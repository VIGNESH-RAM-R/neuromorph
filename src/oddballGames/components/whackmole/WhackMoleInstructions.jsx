function EyeIcon() {
  return (
    <svg viewBox="0 0 40 40" width="32" height="32" aria-hidden="true">
      <path d="M4 20c4-8 12-12 16-12s12 4 16 12c-4 8-12 12-16 12S8 28 4 20z" fill="none" stroke="#1E3A5F" strokeWidth="2.2" />
      <circle cx="20" cy="20" r="5.5" fill="#16A34A" />
    </svg>
  );
}
function TargetIcon() {
  return (
    <svg viewBox="0 0 40 40" width="32" height="32" aria-hidden="true">
      <circle cx="20" cy="20" r="15" fill="none" stroke="#1E3A5F" strokeWidth="2" />
      <circle cx="20" cy="20" r="9" fill="none" stroke="#16A34A" strokeWidth="2" />
      <circle cx="20" cy="20" r="3" fill="#16A34A" />
    </svg>
  );
}
function TapIcon() {
  return (
    <svg viewBox="0 0 40 40" width="32" height="32" aria-hidden="true">
      <circle cx="20" cy="20" r="7" fill="none" stroke="#1E3A5F" strokeWidth="2" />
      <circle cx="20" cy="20" r="13" fill="none" stroke="#16A34A" strokeWidth="1.6" strokeDasharray="3 4" />
    </svg>
  );
}
function ContinueIcon() {
  return (
    <svg viewBox="0 0 40 40" width="32" height="32" aria-hidden="true">
      <path d="M10 20h16" stroke="#1E3A5F" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M20 12l8 8-8 8" fill="none" stroke="#16A34A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Shown once, right after "Start Test" on Welcome, before Practice — the
 * only explanation screen in the flow, matching every other Neuromorph
 * module.
 */
export default function WhackMoleInstructions({ onContinue, onBack, difficultyLabel }) {
  return (
    <div className="oddball-screen wm-screen">
      <h1 className="oddball-heading">How To Play</h1>
      <p className="oddball-lead">Tap the mole as quickly as you can when it appears.</p>
      {difficultyLabel && <p className="oddball-metric-sublabel">Difficulty: {difficultyLabel}</p>}

      <div className="seq-stage-cards wm-stage-cards">
        <div className="seq-stage-card">
          <span className="seq-stage-icon">
            <EyeIcon />
          </span>
          <span className="seq-stage-title">Watch</span>
          <p className="seq-stage-desc">Keep your eyes on the game board.</p>
        </div>
        <div className="seq-stage-card">
          <span className="seq-stage-icon">
            <TargetIcon />
          </span>
          <span className="seq-stage-title">Detect</span>
          <p className="seq-stage-desc">A mole will pop up from one of the holes.</p>
        </div>
        <div className="seq-stage-card">
          <span className="seq-stage-icon">
            <TapIcon />
          </span>
          <span className="seq-stage-title">Tap</span>
          <p className="seq-stage-desc">Tap it as quickly as you can.</p>
        </div>
        <div className="seq-stage-card">
          <span className="seq-stage-icon">
            <ContinueIcon />
          </span>
          <span className="seq-stage-title">Continue</span>
          <p className="seq-stage-desc">Another mole will appear. Keep going.</p>
        </div>
      </div>

      <ul className="oddball-instruction-list">
        <li>Only one mole appears at a time.</li>
        <li>Tap directly on the mole, not just near it.</li>
        <li>Try not to tap when no mole is showing.</li>
        <li>Work as quickly and accurately as you can.</li>
      </ul>

      <div className="oddball-actions">
        <button className="oddball-btn oddball-btn--primary" onClick={onContinue}>
          Continue
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
