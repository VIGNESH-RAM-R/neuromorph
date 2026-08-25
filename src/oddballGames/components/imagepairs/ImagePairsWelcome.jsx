function PuzzleBrainIcon() {
  return (
    <svg viewBox="0 0 64 64" width="72" height="72" aria-hidden="true">
      <circle cx="32" cy="32" r="28" fill="none" stroke="#1E3A5F" strokeWidth="3" />
      <rect x="17" y="17" width="13" height="13" rx="3" fill="none" stroke="#4F46E5" strokeWidth="2.5" />
      <rect x="34" y="17" width="13" height="13" rx="3" fill="none" stroke="#4F46E5" strokeWidth="2.5" />
      <rect x="17" y="34" width="13" height="13" rx="3" fill="#4F46E5" />
      <rect x="34" y="34" width="13" height="13" rx="3" fill="none" stroke="#4F46E5" strokeWidth="2.5" />
    </svg>
  );
}

export default function ImagePairsWelcome({ onStart, onAbout, onViewHistory, onBack }) {
  return (
    <div className="oddball-screen ip-screen ip-screen--welcome">
      <div className="ip-brain-icon">
        <PuzzleBrainIcon />
      </div>

      <p className="oddball-eyebrow">NEUROMORPH &middot; Cognitive Assessment</p>
      <h1 className="oddball-title">Image Pairs</h1>
      <p className="ip-subtitle">MEMORY &bull; RECOGNITION &bull; ASSOCIATION</p>

      <p className="oddball-lead">Assess your visual memory by finding matching pairs.</p>

      <div className="oddball-info-grid">
        <div className="oddball-info-card">
          <span className="oddball-info-label">Duration</span>
          <span className="oddball-info-value">~2 minutes</span>
        </div>
        <div className="oddball-info-card">
          <span className="oddball-info-label">Input</span>
          <span className="oddball-info-value">Touch or mouse</span>
        </div>
      </div>

      <div className="oddball-actions">
        <button className="oddball-btn oddball-btn--primary" onClick={onStart}>
          Start Test
        </button>
        {onBack && (
          <button className="oddball-btn oddball-btn--secondary" onClick={onBack}>
            Back
          </button>
        )}
      </div>

      <button className="oddball-link-btn" onClick={onAbout}>
        &#9432; About This Assessment
      </button>
      {onViewHistory && (
        <button className="oddball-link-btn" onClick={onViewHistory}>
          View past assessments
        </button>
      )}
    </div>
  );
}
