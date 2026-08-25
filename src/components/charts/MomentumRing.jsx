import { useCountUp } from '../../hooks/useCountUp.js';

const SIZE = 132;
const STROKE = 12;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// Samsung Health/Apple Health-style circular progress ring for the
// Momentum Score. Two states: "revealed" (real score, animated fill +
// count-up number) and "hidden" (the momentum reveal gate hasn't been met
// yet -- a soft, gently pulsing outline with a "?" placeholder, never a
// fabricated number). The ring itself animates via a plain CSS transition
// on stroke-dashoffset (smoother and cheaper than animating it in JS); only
// the numeric label uses useCountUp, so the two stay visually in sync.
export default function MomentumRing({ score, revealed, label }) {
  const animatedScore = useCountUp(revealed ? score ?? 0 : 0);
  const pct = revealed ? Math.max(0, Math.min(100, score ?? 0)) : 0;
  const offset = CIRCUMFERENCE * (1 - pct / 100);

  return (
    <div className={`nmpa-ring ${revealed ? 'is-revealed' : 'is-hidden'}`} role="img" aria-label={label}>
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="nmpa-ring__svg">
        {/* 2026-08-23 (electric glow pass): gradient stroke for the progress
            arc -- CSS alone can't gradient an SVG stroke, so the gradient
            stops are defined here and read via stroke="url(#...)" below;
            the glow itself (filter: var(--nmpa-ring-glow)) and the
            light-theme no-op are handled entirely in theme.css. Stop
            colors reference the same --nmpa-accent/--nmpa-accent-2 tokens
            as everywhere else, so this stays theme-aware without any JS
            branching -- in light theme they resolve to the same solid
            accent color, so the "gradient" is visually flat there. */}
        <defs>
          <linearGradient id="nmpa-ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: 'var(--nmpa-accent)' }} />
            <stop offset="100%" style={{ stopColor: 'var(--nmpa-accent-2)' }} />
          </linearGradient>
        </defs>
        <circle
          className="nmpa-ring__track"
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          strokeWidth={STROKE}
          fill="none"
        />
        {revealed && (
          <circle
            className="nmpa-ring__fill"
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            strokeWidth={STROKE}
            fill="none"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
          />
        )}
      </svg>
      <div className="nmpa-ring__center">
        {revealed ? (
          <span className="nmpa-ring__value">{animatedScore}</span>
        ) : (
          <span className="nmpa-ring__value nmpa-ring__value--hidden">--</span>
        )}
      </div>
    </div>
  );
}
