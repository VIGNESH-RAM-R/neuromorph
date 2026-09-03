// useVisualMemoryTest
// -----------------------------------------------------------------------------
// The ONLY hook in this module. Owns the entire phase state machine and is
// the sole place that talks to every engine. Components read state from this
// hook and call the actions it returns -- they never import an engine
// directly and never contain scoring/timing/business logic themselves.
//
// Phase flow: instruction -> practice (protocol.practiceTrials, unscored,
// with feedback) -> countdown (3,2,1,GO) -> (observation -> delay ->
// recognition) per scored trial in protocol.scoredSequence -> completion.
//
// Protocol is configurable (demo / standardClinical / a custom research
// object) rather than a hardcoded trial count -- see config/trialModes.js.
// Trial transitions are driven directly from the event that causes them
// (a timer expiring, a submit click) rather than inferred from watching
// state in a separate effect, which keeps the control flow traceable.
import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { ObjectGenerationEngine } from '../engines/ObjectGenerationEngine.js';
import { SceneEngine } from '../engines/SceneEngine.js';
import { RecognitionEngine } from '../engines/RecognitionEngine.js';
import { ValidationEngine } from '../engines/ValidationEngine.js';
import { MetricsEngine } from '../engines/MetricsEngine.js';
import { buildResultModel } from '../engines/ResultModel.js';
import { DIFFICULTY_CONFIG, DELAY_SEC, RECOGNITION_MAX_SEC } from '../config/difficultyConfig.js';
import { TRIAL_MODES } from '../config/trialModes.js';
// §A.4 — this module is one of the two occipital tasks that publish what
// they showed the patient, for Delayed Recognition Memory to re-test later
// in the same session.
import { StudyItemRegistry } from '../../../lib/studyItemRegistry.js';

const TEST_VERSION = '1.0.0';

function makeSessionId() {
  return 'vmt-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

// targetsOverride/optionsOverride let a protocol ask for a specific object
// count on a specific round (see trialModes.js's targetsSequence/
// optionsSequence) without changing the trial's difficulty tier — the tier
// still drives viewing time and the scoring weight/breakdown untouched,
// only how many objects actually appear this round is overridden.
function generateTrial(difficulty, practice, targetsOverride, optionsOverride) {
  const { targets, distractors } = ObjectGenerationEngine.generateTrial(difficulty, targetsOverride, optionsOverride);
  const arranged = SceneEngine.arrange(targets);
  const grid = RecognitionEngine.buildGrid(targets, distractors);
  return { targets: arranged, distractors, difficulty, practice, grid };
}

export function useVisualMemoryTest({ initialProtocolKey = 'demo', protocol: customProtocol } = {}) {
  const [protocolKey, setProtocolKey] = useState(initialProtocolKey);
  const protocol = useMemo(
    () => customProtocol || TRIAL_MODES[protocolKey],
    [customProtocol, protocolKey]
  );

  const [phase, setPhase] = useState('instruction');
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [trialIndex, setTrialIndex] = useState(0);
  const [currentTrial, setCurrentTrial] = useState(null);
  const [selected, setSelected] = useState({});
  const [timeRemainingSec, setTimeRemainingSec] = useState(0);
  const [trialResults, setTrialResults] = useState([]);
  const [resultModel, setResultModel] = useState(null);
  const [practiceFeedback, setPracticeFeedback] = useState(null);

  const sessionIdRef = useRef(makeSessionId());
  const clickHistoryRef = useRef([]);
  // §A.4 — every scored (never practice) trial's targets, once we know
  // whether each was actually recognized, accumulated across the session
  // and exposed via the hook's return value for the contract adapter to
  // include in the final GameResult.
  const registeredItemsRef = useRef([]);
  // Practice trial outcomes, previously discarded once shown as feedback —
  // accumulated here so the contract adapter can report them via
  // onPracticeComplete (features/04 §A.5).
  const practiceResultsRef = useRef([]);
  const assessmentStartRef = useRef(null);
  const recognitionStartRef = useRef(null);
  const timerRef = useRef(null);
  // Holds the latest submitRecognition closure so the recognition timer's
  // setInterval callback (registered once when phase becomes 'recognition')
  // never scores a timeout against a stale, empty `selected` snapshot from
  // the moment the phase began -- see the sync effect right after
  // submitRecognition is defined below.
  const submitRecognitionRef = useRef(() => {});

  const log = useCallback((action, detail) => {
    clickHistoryRef.current.push({ action, detail: detail || null, t: Date.now() });
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  const chooseProtocol = useCallback((key) => {
    if (phase !== 'instruction') return;
    setProtocolKey(key);
  }, [phase]);

  // ---- entering an observation screen (shared by practice and scored trials) ----
  const enterObservation = useCallback((difficulty, practice, targetsOverride, optionsOverride) => {
    setCurrentTrial(generateTrial(difficulty, practice, targetsOverride, optionsOverride));
    setSelected({});
    setPracticeFeedback(null);
    setPhase('observation');
  }, []);

  const startTest = useCallback(() => {
    assessmentStartRef.current = Date.now();
    log('start_test', { protocol: protocolKey });
    if (protocol.practiceTrials > 0) {
      setPracticeIndex(0);
      enterObservation('easy', true);
    } else {
      setPhase('countdown');
    }
  }, [protocol, protocolKey, log, enterObservation]);

  const continuePastPracticeFeedback = useCallback(() => {
    if (practiceIndex + 1 < protocol.practiceTrials) {
      const next = practiceIndex + 1;
      setPracticeIndex(next);
      enterObservation('easy', true);
    } else {
      setPhase('countdown');
    }
  }, [practiceIndex, protocol, enterObservation]);

  // ---- countdown: on completion, enter the first scored trial ----
  useEffect(() => {
    if (phase !== 'countdown') return undefined;
    const sequence = [3, 2, 1, 'GO'];
    let idx = 0;
    setTimeRemainingSec(sequence[0]);
    const id = setInterval(() => {
      idx += 1;
      if (idx >= sequence.length) {
        clearInterval(id);
        setTrialIndex(0);
        enterObservation(protocol.scoredSequence[0], false, protocol.targetsSequence?.[0], protocol.optionsSequence?.[0]);
      } else {
        setTimeRemainingSec(sequence[idx]);
      }
    }, 700);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // ---- observation timer ----
  useEffect(() => {
    if (phase !== 'observation' || !currentTrial) return undefined;
    const viewSec = DIFFICULTY_CONFIG[currentTrial.difficulty].viewSec;
    let remaining = viewSec;
    setTimeRemainingSec(remaining);
    log('observation_shown', { difficulty: currentTrial.difficulty, count: currentTrial.targets.length, practice: currentTrial.practice });
    clearTimer();
    timerRef.current = setInterval(() => {
      remaining -= 1;
      setTimeRemainingSec(Math.max(0, remaining));
      if (remaining <= 0) {
        clearTimer();
        setPhase('delay');
      }
    }, 1000);
    return () => clearTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, currentTrial]);

  // ---- delay timer ----
  useEffect(() => {
    if (phase !== 'delay') return undefined;
    let remaining = DELAY_SEC;
    setTimeRemainingSec(remaining);
    log('delay_start');
    clearTimer();
    timerRef.current = setInterval(() => {
      remaining -= 1;
      setTimeRemainingSec(Math.max(0, remaining));
      if (remaining <= 0) {
        clearTimer();
        recognitionStartRef.current = Date.now();
        setPhase('recognition');
      }
    }, 1000);
    return () => clearTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // ---- recognition timer ----
  useEffect(() => {
    if (phase !== 'recognition') return undefined;
    let remaining = RECOGNITION_MAX_SEC;
    setTimeRemainingSec(remaining);
    clearTimer();
    timerRef.current = setInterval(() => {
      remaining -= 1;
      setTimeRemainingSec(Math.max(0, remaining));
      if (remaining <= 0) {
        clearTimer();
        submitRecognitionRef.current(true);
      }
    }, 1000);
    return () => clearTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const toggleSelect = useCallback((id) => {
    if (phase !== 'recognition') return;
    setSelected((prev) => {
      const next = { ...prev };
      if (next[id]) delete next[id]; else next[id] = true;
      return next;
    });
    log('toggle_select', { id });
  }, [phase, log]);

  const finishAssessment = useCallback((finalResults) => {
    const metrics = MetricsEngine.compute(finalResults);
    const model = buildResultModel({
      sessionId: sessionIdRef.current,
      testVersion: TEST_VERSION,
      trialResults: finalResults,
      metrics,
      clickHistory: clickHistoryRef.current,
      assessmentStartTime: assessmentStartRef.current,
      trialMode: protocolKey
    });
    setResultModel(model);
    setPhase('completion');
  }, [protocolKey]);

  // submitRecognition is the one function every trial-ending path (manual
  // submit click or the 30s timeout) funnels through. It reads currentTrial
  // and selected directly from the latest render via the dependency array,
  // and moves the state machine forward itself -- no separate effect has to
  // infer "what happens next" from a state change.
  const submitRecognition = useCallback((timedOut) => {
    if (!currentTrial) return;
    clearTimer();
    const reactionTimeMs = Date.now() - (recognitionStartRef.current || Date.now());
    const selectedIds = Object.keys(selected);
    const result = ValidationEngine.validate(selectedIds, currentTrial.grid);
    log('submit', { timedOut, reactionTimeMs, ...result, practice: currentTrial.practice });

    if (currentTrial.practice) {
      setPracticeFeedback({ result, selectedIds });
      practiceResultsRef.current = [
        ...practiceResultsRef.current,
        { reactionTimeMs, timedOut, correct: result.misses === 0 && result.falsePositives === 0 },
      ];
      setPhase('practice-feedback');
      return;
    }

    const record = { difficulty: currentTrial.difficulty, reactionTimeMs, timedOut, ...result };
    const updated = [...trialResults, record];
    setTrialResults(updated);

    // §A.4 — register this trial's targets now, not at observation time:
    // only now do we know whether each was actually recognized in this
    // same trial's own immediate check (wasRecognizedAtEncoding).
    const registeredItems = currentTrial.targets.map((t) => ({
      id: t.id,
      wasRecognizedAtEncoding: selectedIds.includes(t.id),
    }));
    registeredItemsRef.current = [...registeredItemsRef.current, ...registeredItems];
    StudyItemRegistry.register({ sourceModule: 'Visual Memory Test', itemType: 'object', items: registeredItems });

    if (updated.length >= protocol.scoredSequence.length) {
      finishAssessment(updated);
    } else {
      setTrialIndex(updated.length);
      enterObservation(
        protocol.scoredSequence[updated.length],
        false,
        protocol.targetsSequence?.[updated.length],
        protocol.optionsSequence?.[updated.length]
      );
    }
  }, [currentTrial, selected, trialResults, protocol, log, clearTimer, enterObservation, finishAssessment]);

  // Keep the ref used by the recognition timeout path pointed at the latest
  // submitRecognition closure on every render, so a timeout always scores
  // against the participant's actual current selections.
  useEffect(() => {
    submitRecognitionRef.current = submitRecognition;
  });

  const restartTest = useCallback(() => {
    clearTimer();
    sessionIdRef.current = makeSessionId();
    clickHistoryRef.current = [];
    registeredItemsRef.current = [];
    practiceResultsRef.current = [];
    assessmentStartRef.current = null;
    recognitionStartRef.current = null;
    setPracticeIndex(0);
    setTrialIndex(0);
    setCurrentTrial(null);
    setSelected({});
    setTrialResults([]);
    setResultModel(null);
    setPracticeFeedback(null);
    setPhase('instruction');
  }, [clearTimer]);

  return {
    phase,
    protocolKey,
    protocol,
    chooseProtocol,
    currentTrial,
    selected,
    practiceIndex,
    practiceTotal: protocol.practiceTrials,
    trialIndex,
    trialTotal: protocol.scoredSequence ? protocol.scoredSequence.length : 0,
    timeRemainingSec,
    trialResults,
    practiceFeedback,
    resultModel,
    registeredItems: registeredItemsRef.current,
    practiceResults: practiceResultsRef.current,
    startTest,
    toggleSelect,
    submitRecognition: () => submitRecognition(false),
    continuePastPracticeFeedback,
    restartTest
  };
}
