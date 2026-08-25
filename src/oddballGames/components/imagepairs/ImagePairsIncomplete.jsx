/**
 * Shown when a session is safely terminated mid-assessment (tab hidden, or
 * the participant used the Exit control). The interrupted session is never
 * saved, so it cannot corrupt completed results or history (spec section 41).
 */
export default function ImagePairsIncomplete({ onRetry, onExit }) {
  return (
    <div className="oddball-screen ip-screen">
      <h1 className="oddball-heading">Assessment Interrupted</h1>
      <p className="oddball-lead">
        This session was interrupted, so it has not been saved and will not affect your results or
        performance history.
      </p>
      <div className="oddball-actions">
        <button className="oddball-btn oddball-btn--primary" onClick={onRetry}>
          Try Again
        </button>
        <button className="oddball-btn oddball-btn--secondary" onClick={onExit}>
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}
