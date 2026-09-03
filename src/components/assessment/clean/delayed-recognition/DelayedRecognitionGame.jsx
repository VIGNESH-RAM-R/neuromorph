import { useEffect, useRef } from 'react';
// This game's CSS was previously imported at its standalone main.jsx level
// (not App.jsx) — imported directly here since there's no separate entry
// point in the integrated copy; the adapter mounts this component directly.
import './styles/index.css';
import { useDelayedRecognitionTest } from './hooks/useDelayedRecognitionTest.js';
import InstructionScreen from './components/InstructionScreen.jsx';
import NoDataScreen from './components/NoDataScreen.jsx';
import CountdownScreen from './components/CountdownScreen.jsx';
import RecognitionScreen from './components/RecognitionScreen.jsx';
import CompletionScreen from './components/CompletionScreen.jsx';

/**
 * Contract adapter — no separate practice phase exists for this game (per
 * the hook's own comment: it never introduces new material, so there's
 * nothing to practice encoding), so onPracticeComplete is simply never
 * called. See src/features/games/weekly/delayed-recognition/adapter.js.
 */
function toContractTrials(trialResults) {
  return trialResults.map((t) => ({
    responseTimeMs: t.reactionTimeMs,
    correct: t.fullyCorrect,
    errorType: t.fullyCorrect ? undefined : t.misses > 0 ? 'miss' : t.falsePositives > 0 ? 'false_positive' : undefined,
  }));
}

export default function DelayedRecognitionGame({ config, onComplete }) {
  // `config?.allowMockData` — see useDelayedRecognitionTest.js's doc
  // comment. Defaults to permissive/demoable (`true`) for every caller
  // that doesn't explicitly opt out, so GameDebugPage/PracticeGameRunner
  // are unaffected; only SessionPlayer.jsx's real scored mount passes
  // `allowMockData: false`.
  const test = useDelayedRecognitionTest({ allowMockFallback: config?.allowMockData !== false });
  const reportedRef = useRef(false);

  useEffect(() => {
    if (test.phase === 'completion' && test.resultModel && !reportedRef.current) {
      reportedRef.current = true;
      onComplete?.({
        score: test.resultModel.cognitiveScore,
        trials: toContractTrials(test.trialResults),
        rawLog: test.resultModel,
      });
    }
  }, [test.phase, test.resultModel, test.trialResults, onComplete]);

  return (
    <div className="drt-app">
      {test.phase === 'no-data' && <NoDataScreen />}

      {test.phase === 'instruction' && (
        <InstructionScreen categoryCount={test.categoryTotal} onStart={test.startTest} />
      )}

      {test.phase === 'countdown' && <CountdownScreen label={test.timeRemainingSec} />}

      {test.phase === 'recognition' && test.currentTrial && (
        <RecognitionScreen
          trial={test.currentTrial}
          categoryIndex={test.categoryIndex}
          categoryTotal={test.categoryTotal}
          selected={test.selected}
          timeRemainingSec={test.timeRemainingSec}
          onToggle={test.toggleSelect}
          onSubmit={test.submitRecognition}
        />
      )}

      {test.phase === 'completion' && (
        <CompletionScreen
          resultModel={test.resultModel}
          trialResults={test.trialResults}
          onRestart={test.restartTest}
          onHome={test.restartTest}
        />
      )}
    </div>
  );
}
