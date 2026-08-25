import { useState, useEffect } from 'react';

// Shared 3-2-1-GO countdown used between a task's practice and scored
// phases (Stroop, Go/No-Go, Token Test, and any future task that wants
// the same "get ready" beat). Kept as one component so the timing/feel is
// identical everywhere it appears rather than three near-copies drifting.
export default function TaskCountdown({ onDone }) {
  const steps = ['3', '2', '1', 'GO'];
  const [i, setI] = useState(0);

  useEffect(() => {
    if (i >= steps.length) {
      const t = setTimeout(onDone, 350);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setI((v) => v + 1), 550);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);

  return (
    <div className="nmpa-task__countdown">
      <span key={i} className={`nmpa-task__countdown-num ${steps[i] === 'GO' ? 'is-go' : ''}`}>{steps[i] ?? ''}</span>
    </div>
  );
}
