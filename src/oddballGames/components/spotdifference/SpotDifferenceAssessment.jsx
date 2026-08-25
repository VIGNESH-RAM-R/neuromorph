import { useCallback, useEffect, useState } from 'react';
import AssessmentBackground from '../shared/AssessmentBackground';
import SpotDifferenceWelcome from './SpotDifferenceWelcome';
import SpotDifferenceInstructions from './SpotDifferenceInstructions';
import SpotDifferenceLevelSelect from './SpotDifferenceLevelSelect';
import SpotDifferenceLevelIntro from './SpotDifferenceLevelIntro';
import SpotDifferenceGame from './SpotDifferenceGame';
import SpotDifferenceLevelComplete from './SpotDifferenceLevelComplete';
import SpotDifferenceCompleting from './SpotDifferenceCompleting';
import SpotDifferenceResults from './SpotDifferenceResults';
import SpotDifferenceHistory from './SpotDifferenceHistory';
import {
  SPOT_DIFFERENCE_LEVELS,
  SPOT_DIFFERENCE_VERSION,
  SPOT_DIFFERENCE_PROTOCOL_VERSION,
} from '../../config/spotDifferenceConfig';
import { summarizeLevel, summarizeSession } from '../../utils/spotDifferenceMetrics';
import { loadAssessments, saveAssessment, getDeviceInfo } from '../../utils/spotDifferenceStorage';

/**
 * Top-level state machine for Spot the Difference:
 * WELCOME -> INSTRUCTIONS -> LEVEL_SELECT -> LEVEL_INTRO -> GAME (one
 * level's rounds, driven internally by useSpotDifferenceEngine) ->
 * LEVEL_COMPLETE -> (loop back to LEVEL_INTRO for another level, or on to
 * COMPLETING -> RESULTS), with HISTORY reachable from WELCOME, LEVEL_SELECT
 * or RESULTS.
 *
 * Levels are freely selectable at any time (no forced order), matching the
 * source prototype. A session can be finished — saved to history and
 * shown as Results — after completing just one level or after all three;
 * `levelResultsByLevelId` accumulates every level completed so far this
 * session (replaying a level overwrites its previous entry rather than
 * duplicating it).
 */
export default function SpotDifferenceAssessment({ onExit }) {
  const [state, setState] = useState('WELCOME');
  const [previousState, setPreviousState] = useState('WELCOME');
  const [runId, setRunId] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(null);
  const [levelResultsByLevelId, setLevelResultsByLevelId] = useState({});
  const [currentAssessment, setCurrentAssessment] = useState(null);
  const [history, setHistory] = useState(() => loadAssessments());

  useEffect(() => {
    return () => setState('WELCOME');
  }, []);

  const goWelcome = useCallback(() => setState('WELCOME'), []);
  const goInstructions = useCallback(() => setState('INSTRUCTIONS'), []);
  const goLevelSelect = useCallback(() => setState('LEVEL_SELECT'), []);

  const handleSelectLevel = useCallback((level) => {
    setCurrentLevel(level);
    setState('LEVEL_INTRO');
  }, []);

  const handleStartLevelPlay = useCallback(() => {
    setRunId((id) => id + 1);
    setState('GAME');
  }, []);

  const handleLevelComplete = useCallback(({ level, roundStates, timeMs }) => {
    const summary = summarizeLevel(level, roundStates, timeMs);
    setLevelResultsByLevelId((prev) => ({ ...prev, [level.id]: summary }));
    setState('LEVEL_COMPLETE');
  }, []);

  const handleContinueToLevel = useCallback((level) => {
    setCurrentLevel(level);
    setRunId((id) => id + 1);
    setState('LEVEL_INTRO');
  }, []);

  const finalizeSession = useCallback(() => {
    setState('COMPLETING');
    setTimeout(() => {
      const perLevel = SPOT_DIFFERENCE_LEVELS.filter((l) => levelResultsByLevelId[l.id]).map(
        (l) => levelResultsByLevelId[l.id]
      );
      const summary = summarizeSession(perLevel);
      const timestamp = Date.now();
      const deviceInfo = getDeviceInfo();

      const assessment = {
        assessmentId: `spot_difference_${timestamp}_${Math.random().toString(36).slice(2, 8)}`,
        patientId: null, // no existing patient/user system to integrate with yet
        gameType: 'spot_the_difference',
        testName: 'Spot the Difference',
        date: new Date(timestamp).toISOString().slice(0, 10),
        timestamp,
        version: SPOT_DIFFERENCE_VERSION,
        assessmentVersion: SPOT_DIFFERENCE_VERSION,
        protocolVersion: SPOT_DIFFERENCE_PROTOCOL_VERSION,
        deviceType: deviceInfo.deviceType,
        screenWidth: deviceInfo.screenWidth,
        screenHeight: deviceInfo.screenHeight,
        browser: deviceInfo.browser,
        operatingSystem: deviceInfo.os,
        deviceInfo,
        completionStatus: 'COMPLETED',
        ...summary,
      };

      const updatedHistory = saveAssessment(assessment);
      setHistory(updatedHistory);
      setCurrentAssessment(assessment);
      setState('RESULTS');
    }, 900);
  }, [levelResultsByLevelId]);

  const handlePlayAgain = useCallback(() => {
    setLevelResultsByLevelId({});
    setCurrentAssessment(null);
    setCurrentLevel(null);
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

  const allLevelsCompleted = SPOT_DIFFERENCE_LEVELS.every((l) => levelResultsByLevelId[l.id]);
  const nextIncompleteLevel = SPOT_DIFFERENCE_LEVELS.find((l) => !levelResultsByLevelId[l.id]) || null;

  return (
    <div className="oddball-module sd-module">
      <AssessmentBackground />

      {state === 'WELCOME' && (
        <SpotDifferenceWelcome onStart={goInstructions} onViewHistory={goHistory} onBack={handleExit} />
      )}

      {state === 'INSTRUCTIONS' && (
        <SpotDifferenceInstructions onContinue={goLevelSelect} onBack={goWelcome} />
      )}

      {state === 'LEVEL_SELECT' && (
        <SpotDifferenceLevelSelect
          levels={SPOT_DIFFERENCE_LEVELS}
          levelResults={levelResultsByLevelId}
          onSelectLevel={handleSelectLevel}
          onFinishSession={finalizeSession}
          onBack={goWelcome}
        />
      )}

      {state === 'LEVEL_INTRO' && currentLevel && (
        <SpotDifferenceLevelIntro level={currentLevel} onStart={handleStartLevelPlay} onBack={goLevelSelect} />
      )}

      {state === 'GAME' && currentLevel && (
        <SpotDifferenceGame
          key={`game-${currentLevel.id}-${runId}`}
          level={currentLevel}
          onLevelComplete={handleLevelComplete}
          onChooseAnotherLevel={goLevelSelect}
        />
      )}

      {state === 'LEVEL_COMPLETE' && currentLevel && (
        <SpotDifferenceLevelComplete
          level={currentLevel}
          allLevelsCompleted={allLevelsCompleted}
          nextIncompleteLevel={nextIncompleteLevel}
          onContinueToLevel={handleContinueToLevel}
          onViewResults={finalizeSession}
          onChooseAnotherLevel={goLevelSelect}
        />
      )}

      {state === 'COMPLETING' && <SpotDifferenceCompleting />}

      {state === 'RESULTS' && currentAssessment && (
        <SpotDifferenceResults
          currentAssessment={currentAssessment}
          history={history}
          onPlayAgain={handlePlayAgain}
          onViewHistory={goHistory}
          onBackToDashboard={handleExit}
        />
      )}

      {state === 'HISTORY' && <SpotDifferenceHistory assessments={history} onBack={goBackFromHistory} />}
    </div>
  );
}
