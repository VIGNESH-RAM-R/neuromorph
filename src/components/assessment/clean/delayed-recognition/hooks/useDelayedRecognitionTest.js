// useDelayedRecognitionTest
// -----------------------------------------------------------------------------
// The ONLY hook in this module. Owns the entire phase state machine and is
// the sole place that talks to every engine. Components read state from
// this hook and call the actions it returns -- they never import an engine
// directly and never contain scoring/timing/business logic themselves.
//
// Phase flow: instruction -> (no-data, if MemoryRetrievalEngine finds
// nothing) -> countdown (3,2,1,GO) -> recognition (one trial per retrieved
// category, looped) -> completion.
//
// No practice phase and no difficulty tiers here -- unlike Visual Memory
// Test, this module never introduces new material, so there's nothing to
// practice encoding. Every trial is a real scored delayed-recognition probe
// on items retrieved from other modules.
import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { MemoryRetrievalEngine } from '../engines/MemoryRetrievalEngine.js';
import { RecognitionEngine } from '../engines/RecognitionEngine.js';
import { ValidationEngine } from '../engines/ValidationEngine.js';
import { MetricsEngine } from '../engines/MetricsEngine.js';
import { buildResultModel } from '../engines/ResultModel.js';
import { RECOGNITION_MAX_SEC } from '../config/scoringConfig.js';

const TEST_VERSION = '1.0.0';
// Was uncapped — every registered round from Visual Memory (and, once the
// task order reaches it, Face Recognition) became its own category here,
// so this scaled directly with however many rounds those games ran, up to
// 9+ in practice. Was capped to 3, now 2 (reported as still too many) —
// enough to probe delayed recall without re-running the whole earlier
// test; picked spread across whatever's available (see pickSpread below)
// rather than just the first 2, so a short session still samples early and
// late material instead of only the easiest round.
const MAX_CATEGORIES = 2;

function makeSessionId() {
  return 'drt-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

// Picks n items evenly spread across arr (first, last, and evenly-spaced
// in between) rather than just arr.slice(0, n) — so a 3-of-5 pick lands on
// rounds 1, 3, 5, not just 1, 2, 3.
function pickSpread(arr, n) {
  if (arr.length <= n) return arr;
  if (n <= 1) return arr.slice(0, n);
  const step = (arr.length - 1) / (n - 1);
  const indices = Array.from({ length: n }, (_, i) => Math.round(i * step));
  return indices.map((i) => arr[i]);
}

// `allowMockFallback` defaults to true (demoable when mounted standalone —
// GameDebugPage/PracticeGameRunner never run visual-memory first, so the
// registry is always empty there) but the real weekly session
// (SessionPlayer.jsx) explicitly passes `allowMockFallback: false` via
// DelayedRecognitionGame's `config` prop. Before this was wired through,
// EVERY real scored run defaulted to mock data too — MemoryRetrievalEngine
// only falls back when the shared registry is empty, which is always true
// for a session's own Delayed Recognition mount until this got threaded
// in, since the module-level default here was never overridden by anyone.
// Found during this project's own full-app review: weeklyOrder.js's own
// doc comment says an empty registry should reach the "nothing to test
// yet" screen (NoDataScreen, already fully built and already wired into
// this module's render logic) — instead every real session silently
// scored a patient against completely fabricated study items (including
// "Figure Matching Test," a module that doesn't exist anywhere in this
// app's real 8-task list) with no error or signal anywhere that it happened.
export function useDelayedRecognitionTest({ allowMockFallback = true } = {}) {
  // Retrieved once per mount -- this is the set of study items "presented
  // earlier in today's session" as far as this module is concerned.
  const categories = useMemo(() => pickSpread(MemoryRetrievalEngine.retrieveAll({ allowMockFallback }), MAX_CATEGORIES), [allowMockFallback]);

  const [phase, setPhase] = useState(categories.length === 0 ? 'no-data' : 'instruction');
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [currentTrial, setCurrentTrial] = useState(null);
  const [selected, setSelected] = useState({});
  const [timeRemainingSec, setTimeRemainingSec] = useState(0);
  const [trialResults, setTrialResults] = useState([]);
  const [resultModel, setResultModel] = useState(null);

  const sessionIdRef = useRef(makeSessionId());
  const clickHistoryRef = useRef([]);
  const assessmentStartRef = useRef(null);
  const recognitionStartRef = useRef(null);
  const timerRef = useRef(null);
  const submitRecognitionRef = useRef(() => {});

  const log = useCallback((action, detail) => {
    clickHistoryRef.current.push({ action, detail: detail || null, t: Date.now() });
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  const enterCategoryTrial = useCallback((index) => {
    const studySet = categories[index];
    const grid = RecognitionEngine.buildTrial(studySet);
    setCurrentTrial({ itemType: studySet.itemType, sourceModule: studySet.sourceModule, grid });
    setSelected({});
    setPhase('recognition');
  }, [categories]);

  const startTest = useCallback(() => {
    assessmentStartRef.current = Date.now();
    log('start_test', { categoryCount: categories.length });
    setPhase('countdown');
  }, [categories.length, log]);

  // ---- countdown: on completion, enter the first category trial ----
  useEffect(() => {
    if (phase !== 'countdown') return undefined;
    const sequence = [3, 2, 1, 'GO'];
    let idx = 0;
    setTimeRemainingSec(sequence[0]);
    const id = setInterval(() => {
      idx += 1;
      if (idx >= sequence.length) {
        clearInterval(id);
        setCategoryIndex(0);
        enterCategoryTrial(0);
      } else {
        setTimeRemainingSec(sequence[idx]);
      }
    }, 700);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // ---- recognition timer ----
  useEffect(() => {
    if (phase !== 'recognition' || !currentTrial) return undefined;
    let remaining = RECOGNITION_MAX_SEC;
    recognitionStartRef.current = Date.now();
    setTimeRemainingSec(remaining);
    log('recognition_shown', { itemType: currentTrial.itemType, sourceModule: currentTrial.sourceModule });
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
  }, [phase, currentTrial]);

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
      assessmentStartTime: assessmentStartRef.current
    });
    setResultModel(model);
    setPhase('completion');
  }, []);

  // The one function every trial-ending path (manual submit or the 30s
  // timeout) funnels through. Reads currentTrial/selected from the latest
  // render via the dependency array; moves the state machine forward
  // itself rather than relying on a separate effect to infer what's next.
  const submitRecognition = useCallback((timedOut) => {
    if (!currentTrial) return;
    clearTimer();
    const reactionTimeMs = Date.now() - (recognitionStartRef.current || Date.now());
    const selectedIds = Object.keys(selected);
    const result = ValidationEngine.validate(selectedIds, currentTrial.grid);
    log('submit', { timedOut, reactionTimeMs, hits: result.hits, misses: result.misses, falsePositives: result.falsePositives });

    const record = {
      itemType: currentTrial.itemType,
      sourceModule: currentTrial.sourceModule,
      reactionTimeMs, timedOut,
      // DelayedRecognitionGame.jsx's toContractTrials() reads `fullyCorrect`
      // off every trial record — it was never actually set here (only
      // ValidationEngine's raw hits/misses/falsePositives were spread in),
      // so `correct` was `undefined` for every trial regardless of how the
      // patient actually did, and the backend's attempt schema requires
      // `correct` to be a real boolean — meaning every scored attempt for
      // this game likely failed to save at all. Same "fully correct" rule
      // already used by Visual Memory and Face Recognition: every target
      // found, nothing extra selected.
      fullyCorrect: result.misses === 0 && result.falsePositives === 0,
      ...result
    };
    const updated = [...trialResults, record];
    setTrialResults(updated);

    if (updated.length >= categories.length) {
      finishAssessment(updated);
    } else {
      setCategoryIndex(updated.length);
      enterCategoryTrial(updated.length);
    }
  }, [currentTrial, selected, trialResults, categories.length, log, clearTimer, enterCategoryTrial, finishAssessment]);

  // Keep the ref used by the timeout path pointed at the latest
  // submitRecognition closure on every render, so a 30s timeout always
  // scores against the participant's actual current selections rather than
  // a stale snapshot from when the recognition phase began.
  useEffect(() => {
    submitRecognitionRef.current = submitRecognition;
  });

  const restartTest = useCallback(() => {
    clearTimer();
    sessionIdRef.current = makeSessionId();
    clickHistoryRef.current = [];
    assessmentStartRef.current = null;
    recognitionStartRef.current = null;
    setCategoryIndex(0);
    setCurrentTrial(null);
    setSelected({});
    setTrialResults([]);
    setResultModel(null);
    setPhase(categories.length === 0 ? 'no-data' : 'instruction');
  }, [clearTimer, categories.length]);

  return {
    phase,
    categories,
    categoryIndex,
    categoryTotal: categories.length,
    currentTrial,
    selected,
    timeRemainingSec,
    trialResults,
    resultModel,
    startTest,
    toggleSelect,
    submitRecognition: () => submitRecognition(false),
    restartTest
  };
}
