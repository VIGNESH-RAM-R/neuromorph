import { useEffect, useState } from 'react';
import { WHACK_MOLE_CONFIG } from '../../config/whackMoleConfig';

/**
 * Short, professional 3-2-1-GO countdown before the scored assessment
 * begins. No target/response is ever recorded before GO (spec section 10).
 */
export default function WhackMoleCountdown({ onComplete }) {
  const [count, setCount] = useState(WHACK_MOLE_CONFIG.countdownSeconds);

  useEffect(() => {
    if (count <= 0) {
      const id = setTimeout(onComplete, 450);
      return () => clearTimeout(id);
    }
    const id = setTimeout(() => setCount((c) => c - 1), 800);
    return () => clearTimeout(id);
  }, [count, onComplete]);

  return (
    <div className="oddball-screen wm-screen oddball-screen--countdown">
      <span className="oddball-eyebrow">GET READY</span>
      <span className="oddball-countdown-value" key={count}>
        {count > 0 ? count : 'GO!'}
      </span>
    </div>
  );
}
