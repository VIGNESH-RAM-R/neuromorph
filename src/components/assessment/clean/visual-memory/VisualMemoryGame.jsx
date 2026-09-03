import { useEffect, useRef } from 'react';
// See the note on DelayedRecognitionGame.jsx — CSS previously imported at
// this game's own standalone main.jsx level.
import './styles/index.css';
import { useVisualMemoryTest } from './hooks/useVisualMemoryTest.js';
import InstructionScreen from './components/InstructionScreen.jsx';
import CountdownScreen from './components/CountdownScreen.jsx';
import ObservationScreen from './components/ObservationScreen.jsx';
import DelayScreen from './components/DelayScreen.jsx';
import RecognitionScreen from './components/RecognitionScreen.jsx';
import PracticeFeedbackScreen from './components/PracticeFeedbackScreen.jsx';
import CompletionScreen from './components/CompletionScreen.jsx';

/**
 * Contract adapter. See src/features/games/weekly/visual-memory/adapter.js
 * for the mount/unmount wrapper this component gets rendered through.
 */
function toContractTrials(trialResults) {
  return trialResults.map((t) => ({
    responseTimeMs: t.reactionTimeMs,
    correct: t.misses === 0 && t.falsePositives === 0,
    errorType: t.misses > 0 && t.falsePositives > 0 ? 'miss_and_false_positive' : t.misses > 0 ? 'miss' : t.falsePositives > 0 ? 'false_positive' : undefined,
  }));
}

function toContractPracticeTrials(practiceResults) {
  return practiceResults.map((p) => ({
    responseTimeMs: p.reactionTimeMs,
    correct: p.correct,
    errorType: p.correct ? undefined : p.timedOut ? 'timeout' : 'incorrect_selection',
  }));
}

export default function VisualMemoryGame({ config, onComplete, onPracticeComplete }) {
  // 'standardClinical' (2 practice, 15 scored: 5 easy/medium/hard each) —
  // not the 'demo' protocol (1 practice, 3 scored) this game ships with by
  // default, which is meant for trying the module out standalone.
  const test = useVisualMemoryTest({ initialProtocolKey: 'standardClinical' });
  const reportedScoredRef = useRef(false);
  const reportedPracticeRef = useRef(false);

  useEffect(() => {
    if (test.phase === 'completion' && test.resultModel && !reportedScoredRef.current) {
      reportedScoredRef.current = true;
      const studyItems = test.registeredItems;
      onComplete?.({
        score: test.resultModel.cognitiveScore,
        trials: toContractTrials(test.trialResults),
        studyItemsRegistered: studyItems.map((i) => i.id),
        rawLog: { ...test.resultModel, studyItems },
      });
    }
  }, [test.phase, test.resultModel, test.trialResults, test.registeredItems, onComplete]);

  useEffect(() => {
    if (test.phase === 'countdown' && test.practiceResults.length > 0 && !reportedPracticeRef.current) {
      reportedPracticeRef.current = true;
      onPracticeComplete?.({ score: null, trials: toContractPracticeTrials(test.practiceResults) });
    }
  }, [test.phase, test.practiceResults, onPracticeComplete]);
  void config;

  return (
    <div className="vmt-app">
      {test.phase === 'instruction' && (
        <InstructionScreen onStart={test.startTest} />
      )}

      {test.phase === 'countdown' && <CountdownScreen label={test.timeRemainingSec} />}

      {test.phase === 'observation' && test.currentTrial && (
        <ObservationScreen
          trial={test.currentTrial}
          trialIndex={test.trialIndex}
          trialTotal={test.trialTotal}
          timeRemainingSec={test.timeRemainingSec}
        />
      )}

      {test.phase === 'delay' && <DelayScreen timeRemainingSec={test.timeRemainingSec} />}

      {test.phase === 'recognition' && test.currentTrial && (
        <RecognitionScreen
          trial={test.currentTrial}
          selected={test.selected}
          timeRemainingSec={test.timeRemainingSec}
          onToggle={test.toggleSelect}
          onSubmit={test.submitRecognition}
        />
      )}

      {test.phase === 'practice-feedback' && test.currentTrial && test.practiceFeedback && (
        <PracticeFeedbackScreen
          trial={test.currentTrial}
          feedback={test.practiceFeedback}
          onContinue={test.continuePastPracticeFeedback}
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
