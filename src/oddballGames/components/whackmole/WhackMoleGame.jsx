import { useEffect, useMemo, useRef, useState } from 'react';
import WhackMoleBoard from './WhackMoleBoard';
import PauseModal from '../pointclick/PauseModal';
import { useWhackMoleEngine } from '../../hooks/useWhackMoleEngine';
import { getWhackMoleConfig, WHACK_MOLE_DEFAULT_DIFFICULTY } from '../../config/whackMoleConfig';
import { formatTimeRemaining } from '../../utils/oddballTiming';

/**
 * The actual, scored assessment. Header shows TIME / SCORE / PAUSE only —
 * detailed clinical metrics stay off this screen entirely and only appear
 * on Results (spec section 6). Pause stops the engine outright and voids
 * any in-flight trial; a hidden browser tab auto-pauses the same way
 * (spec sections 28, 49), reusing Point & Click's PauseModal directly
 * since it has no module-specific logic.
 */
export default function WhackMoleGame({ onAssessmentComplete, onInterrupted, difficulty = WHACK_MOLE_DEFAULT_DIFFICULTY }) {
  const [isPaused, setIsPaused] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const feedbackTimeoutRef = useRef(null);
  const runConfig = useMemo(() => getWhackMoleConfig(difficulty), [difficulty]);

  const engine = useWhackMoleEngine({
    onTrialRecorded: (record) => {
      if (record.result === 'correct' || record.result === 'miss') {
        showFeedback(record.position, record.result === 'correct' ? 'hit' : 'miss');
      }
    },
    onFalseResponse: (event) => {
      showFeedback(event.position, 'false');
    },
    onComplete: (finalState) => {
      if (finalState.reason === 'INTERRUPTED') {
        onInterrupted?.();
      } else {
        onAssessmentComplete(finalState);
      }
    },
  });

  function showFeedback(position, type) {
    clearTimeout(feedbackTimeoutRef.current);
    setFeedback({ position, type });
    feedbackTimeoutRef.current = setTimeout(() => setFeedback(null), 320);
  }

  useEffect(() => {
    engine.start(runConfig, 'duration');
    return () => {
      clearTimeout(feedbackTimeoutRef.current);
      engine.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePause = () => {
    engine.pause();
    setIsPaused(true);
  };
  const handleResume = () => {
    engine.resume();
    setIsPaused(false);
  };
  const handleConfirmExit = () => engine.interrupt();

  // A hidden tab mid-assessment pauses rather than silently continuing
  // timers against a background tab.
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) handlePause();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTap = (position, inputMethod) => engine.respond(position, inputMethod || 'mouse');

  const progressPct =
    engine.timeRemainingMs != null
      ? Math.min(100, Math.round(((runConfig.assessmentDurationMs - engine.timeRemainingMs) / runConfig.assessmentDurationMs) * 100))
      : 0;
  const lowTime = engine.timeRemainingMs != null && engine.timeRemainingMs <= 10000;

  return (
    <div className="oddball-screen wm-screen wm-screen--game">
      <div className="oddball-game-header">
        <div>
          <span className="oddball-eyebrow">NEUROMORPH</span>
          <span className="oddball-game-title">Whack the Mole</span>
        </div>
        <div className="wm-header-right">
          <span className={`oddball-timer${lowTime ? ' wm-timer--low' : ''}`} aria-live="polite">
            TIME&nbsp;{formatTimeRemaining(engine.timeRemainingMs ?? 0)}
          </span>
          <span className="wm-score-badge" aria-live="polite">
            SCORE&nbsp;{engine.score}
          </span>
          <button className="pc-pause-btn" onClick={handlePause} aria-label="Pause assessment" disabled={isPaused}>
            Pause
          </button>
        </div>
      </div>

      <p className="wm-instruction-line">Tap the mole as quickly as you can when it appears.</p>

      <WhackMoleBoard
        totalHoles={runConfig.totalHoles}
        activePosition={engine.activeTarget?.position ?? null}
        feedback={feedback}
        onTap={handleTap}
        disabled={isPaused}
      />

      <div className="wm-stats-bar">
        <div className="wm-stat">
          <span className="oddball-info-label">Hits</span>
          <span className="oddball-info-value">{engine.hits}</span>
        </div>
        <div className="wm-stat">
          <span className="oddball-info-label">Misses</span>
          <span className="oddball-info-value">{engine.misses}</span>
        </div>
      </div>
      <div className="oddball-progress-track">
        <div className="oddball-progress-fill" style={{ width: `${progressPct}%` }} />
      </div>
      <span className="oddball-progress-label">Progress</span>

      {isPaused && <PauseModal onResume={handleResume} onConfirmExit={handleConfirmExit} />}
    </div>
  );
}
