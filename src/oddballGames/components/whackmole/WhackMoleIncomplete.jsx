/**
 * Shown when a session is ended before completion (browser tab closed and
 * reopened mid-run is handled by the module simply resetting on mount; this
 * screen covers the explicit "End Test" path from the pause modal). The
 * interrupted session is never saved, so it cannot corrupt completed
 * history (spec sections 28, 41).
 */
export default function WhackMoleIncomplete({ onRetry, onExit }) {
  return (
    <div className="oddball-screen wm-screen">
      <h1 className="oddball-heading">Assessment Ended</h1>
      <p className="oddball-lead">
        This session was ended before completion, so it has not been saved and will not affect your
        results or performance history.
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
