import { useEffect, useState, useRef } from 'react';
import { ODDBALL_CONFIG } from '../../config/oddballConfig';

export default function OddballCountdown({ onComplete }) {
  const [count, setCount] = useState(ODDBALL_CONFIG.countdownSeconds);
  const timeoutRef = useRef(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (count > 0) {
      timeoutRef.current = setTimeout(() => setCount((c) => c - 1), 800);
      return () => clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => onCompleteRef.current?.(), 600);
    return () => clearTimeout(timeoutRef.current);
  }, [count]);

  return (
    <div className="oddball-screen oddball-screen--countdown">
      <div className="oddball-countdown-value" key={count} aria-live="polite">
        {count > 0 ? count : 'GO'}
      </div>
      <p className="oddball-hint">Get ready to watch the screen.</p>
    </div>
  );
}
