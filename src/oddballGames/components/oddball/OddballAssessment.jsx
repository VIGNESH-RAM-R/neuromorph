import { useCallback, useEffect, useState } from 'react';
import AssessmentBackground from '../shared/AssessmentBackground';
import OddballIntro from './OddballIntro';
import OddballInstructions from './OddballInstructions';
import OddballPractice from './OddballPractice';
import OddballPracticeComplete from './OddballPracticeComplete';
import OddballCountdown from './OddballCountdown';
import OddballGame from './OddballGame';
import OddballCompleting from './OddballCompleting';
import OddballResults from './OddballResults';
import OddballHistory from './OddballHistory';
import { ODDBALL_VERSION, ODDBALL_CONFIG } from '../../config/oddballConfig';
import { generateTrialSequence } from '../../utils/oddballTrialGenerator';
import { calculateOddballMetrics } from '../../utils/oddballMetrics';
import { loadAssessments, saveAssessment, getDeviceInfo } from '../../utils/oddballStorage';

/**
 * Top-level state machine for the Visual Oddball Assessment module.
 * States: INTRO -> INSTRUCTIONS -> PRACTICE -> PRACTICE_COMPLETE ->
 * COUNTDOWN -> RUNNING -> COMPLETING -> RESULTS, with HISTORY reachable
 * from INTRO and RESULTS. A single explicit `state` value (rather than
 * scattered booleans) drives which screen renders.
 */
export default function OddballAssessment({ onExit }) {
  const [state, setState] = useState('INTRO');
  const [runId, setRunId] = useState(0);
  const [trials, setTrials] = useState(null);
  const [currentAssessment, setCurrentAssessment] = useState(null);
  const [history, setHistory] = useState(() => loadAssessments());

  // Belt-and-braces reset if the module itself unmounts mid-assessment.
  useEffect(() => {
    return () => setState('INTRO');
  }, []);

  const goIntro = useCallback(() => setState('INTRO'), []);
  const goInstructions = useCallback(() => setState('INSTRUCTIONS'), []);
  const goPractice = useCallback(() => setState('PRACTICE'), []);
  const goPracticeComplete = useCallback(() => setState('PRACTICE_COMPLETE'), []);

  const goCountdown = useCallback(() => {
    setTrials(generateTrialSequence());
    setState('COUNTDOWN');
  }, []);

  const goRunning = useCallback(() => setState('RUNNING'), []);

  const handleAssessmentComplete = useCallback(
    (trialRecords) => {
      setState('COMPLETING');
      // Brief, deliberate "assessment complete" transition before results are
      // computed and shown, per spec — avoids jumping abruptly to numbers.
      setTimeout(() => {
        const metrics = calculateOddballMetrics(trialRecords, ODDBALL_CONFIG);
        const assessment = {
          assessmentId: `oddball_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          timestamp: Date.now(),
          assessmentVersion: ODDBALL_VERSION,
          deviceInfo: getDeviceInfo(),
          completionStatus: 'COMPLETED',
          trialCount: trialRecords.length,
          targetCount: metrics.targetTrials,
          nonTargetCount: metrics.nonTargetTrials,
          ...metrics,
          trialData: trialRecords,
        };
        const updatedHistory = saveAssessment(assessment);
        setHistory(updatedHistory);
        setCurrentAssessment(assessment);
        setState('RESULTS');
      }, 900);
    },
    []
  );

  const handleTakeAnother = useCallback(() => {
    setTrials(null);
    setCurrentAssessment(null);
    setRunId((id) => id + 1);
    setState('INTRO');
  }, []);

  const handleExit = useCallback(() => {
    if (onExit) onExit();
  }, [onExit]);

  const goHistory = useCallback(() => setState('HISTORY'), []);

  return (
    <div className="oddball-module">
      <AssessmentBackground variant="oddball" />
      {state === 'INTRO' && (
        <OddballIntro onStart={goInstructions} onBack={handleExit} onViewHistory={goHistory} />
      )}

      {state === 'INSTRUCTIONS' && (
        <OddballInstructions onStartPractice={goPractice} onBack={goIntro} onViewHistory={goHistory} />
      )}

      {state === 'PRACTICE' && (
        <OddballPractice key={`practice-${runId}`} onPracticeComplete={goPracticeComplete} />
      )}

      {state === 'PRACTICE_COMPLETE' && (
        <OddballPracticeComplete onBeginAssessment={goCountdown} />
      )}

      {state === 'COUNTDOWN' && <OddballCountdown onComplete={goRunning} />}

      {state === 'RUNNING' && trials && (
        <OddballGame
          key={`game-${runId}`}
          trials={trials}
          onAssessmentComplete={handleAssessmentComplete}
        />
      )}

      {state === 'COMPLETING' && <OddballCompleting />}

      {state === 'RESULTS' && currentAssessment && (
        <OddballResults
          currentAssessment={currentAssessment}
          history={history}
          onTakeAnother={handleTakeAnother}
          onBackToDashboard={handleExit}
          onViewHistory={goHistory}
        />
      )}

      {state === 'HISTORY' && <OddballHistory assessments={history} onBack={goIntro} />}
    </div>
  );
}
