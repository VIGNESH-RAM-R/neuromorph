import { useCallback, useEffect, useState } from 'react';
import AssessmentBackground from '../shared/AssessmentBackground';
import SequenceWelcome from './SequenceWelcome';
import SequenceInstructions from './SequenceInstructions';
import SequencePractice from './SequencePractice';
import SequenceAssessmentIntro from './SequenceAssessmentIntro';
import SequenceAssessmentGame from './SequenceAssessmentGame';
import SequenceCompleting from './SequenceCompleting';
import SequenceResults from './SequenceResults';
import SequenceHistory from './SequenceHistory';
import SequenceIncomplete from './SequenceIncomplete';
import { SEQUENCE_MEMORY_VERSION, SEQUENCE_LEVELS } from '../../config/sequenceConfig';
import { buildTrialSpecs } from '../../utils/sequenceGenerator';
import { calculateAssessmentSummary } from '../../utils/sequenceMetrics';
import { loadAssessments, saveAssessment, getDeviceInfo } from '../../utils/sequenceStorage';

/**
 * Top-level state machine for Sequence Memory:
 * WELCOME -> INSTRUCTIONS -> PRACTICE -> ASSESSMENT_INTRO -> RUNNING
 * (WATCH/REMEMBER/REPEAT/TRIAL_COMPLETE, driven internally by
 * SequenceAssessmentGame) -> COMPLETING -> RESULTS, with HISTORY reachable
 * from RESULTS and INCOMPLETE reachable from a mid-trial interruption.
 * Clicking "Start Assessment" on WELCOME leads into INSTRUCTIONS ("How To
 * Play") before Practice — the explanation is shown exactly once, at that
 * point, rather than as a separate optional preview. A single explicit
 * `state` value (not scattered booleans) drives the active screen.
 */
export default function SequenceMemoryAssessment({ onExit }) {
  const [state, setState] = useState('WELCOME');
  const [previousState, setPreviousState] = useState('WELCOME');
  const [runId, setRunId] = useState(0);
  const [trials, setTrials] = useState(null);
  const [currentAssessment, setCurrentAssessment] = useState(null);
  const [history, setHistory] = useState(() => loadAssessments());

  // Belt-and-braces reset if the module itself unmounts mid-assessment.
  useEffect(() => {
    return () => setState('WELCOME');
  }, []);

  const goWelcome = useCallback(() => setState('WELCOME'), []);
  const goInstructions = useCallback(() => setState('INSTRUCTIONS'), []);
  const goPractice = useCallback(() => setState('PRACTICE'), []);
  const goAssessmentIntro = useCallback(() => setState('ASSESSMENT_INTRO'), []);

  const goRunning = useCallback(() => {
    setTrials(buildTrialSpecs(SEQUENCE_LEVELS));
    setState('RUNNING');
  }, []);

  const handleAssessmentComplete = useCallback((trialRecords) => {
    setState('COMPLETING');
    // Brief, deliberate "assessment complete" transition before results are
    // computed and shown — avoids jumping abruptly to numbers.
    setTimeout(() => {
      const summary = calculateAssessmentSummary(trialRecords);
      const timestamp = Date.now();
      const deviceInfo = getDeviceInfo();
      const assessment = {
        assessmentId: `sequence_${timestamp}_${Math.random().toString(36).slice(2, 8)}`,
        patientId: null, // no existing patient/user system to integrate with yet
        date: new Date(timestamp).toISOString().slice(0, 10),
        timestamp,
        assessmentVersion: SEQUENCE_MEMORY_VERSION,
        deviceType: deviceInfo.deviceType,
        screenWidth: deviceInfo.screenWidth,
        screenHeight: deviceInfo.screenHeight,
        deviceInfo,
        completionStatus: 'COMPLETED',
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

  const handleInterrupted = useCallback(() => {
    // Interrupted sessions are never saved — this keeps completed history clean.
    setState('INCOMPLETE');
  }, []);

  const handleRepeatAssessment = useCallback(() => {
    setTrials(null);
    setCurrentAssessment(null);
    setRunId((id) => id + 1);
    setState('WELCOME');
  }, []);

  const handleRetryFromIncomplete = useCallback(() => {
    setTrials(null);
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
    <div className="oddball-module seq-module">
      <AssessmentBackground />
      {state === 'WELCOME' && (
        <SequenceWelcome onStart={goInstructions} onViewHistory={goHistory} onBack={handleExit} />
      )}

      {state === 'INSTRUCTIONS' && (
        <SequenceInstructions onContinue={goPractice} onBack={goWelcome} />
      )}

      {state === 'PRACTICE' && (
        <SequencePractice
          key={`practice-${runId}`}
          onPracticeComplete={goAssessmentIntro}
          onInterrupted={handleInterrupted}
        />
      )}

      {state === 'ASSESSMENT_INTRO' && (
        <SequenceAssessmentIntro onBeginAssessment={goRunning} />
      )}

      {state === 'RUNNING' && trials && (
        <SequenceAssessmentGame
          key={`assessment-${runId}`}
          trials={trials}
          onAssessmentComplete={handleAssessmentComplete}
          onInterrupted={handleInterrupted}
        />
      )}

      {state === 'COMPLETING' && <SequenceCompleting />}

      {state === 'RESULTS' && currentAssessment && (
        <SequenceResults
          currentAssessment={currentAssessment}
          history={history}
          onViewHistory={goHistory}
          onRepeatAssessment={handleRepeatAssessment}
          onBackToDashboard={handleExit}
        />
      )}

      {state === 'HISTORY' && (
        <SequenceHistory assessments={history} onBack={goBackFromHistory} />
      )}

      {state === 'INCOMPLETE' && (
        <SequenceIncomplete onRetry={handleRetryFromIncomplete} onExit={handleExit} />
      )}
    </div>
  );
}
