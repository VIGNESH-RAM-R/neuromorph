function CompareIcon() {
  return (
    <svg viewBox="0 0 40 40" width="32" height="32" aria-hidden="true">
      <rect x="3" y="8" width="14" height="24" rx="2" fill="none" stroke="#3B82F6" strokeWidth="2.2" />
      <rect x="23" y="8" width="14" height="24" rx="2" fill="none" stroke="#22D3EE" strokeWidth="2.2" />
    </svg>
  );
}

function TapIcon() {
  return (
    <svg viewBox="0 0 40 40" width="32" height="32" aria-hidden="true">
      <circle cx="20" cy="20" r="7" fill="none" stroke="#3B82F6" strokeWidth="2" />
      <circle cx="20" cy="20" r="13" fill="none" stroke="#22D3EE" strokeWidth="1.6" strokeDasharray="3 4" />
    </svg>
  );
}

function ConfirmIcon() {
  return (
    <svg viewBox="0 0 40 40" width="32" height="32" aria-hidden="true">
      <circle cx="20" cy="20" r="15" fill="none" stroke="#22D3EE" strokeWidth="2.2" />
      <path d="M13 20l5 5 9-11" fill="none" stroke="#3B82F6" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Shown once, right after "Start Assessment" on Welcome, and before Level Select. */
export default function SpotDifferenceInstructions({ onContinue, onBack }) {
  return (
    <div className="oddball-screen sd-screen sd-screen--instructions">
      <h1 className="oddball-heading">How to Play</h1>

      <div className="seq-stage-cards">
        <div className="seq-stage-card">
          <span className="seq-stage-icon">
            <CompareIcon />
          </span>
          <span className="seq-stage-title">Compare</span>
          <p className="seq-stage-desc">You&rsquo;ll see two pictures side by side that look almost the same.</p>
        </div>
        <div className="seq-stage-card">
          <span className="seq-stage-icon">
            <TapIcon />
          </span>
          <span className="seq-stage-title">Tap</span>
          <p className="seq-stage-desc">
            Tap or click anywhere on either picture where you think the two pictures are different.
          </p>
        </div>
        <div className="seq-stage-card">
          <span className="seq-stage-icon">
            <ConfirmIcon />
          </span>
          <span className="seq-stage-title">Confirm</span>
          <p className="seq-stage-desc">
            A correct spot is marked with a green check on both pictures — no timer, no penalty.
          </p>
        </div>
      </div>

      <ul className="oddball-instruction-list">
        <li>If you&rsquo;re right, a green circle with a check mark appears on both pictures, and your count goes up.</li>
        <li>
          If you&rsquo;re not right, you&rsquo;ll see a red mark — that&rsquo;s completely fine. Try
          looking near the differences you&rsquo;ve already found, or check a new part of the picture.
        </li>
        <li>There is no timer and no penalty for a wrong tap. Take all the time you need.</li>
        <li>There are three levels — Easy, Medium and Hard — each with more (and smaller) differences to find.</li>
      </ul>

      <div className="oddball-actions">
        <button className="seq-cs-btn seq-cs-btn--primary" onClick={onContinue}>
          Choose a Level
        </button>
        {onBack && (
          <button className="seq-cs-btn seq-cs-btn--secondary" onClick={onBack}>
            Back
          </button>
        )}
      </div>
    </div>
  );
}
