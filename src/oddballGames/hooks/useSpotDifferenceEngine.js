import { useCallback, useEffect, useRef, useState } from 'react';
import {
  createRoundState,
  applyTap as applyTapPure,
  isRoundComplete,
} from '../engines/spotDifferenceEngine.js';

/**
 * Drives play through a single level's rounds (one or two picture pairs).
 * Mirrors the "thin React wrapper around a pure engine" pattern used by the
 * other NeuroMorph modules (useOddballEngine.js, useImagePairsEngine.js),
 * scaled down for a task with no timing pressure: this hook owns
 * round-to-round progression and per-round found/wrongTaps state. There is
 * no fixation/response-window/ITI concept here — Spot the Difference is
 * untimed and has no penalty for a wrong tap, by design, matching the
 * source prototype exactly. Elapsed time is only ever *recorded* (for the
 * session summary), never used to gate or score gameplay.
 *
 * `roundStateRef` mirrors the latest roundState (same pattern as
 * useImagePairsEngine.js's `stateRef`) so `tap()` can compute its result
 * synchronously against the true current state and return it directly to
 * the caller, rather than relying on a React state updater callback having
 * already run by the time `tap()` returns (which React does not guarantee).
 *
 * A monotonically increasing `session` id guards the "round/level complete"
 * timeout the same way the other engines guard theirs, so a stale timeout
 * from a round the participant has since reset can never fire late.
 */
export function useSpotDifferenceEngine({ onLevelComplete } = {}) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [roundState, setRoundState] = useState(() => createRoundState());
  const [phase, setPhase] = useState('idle'); // idle | playing | levelComplete

  const roundStateRef = useRef(roundState);
  const sessionRef = useRef(0);
  const levelRef = useRef(null);
  const levelStartRef = useRef(null);
  const roundStartRef = useRef(null);
  const completedRoundStatesRef = useRef([]);
  const timeoutRef = useRef(null);
  const callbackRef = useRef(onLevelComplete);

  useEffect(() => {
    callbackRef.current = onLevelComplete;
  }, [onLevelComplete]);

  const clearPendingTimeout = useCallback(() => {
    if (timeoutRef.current != null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  /** Starts (or restarts) play on the given level from its first round. */
  const start = useCallback(
    (level) => {
      sessionRef.current += 1;
      clearPendingTimeout();
      levelRef.current = level;
      levelStartRef.current = performance.now();
      roundStartRef.current = performance.now();
      completedRoundStatesRef.current = [];
      const initial = createRoundState();
      roundStateRef.current = initial;
      setRoundIndex(0);
      setRoundState(initial);
      setPhase('playing');
    },
    [clearPendingTimeout]
  );

  /** Restarts just the current round ("Start this picture over"). */
  const resetRound = useCallback(() => {
    sessionRef.current += 1;
    clearPendingTimeout();
    roundStartRef.current = performance.now();
    const initial = createRoundState();
    roundStateRef.current = initial;
    setRoundState(initial);
    setPhase('playing');
  }, [clearPendingTimeout]);

  /**
   * Applies a tap at natural-image (x, y) and returns `{ result, diffIndex }`
   * synchronously. No-ops (returns null) outside the playing phase. `onB`
   * says whether the tap happened on the right/modified picture, so the
   * engine hit-tests against that difference's own bx/by rather than the
   * left picture's x/y — see engines/spotDifferenceEngine.js.
   */
  const tap = useCallback(
    (x, y, onB = false) => {
      const level = levelRef.current;
      if (!level || phase !== 'playing') return null;
      const round = level.rounds[roundIndex];
      const applied = applyTapPure(roundStateRef.current, round, x, y, onB);
      roundStateRef.current = applied.state;
      setRoundState(applied.state);
      return { result: applied.result, diffIndex: applied.diffIndex };
    },
    [phase, roundIndex]
  );

  // Advances to the next round (or completes the level) once the current
  // round's roundState has every difference found. Runs as an effect
  // (rather than inline inside tap()) so it always reacts to the committed
  // state, matching the source prototype's brief 1400ms "found them all"
  // pause before moving on.
  useEffect(() => {
    const level = levelRef.current;
    if (phase !== 'playing' || !level) return undefined;
    const round = level.rounds[roundIndex];
    if (!round || !isRoundComplete(roundState, round)) return undefined;

    const session = sessionRef.current;
    const finishedRoundState = { ...roundState, timeMs: performance.now() - roundStartRef.current };
    completedRoundStatesRef.current = [...completedRoundStatesRef.current, finishedRoundState];
    const isLastRound = roundIndex >= level.rounds.length - 1;

    timeoutRef.current = setTimeout(() => {
      if (session !== sessionRef.current) return;
      if (!isLastRound) {
        roundStartRef.current = performance.now();
        const nextInitial = createRoundState();
        roundStateRef.current = nextInitial;
        setRoundIndex((i) => i + 1);
        setRoundState(nextInitial);
        return;
      }
      setPhase('levelComplete');
      callbackRef.current?.({
        level,
        roundStates: completedRoundStatesRef.current,
        timeMs: performance.now() - levelStartRef.current,
      });
    }, 1400);

    return clearPendingTimeout;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundState, roundIndex, phase]);

  const stop = useCallback(() => {
    sessionRef.current += 1;
    clearPendingTimeout();
    setPhase('idle');
  }, [clearPendingTimeout]);

  useEffect(() => stop, [stop]);

  return {
    phase,
    roundIndex,
    roundState,
    start,
    resetRound,
    tap,
    stop,
  };
}
