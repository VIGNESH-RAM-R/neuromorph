import { useEffect, useRef, useState } from 'react';

const CHECK_TAPS = 3;

/**
 * Optional device check (spec section 43): confirms touch/click, display
 * and timing are functioning before the real assessment. Entirely
 * self-contained and local — its interactions are never recorded as trial
 * data and never contribute to assessment statistics.
 */
export default function WhackMoleDeviceCheck({ onDone, onBack }) {
  const [visible, setVisible] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const [ready, setReady] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    timeoutRef.current = setTimeout(() => setVisible(true), 500);
    return () => clearTimeout(timeoutRef.current);
  }, [tapCount]);

  const handleTap = () => {
    if (!visible || ready) return;
    setVisible(false);
    const next = tapCount + 1;
    if (next >= CHECK_TAPS) {
      setReady(true);
    } else {
      setTapCount(next);
    }
  };

  return (
    <div className="oddball-screen wm-screen">
      <h1 className="oddball-heading">Device Check</h1>
      {!ready ? (
        <>
          <p className="oddball-lead">Tap the circle when it appears.</p>
          <div className="wm-device-check-area">
            {visible && (
              <button type="button" className="wm-device-check-target" onClick={handleTap} aria-label="Tap target" />
            )}
          </div>
          <p className="oddball-hint">
            {tapCount} / {CHECK_TAPS} taps
          </p>
        </>
      ) : (
        <>
          <div className="oddball-check-badge" aria-hidden="true">
            ✓
          </div>
          <p className="oddball-lead">Device Ready</p>
          <p className="oddball-hint">Touch/click, display and timing all responded correctly.</p>
        </>
      )}
      <div className="oddball-actions">
        {ready ? (
          <button className="oddball-btn oddball-btn--primary" onClick={onDone}>
            Continue
          </button>
        ) : (
          <button className="oddball-btn oddball-btn--secondary" onClick={onBack}>
            Skip
          </button>
        )}
      </div>
    </div>
  );
}
