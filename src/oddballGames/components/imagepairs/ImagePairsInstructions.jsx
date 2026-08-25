function TapIcon() {
  return (
    <svg viewBox="0 0 40 40" width="32" height="32" aria-hidden="true">
      <circle cx="20" cy="20" r="7" fill="none" stroke="#1E3A5F" strokeWidth="2" />
      <circle cx="20" cy="20" r="13" fill="none" stroke="#4F46E5" strokeWidth="1.6" strokeDasharray="3 4" />
    </svg>
  );
}
function EyeIcon() {
  return (
    <svg viewBox="0 0 40 40" width="32" height="32" aria-hidden="true">
      <path d="M4 20c4-8 12-12 16-12s12 4 16 12c-4 8-12 12-16 12S8 28 4 20z" fill="none" stroke="#1E3A5F" strokeWidth="2.2" />
      <circle cx="20" cy="20" r="5.5" fill="#4F46E5" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg viewBox="0 0 40 40" width="32" height="32" aria-hidden="true">
      <circle cx="20" cy="20" r="16" fill="none" stroke="#4F46E5" strokeWidth="2" />
      <path d="M13 20l5 5 9-11" fill="none" stroke="#1E3A5F" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Shown once, right after "Start Test" on Welcome, before Practice — the
 * only explanation screen in the flow. Plain, non-medical language (spec
 * section 9): the participant should understand the task immediately.
 */
export default function ImagePairsInstructions({ onContinue, onBack }) {
  return (
    <div className="oddball-screen ip-screen">
      <h1 className="oddball-heading">How To Play</h1>
      <p className="oddball-lead">You will see several cards.</p>

      <div className="seq-stage-cards">
        <div className="seq-stage-card">
          <span className="seq-stage-icon">
            <TapIcon />
          </span>
          <span className="seq-stage-title">Tap a Card</span>
          <p className="seq-stage-desc">Tap a card to reveal the image, then tap another card.</p>
        </div>
        <div className="seq-stage-card">
          <span className="seq-stage-icon">
            <EyeIcon />
          </span>
          <span className="seq-stage-title">Remember</span>
          <p className="seq-stage-desc">Remember where each image is located.</p>
        </div>
        <div className="seq-stage-card">
          <span className="seq-stage-icon">
            <CheckIcon />
          </span>
          <span className="seq-stage-title">Find the Match</span>
          <p className="seq-stage-desc">Continue until all matching pairs are found.</p>
        </div>
      </div>

      <ul className="oddball-instruction-list">
        <li>Tap a card to reveal the image.</li>
        <li>Tap another card.</li>
        <li>Try to find the matching image.</li>
        <li>Remember where each image is located.</li>
        <li>Continue until all pairs are found.</li>
      </ul>

      <p className="oddball-hint">Work as accurately and quickly as possible.</p>

      <div className="oddball-actions">
        <button className="oddball-btn oddball-btn--primary" onClick={onContinue}>
          Begin
        </button>
        {onBack && (
          <button className="oddball-btn oddball-btn--secondary" onClick={onBack}>
            Back
          </button>
        )}
      </div>
    </div>
  );
}
