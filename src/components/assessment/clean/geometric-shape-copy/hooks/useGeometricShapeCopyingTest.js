// useGeometricShapeCopyingTest
// -----------------------------------------------------------------------------
// The ONLY hook in this module. Owns the entire phase state machine and is the
// sole place that talks to every engine. Components read state from this hook
// and call the actions it returns -- they never import an engine directly and
// never contain scoring/timing/business logic themselves.
//
// Phase flow: instruction -> practice (2, unscored) -> countdown (3,2,1,GO)
// -> assessment (12 scored figures, ascending difficulty) -> completion.

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { ShapeGeneratorEngine } from '../engines/ShapeGeneratorEngine.js';
import { DrawingEngine } from '../engines/DrawingEngine.js';
import { analyzeDrawing } from '../engines/GeometryAnalysisEngine.js';
import { ValidationEngine } from '../engines/ValidationEngine.js';
import { MetricsEngine } from '../engines/MetricsEngine.js';
import { buildResultModel } from '../engines/ResultModel.js';

const COUNTDOWN_SEQUENCE = [3, 2, 1, 'GO'];
const COUNTDOWN_STEP_MS = 700;
const TEST_VERSION = '1.0.0';

// Figure-space is a fixed 0-100 unit square; canvasToFigureScale converts a
// canvas pixel coordinate into that space regardless of actual rendered size.
function makeSessionId() {
  return 'gsc-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

export function useGeometricShapeCopyingTest({ canvasSize = 480 } = {}) {
  const [phase, setPhase] = useState('instruction');
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [assessmentIndex, setAssessmentIndex] = useState(0);
  const [countdownIdx, setCountdownIdx] = useState(0);
  const [timeRemainingSec, setTimeRemainingSec] = useState(0);
  const [strokesVersion, setStrokesVersion] = useState(0); // bump to force canvas re-render
  const [perFigureResults, setPerFigureResults] = useState([]);
  const [resultModel, setResultModel] = useState(null);

  const drawingEngineRef = useRef(new DrawingEngine());
  const sessionIdRef = useRef(makeSessionId());
  const clickHistoryRef = useRef([]);
  const figureStartWallClockRef = useRef(null);
  const timerRef = useRef(null);
  // Practice-figure outcomes, previously discarded once the figure advanced
  // — accumulated so the contract adapter can report them via
  // onPracticeComplete (features/04 §A.5).
  const practiceResultsRef = useRef([]);

  const practiceSequence = useMemo(() => ShapeGeneratorEngine.buildPracticeSequence(), []);
  const assessmentSequence = useMemo(() => ShapeGeneratorEngine.buildAssessmentSequence(), []);

  const canvasToFigureScale = 100 / canvasSize;

  const logEvent = useCallback((figureId, event, extra = {}) => {
    clickHistoryRef.current.push({ figureId, event, t: Date.now(), ...extra });
  }, []);

  const currentFigure = useMemo(() => {
    if (phase === 'practice') return practiceSequence[practiceIndex] || null;
    if (phase === 'assessment') return assessmentSequence[assessmentIndex] || null;
    return null;
  }, [phase, practiceIndex, assessmentIndex, practiceSequence, assessmentSequence]);

  const clearTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  // ---- pointer handlers (delegate straight to DrawingEngine) ----
  const onPointerDown = useCallback((x, y) => {
    drawingEngineRef.current.beginStroke(x, y);
    setStrokesVersion((v) => v + 1);
  }, []);
  const onPointerMove = useCallback((x, y) => {
    drawingEngineRef.current.extendStroke(x, y);
    setStrokesVersion((v) => v + 1);
  }, []);
  const onPointerUp = useCallback(() => {
    drawingEngineRef.current.endStroke();
    setStrokesVersion((v) => v + 1);
  }, []);
  const clearCurrentDrawing = useCallback(() => {
    if (!currentFigure) return;
    drawingEngineRef.current.startFigure();
    setStrokesVersion((v) => v + 1);
    logEvent(currentFigure.id, 'clear');
  }, [currentFigure, logEvent]);

  const getStrokes = useCallback(() => drawingEngineRef.current.getStrokes(), []);
  void strokesVersion; // strokesVersion exists purely to force consumers to re-render on draw

  // ---- figure lifecycle ----
  const beginFigure = useCallback((figure) => {
    drawingEngineRef.current.startFigure();
    figureStartWallClockRef.current = Date.now();
    setTimeRemainingSec(figure.timeLimitSec);
    logEvent(figure.id, 'figure_shown');
    setStrokesVersion((v) => v + 1);
  }, [logEvent]);

  const finishPracticeFigure = useCallback((timedOut = false) => {
    logEvent(currentFigure ? currentFigure.id : 'practice', 'practice_submitted');
    clearTimer();

    const strokes = drawingEngineRef.current.getStrokes();
    const validation = ValidationEngine.validateAttempt(strokes, timedOut);
    const responseTimeMs = Date.now() - (figureStartWallClockRef.current || Date.now());
    practiceResultsRef.current = [...practiceResultsRef.current, { responseTimeMs, timedOut, correct: validation.valid }];

    if (practiceIndex + 1 < practiceSequence.length) {
      setPracticeIndex((i) => i + 1);
    } else {
      setPhase('countdown');
      setCountdownIdx(0);
    }
  }, [currentFigure, practiceIndex, practiceSequence.length, logEvent, clearTimer]);

  const submitAssessmentFigure = useCallback((timedOut) => {
    const figure = assessmentSequence[assessmentIndex];
    if (!figure) return;
    clearTimer();

    const strokes = drawingEngineRef.current.getStrokes();
    const validation = ValidationEngine.validateAttempt(strokes, timedOut);
    const responseTimeMs = Date.now() - (figureStartWallClockRef.current || Date.now());
    const planningTimeMs = drawingEngineRef.current.getPlanningTimeMs();

    const drawingMetrics = validation.valid
      ? analyzeDrawing(figure, strokes, canvasToFigureScale)
      : null;

    logEvent(figure.id, timedOut ? 'timed_out' : 'submitted', { valid: validation.valid });

    setPerFigureResults((prev) => [
      ...prev,
      {
        figureId: figure.id,
        difficulty: figure.difficulty,
        timeLimitSec: figure.timeLimitSec,
        // 'completed': valid drawing submitted. 'timed_out': the per-figure
        // timer expired with no valid drawing. 'no_response': the participant
        // pressed Done on an empty/near-empty canvas without timing out.
        // Only 'not_administered' (see MetricsEngine) is excluded from tier
        // accuracy -- both of these still count as genuine administered
        // attempts, same discipline as the Matrix Reasoning fix.
        status: validation.valid ? 'completed' : (timedOut ? 'timed_out' : 'no_response'),
        responseTimeMs,
        planningTimeMs,
        drawingMetrics
      }
    ]);

    if (assessmentIndex + 1 < assessmentSequence.length) {
      setAssessmentIndex((i) => i + 1);
    } else {
      setPhase('completion');
    }
  }, [assessmentIndex, assessmentSequence, canvasToFigureScale, logEvent, clearTimer]);

  // ---- countdown effect ----
  useEffect(() => {
    if (phase !== 'countdown') return undefined;
    if (countdownIdx >= COUNTDOWN_SEQUENCE.length) {
      setPhase('assessment');
      setAssessmentIndex(0);
      return undefined;
    }
    const id = setTimeout(() => setCountdownIdx((i) => i + 1), COUNTDOWN_STEP_MS);
    return () => clearTimeout(id);
  }, [phase, countdownIdx]);

  // ---- per-figure timer effect (practice + assessment) ----
  useEffect(() => {
    if (phase !== 'practice' && phase !== 'assessment') return undefined;
    if (!currentFigure) return undefined;

    beginFigure(currentFigure);
    let remaining = currentFigure.timeLimitSec;
    clearTimer();
    timerRef.current = setInterval(() => {
      remaining -= 1;
      setTimeRemainingSec(Math.max(0, remaining));
      if (remaining <= 0) {
        clearTimer();
        if (phase === 'practice') finishPracticeFigure(true);
        else submitAssessmentFigure(true);
      }
    }, 1000);

    return () => clearTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, currentFigure && currentFigure.id]);

  // ---- build ResultModel once assessment completes ----
  useEffect(() => {
    if (phase !== 'completion' || resultModel) return;
    const aggregateMetrics = MetricsEngine.computeAssessmentMetrics(perFigureResults);
    const model = buildResultModel({
      sessionId: sessionIdRef.current,
      testVersion: TEST_VERSION,
      clickHistory: clickHistoryRef.current,
      aggregateMetrics
    });
    setResultModel(model);
  }, [phase, perFigureResults, resultModel]);

  const startTest = useCallback(() => {
    setPhase('practice');
    setPracticeIndex(0);
  }, []);

  const submitCurrentFigure = useCallback(() => {
    if (phase === 'practice') finishPracticeFigure();
    else if (phase === 'assessment') submitAssessmentFigure(false);
  }, [phase, finishPracticeFigure, submitAssessmentFigure]);

  const restartTest = useCallback(() => {
    clearTimer();
    drawingEngineRef.current.reset();
    sessionIdRef.current = makeSessionId();
    clickHistoryRef.current = [];
    practiceResultsRef.current = [];
    setPerFigureResults([]);
    setResultModel(null);
    setPracticeIndex(0);
    setAssessmentIndex(0);
    setCountdownIdx(0);
    setPhase('instruction');
  }, [clearTimer]);

  return {
    phase,
    currentFigure,
    practiceIndex,
    practiceTotal: practiceSequence.length,
    assessmentIndex,
    assessmentTotal: assessmentSequence.length,
    countdownLabel: COUNTDOWN_SEQUENCE[countdownIdx] ?? 'GO',
    timeRemainingSec,
    perFigureResults,
    resultModel,
    practiceResults: practiceResultsRef.current,
    canvasSize,
    getStrokes,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    clearCurrentDrawing,
    startTest,
    submitCurrentFigure,
    restartTest
  };
}
