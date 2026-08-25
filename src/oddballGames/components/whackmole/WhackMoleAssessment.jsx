import { useCallback, useEffect, useState } from 'react';
import AssessmentBackground from '../shared/AssessmentBackground';
import WhackMoleWelcome from './WhackMoleWelcome';
import WhackMoleAbout from './WhackMoleAbout';
import WhackMoleDeviceCheck from './WhackMoleDeviceCheck';
import WhackMoleInstructions from './WhackMoleInstructions';
import WhackMolePractice from './WhackMolePractice';
import WhackMolePracticeComplete from './WhackMolePracticeComplete';
import WhackMoleCountdown from './WhackMoleCountdown';
import WhackMoleGame from './WhackMoleGame';
import WhackMoleCompleting from './WhackMoleCompleting';
import WhackMoleResults from './WhackMoleResults';
import WhackMoleHistory from './WhackMoleHistory';
import WhackMoleIncomplete from './WhackMoleIncomplete';
import {
  WHACK_MOLE_VERSION,
  WHACK_MOLE_PROTOCOL_VERSION,
  WHACK_MOLE_CONFIG,
  WHACK_MOLE_DIFFICULTY_LEVELS,
  WHACK_MOLE_DEFAULT_DIFFICULTY,
} from '../../config/whackMoleConfig';
import { calculateAssessmentSummary } from '../../utils/whackMoleMetrics';
import { loadAssessments, saveAssessment, getDeviceInfo } from '../../utils/whackMoleStorage';

/** Majority input method across recorded trials/false-response events — a
 * session shouldn't silently mix touch and mouse without it being visible
 * in the data (spec section 42). Falls back to 'unknown' if nothing was recorded. */
function dominantInputMethod(trials, falseResponseEvents) {
  const counts = {};
  [...trials, ...falseResponseEvents].forEach((e) => {
    const method = e.inputMethod;
    if (!method) return;
    counts[method] = (counts[method] || 0) + 1;
  });
  const entries = Object.entries(counts);
  if (!entries.length) return 'unknown';
  return entries.sort((a, b) => b[1] - a[1])[0][0];
}

/**
 * Top-level state machine for Whack the Mole:
 * WELCOME (<-> ABOUT, <-> DEVICE_CHECK) -> INSTRUCTIONS -> PRACTICE ->
 * PRACTICE_COMPLETE -> COUNTDOWN -> RUNNING (scored assessment, driven
 * internally by WhackMoleGame/useWhackMoleEngine, including pause/resume)
 * -> COMPLETING -> RESULTS, with HISTORY reachable from WELCOME or RESULTS
 * and INCOMPLETE reachable from an explicit "End Test" during a pause.
 */
export default function WhackMoleAssessment({ onExit }) {
  const [state, setState] = useState('WELCOME');
  const [previousState, setPreviousState] = useState('WELCOME');
  const [runId, setRunId] = useState(0);
  const [currentAssessment, setCurrentAssessment] = useState(null);
  const [history, setHistory] = useState(() => loadAssessments());
  // Participant-selected pacing (spec: constant, non-randomized target
  // timing per level). Selected once on Welcome, applies to both Practice
  // and the scored assessment for a given run.
  const [difficulty, setDifficulty] = useState(WHACK_MOLE_DEFAULT_DIFFICULTY);

  useEffect(() => {
    return () => setState('WELCOME');
  }, []);

  const goWelcome = useCallback(() => setState('WELCOME'), []);
  const goAbout = useCallback(() => setState('ABOUT'), []);
  const goDeviceCheck = useCallback(() => setState('DEVICE_CHECK'), []);
  const goInstructions = useCallback(() => setState('INSTRUCTIONS'), []);
  const goPractice = useCallback(() => setState('PRACTICE'), []);
  const goPracticeComplete = useCallback(() => setState('PRACTICE_COMPLETE'), []);
  const goCountdown = useCallback(() => setState('COUNTDOWN'), []);
  const goRunning = useCallback(() => setState('RUNNING'), []);

  const handleAssessmentComplete = useCallback((finalState) => {
    setState('COMPLETING');
    // Brief, deliberate "assessment complete" transition before results are
    // computed and shown — avoids jumping abruptly to numbers.
    setTimeout(() => {
      const summary = calculateAssessmentSummary(finalState.trials, finalState.falseResponseEvents, {
        score: finalState.score,
        pauseCount: finalState.pauseCount,
        totalPausedDurationMs: finalState.totalPausedDurationMs,
        reason: finalState.reason,
      });
      const timestamp = Date.now();
      const deviceInfo = getDeviceInfo();
      const inputMethod = dominantInputMethod(finalState.trials, finalState.falseResponseEvents);

      const assessment = {
        assessmentId: `whack_mole_${timestamp}_${Math.random().toString(36).slice(2, 8)}`,
        patientId: null, // no existing patient/user system to integrate with yet
        gameType: 'whack_the_mole',
        testName: 'Whack the Mole',
        date: new Date(timestamp).toISOString().slice(0, 10),
        timestamp,
        version: WHACK_MOLE_VERSION,
        assessmentVersion: WHACK_MOLE_VERSION,
        protocolVersion: WHACK_MOLE_PROTOCOL_VERSION,
        duration: WHACK_MOLE_CONFIG.assessmentDurationMs / 1000,
        difficulty,
        inputMethod,
        deviceType: deviceInfo.deviceType,
        screenWidth: deviceInfo.screenWidth,
        screenHeight: deviceInfo.screenHeight,
        browser: deviceInfo.browser,
        operatingSystem: deviceInfo.os,
        deviceInfo,
        completionStatus: 'COMPLETED',
        completionReason: finalState.reason,
        // Full raw event log (spec section 16, 25-style rigor) — never only the summary.
        trials: finalState.trials,
        falseResponseEvents: finalState.falseResponseEvents,
        summary,
        ...summary,
      };

      const updatedHistory = saveAssessment(assessment);
      setHistory(updatedHistory);
      setCurrentAssessment(assessment);
      setState('RESULTS');
    }, 900);
  }, [difficulty]);

  const handleInterrupted = useCallback(() => {
    // Ended sessions (via "End Test" while paused) are never saved.
    setState('INCOMPLETE');
  }, []);

  const handleRepeatAssessment = useCallback(() => {
    setCurrentAssessment(null);
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
    <div className="oddball-module wm-module">
      <AssessmentBackground />
      {state === 'WELCOME' && (
        <WhackMoleWelcome
          onStart={goInstructions}
          onAbout={goAbout}
          onDeviceCheck={goDeviceCheck}
          onViewHistory={goHistory}
          onBack={handleExit}
          difficulty={difficulty}
          difficultyLevels={WHACK_MOLE_DIFFICULTY_LEVELS}
          onDifficultyChange={setDifficulty}
        />
      )}

      {state === 'ABOUT' && <WhackMoleAbout onBack={goWelcome} />}

      {state === 'DEVICE_CHECK' && <WhackMoleDeviceCheck onDone={goWelcome} onBack={goWelcome} />}

      {state === 'INSTRUCTIONS' && (
        <WhackMoleInstructions
          onContinue={goPractice}
          onBack={goWelcome}
          difficultyLabel={WHACK_MOLE_DIFFICULTY_LEVELS[difficulty]?.label}
        />
      )}

      {state === 'PRACTICE' && (
        <WhackMolePractice key={`practice-${runId}`} onPracticeComplete={goPracticeComplete} difficulty={difficulty} />
      )}

      {state === 'PRACTICE_COMPLETE' && <WhackMolePracticeComplete onBeginTest={goCountdown} />}

      {state === 'COUNTDOWN' && <WhackMoleCountdown key={`countdown-${runId}`} onComplete={goRunning} />}

      {state === 'RUNNING' && (
        <WhackMoleGame
          key={`assessment-${runId}`}
          onAssessmentComplete={handleAssessmentComplete}
          onInterrupted={handleInterrupted}
          difficulty={difficulty}
        />
      )}

      {state === 'COMPLETING' && <WhackMoleCompleting />}

      {state === 'RESULTS' && currentAssessment && (
        <WhackMoleResults
          currentAssessment={currentAssessment}
          history={history}
          onViewHistory={goHistory}
          onRepeatAssessment={handleRepeatAssessment}
          onBackToDashboard={handleExit}
        />
      )}

      {state === 'HISTORY' && <WhackMoleHistory assessments={history} onBack={goBackFromHistory} />}

      {state === 'INCOMPLETE' && <WhackMoleIncomplete onRetry={handleRetryFromIncomplete} onExit={handleExit} />}
    </div>
  );
}
