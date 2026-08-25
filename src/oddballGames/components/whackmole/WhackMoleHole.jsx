import WhackMoleMole from './WhackMoleMole';

/**
 * A single hole. Always clickable regardless of whether the mole is
 * currently showing — false/commission responses are measured by tapping
 * an inactive hole, so the hit area can never be conditionally removed
 * (spec section 19). `feedback` is a short-lived, purely decorative class
 * ('hit' | 'miss' | 'false' | null) driven by the caller from the engine's
 * onTrialRecorded/onFalseResponse callbacks — it never affects scoring.
 */
export default function WhackMoleHole({ position, isActive, feedback, onTap, disabled, label }) {
  // Pointer events (not a plain click handler) so mouse/touch/pen can be
  // told apart and recorded as inputMethod (spec sections 42, 76, 77).
  const handlePointerUp = (e) => {
    onTap(position, e.pointerType || 'mouse');
  };

  return (
    <button
      type="button"
      className={`wm-hole${isActive ? ' wm-hole--active' : ''}${feedback ? ` wm-hole--${feedback}` : ''}`}
      onPointerUp={handlePointerUp}
      disabled={disabled}
      aria-label={label || `Hole ${position}`}
      data-position={position}
      data-active={isActive ? 'true' : 'false'}
    >
      <span className="wm-hole-rim" aria-hidden="true" />
      <span className="wm-hole-shadow" aria-hidden="true" />
      <span className="wm-mole-slot" aria-hidden="true">
        {isActive && <WhackMoleMole state="up" />}
      </span>
    </button>
  );
}
