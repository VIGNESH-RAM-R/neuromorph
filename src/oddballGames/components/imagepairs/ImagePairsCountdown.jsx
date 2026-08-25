import { useEffect, useState } from 'react';
import { IMAGE_PAIRS_CONFIG } from '../../config/imagePairsConfig';

/**
 * Short, professional 3-2-1 countdown before the scored assessment begins.
 * Deliberately plain — no flashing or celebratory motion (spec section 11).
 */
export default function ImagePairsCountdown({ onComplete }) {
  const [count, setCount] = useState(IMAGE_PAIRS_CONFIG.countdownSeconds);

  useEffect(() => {
    if (count <= 0) {
      const id = setTimeout(onComplete, 400);
      return () => clearTimeout(id);
    }
    const id = setTimeout(() => setCount((c) => c - 1), 800);
    return () => clearTimeout(id);
  }, [count, onComplete]);

  return (
    <div className="oddball-screen ip-screen oddball-screen--countdown">
      <span className="oddball-eyebrow">GET READY</span>
      <span className="oddball-countdown-value" key={count}>
        {count > 0 ? count : 'BEGIN'}
      </span>
    </div>
  );
}
