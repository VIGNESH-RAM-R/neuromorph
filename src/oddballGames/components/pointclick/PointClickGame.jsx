import { useCallback, useEffect, useState } from 'react';
import AssessmentBackground from '../shared/AssessmentBackground';
import PointClickWelcome from './PointClickWelcome';
import PointClickInstructions from './PointClickInstructions';
import PointClickPractice from './PointClickPractice';
import PointClickPracticeComplete from './PointClickPracticeComplete';
import PointClickAssessment from './PointClickAssessment';
import PointClickCompleting from './PointClickCompleting';
import PointClickResults from './PointClickResults';
import PointClickHistory from './PointClickHistory';
import { POINT_CLICK_VERSION, POINT_CLICK_CONFIG } from '../../config/pointClickConfig';
import { generateAssessmentTrials } from '../../utils/pointClickTrialGenerator';
import { calculatePointClickResults } from '../../utils/pointClickMetrics';
import { loadAssessments, saveAssessment, getDeviceInfo } from '../../utils/pointClickStorage';

/**
 * Top-level state machine for Point & Click:
 * WELCOME -> INSTRUCTIONS -> PRACTICE -> PRACTICE_COMPLETE -> RUNNING
 * (target/transition/board/feedback/inter-trial, driven internally by
 * PointClickAssessment, which also owns pause/resume) -> COMPLETING ->
 * RESULTS, with HISTORY reachable from WELCOME or RESULTS. Exiting mid-
 * assessment (via the pause modal's confirmed exit) returns straight to the
 * dashboard — interrupted runs are never saved, keeping completed history
 * clean. A single explicit `state` value (not scattered booleans) drives
 * the active screen, matching the other Neuromorph modules.
 */
export default function PointClickGame({ onExit }) {
  const [state, setState] = useState('WELCOME');
  const [previousState, setPreviousState] = useState('WELCOME');
  const [runId, setRunId] = useState(0);
  const [trials, setTrials] = useState(null);
  const [currentAssessment, setCurrentAssessment] = useState(null);
  const [history, setHistory] = useState(() => loadAssessments());

  useEffect(() => {
    return () => setState('WELCOME');
  }, []);

  const goWelcome = useCallback(() => setState('WELCOME'), []);
  const goInstructions = useCallback(() => setState('INSTRUCTIONS'), []);
  const goPractice = useCallback(() => setState('PRACTICE'), []);
  const goPracticeComplete = useCallback(() => setState('PRACTICE_COMPLETE'), []);

  const goRunning = useCallback(() => {
    setTrials(generateAssessmentTrials(POINT_CLICK_CONFIG));
    setState('RUNNING');
  }, []);

  const handleAssessmentComplete = useCallback((trialRecords) => {
    setState('COMPLETING');
    // Brief, deliberate "assessment complete" transition before results are
    // computed and shown — avoids jumping abruptly to numbers.
    setTimeout(() => {
      const summary = calculatePointClickResults(trialRecords);
      const timestamp = Date.now();
      const deviceInfo = getDeviceInfo();
      const assessment = {
        assessmentId: `pointclick_${timestamp}_${Math.random().toString(36).slice(2, 8)}`,
        patientId: null, // no existing patient/user system to integrate with yet
        gameType: 'point_click',
        date: new Date(timestamp).toISOString().slice(0, 10),
        timestamp,
        assessmentVersion: POINT_CLICK_VERSION,
        deviceType: deviceInfo.deviceType,
        screenWidth: deviceInfo.screenWidth,
        screenHeight: deviceInfo.screenHeight,
        deviceInfo,
        completionStatus: 'COMPLETED',
        practiceTrials: POINT_CLICK_CONFIG.practiceTrials,
        trials: trialRecords,
        summary,
        ...summary,
      };
      const updatedHistory = saveAssessment(assessment);
      setHistory(updatedHistory);
      setCurrentAssessment(assessment);
      setState('RESULTS');
    }, 900);
  }, []);

  const handleRepeatAssessment = useCallback(() => {
    setTrials(null);
    setCurrentAssessment(null);
    setRunId((id) => id + 1);
    setState('WELCOME');
  }, []);

  const handleExit = useCallback(() => {
    if (onExit) onExit();
  }, [onExit]);

  const goHistory = useCallback(() => {
    setPreviousState(state);
    setState('HISTORY');
  }, [state]);
  const goBackFromHistory = useCallback(() => setState(previousState), [previousState]);

  return (
    <div className="oddball-module pc-module">
      <AssessmentBackground />
      {state === 'WELCOME' && (
        <PointClickWelcome onStart={goInstructions} onViewHistory={goHistory} onBack={handleExit} />
      )}

      {state === 'INSTRUCTIONS' && <PointClickInstructions onContinue={goPractice} onBack={goWelcome} />}

      {state === 'PRACTICE' && (
        <PointClickPractice key={`practice-${runId}`} onPracticeComplete={goPracticeComplete} />
      )}

      {state === 'PRACTICE_COMPLETE' && <PointClickPracticeComplete onBeginAssessment={goRunning} />}

      {state === 'RUNNING' && trials && (
        <PointClickAssessment
          key={`assessment-${runId}`}
          trials={trials}
          onAssessmentComplete={handleAssessmentComplete}
          onExit={handleExit}
        />
      )}

      {state === 'COMPLETING' && <PointClickCompleting />}

      {state === 'RESULTS' && currentAssessment && (
        <PointClickResults
          currentAssessment={currentAssessment}
          history={history}
          onViewHistory={goHistory}
          onRepeatAssessment={handleRepeatAssessment}
          onBackToDashboard={handleExit}
        />
      )}

      {state === 'HISTORY' && <PointClickHistory assessments={history} onBack={goBackFromHistory} />}
    </div>
  );
}
