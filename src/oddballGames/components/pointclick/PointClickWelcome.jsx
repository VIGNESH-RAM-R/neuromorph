function TargetGlyph() {
  return (
    <svg viewBox="0 0 64 64" width="72" height="72" aria-hidden="true">
      <circle cx="32" cy="32" r="28" fill="none" stroke="#3B82F6" strokeWidth="3" />
      <circle cx="32" cy="32" r="18" fill="none" stroke="#22D3EE" strokeWidth="2.5" />
      <circle cx="32" cy="32" r="7" fill="#22D3EE" />
    </svg>
  );
}

/**
 * Welcome screen. A single "Start Assessment" action leads into the
 * Instructions ("How It Works") screen before Practice — consistent with
 * the other Neuromorph modules, there is no separate "How It Works" preview
 * button here, so the explanation is shown exactly once.
 */
export default function PointClickWelcome({ onStart, onViewHistory, onBack }) {
  return (
    <div className="oddball-screen pc-screen pc-screen--welcome">
      <div className="pc-brain-icon">
        <TargetGlyph />
      </div>

      <p className="oddball-eyebrow">NEUROMORPH</p>
      <h1 className="oddball-title">Point &amp; Click</h1>
      <p className="pc-subtitle">VISUAL ATTENTION &bull; TARGET DETECTION &bull; RESPONSE SPEED</p>

      <p className="oddball-lead">
        A changing target object will be announced before each round. Find it among the other
        objects on the screen and tap it as quickly as you can.
      </p>
      <p className="oddball-hint">Estimated duration: approximately 2–3 minutes.</p>

      <div className="oddball-actions">
        <button className="seq-cs-btn seq-cs-btn--primary" onClick={onStart}>
          Start Assessment
        </button>
        {onBack && (
          <button className="seq-cs-btn seq-cs-btn--secondary" onClick={onBack}>
            Back
          </button>
        )}
      </div>

      {onViewHistory && (
        <button className="oddball-link-btn" onClick={onViewHistory}>
          View past assessments
        </button>
      )}
    </div>
  );
}
