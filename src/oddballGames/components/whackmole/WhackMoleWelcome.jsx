function MoleBadgeIcon() {
  return (
    <svg viewBox="0 0 64 64" width="72" height="72" aria-hidden="true">
      <circle cx="32" cy="32" r="28" fill="none" stroke="#1E3A5F" strokeWidth="3" />
      <ellipse cx="32" cy="46" rx="16" ry="4" fill="#166534" opacity="0.5" />
      <path
        d="M32 12c-11 0-18 9-18 20 0 9 5 15 12 18 1 .4 3-.3 3-2 0-1-.5-1.5-1.5-2-5-2-8-7-8-12 0-9 5.5-15 12.5-15S44 24 44 33c0 5-3 10-8 12-1 .5-1.5 1-1.5 2 0 1.7 2 2.4 3 2 7-3 12-9 12-18 0-11-7-20-18-20z"
        fill="#16A34A"
      />
      <ellipse cx="26" cy="27" rx="2.4" ry="3" fill="#0F2440" />
      <ellipse cx="38" cy="27" rx="2.4" ry="3" fill="#0F2440" />
      <ellipse cx="32" cy="33" rx="4" ry="3" fill="#F2A6A6" />
    </svg>
  );
}

export default function WhackMoleWelcome({
  onStart,
  onAbout,
  onDeviceCheck,
  onViewHistory,
  onBack,
  difficulty,
  difficultyLevels,
  onDifficultyChange,
}) {
  const levels = difficultyLevels ? Object.values(difficultyLevels) : [];
  const selectedLevel = difficultyLevels?.[difficulty];

  return (
    <div className="oddball-screen wm-screen wm-screen--welcome">
      <div className="wm-mole-icon">
        <MoleBadgeIcon />
      </div>

      <p className="oddball-eyebrow">NEUROMORPH &middot; Cognitive Assessment</p>
      <h1 className="oddball-title">Whack the Mole</h1>
      <p className="wm-subtitle">ATTENTION &bull; REACTION SPEED</p>

      <p className="oddball-lead">
        This task measures how quickly and accurately you respond to visual targets.
      </p>

      <ul className="oddball-instruction-list">
        <li>Moles will appear from different holes.</li>
        <li>Tap the mole as quickly as you can when it appears.</li>
        <li>Focus on the game area.</li>
        <li>Do not tap unless you see the target.</li>
      </ul>

      {levels.length > 0 && (
        <div className="wm-difficulty-block">
          <span className="oddball-info-label">Difficulty</span>
          <div className="oddball-trend-toggle" role="group" aria-label="Select difficulty">
            {levels.map((level) => (
              <button
                key={level.key}
                type="button"
                className={`oddball-toggle-btn${difficulty === level.key ? ' oddball-toggle-btn--active' : ''}`}
                aria-pressed={difficulty === level.key}
                onClick={() => onDifficultyChange?.(level.key)}
              >
                {level.label}
              </button>
            ))}
          </div>
          {selectedLevel && <p className="oddball-metric-sublabel">{selectedLevel.description}</p>}
        </div>
      )}

      <div className="wm-howitworks">
        <div className="wm-howitworks-step">
          <span className="wm-howitworks-num">1</span>
          <span>Watch</span>
        </div>
        <div className="wm-howitworks-step">
          <span className="wm-howitworks-num">2</span>
          <span>Detect</span>
        </div>
        <div className="wm-howitworks-step">
          <span className="wm-howitworks-num">3</span>
          <span>Tap</span>
        </div>
        <div className="wm-howitworks-step">
          <span className="wm-howitworks-num">4</span>
          <span>Continue</span>
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
        &#9432; About This Test
      </button>
      {onDeviceCheck && (
        <button className="oddball-link-btn" onClick={onDeviceCheck}>
          Device Check (optional)
        </button>
      )}
      {onViewHistory && (
        <button className="oddball-link-btn" onClick={onViewHistory}>
          View past assessments
        </button>
      )}
    </div>
  );
}
