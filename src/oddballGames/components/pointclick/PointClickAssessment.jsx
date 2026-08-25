import { useEffect, useRef, useState } from 'react';
import PointClickTrialView from './PointClickTrialView';
import PauseModal from './PauseModal';
import { useTargetClickEngine } from '../../hooks/useTargetClickEngine';
import { POINT_CLICK_CONFIG } from '../../config/pointClickConfig';

/**
 * The actual, scored assessment (20 trials). Supports pause/resume: pausing
 * stops the engine outright, and any trial that was interrupted mid-flight
 * (its response was never recorded) is simply included in the "remaining"
 * slice re-started on resume — it runs again from the top (target ->
 * board), rather than trying to salvage a partially-measured response.
 * Completed trial records persist across pause/resume cycles in a ref.
 */
export default function PointClickAssessment({ trials, onAssessmentComplete, onExit }) {
  const trialRecordsRef = useRef([]);
  const completedCountRef = useRef(0);
  const [isPaused, setIsPaused] = useState(false);

  const engine = useTargetClickEngine({
    onTrialRecorded: (record) => {
      trialRecordsRef.current = [...trialRecordsRef.current, record];
      completedCountRef.current += 1;
      if (typeof window !== 'undefined') {
        window.__pcDebug = window.__pcDebug || [];
        window.__pcDebug.push({ t: Math.round(performance.now()), msg: `onTrialRecorded -> completedCount=${completedCountRef.current}` });
      }
    },
    onSequenceComplete: () => onAssessmentComplete(trialRecordsRef.current),
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.__pcDebug = window.__pcDebug || [];
      window.__pcDebug.push({ t: Math.round(performance.now()), msg: `EFFECT RUN isPaused=${isPaused} completedCount=${completedCountRef.current}` });
    }
    if (isPaused) return undefined;
    const remaining = trials.slice(completedCountRef.current);
    if (remaining.length === 0) {
      onAssessmentComplete(trialRecordsRef.current);
      return undefined;
    }
    engine.start(remaining, POINT_CLICK_CONFIG);
    return () => {
      if (typeof window !== 'undefined') {
        window.__pcDebug.push({ t: Math.round(performance.now()), msg: 'EFFECT CLEANUP' });
      }
      engine.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPaused]);

  const handlePause = () => setIsPaused(true);
  const handleResume = () => setIsPaused(false);
  const handleConfirmExit = () => onExit?.();

  // A hidden tab mid-assessment pauses rather than silently continuing
  // timers against a background tab, or hard-aborting the whole run.
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) setIsPaused(true);
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const displayedTrialNumber = completedCountRef.current + engine.trialNumber;
  const displayEngine = { ...engine, trialNumber: displayedTrialNumber, totalTrials: trials.length };

  return (
    <div className="oddball-screen pc-screen pc-screen--game">
      <div className="pc-game-header">
        <span className="oddball-eyebrow">NEUROMORPH</span>
        <span className="oddball-game-title">Point &amp; Click</span>
        <button className="pc-pause-btn" onClick={handlePause} aria-label="Pause assessment" disabled={isPaused}>
          Pause
        </button>
      </div>

      <PointClickTrialView engine={displayEngine} roundLabel="Trial" />

      {isPaused && <PauseModal onResume={handleResume} onConfirmExit={handleConfirmExit} />}
    </div>
  );
}
