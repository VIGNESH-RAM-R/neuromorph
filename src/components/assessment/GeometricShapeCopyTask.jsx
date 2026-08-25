import { useState, useRef, useCallback, useEffect } from 'react';
import { buildPracticeSequence, buildAssessmentSequence, CANVAS_SIZE } from '../../config/geometricShapeCopyConfig.js';
import { DrawingEngine, analyzeDrawing, ValidationEngine, GeometricShapeCopyEngine } from '../../engines/GeometricShapeCopyEngine.js';
import TaskCountdown from './shared/TaskCountdown.jsx';
import { t, format } from '../../i18n/strings/assessmentTasks.js';
import { DEFAULT_LANGUAGE } from '../../config/i18nConfig.js';

// Geometric Shape Copying Test -- teammate's real project (geometry_game.zip,
// 2026-08-11 integration, part of the real Final 8: "Geometric Shape Copy").
// Restyled to this app's nmpa- theme; canvas drawing + freehand-stroke
// capture reimplemented natively here (raw HTML5 canvas + pointer events)
// since the original's own DrawingCanvas.jsx isn't ported line-for-line --
// only its DrawingEngine (stroke bookkeeping) and scoring math are. Flow: 1
// unscored practice figure -> countdown -> 6 scored figures (2 easy, 2
// medium, 2 hard) -> onSubmit. Scored sequence trimmed for the shared
// 20-minute time budget -- see geometricShapeCopyConfig.js's own comment.

function FigureSVG({ figure, size = 140 }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
      {figure.components.map((c, i) => {
        if (c.type === 'polygon') return <polygon key={i} points={c.vertices.map((v) => v.join(',')).join(' ')} fill="none" stroke="var(--nmpa-accent, #2f6db5)" strokeWidth="2" />;
        if (c.type === 'line') return <line key={i} x1={c.points[0][0]} y1={c.points[0][1]} x2={c.points[1][0]} y2={c.points[1][1]} stroke="var(--nmpa-accent, #2f6db5)" strokeWidth="2" />;
        if (c.type === 'circle') return <circle key={i} cx={c.cx} cy={c.cy} r={c.r} fill="none" stroke="var(--nmpa-accent, #2f6db5)" strokeWidth="2" />;
        return null;
      })}
    </svg>
  );
}

export default function GeometricShapeCopyTask({ onSubmit, language = DEFAULT_LANGUAGE }) {
  const [stage, setStage] = useState('practice'); // 'practice' | 'countdown' | 'scored'
  const [figureIndex, setFigureIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [strokesVersion, setStrokesVersion] = useState(0);
  const [practiceFeedback, setPracticeFeedback] = useState(null);

  const practiceSequence = useRef(buildPracticeSequence()).current;
  const assessmentSequence = useRef(buildAssessmentSequence()).current;
  const drawingEngineRef = useRef(new DrawingEngine());
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const figureStartRef = useRef(null);
  const timerRef = useRef(null);
  const resultsRef = useRef([]);
  const sessionIdRef = useRef('gsc-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8));

  const currentFigure = stage === 'practice' ? practiceSequence[0] : (stage === 'scored' ? assessmentSequence[figureIndex] : null);

  const clearTimer = useCallback(() => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } }, []);

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Canvas 2D does NOT understand CSS var() syntax (canvas is outside the
    // DOM/CSSOM) -- assigning 'var(--nmpa-ink, #1a2333)' directly is silently
    // ignored by the spec and ctx.strokeStyle just stays at its default,
    // '#000000'. That happened to look fine in light mode (ink is near-black
    // anyway) but in dark mode the canvas background (--nmpa-surface) is
    // dark too, so the user's own strokes were rendering at very low
    // contrast against it. Fix: resolve the CSS variable to its real
    // computed color first, then hand canvas a literal value.
    const inkColor = getComputedStyle(document.documentElement).getPropertyValue('--nmpa-ink').trim() || '#1a2333';
    ctx.strokeStyle = inkColor;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (const stroke of drawingEngineRef.current.getStrokes()) {
      if (!stroke.length) continue;
      ctx.beginPath();
      ctx.moveTo(stroke[0].x, stroke[0].y);
      for (let i = 1; i < stroke.length; i++) ctx.lineTo(stroke[i].x, stroke[i].y);
      ctx.stroke();
    }
  }, []);

  useEffect(() => { redrawCanvas(); }, [strokesVersion, redrawCanvas]);

  const relativeCoords = useCallback((e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const point = e.touches ? e.touches[0] : e;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return { x: (point.clientX - rect.left) * scaleX, y: (point.clientY - rect.top) * scaleY };
  }, []);

  const onPointerDown = useCallback((e) => {
    e.preventDefault();
    drawingRef.current = true;
    const { x, y } = relativeCoords(e);
    drawingEngineRef.current.beginStroke(x, y);
    setStrokesVersion((v) => v + 1);
  }, [relativeCoords]);
  const onPointerMove = useCallback((e) => {
    if (!drawingRef.current) return;
    e.preventDefault();
    const { x, y } = relativeCoords(e);
    drawingEngineRef.current.extendStroke(x, y);
    setStrokesVersion((v) => v + 1);
  }, [relativeCoords]);
  const onPointerUp = useCallback(() => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    drawingEngineRef.current.endStroke();
    setStrokesVersion((v) => v + 1);
  }, []);

  const clearDrawing = useCallback(() => {
    drawingEngineRef.current.startFigure();
    setStrokesVersion((v) => v + 1);
  }, []);

  const beginFigure = useCallback((figure) => {
    drawingEngineRef.current.startFigure();
    figureStartRef.current = Date.now();
    setStrokesVersion((v) => v + 1);
    setPracticeFeedback(null);
    let remaining = figure.timeLimitSec;
    setTimeRemaining(remaining);
    clearTimer();
    timerRef.current = setInterval(() => {
      remaining -= 1;
      setTimeRemaining(Math.max(0, remaining));
      if (remaining <= 0) { clearTimer(); submitFigure(true); }
    }, 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearTimer]);

  useEffect(() => {
    if (!currentFigure) return;
    beginFigure(currentFigure);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, figureIndex]);

  function submitFigure(timedOut) {
    clearTimer();
    const figure = currentFigure;
    if (!figure) return;
    const strokes = drawingEngineRef.current.getStrokes();
    const validation = ValidationEngine.validateAttempt(strokes, timedOut);
    const responseTimeMs = Date.now() - (figureStartRef.current || Date.now());
    const planningTimeMs = drawingEngineRef.current.getPlanningTimeMs();
    const drawingMetrics = validation.valid ? analyzeDrawing(figure, strokes, 100 / CANVAS_SIZE) : null;

    if (stage === 'practice') {
      setPracticeFeedback(validation.valid ? t(language, 'geometricPracticeOkFeedback') : t(language, 'geometricPracticeRetryFeedback'));
      setTimeout(() => setStage('countdown'), 1100);
      return;
    }

    resultsRef.current = [...resultsRef.current, {
      figureId: figure.id,
      difficulty: figure.difficulty,
      timeLimitSec: figure.timeLimitSec,
      status: validation.valid ? 'completed' : (timedOut ? 'timed_out' : 'no_response'),
      responseTimeMs,
      planningTimeMs,
      drawingMetrics,
    }];

    const nextIndex = figureIndex + 1;
    if (nextIndex >= assessmentSequence.length) {
      const raw = GeometricShapeCopyEngine.score(resultsRef.current, { sessionId: sessionIdRef.current });
      onSubmit({ score: raw.score, raw });
    } else {
      setFigureIndex(nextIndex);
    }
  }

  useEffect(() => () => clearTimer(), [clearTimer]);

  if (stage === 'countdown') return <TaskCountdown onDone={() => { setStage('scored'); setFigureIndex(0); }} />;
  if (!currentFigure) return null;

  const isPractice = stage === 'practice';

  return (
    <div className="nmpa-task">
      <p className="nmpa-task__instruction">
        {isPractice ? t(language, 'practicePrefix') : ''}{t(language, 'geometricInstruction')}
      </p>
      <p className="nmpa-task__progress">{isPractice ? t(language, 'practiceFigureLabel') : format(t(language, 'figureProgress'), { current: figureIndex + 1, total: assessmentSequence.length })}</p>
      <p className="nmpa-muted">{format(t(language, 'timeRemainingLine'), { seconds: timeRemaining })}</p>

      <div className="nmpa-task__geometry-layout">
        <div className="nmpa-task__geometry-reference">
          <FigureSVG figure={currentFigure} />
        </div>
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="nmpa-task__geometry-canvas"
          onMouseDown={onPointerDown}
          onMouseMove={onPointerMove}
          onMouseUp={onPointerUp}
          onMouseLeave={onPointerUp}
          onTouchStart={onPointerDown}
          onTouchMove={onPointerMove}
          onTouchEnd={onPointerUp}
        />
      </div>

      <div className="nmpa-task__geometry-actions">
        <button type="button" className="nmpa-button" onClick={clearDrawing}>{t(language, 'clearBtn')}</button>
        <button type="button" className="nmpa-button nmpa-button--primary" onClick={() => submitFigure(false)}>{t(language, 'doneBtn')}</button>
      </div>

      {practiceFeedback && <p className="nmpa-task__feedback is-ok">{practiceFeedback}</p>}
    </div>
  );
}
