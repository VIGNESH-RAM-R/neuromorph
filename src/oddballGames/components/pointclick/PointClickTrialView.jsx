import PointClickBoard from './PointClickBoard';
import TargetIndicator from './TargetIndicator';

const STATUS_TEXT = {
  target: 'Get ready…',
  transition: ' ',
  board: 'Tap the target as quickly as you can.',
  feedback: ' ',
  'inter-trial': ' ',
};

const FEEDBACK_TEXT = {
  HIT: 'Correct',
  CORRECT_REJECTION: 'Correct — no target appeared',
  FALSE_ALARM: 'Incorrect',
  MISS: 'No response recorded',
};

/**
 * Shared presentational layout for a running trial (target reminder + board
 * + status). Used by both Practice and the scored Assessment — each
 * supplies its own useTargetClickEngine instance so their data never mix.
 */
export default function PointClickTrialView({ engine, roundLabel }) {
  const { phase, trialNumber, totalTrials, currentTrial, lastResponseType, lastRespondedObjectId, respond } = engine;

  const interactive = phase === 'board';
  const showBoardObjects = phase === 'board' || phase === 'feedback';
  const showTarget = currentTrial && phase !== 'inter-trial';
  const statusText = STATUS_TEXT[phase] || ' ';

  const feedbackClass =
    lastResponseType === 'HIT' || lastResponseType === 'CORRECT_REJECTION'
      ? 'pc-feedback-pill--correct'
      : lastResponseType === 'FALSE_ALARM'
      ? 'pc-feedback-pill--incorrect'
      : 'pc-feedback-pill--missed';

  const progressPct = totalTrials ? Math.max(0, Math.min(100, ((trialNumber - 1) / totalTrials) * 100)) : 0;

  return (
    <div className="pc-game-area">
      <div className="pc-progress-wrap">
        <div className="pc-progress-bar">
          <div className="pc-progress-fill" style={{ width: `${progressPct}%` }} />
        </div>
        <p className="pc-progress-text">
          {roundLabel} {trialNumber} of {totalTrials || '—'}
        </p>
      </div>

      {showTarget && (
        <TargetIndicator shapeId={currentTrial.targetShapeId} colorId={currentTrial.targetColorId} label={currentTrial.targetLabel} />
      )}

      <p className="pc-status-text" aria-live="polite">
        {statusText}
      </p>

      <PointClickBoard
        objects={showBoardObjects ? currentTrial?.objects : []}
        interactive={interactive}
        onRespond={respond}
        feedback={phase === 'feedback' ? { respondedObjectId: lastRespondedObjectId, responseType: lastResponseType } : null}
      />

      <div className="pc-feedback-slot" aria-live="polite">
        {phase === 'feedback' && lastResponseType && (
          <span className={`pc-feedback-pill ${feedbackClass}`}>{FEEDBACK_TEXT[lastResponseType]}</span>
        )}
      </div>
    </div>
  );
}
