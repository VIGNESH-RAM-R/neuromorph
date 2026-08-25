function MagnifierIcon() {
  return (
    <svg viewBox="0 0 64 64" width="72" height="72" aria-hidden="true">
      <circle cx="27" cy="27" r="18" fill="none" stroke="#3B82F6" strokeWidth="3" />
      <circle cx="27" cy="27" r="9" fill="none" stroke="#22D3EE" strokeWidth="2.2" />
      <line x1="40" y1="40" x2="54" y2="54" stroke="#22D3EE" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Welcome screen. A single "Start Assessment" action leads into the How to
 * Play instructions before Level Select — consistent with the other
 * Neuromorph modules, the explanation is shown exactly once.
 */
export default function SpotDifferenceWelcome({ onStart, onViewHistory, onBack }) {
  return (
    <div className="oddball-screen sd-screen sd-screen--welcome">
      <div className="pc-brain-icon">
        <MagnifierIcon />
      </div>

      <p className="oddball-eyebrow">NEUROMORPH</p>
      <h1 className="oddball-title">Spot the Difference</h1>
      <p className="pc-subtitle">VISUAL ATTENTION &bull; DETAIL DISCRIMINATION &bull; VISUAL SEARCH</p>

      <p className="oddball-lead">
        Two pictures, almost the same. Tap every spot where they differ, across three levels of
        difficulty.
      </p>
      <p className="oddball-hint">Untimed, no penalty for a wrong tap — take all the time you need.</p>

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
