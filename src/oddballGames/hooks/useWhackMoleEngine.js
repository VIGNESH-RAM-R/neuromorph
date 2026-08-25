import { useCallback, useEffect, useRef, useState } from 'react';
import { hiResNow, randomDuration } from '../utils/timing.js';
import { pickPosition } from '../utils/whackMoleGenerator.js';

/**
 * Continuous real-time trial engine for Whack the Mole: WAITING (inter-
 * target interval, no active target) -> TARGET (mole visible at a random
 * hole, awaiting a response) -> resolve (hit/miss) -> WAITING -> ... until
 * either the assessment's time budget is used up (`mode: 'duration'`) or a
 * fixed trial count is reached (`mode: 'count'`, used by practice).
 *
 * Follows the same architecture as useSequenceEngine.js/useTargetClickEngine.js:
 * every phase transition is an explicitly scheduled setTimeout (never a
 * free-running interval driving game logic), guarded by a monotonically
 * increasing `session` id so a stopped/superseded run's stale timers can
 * never mutate state after a restart, pause, or unmount. A single 200ms
 * setInterval exists only to drive the *visible* countdown display and as
 * a defense-in-depth hard stop at exactly the configured duration — it
 * never itself decides trial timing.
 *
 * Pause/resume is tracked via accumulated "paused time" subtracted from
 * wall-clock elapsed time (so the 45s budget only counts time actually
 * spent playing), matching spec section 28. Any target that is mid-flight
 * when paused is voided (`result: 'truncated'`) rather than guessed at,
 * since accurate response-window timing can't be guaranteed across a
 * pause (spec sections 37, 49).
 */
export function useWhackMoleEngine({ onTrialRecorded, onFalseResponse, onComplete } = {}) {
  const [phase, setPhase] = useState('idle'); // idle | waiting | target | paused | done
  const [trialNumber, setTrialNumber] = useState(0);
  const [activeTarget, setActiveTarget] = useState(null); // { position, trialNumber, shownAt }
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [falseResponses, setFalseResponses] = useState(0);
  const [score, setScore] = useState(0);
  const [timeRemainingMs, setTimeRemainingMs] = useState(null);
  const [pauseCount, setPauseCount] = useState(0);

  const sessionRef = useRef(0);
  const timeoutsRef = useRef([]);
  const tickRef = useRef(null);
  const resultsRef = useRef([]);
  const falseEventsRef = useRef([]);
  const lastPositionRef = useRef(null);
  const lastItiRef = useRef(null);
  const configRef = useRef(null);
  const modeRef = useRef('duration');
  const runStartRef = useRef(null);
  const pausedAccumRef = useRef(0);
  const pauseStartedAtRef = useRef(null);
  const totalPausedDurationRef = useRef(0);
  const pauseCountRef = useRef(0);
  const runningRef = useRef(false);
  const pausedRef = useRef(false);
  const targetActiveRef = useRef(false);
  const finalizedRef = useRef(true);
  const trialCtxRef = useRef(null); // { position, shownAt, trialNumber, targetWindowMs }
  const postHitGraceRef = useRef(null); // { position, until } — suppresses an immediate double-tap on the same hole
  // Mirrors `score` so completion callbacks can read the latest value
  // without depending on `score` state (which would otherwise force
  // finishRun/scheduleNextTrial/spawnTarget to be recreated on every point).
  const scoreRef = useRef(0);
  const callbacksRef = useRef({ onTrialRecorded, onFalseResponse, onComplete });

  useEffect(() => {
    callbacksRef.current = { onTrialRecorded, onFalseResponse, onComplete };
  }, [onTrialRecorded, onFalseResponse, onComplete]);

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

  const effectiveElapsedMs = useCallback(() => {
    if (runStartRef.current == null) return 0;
    const ongoingPause = pauseStartedAtRef.current != null ? hiResNow() - pauseStartedAtRef.current : 0;
    return hiResNow() - runStartRef.current - pausedAccumRef.current - ongoingPause;
  }, []);

  const startTick = useCallback(
    (session, config) => {
      tickRef.current = setInterval(() => {
        if (session !== sessionRef.current || pausedRef.current) return;
        const elapsed = effectiveElapsedMs();
        const remaining = Math.max(0, config.assessmentDurationMs - elapsed);
        setTimeRemainingMs(remaining);
        if (remaining <= 0) {
          // eslint-disable-next-line no-use-before-define
          finishRun('TIME_EXPIRED');
        }
      }, 200);
    },
    // finishRun is defined below via useCallback; by the time this interval
    // callback actually fires, the closure has resolved to the latest
    // finishRun (same forward-reference pattern used by the other engines).
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [effectiveElapsedMs]
  );

  const finishRun = useCallback((reason) => {
    clearAllTimers();
    runningRef.current = false;
    pausedRef.current = false;
    targetActiveRef.current = false;
    finalizedRef.current = true;
    setActiveTarget(null);
    setPhase('done');
    callbacksRef.current.onComplete?.({
      trials: resultsRef.current,
      falseResponseEvents: falseEventsRef.current,
      reason,
      pauseCount: pauseCountRef.current,
      totalPausedDurationMs: totalPausedDurationRef.current,
      score: scoreRef.current,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearAllTimers]);

  const finalizeTrial = useCallback(
    (session, result, responseTimestamp, inputMethod) => {
      if (session !== sessionRef.current || finalizedRef.current) return;
      finalizedRef.current = true;
      targetActiveRef.current = false;

      const ctx = trialCtxRef.current;
      const reactionTime = responseTimestamp != null && ctx ? responseTimestamp - ctx.shownAt : null;

      const record = {
        trial: ctx?.trialNumber ?? resultsRef.current.length + 1,
        position: ctx?.position ?? null,
        targetShownTime: ctx?.shownAt ?? null,
        responseTime: responseTimestamp ?? null,
        reactionTime,
        result, // 'correct' | 'miss'
        targetDurationMs: ctx?.targetWindowMs ?? null,
        interTargetIntervalMs: lastItiRef.current,
        timestamp: Date.now(),
        difficulty: configRef.current?.difficulty ?? null,
        inputMethod: inputMethod ?? null,
      };

      resultsRef.current = [...resultsRef.current, record];
      setActiveTarget(null);

      if (result === 'correct') {
        setHits((h) => h + 1);
        setScore((s) => {
          const next = s + 10;
          scoreRef.current = next;
          return next;
        });
        postHitGraceRef.current = {
          position: record.position,
          until: hiResNow() + (configRef.current?.postHitGraceMs ?? 0),
        };
      } else if (result === 'miss') {
        setMisses((m) => m + 1);
      }

      callbacksRef.current.onTrialRecorded?.(record);

      // eslint-disable-next-line no-use-before-define
      scheduleNextTrial(sessionRef.current);
    },
    // scheduleNextTrial is defined further below via useCallback; by the
    // time this callback actually runs, the closure has already resolved
    // to the latest scheduleNextTrial (same forward-reference pattern used
    // by useSequenceEngine.js's finalizeTrial -> runTrialAt).
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const spawnTarget = useCallback(
    (session) => {
      if (session !== sessionRef.current) return;
      const config = configRef.current;

      const position = pickPosition(config.totalHoles, lastPositionRef.current);
      lastPositionRef.current = position;
      const targetWindowMs = randomDuration(config.targetWindowMsRange[0], config.targetWindowMsRange[1]);
      const shownAt = hiResNow();
      const trialNum = resultsRef.current.length + 1;

      trialCtxRef.current = { position, shownAt, trialNumber: trialNum, targetWindowMs };
      targetActiveRef.current = true;
      finalizedRef.current = false;
      setActiveTarget({ position, trialNumber: trialNum, shownAt });
      setTrialNumber(trialNum);
      setPhase('target');

      schedule(() => {
        if (session !== sessionRef.current || finalizedRef.current) return;
        finalizeTrial(session, 'miss', null, null);
      }, targetWindowMs);
    },
    [schedule, finalizeTrial]
  );

  const scheduleNextTrial = useCallback(
    (session) => {
      if (session !== sessionRef.current || !runningRef.current || pausedRef.current) return;
      const config = configRef.current;

      if (modeRef.current === 'duration') {
        if (effectiveElapsedMs() >= config.assessmentDurationMs) {
          finishRun('TIME_EXPIRED');
          return;
        }
      } else if (modeRef.current === 'count') {
        if (resultsRef.current.length >= config.trialCount) {
          finishRun('TRIAL_COUNT_REACHED');
          return;
        }
      }

      setPhase('waiting');
      targetActiveRef.current = false;
      finalizedRef.current = true;

      const iti = randomDuration(config.interTargetIntervalMsRange[0], config.interTargetIntervalMsRange[1]);
      lastItiRef.current = iti;
      schedule(() => {
        if (session !== sessionRef.current || pausedRef.current) return;
        spawnTarget(session);
      }, iti);
    },
    [schedule, spawnTarget, effectiveElapsedMs, finishRun]
  );

  /** Starts a fresh run. `mode` is 'duration' (assessment) or 'count' (practice). */
  const start = useCallback(
    (config, mode = 'duration') => {
      sessionRef.current += 1;
      const session = sessionRef.current;
      clearAllTimers();

      configRef.current = config;
      modeRef.current = mode;
      resultsRef.current = [];
      falseEventsRef.current = [];
      lastPositionRef.current = null;
      lastItiRef.current = null;
      runStartRef.current = hiResNow();
      pausedAccumRef.current = 0;
      pauseStartedAtRef.current = null;
      totalPausedDurationRef.current = 0;
      pauseCountRef.current = 0;
      runningRef.current = true;
      pausedRef.current = false;
      targetActiveRef.current = false;
      finalizedRef.current = true;
      scoreRef.current = 0;

      setHits(0);
      setMisses(0);
      setFalseResponses(0);
      setScore(0);
      setPauseCount(0);
      setTrialNumber(0);
      setActiveTarget(null);
      setTimeRemainingMs(mode === 'duration' ? config.assessmentDurationMs : null);

      if (mode === 'duration') startTick(session, config);

      const initialDelay = randomDuration(config.initialDelayMsRange[0], config.initialDelayMsRange[1]);
      setPhase('waiting');
      schedule(() => {
        if (session !== sessionRef.current) return;
        spawnTarget(session);
      }, initialDelay);

      return session;
    },
    [clearAllTimers, schedule, spawnTarget, startTick]
  );

  /** A tap on `position`. `inputMethod` is recorded, never used to change scoring. */
  const respond = useCallback(
    (position, inputMethod = 'pointer') => {
      if (!runningRef.current || pausedRef.current) return;
      const responseTimestamp = hiResNow();

      if (targetActiveRef.current && !finalizedRef.current) {
        const ctx = trialCtxRef.current;
        if (ctx && ctx.position === position) {
          finalizeTrial(sessionRef.current, 'correct', responseTimestamp, inputMethod);
          return;
        }
      }

      const grace = postHitGraceRef.current;
      if (grace && grace.position === position && responseTimestamp <= grace.until) {
        return; // same motor response as the just-scored hit — not scored either way
      }

      setFalseResponses((f) => f + 1);
      const event = {
        timestamp: Date.now(),
        responseTimestamp,
        position,
        inputMethod,
        duringActiveTarget: targetActiveRef.current && !finalizedRef.current,
      };
      falseEventsRef.current = [...falseEventsRef.current, event];
      callbacksRef.current.onFalseResponse?.(event);
    },
    [finalizeTrial]
  );

  /** Pauses: stops all timers, voids any in-flight target trial, records a pause event. */
  const pause = useCallback(() => {
    if (!runningRef.current || pausedRef.current) return;
    pausedRef.current = true;
    pauseStartedAtRef.current = hiResNow();
    pauseCountRef.current += 1;
    setPauseCount(pauseCountRef.current);

    if (targetActiveRef.current && !finalizedRef.current) {
      finalizedRef.current = true;
      targetActiveRef.current = false;
      const ctx = trialCtxRef.current;
      if (ctx) {
        const record = {
          trial: ctx.trialNumber,
          position: ctx.position,
          targetShownTime: ctx.shownAt,
          responseTime: null,
          reactionTime: null,
          result: 'truncated', // voided — the response window was cut short by the pause, not by inaction
          targetDurationMs: ctx.targetWindowMs,
          interTargetIntervalMs: lastItiRef.current,
          timestamp: Date.now(),
          difficulty: configRef.current?.difficulty ?? null,
          inputMethod: null,
        };
        resultsRef.current = [...resultsRef.current, record];
        callbacksRef.current.onTrialRecorded?.(record);
      }
      setActiveTarget(null);
    }

    clearAllTimers();
    setPhase('paused');
  }, [clearAllTimers]);

  /** Resumes: continues the same session with a fresh inter-target interval. */
  const resume = useCallback(() => {
    if (!runningRef.current || !pausedRef.current) return;
    const pauseDuration = hiResNow() - pauseStartedAtRef.current;
    pausedAccumRef.current += pauseDuration;
    totalPausedDurationRef.current += pauseDuration;
    pauseStartedAtRef.current = null;
    pausedRef.current = false;

    const session = sessionRef.current;
    const config = configRef.current;
    if (config && modeRef.current === 'duration') startTick(session, config);
    scheduleNextTrial(session);
  }, [startTick, scheduleNextTrial]);

  /** Ends the run immediately without saving (participant chose "End Test" while paused). */
  const interrupt = useCallback(() => {
    finishRun('INTERRUPTED');
  }, [finishRun]);

  const stop = useCallback(() => {
    sessionRef.current += 1;
    clearAllTimers();
    runningRef.current = false;
    pausedRef.current = false;
    targetActiveRef.current = false;
    finalizedRef.current = true;
    setPhase('idle');
  }, [clearAllTimers]);

  useEffect(() => stop, [stop]);

  return {
    phase,
    trialNumber,
    activeTarget,
    hits,
    misses,
    falseResponses,
    score,
    timeRemainingMs,
    pauseCount,
    start,
    respond,
    pause,
    resume,
    interrupt,
    stop,
  };
}
