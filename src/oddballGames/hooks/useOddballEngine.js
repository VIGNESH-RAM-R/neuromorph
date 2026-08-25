import { useCallback, useEffect, useRef, useState } from 'react';
import { randomDuration, hiResNow } from '../utils/oddballTiming.js';

/**
 * Controlled trial-runner for the Visual Oddball task.
 *
 * Each trial is explicitly driven through fixation -> stimulus (visible) ->
 * blank (still within the response window) -> inter-trial interval, using
 * individually scheduled timeouts rather than a single free-running
 * interval. Reaction time is always computed from a performance.now()
 * timestamp taken at stimulus onset versus a performance.now() timestamp
 * taken at the moment of a valid response.
 *
 * A monotonically increasing `session` id guards every scheduled callback,
 * so stale timers from a previous/aborted run can never mutate state after
 * a restart or unmount. Exactly one response is accepted per trial.
 *
 * Usable for both the practice sequence and the actual assessment — the
 * caller supplies the trial list and receives trial-by-trial callbacks plus
 * a final array of trial records.
 */
export function useOddballEngine({ onTrialRecorded, onSequenceComplete } = {}) {
  const [phase, setPhase] = useState('idle'); // idle | fixation | stimulus | blank | iti | done
  const [trialNumber, setTrialNumber] = useState(0);
  const [totalTrials, setTotalTrials] = useState(0);
  const [activeStimulusType, setActiveStimulusType] = useState(null);

  const sessionRef = useRef(0);
  const timeoutsRef = useRef([]);
  const resultsRef = useRef([]);
  const respondedRef = useRef(false);
  const responseWindowOpenRef = useRef(false);
  const ctxRef = useRef({ trials: [], config: null, index: 0, trial: null, onset: null });
  const callbacksRef = useRef({ onTrialRecorded, onSequenceComplete });

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

  /** Stops the engine, invalidates any in-flight timers, resets to idle. */
  const stop = useCallback(() => {
    sessionRef.current += 1;
    clearAllTimers();
    responseWindowOpenRef.current = false;
    respondedRef.current = false;
    setPhase('idle');
  }, [clearAllTimers]);

  const finalizeTrial = useCallback((session, responseTimestamp) => {
    if (session !== sessionRef.current) return;
    if (!responseWindowOpenRef.current && responseTimestamp === null) return; // already finalized
    responseWindowOpenRef.current = false;

    const { trial, onset, index, trials, config } = ctxRef.current;
    const reactionTime =
      responseTimestamp != null ? Math.round(responseTimestamp - onset) : null;

    let responseType;
    if (trial.stimulusType === 'target') {
      responseType = responseTimestamp != null ? 'HIT' : 'MISS';
    } else {
      responseType = responseTimestamp != null ? 'FALSE_ALARM' : 'CORRECT_REJECTION';
    }

    const record = {
      trialNumber: trial.trialNumber,
      stimulusType: trial.stimulusType,
      stimulusId: trial.stimulusId,
      stimulusOnsetTimestamp: Date.now(),
      responseTimestamp: responseTimestamp != null ? Date.now() : null,
      reactionTime,
      responseType,
      isCorrect: responseType === 'HIT' || responseType === 'CORRECT_REJECTION',
      responseWindow: config.responseWindowMs,
    };

    resultsRef.current = [...resultsRef.current, record];
    callbacksRef.current.onTrialRecorded?.(record);

    setPhase('iti');
    const iti = randomDuration(config.itiMinMs, config.itiMaxMs);
    schedule(() => {
      if (session !== sessionRef.current) return;
      runTrialAt(session, index + 1, trials, config);
    }, iti);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schedule]);

  const runTrialAt = useCallback(
    (session, index, trials, config) => {
      if (session !== sessionRef.current) return;
      if (index >= trials.length) {
        setPhase('done');
        callbacksRef.current.onSequenceComplete?.(resultsRef.current);
        return;
      }

      const trial = trials[index];
      respondedRef.current = false;
      responseWindowOpenRef.current = false;
      setTrialNumber(index + 1);
      setActiveStimulusType(null);
      setPhase('fixation');

      const fixationDuration = randomDuration(config.fixationMinMs, config.fixationMaxMs);

      schedule(() => {
        if (session !== sessionRef.current) return;
        const onset = hiResNow();
        ctxRef.current = { trials, config, index, trial, onset };
        responseWindowOpenRef.current = true;
        setActiveStimulusType(trial.stimulusType);
        setPhase('stimulus');

        schedule(() => {
          if (session !== sessionRef.current) return;
          setPhase('blank');
        }, config.stimulusDurationMs);

        schedule(() => {
          finalizeTrial(session, null);
        }, config.responseWindowMs);
      }, fixationDuration);
    },
    [schedule, finalizeTrial]
  );

  /** Starts a fresh run over the given trial list with the given timing config. */
  const start = useCallback(
    (trials, config) => {
      sessionRef.current += 1;
      const session = sessionRef.current;
      clearAllTimers();
      resultsRef.current = [];
      respondedRef.current = false;
      responseWindowOpenRef.current = false;
      setTotalTrials(trials.length);
      runTrialAt(session, 0, trials, config);
      return session;
    },
    [clearAllTimers, runTrialAt]
  );

  /** Registers a participant response. Only the first response per trial counts. */
  const respond = useCallback(() => {
    if (!responseWindowOpenRef.current || respondedRef.current) return;
    respondedRef.current = true;
    const responseTimestamp = hiResNow();
    finalizeTrial(sessionRef.current, responseTimestamp);
  }, [finalizeTrial]);

  useEffect(() => stop, [stop]);

  return {
    phase,
    trialNumber,
    totalTrials,
    activeStimulusType,
    start,
    stop,
    respond,
  };
}
