import { useEffect, useRef, useState } from 'react';

function prefersReducedMotion() {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

// Animates a displayed number from its previous value up (or down) to a new
// target over `duration` ms, using requestAnimationFrame -- the classic
// "dashboard number count-up" micro-interaction (Samsung Health, Apple
// Health, etc. all do this on their ring/score reveals). Respects
// prefers-reduced-motion by jumping straight to the target, same as every
// other animation in this app (see theme.css's existing
// @media (prefers-reduced-motion: reduce) blocks). Rounds to whole numbers
// by default since every score/count in this app is an integer.
export function useCountUp(target, { duration = 900, round = true } = {}) {
  const [display, setDisplay] = useState(target ?? 0);
  const fromRef = useRef(target ?? 0);
  const frameRef = useRef(null);

  useEffect(() => {
    if (target === undefined || target === null) return undefined;
    const from = fromRef.current;
    if (from === target) return undefined;

    if (prefersReducedMotion() || duration <= 0) {
      setDisplay(target);
      fromRef.current = target;
      return undefined;
    }

    const start = performance.now();
    const animate = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      // ease-out cubic -- fast start, gentle settle, matches
      // --nmpa-motion-med's easing curve used elsewhere in this app.
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = from + (target - from) * eased;
      setDisplay(round ? Math.round(value) : value);
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        fromRef.current = target;
      }
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return display;
}
