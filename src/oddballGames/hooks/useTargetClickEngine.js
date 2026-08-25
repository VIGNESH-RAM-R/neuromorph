import { useCallback, useEffect, useRef, useState } from 'react';
import { hiResNow } from '../utils/timing.js';

/**
 * Controlled trial-runner for Point & Click: TARGET (instruction display,
 * board hidden) -> TRANSITION (brief blank pause) -> BOARD (interactive;
 * the high-resolution response timer starts exactly when this phase
 * begins) -> FEEDBACK (brief, subtle) -> INTER-TRIAL (fixed pause) -> next
 * trial.
 *
 * Response classification happens at respond()/timeout time:
 *  - target-present trial, correct object tapped -> HIT
 *  - target-present trial, distractor tapped -> FALSE_ALARM
 *  - target-present trial, no tap within responseWindowMs -> MISS
 *  - no-target trial, any object tapped -> FALSE_ALARM
 *  - no-target trial, no tap within responseWindowMs -> CORRECT_REJECTION
 *
 * Response time is measured strictly from BOARD onset (performance.now())
 * to the tap timestamp — instruction/transition/feedback time is never
 * included. Every phase transition is an explicitly scheduled timeout (no
 * free-running interval), guarded by a monotonically increasing `session`
 * id so a stopped/superseded run's stale timers can never mutate state —
 * the same pattern used by useOddballEngine.js and useSequenceEngine.js.
 * start()/stop() are safe to call again mid-run (used by the pause/resume
 * flow in PointClickAssessment, which restarts the current trial after a
 * pause rather than trying to salvage a partially-measured response).
 */
export function useTargetClickEngine({ onTrialRecorded, onSequenceComplete } = {}) {
  const [phase, setPhase] = useState('idle');
  const [trialNumber, setTrialNumber] = useState(0);
  const [totalTrials, setTotalTrials] = useState(0);
  const [currentTrial, setCurrentTrial] = useState(null);
  const [lastResponseType, setLastResponseType] = useState(null);
  const [lastRespondedObjectId, setLastRespondedObjectId] = useState(null);

  const sessionRef = useRef(0);
  const timeoutsRef = useRef([]);
  const resultsRef = useRef([]);
  const boardActiveRef = useRef(false);
  const finalizedRef = useRef(true);
  const responseWindowTimerRef = useRef(null); // the pending MISS/CORRECT_REJECTION timeout for the current trial
  const trialCtxRef = useRef(null); // { trial, onset, index, trials, config }
  const callbacksRef = useRef({ onTrialRecorded, onSequenceComplete });
  const instanceIdRef = useRef(Math.random().toString(36).slice(2, 7));
  const dbg = (...args) => {
    if (typeof window !== 'undefined') {
      window.__pcDebug = window.__pcDebug || [];
      window.__pcDebug.push({ t: Math.round(performance.now()), inst: instanceIdRef.current, msg: args.join(' ') });
    }
  };

  useEffect(() => {
    callbacksRef.current = { onTrialRecorded, onSequenceComplete };
  }, [onTrialRecorded, onSequenceComplete]);

  const clearAllTimers = useCallback(() => {
    timeoutsRef.current.forEach((id) => clearTimeout(id));
    timeoutsRef.current = [];
  }, []);

  const schedule = useCallback((fn, ms) => {
    const id = setTimeout(fn, ms);
    timeoutsRef.current.push(id);
    return id;
  }, []);

  /** Stops the engine, invalidates in-flight timers. Defaults to 'idle'. */
  const stop = useCallback(
    (finalPhase = 'idle') => {
      dbg('stop() called, was session', sessionRef.current, '-> new session', sessionRef.current + 1);
      sessionRef.current += 1;
      clearAllTimers();
      responseWindowTimerRef.current = null;
      boardActiveRef.current = false;
      finalizedRef.current = true;
      setPhase(finalPhase);
    },
    [clearAllTimers]
  );

  const runTrialAt = useCallback(
    (session, index, trials, config) => {
      dbg('runTrialAt session', session, 'sessionRef', sessionRef.current, 'index', index, 'len', trials.length);
      if (session !== sessionRef.current) {
        dbg('runTrialAt BAILED (stale session)');
        return;
      }
      if (index >= trials.length) {
        dbg('runTrialAt -> done');
        setPhase('done');
        callbacksRef.current.onSequenceComplete?.(resultsRef.current);
        return;
      }

      const trial = trials[index];
      finalizedRef.current = false;
      boardActiveRef.current = false;
      setTrialNumber(index + 1);
      setCurrentTrial(trial);
      setLastResponseType(null);
      setLastRespondedObjectId(null);
      setPhase('target');

      schedule(() => {
        if (session !== sessionRef.current) return;
        setPhase('transition');

        schedule(() => {
          if (session !== sessionRef.current) return;
          const onset = hiResNow();
          trialCtxRef.current = { trial, onset, index, trials, config };
          boardActiveRef.current = true;
          setPhase('board');

          responseWindowTimerRef.current = schedule(() => {
            if (session !== sessionRef.current || finalizedRef.current) return;
            const responseType = trial.targetPresent ? 'MISS' : 'CORRECT_REJECTION';
            finalizeTrial(session, responseType, null, null);
          }, config.responseWindowMs);
        }, config.transitionMs);
      }, config.targetDisplayMs);
    },
    // finalizeTrial is defined below via useCallback and referenced here
    // before its declaration; by the time these scheduled callbacks
    // actually run, the closure has resolved to the latest finalizeTrial
    // (same forward-reference pattern used in the other engine hooks).
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [schedule]
  );

  const finalizeTrial = useCallback(
    (session, responseType, objectId, responseTimestamp) => {
      dbg('finalizeTrial session', session, 'sessionRef', sessionRef.current, 'finalizedRef', finalizedRef.current, 'type', responseType);
      if (session !== sessionRef.current || finalizedRef.current) {
        dbg('finalizeTrial BAILED');
        return;
      }
      finalizedRef.current = true;
      boardActiveRef.current = false;

      // Cancel this trial's still-pending response-window timeout (relevant
      // when finalizeTrial runs early, via a real response) — otherwise it
      // survives into a later trial (finalizedRef gets reset to false for
      // each new trial) and wrongly finalizes whatever trial is active when
      // it eventually fires, using this trial's stale responseType against
      // the current trial's context. That race is what caused the board to
      // flash away and restart mid-trial.
      if (responseWindowTimerRef.current != null) {
        clearTimeout(responseWindowTimerRef.current);
        responseWindowTimerRef.current = null;
      }

      const ctx = trialCtxRef.current;
      const responseTime = responseTimestamp != null ? responseTimestamp - ctx.onset : null;

      const record = {
        trialNumber: ctx.trial.trialNumber,
        difficultyLevel: ctx.trial.difficultyLevel,
        objectCount: ctx.trial.objectCount,
        targetPresent: ctx.trial.targetPresent,
        targetShapeId: ctx.trial.targetShapeId,
        targetColorId: ctx.trial.targetColorId,
        targetLabel: ctx.trial.targetLabel,
        stimulusOnset: Date.now(),
        responseTimestamp: responseTimestamp != null ? Date.now() : null,
        respondedObjectId: objectId,
        responseTime,
        responseType,
        correctHit: responseType === 'HIT',
        miss: responseType === 'MISS',
        falseAlarm: responseType === 'FALSE_ALARM',
        correctRejection: responseType === 'CORRECT_REJECTION',
      };

      resultsRef.current = [...resultsRef.current, record];
      setLastResponseType(responseType);
      setLastRespondedObjectId(objectId);
      callbacksRef.current.onTrialRecorded?.(record);

      const config = ctx.config;
      setPhase('feedback');
      schedule(() => {
        if (session !== sessionRef.current) return;
        setPhase('inter-trial');
        schedule(() => {
          if (session !== sessionRef.current) return;
          runTrialAt(session, ctx.index + 1, ctx.trials, config);
        }, config.interTrialIntervalMs);
      }, config.feedbackMs);
    },
    [schedule, runTrialAt]
  );

  const respond = useCallback(
    (objectId) => {
      if (!boardActiveRef.current || finalizedRef.current) return;
      const ctx = trialCtxRef.current;
      if (!ctx) return;

      const responseTimestamp = hiResNow();
      const tappedObject = ctx.trial.objects.find((o) => o.id === objectId);
      const isTarget = Boolean(ctx.trial.targetPresent && tappedObject && tappedObject.isTarget);
      const responseType = isTarget ? 'HIT' : 'FALSE_ALARM';
      finalizeTrial(sessionRef.current, responseType, objectId, responseTimestamp);
    },
    [finalizeTrial]
  );

  /** Starts a fresh run over the given trial specs with the given timing config. */
  const start = useCallback(
    (trials, config) => {
      sessionRef.current += 1;
      const session = sessionRef.current;
      dbg('start() called, trials.length', trials.length, '-> session', session);
      clearAllTimers();
      resultsRef.current = [];
      finalizedRef.current = true;
      boardActiveRef.current = false;
      setTotalTrials(trials.length);
      runTrialAt(session, 0, trials, config);
      return session;
    },
    [clearAllTimers, runTrialAt]
  );

  useEffect(() => stop, [stop]);

  return {
    phase,
    trialNumber,
    totalTrials,
    currentTrial,
    lastResponseType,
    lastRespondedObjectId,
    start,
    stop,
    respond,
  };
}
