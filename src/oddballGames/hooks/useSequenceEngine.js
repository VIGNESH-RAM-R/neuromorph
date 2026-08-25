import { useCallback, useEffect, useRef, useState } from 'react';
import { hiResNow } from '../utils/timing.js';
import { generateUniqueSequence } from '../utils/sequenceGenerator.js';
import { calculateTrialResult } from '../utils/sequenceScoring.js';

/**
 * Controlled trial-runner for Sequence Memory: WATCH (encoding, one
 * stimulus at a time) -> REMEMBER (brief consolidation pause, no input) ->
 * REPEAT (all four buttons active, collects exactly sequenceLength taps) ->
 * TRIAL_COMPLETE (brief transition) -> next trial.
 *
 * Every phase transition is an explicitly scheduled timeout (not a single
 * free-running interval), and a monotonically increasing `session` id
 * guards every scheduled callback so stale timers from a previous/aborted
 * run can never mutate state after a restart or unmount. Exactly the
 * required number of taps is accepted per trial — reached-count and any
 * further taps in the same trial are ignored synchronously, so rapid
 * double-taps cannot register twice.
 *
 * Usable for both the practice round and the actual assessment — the
 * caller supplies the trial spec list and timing config, and receives
 * trial-by-trial callbacks plus a final array of trial records.
 */
export function useSequenceEngine({ onTrialRecorded, onSequenceComplete, onInterrupted } = {}) {
  const [phase, setPhase] = useState('idle'); // idle | watch | remember | repeat | trial-complete | done | interrupted
  const [trialNumber, setTrialNumber] = useState(0);
  const [totalTrials, setTotalTrials] = useState(0);
  const [currentSpec, setCurrentSpec] = useState(null); // { level, sequenceLength, trialNumber }
  const [activeStimulusId, setActiveStimulusId] = useState(null); // highlighted color during WATCH
  const [tapCount, setTapCount] = useState(0);
  const [lastTappedId, setLastTappedId] = useState(null); // brief press feedback during REPEAT

  const sessionRef = useRef(0);
  const timeoutsRef = useRef([]);
  const resultsRef = useRef([]);
  const usedSequencesRef = useRef([]);
  const repeatActiveRef = useRef(false);
  const trialCtxRef = useRef(null); // { sequence, spec, taps, recallStart, config, index, trials }
  const callbacksRef = useRef({ onTrialRecorded, onSequenceComplete, onInterrupted });
  const phaseRef = useRef('idle'); // mirrors `phase` for use inside non-React listeners (visibilitychange)

  useEffect(() => {
    callbacksRef.current = { onTrialRecorded, onSequenceComplete, onInterrupted };
  }, [onTrialRecorded, onSequenceComplete, onInterrupted]);

  const clearAllTimers = useCallback(() => {
    timeoutsRef.current.forEach((id) => clearTimeout(id));
    timeoutsRef.current = [];
  }, []);

  const schedule = useCallback((fn, ms) => {
    const id = setTimeout(fn, ms);
    timeoutsRef.current.push(id);
    return id;
  }, []);

  const updatePhase = useCallback((next) => {
    phaseRef.current = next;
    setPhase(next);
  }, []);

  /** Stops the engine, invalidates in-flight timers. Defaults to 'idle'. */
  const stop = useCallback(
    (finalPhase = 'idle') => {
      sessionRef.current += 1;
      clearAllTimers();
      repeatActiveRef.current = false;
      updatePhase(finalPhase);
    },
    [clearAllTimers, updatePhase]
  );

  // A hidden tab during an active trial must not be allowed to silently
  // produce corrupted timing data (a stimulus "presented" while unseen, or
  // a recall window measured against a background tab). Detect the
  // transition and safely terminate the run instead.
  useEffect(() => {
    const handleVisibilityChange = () => {
      const activePhases = ['watch', 'remember', 'repeat', 'trial-complete'];
      if (document.hidden && activePhases.includes(phaseRef.current)) {
        stop('interrupted');
        callbacksRef.current.onInterrupted?.();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [stop]);

  const finalizeTrial = useCallback(
    (session) => {
      if (session !== sessionRef.current) return;
      const ctx = trialCtxRef.current;
      if (!ctx) return;
      repeatActiveRef.current = false;

      const tapTimestamps = ctx.taps.map((t) => t.timestamp);
      const userSequence = ctx.taps.map((t) => t.stimulusId);
      const scoring = calculateTrialResult(ctx.sequence, userSequence, {
        recallStartTime: ctx.recallStart,
        tapTimestamps,
      });

      const record = {
        trialNumber: ctx.spec.trialNumber,
        level: ctx.spec.level,
        sequenceLength: ctx.sequence.length,
        targetSequence: ctx.sequence,
        userSequence,
        ...scoring,
        presentationDuration: ctx.config.stimulusDuration,
        interStimulusInterval: ctx.config.interStimulusInterval,
      };

      resultsRef.current = [...resultsRef.current, record];
      callbacksRef.current.onTrialRecorded?.(record);

      updatePhase('trial-complete');
      schedule(() => {
        if (session !== sessionRef.current) return;
        runTrialAt(session, ctx.index + 1, ctx.trials, ctx.config);
      }, ctx.config.trialCompleteDelay);
    },
    // runTrialAt is defined further below via useCallback; by the time this
    // scheduled callback actually runs, the closure has already resolved to
    // the latest runTrialAt (same forward-reference pattern used in
    // useOddballEngine.js's finalizeTrial -> runTrialAt).
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [schedule, updatePhase]
  );

  const respond = useCallback(
    (stimulusId) => {
      if (!repeatActiveRef.current) return;
      const ctx = trialCtxRef.current;
      if (!ctx) return;

      const timestamp = hiResNow();
      ctx.taps.push({ stimulusId, timestamp });
      setTapCount(ctx.taps.length);
      setLastTappedId(stimulusId);
      schedule(() => setLastTappedId(null), 220);

      if (ctx.taps.length >= ctx.sequence.length) {
        repeatActiveRef.current = false; // block any further taps synchronously
        finalizeTrial(sessionRef.current);
      }
    },
    [finalizeTrial, schedule]
  );

  const runWatchStep = useCallback(
    (session, index, sequence, config) => {
      if (session !== sessionRef.current) return;

      if (index >= sequence.length) {
        // Presentation finished -> post-sequence delay -> REMEMBER -> REPEAT.
        schedule(() => {
          if (session !== sessionRef.current) return;
          setActiveStimulusId(null);
          updatePhase('remember');
          schedule(() => {
            if (session !== sessionRef.current) return;
            const ctx = trialCtxRef.current;
            if (!ctx) return;
            ctx.taps = [];
            ctx.recallStart = hiResNow();
            repeatActiveRef.current = true;
            setTapCount(0);
            updatePhase('repeat');
          }, config.rememberDuration);
        }, config.postSequenceDelay);
        return;
      }

      setActiveStimulusId(sequence[index]);
      schedule(() => {
        if (session !== sessionRef.current) return;
        setActiveStimulusId(null);
        schedule(() => {
          runWatchStep(session, index + 1, sequence, config);
        }, config.interStimulusInterval);
      }, config.stimulusDuration);
    },
    [schedule, updatePhase]
  );

  const runTrialAt = useCallback(
    (session, index, trials, config) => {
      if (session !== sessionRef.current) return;
      if (index >= trials.length) {
        updatePhase('done');
        callbacksRef.current.onSequenceComplete?.(resultsRef.current);
        return;
      }

      const spec = trials[index];
      const sequence = generateUniqueSequence(spec.sequenceLength, usedSequencesRef.current);
      usedSequencesRef.current = [...usedSequencesRef.current, sequence];

      trialCtxRef.current = { sequence, spec, taps: [], recallStart: null, config, index, trials };
      repeatActiveRef.current = false;
      setTrialNumber(index + 1);
      setCurrentSpec(spec);
      setActiveStimulusId(null);
      setTapCount(0);
      updatePhase('watch');

      runWatchStep(session, 0, sequence, config);
    },
    [runWatchStep, updatePhase]
  );

  /** Starts a fresh run over the given trial specs with the given timing config. */
  const start = useCallback(
    (trials, config) => {
      sessionRef.current += 1;
      const session = sessionRef.current;
      clearAllTimers();
      resultsRef.current = [];
      usedSequencesRef.current = [];
      repeatActiveRef.current = false;
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
    currentSpec,
    activeStimulusId,
    tapCount,
    lastTappedId,
    start,
    stop,
    respond,
  };
}
