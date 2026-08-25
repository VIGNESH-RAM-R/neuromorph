const BAND_COLOR_VAR = {
  Excellent: 'var(--nmdd-excellent)',
  Normal: 'var(--nmdd-normal)',
  'Mildly Reduced': 'var(--nmdd-mild)',
  Reduced: 'var(--nmdd-reduced)',
  'Slightly Reduced': 'var(--nmdd-mild)',
};

export default function ScoreBar({ label, score, band, max = 100 }) {
  const pct = typeof score === 'number' ? Math.max(0, Math.min(100, (score / max) * 100)) : 0;
  const color = BAND_COLOR_VAR[band] || 'var(--nmdd-neutral)';
  return (
    <div className="nmdd-scorebar">
      <div className="nmdd-scorebar__row">
        <span className="nmdd-scorebar__label">{label}</span>
        <span className="nmdd-scorebar__value">{typeof score === 'number' ? score : '—'}</span>
      </div>
      <div className="nmdd-scorebar__track" role="progressbar" aria-valuenow={score} aria-valuemin={0} aria-valuemax={max}>
        <div className="nmdd-scorebar__fill" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}
