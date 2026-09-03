import { useEffect, useRef } from 'react';
// See the note on DelayedRecognitionGame.jsx — CSS previously imported at
// this game's own standalone main.jsx level.
import './styles/index.css';
import { useGeometricShapeCopyingTest } from './hooks/useGeometricShapeCopyingTest.js';
import InstructionScreen from './components/InstructionScreen.jsx';
import PracticeScreen from './components/PracticeScreen.jsx';
import CountdownScreen from './components/CountdownScreen.jsx';
import AssessmentScreen from './components/AssessmentScreen.jsx';
import CompletionScreen from './components/CompletionScreen.jsx';
import { ShapeGeneratorEngine } from './engines/ShapeGeneratorEngine.js';

/**
 * Contract adapter. See src/features/games/weekly/geometric-shape-copy/adapter.js
 * for the mount/unmount wrapper this component gets rendered through.
 */
// `status === 'completed'` only means a non-empty drawing was submitted
// before the time limit — it says nothing about whether the copy actually
// resembled the target figure. Treating that as `correct` meant a
// barely-recognizable scribble counted exactly the same as an accurate
// reproduction, and the backend derives this game's whole accuracy column
// from the fraction of trials marked correct (server/src/lib/taskAttempts.js)
// — so every patient who simply attempted every figure would land near
// 100% accuracy for the parietal/frontal domain regardless of drawing
// quality. `overallDrawingAccuracy` (engines/GeometryAnalysisEngine.js) is
// the real per-figure quality score already computed for every valid
// submission; 65 is the same TYPICAL/MILD boundary InterpretationEngine.js
// already uses for the aggregate score, not a new number invented here.
const DRAWING_ACCURACY_PASS_THRESHOLD = 65;

function toContractTrials(perFigureResults) {
  return perFigureResults.map((r) => {
    const correct = r.status === 'completed' && (r.drawingMetrics?.overallDrawingAccuracy ?? 0) >= DRAWING_ACCURACY_PASS_THRESHOLD;
    return {
      responseTimeMs: r.responseTimeMs,
      correct,
      errorType: correct ? undefined : r.status === 'completed' ? 'low_accuracy' : r.status,
    };
  });
}
function toContractPracticeTrials(practiceResults) {
  return practiceResults.map((p) => ({
    responseTimeMs: p.responseTimeMs,
    correct: p.correct,
    errorType: p.correct ? undefined : p.timedOut ? 'timed_out' : 'no_response',
  }));
}

export default function GeometryGame({ config, onComplete, onPracticeComplete }) {
  const test = useGeometricShapeCopyingTest({ canvasSize: 480 });
  const theme = config?.theme ?? 'light';
  const reportedScoredRef = useRef(false);
  const reportedPracticeRef = useRef(false);

  useEffect(() => {
    if (test.phase === 'completion' && test.resultModel && !reportedScoredRef.current) {
      reportedScoredRef.current = true;
      onComplete?.({
        score: test.resultModel.cognitiveScore,
        trials: toContractTrials(test.perFigureResults),
        rawLog: test.resultModel,
      });
    }
  }, [test.phase, test.resultModel, test.perFigureResults, onComplete]);

  useEffect(() => {
    if (test.phase === 'countdown' && test.practiceResults.length > 0 && !reportedPracticeRef.current) {
      reportedPracticeRef.current = true;
      onPracticeComplete?.({ score: null, trials: toContractPracticeTrials(test.practiceResults) });
    }
  }, [test.phase, test.practiceResults, onPracticeComplete]);

  return (
    <div className="gsc-app">
      {test.phase === 'instruction' && (
        <InstructionScreen
          onStart={test.startTest}
          sampleFigure={ShapeGeneratorEngine.getFigureById('easy-pentagon')}
        />
      )}

      {test.phase === 'practice' && test.currentFigure && (
        <PracticeScreen
          figure={test.currentFigure}
          practiceIndex={test.practiceIndex}
          practiceTotal={test.practiceTotal}
          timeRemainingSec={test.timeRemainingSec}
          canvasSize={test.canvasSize}
          theme={theme}
          strokes={test.getStrokes()}
          onPointerDown={test.onPointerDown}
          onPointerMove={test.onPointerMove}
          onPointerUp={test.onPointerUp}
          onClear={test.clearCurrentDrawing}
          onDone={test.submitCurrentFigure}
        />
      )}

      {test.phase === 'countdown' && <CountdownScreen label={test.countdownLabel} />}

      {test.phase === 'assessment' && test.currentFigure && (
        <AssessmentScreen
          figure={test.currentFigure}
          assessmentIndex={test.assessmentIndex}
          assessmentTotal={test.assessmentTotal}
          timeRemainingSec={test.timeRemainingSec}
          canvasSize={test.canvasSize}
          theme={theme}
          strokes={test.getStrokes()}
          onPointerDown={test.onPointerDown}
          onPointerMove={test.onPointerMove}
          onPointerUp={test.onPointerUp}
          onClear={test.clearCurrentDrawing}
          onDone={test.submitCurrentFigure}
        />
      )}

      {test.phase === 'completion' && (
        <CompletionScreen
          resultModel={test.resultModel}
          perFigureResults={test.perFigureResults}
          onRestart={test.restartTest}
        />
      )}
    </div>
  );
}
