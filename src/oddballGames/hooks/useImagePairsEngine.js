import { useCallback, useEffect, useRef, useState } from 'react';
import { hiResNow } from '../utils/timing.js';
import {
  createInitialState,
  startGame,
  selectCard as selectCardPure,
  resolveEvaluation,
  expireTime,
  interruptGame,
} from '../engines/imagePairsEngine.js';

/**
 * Thin React wrapper around the pure engine in engines/imagePairsEngine.js.
 * Owns everything the pure engine deliberately doesn't: scheduled timeouts
 * (flip-back / match-lock reveal delay), the visible countdown timer, and
 * tab-visibility interruption handling. Usable for both the practice round
 * and the actual scored assessment — the caller supplies the deck and
 * timing config.
 *
 * A monotonically increasing `session` id guards every scheduled callback
 * (matching the pattern used by useSequenceEngine.js) so stale timers from
 * a previous/aborted run can never mutate state after a restart or
 * unmount. `stateRef` mirrors the latest state for use inside timer/event
 * callbacks, which read it directly instead of using the functional
 * setState-updater form — this keeps side effects (ending the session,
 * invoking onComplete) out of updater functions, where React may invoke
 * them more than once (e.g. under StrictMode).
 */
export function useImagePairsEngine({ onComplete, onInterrupted } = {}) {
  const [state, setState] = useState(() => createInitialState([], 0));
  const [timeRemainingMs, setTimeRemainingMs] = useState(null);

  const stateRef = useRef(state);
  const sessionRef = useRef(0);
  const timeoutsRef = useRef([]);
  const tickRef = useRef(null);
  const configRef = useRef(null);
  const callbacksRef = useRef({ onComplete, onInterrupted });

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    callbacksRef.current = { onComplete, onInterrupted };
  }, [onComplete, onInterrupted]);

  const clearAllTimers = useCallback(() => {
    timeoutsRef.current.forEach((id) => clearTimeout(id));
    timeoutsRef.current = [];
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }, []);

  const schedule = useCallback((fn, ms) => {
    const id = setTimeout(fn, ms);
    timeoutsRef.current.push(id);
    return id;
  }, []);

  /** Stops all timers and reports the final state upward. Does not itself change state. */
  const completeSession = useCallback((finalState) => {
    clearAllTimers();
    callbacksRef.current.onComplete?.(finalState);
  }, [clearAllTimers]);

  const stop = useCallback(() => {
    sessionRef.current += 1;
    clearAllTimers();
  }, [clearAllTimers]);

  /** Starts a fresh run over the given deck with the given timing config. */
  const start = useCallback(
    (deckCards, config) => {
      sessionRef.current += 1;
      const session = sessionRef.current;
      clearAllTimers();
      configRef.current = config;

      const initial = createInitialState(deckCards, config.totalPairs);
      const started = startGame(initial, hiResNow());
      stateRef.current = started;
      setState(started);
      setTimeRemainingMs(config.maxDurationMs ?? null);

      if (config.maxDurationMs) {
        tickRef.current = setInterval(() => {
          if (session !== sessionRef.current) return;
          const cur = stateRef.current;
          if (cur.phase === 'complete') return;

          const elapsed = hiResNow() - cur.startTime;
          const remaining = Math.max(0, config.maxDurationMs - elapsed);
          setTimeRemainingMs(remaining);

          if (remaining <= 0) {
            const expired = expireTime(cur, hiResNow());
            stateRef.current = expired;
            setState(expired);
            completeSession(expired);
          }
        }, 200);
      }

      return started;
    },
    [clearAllTimers, completeSession]
  );

  const selectCard = useCallback(
    (cardId) => {
      const cur = stateRef.current;
      const { state: next, justEvaluated } = selectCardPure(cur, cardId, hiResNow());
      if (next === cur) return; // invalid selection — no-op (see engine guard)

      stateRef.current = next;
      setState(next);

      if (justEvaluated) {
        const session = sessionRef.current;
        const delay = justEvaluated.correct
          ? configRef.current.correctRevealMs
          : configRef.current.incorrectRevealMs;

        schedule(() => {
          if (session !== sessionRef.current) return;
          const beforeResolve = stateRef.current;
          if (beforeResolve.phase !== 'evaluating') return; // already ended (e.g. time expired)

          const resolved = resolveEvaluation(beforeResolve, justEvaluated.correct, hiResNow());
          stateRef.current = resolved;
          setState(resolved);

          if (resolved.phase === 'complete') {
            completeSession(resolved);
          }
        }, delay);
      }
    },
    [schedule, completeSession]
  );

  // A hidden tab during an active session must not be allowed to silently
  // produce corrupted timing data. Detect the transition and safely end
  // the session as interrupted instead (never saved — see the top-level
  // assessment component).
  useEffect(() => {
    const handleVisibilityChange = () => {
      const cur = stateRef.current;
      if (document.hidden && (cur.phase === 'playing' || cur.phase === 'evaluating')) {
        const interrupted = interruptGame(cur, hiResNow());
        stateRef.current = interrupted;
        setState(interrupted);
        completeSession(interrupted);
        callbacksRef.current.onInterrupted?.();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [completeSession]);

  /** Explicit participant-initiated exit during an active session (spec section 41). */
  const interrupt = useCallback(() => {
    const cur = stateRef.current;
    if (cur.phase !== 'playing' && cur.phase !== 'evaluating') return;
    const interrupted = interruptGame(cur, hiResNow());
    stateRef.current = interrupted;
    setState(interrupted);
    completeSession(interrupted);
    callbacksRef.current.onInterrupted?.();
  }, [completeSession]);

  useEffect(() => stop, [stop]);

  return { state, timeRemainingMs, start, selectCard, interrupt, stop };
}
