import { useCallback, useEffect, useState } from 'react';
import AssessmentBackground from '../shared/AssessmentBackground';
import ImagePairsWelcome from './ImagePairsWelcome';
import ImagePairsAbout from './ImagePairsAbout';
import ImagePairsInstructions from './ImagePairsInstructions';
import ImagePairsPractice from './ImagePairsPractice';
import ImagePairsPracticeComplete from './ImagePairsPracticeComplete';
import ImagePairsCountdown from './ImagePairsCountdown';
import ImagePairsGame from './ImagePairsGame';
import ImagePairsCompleting from './ImagePairsCompleting';
import ImagePairsResults from './ImagePairsResults';
import ImagePairsHistory from './ImagePairsHistory';
import ImagePairsIncomplete from './ImagePairsIncomplete';
import {
  IMAGE_PAIRS_VERSION,
  IMAGE_PAIRS_PROTOCOL_VERSION,
  IMAGE_PAIRS_STIMULUS_VERSION,
} from '../../config/imagePairsConfig';
import { calculateImagePairsSummary } from '../../utils/imagePairsMetrics';
import { loadAssessments, saveAssessment, getDeviceInfo } from '../../utils/imagePairsStorage';

/**
 * Top-level state machine for Image Pairs:
 * WELCOME (<-> ABOUT) -> INSTRUCTIONS -> PRACTICE -> PRACTICE_COMPLETE ->
 * COUNTDOWN -> RUNNING (scored assessment, driven internally by
 * ImagePairsGame/useImagePairsEngine) -> COMPLETING -> RESULTS, with
 * HISTORY reachable from WELCOME or RESULTS and INCOMPLETE reachable from
 * a mid-session interruption (practice or scored). A single explicit
 * `state` value drives the active screen, matching the other Neuromorph
 * modules (Sequence Memory, Point & Click).
 */
export default function ImagePairsAssessment({ onExit }) {
  const [state, setState] = useState('WELCOME');
  const [previousState, setPreviousState] = useState('WELCOME');
  const [runId, setRunId] = useState(0);
  const [pendingCompletionReason, setPendingCompletionReason] = useState(null);
  const [currentAssessment, setCurrentAssessment] = useState(null);
  const [history, setHistory] = useState(() => loadAssessments());

  // Belt-and-braces reset if the module itself unmounts mid-assessment.
  useEffect(() => {
    return () => setState('WELCOME');
  }, []);

  const goWelcome = useCallback(() => setState('WELCOME'), []);
  const goAbout = useCallback(() => setState('ABOUT'), []);
  const goInstructions = useCallback(() => setState('INSTRUCTIONS'), []);
  const goPractice = useCallback(() => setState('PRACTICE'), []);
  const goPracticeComplete = useCallback(() => setState('PRACTICE_COMPLETE'), []);
  const goCountdown = useCallback(() => setState('COUNTDOWN'), []);
  const goRunning = useCallback(() => setState('RUNNING'), []);

  const handleAssessmentComplete = useCallback((finalState, seed) => {
    setPendingCompletionReason(finalState.completionReason);
    setState('COMPLETING');
    // Brief, deliberate "assessment complete" transition before results are
    // computed and shown — avoids jumping abruptly to numbers.
    setTimeout(() => {
      const summary = calculateImagePairsSummary(finalState);
      const timestamp = Date.now();
      const deviceInfo = getDeviceInfo();
      const assessment = {
        assessmentId: `image_pairs_${timestamp}_${Math.random().toString(36).slice(2, 8)}`,
        patientId: null, // no existing patient/user system to integrate with yet
        gameType: 'image_pairs',
        date: new Date(timestamp).toISOString().slice(0, 10),
        timestamp,
        assessmentVersion: IMAGE_PAIRS_VERSION,
        protocolVersion: IMAGE_PAIRS_PROTOCOL_VERSION,
        stimulusVersion: IMAGE_PAIRS_STIMULUS_VERSION,
        randomizationSeed: seed,
        deviceType: deviceInfo.deviceType,
        screenWidth: deviceInfo.screenWidth,
        screenHeight: deviceInfo.screenHeight,
        deviceInfo,
        completionStatus: 'COMPLETED', // reached a defined end state (all matched or time expired) — interrupted sessions never reach this handler
        practiceCompleted: true,
        // Full raw event log (spec section 25) — never only the summary.
        trials: { pairDecisions: finalState.pairDecisions, cardEvents: finalState.cardEvents },
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
    setCurrentAssessment(null);
    setPendingCompletionReason(null);
    setRunId((id) => id + 1);
    setState('WELCOME');
  }, []);

  const handleRetryFromIncomplete = useCallback(() => {
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
    <div className="oddball-module ip-module">
      <AssessmentBackground variant="imagepairs" />
      {state === 'WELCOME' && (
        <ImagePairsWelcome onStart={goInstructions} onAbout={goAbout} onViewHistory={goHistory} onBack={handleExit} />
      )}

      {state === 'ABOUT' && <ImagePairsAbout onBack={goWelcome} />}

      {state === 'INSTRUCTIONS' && <ImagePairsInstructions onContinue={goPractice} onBack={goWelcome} />}

      {state === 'PRACTICE' && (
        <ImagePairsPractice
          key={`practice-${runId}`}
          onPracticeComplete={goPracticeComplete}
          onInterrupted={handleInterrupted}
        />
      )}

      {state === 'PRACTICE_COMPLETE' && <ImagePairsPracticeComplete onBeginAssessment={goCountdown} />}

      {state === 'COUNTDOWN' && <ImagePairsCountdown key={`countdown-${runId}`} onComplete={goRunning} />}

      {state === 'RUNNING' && (
        <ImagePairsGame
          key={`assessment-${runId}`}
          onAssessmentComplete={handleAssessmentComplete}
          onInterrupted={handleInterrupted}
        />
      )}

      {state === 'COMPLETING' && <ImagePairsCompleting reason={pendingCompletionReason} />}

      {state === 'RESULTS' && currentAssessment && (
        <ImagePairsResults
          currentAssessment={currentAssessment}
          history={history}
          onViewHistory={goHistory}
          onRepeatAssessment={handleRepeatAssessment}
          onBackToDashboard={handleExit}
        />
      )}

      {state === 'HISTORY' && <ImagePairsHistory assessments={history} onBack={goBackFromHistory} />}

      {state === 'INCOMPLETE' && <ImagePairsIncomplete onRetry={handleRetryFromIncomplete} onExit={handleExit} />}
    </div>
  );
}
