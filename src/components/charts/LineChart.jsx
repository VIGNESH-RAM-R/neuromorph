// Dependency-free inline SVG line chart, same pattern used across every
// other NEUROMORPH module -- no chart library.
//
// 2026-08-21: Samsung Health-style entrance animation -- the line draws on
// rather than appearing fully formed, and each point pops in with a slight
// stagger just behind the draw. See theme.css's "Charts" section for the
// actual keyframes/reduced-motion fallback; the only thing done here is
// `pathLength={1}` on the <path> (an SVG2 attribute that renormalizes the
// path's length to exactly 1 for stroke-dash* purposes, regardless of its
// real on-screen length) so the CSS animation works identically for a
// short 3-point series and a long 30-point one with zero JS measurement.
export default function LineChart({ series = [], height = 160, label }) {
  const valid = series.filter((p) => typeof p.score === 'number');
  if (valid.length < 2) {
    return <div className="nmpa-chart-empty">Not enough history yet to plot a trend.</div>;
  }
  const width = 480;
  const padding = 32;
  const min = 0;
  const max = 100;
  const stepX = (width - padding * 2) / (valid.length - 1);
  const toY = (score) => padding + (1 - (score - min) / (max - min)) * (height - padding * 2);
  const points = valid.map((p, i) => ({ x: padding + i * stepX, y: toY(p.score), ...p }));
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  // Points land just after the line finishes drawing (~900ms), staggered a
  // little further apart than the usual 60ms card-stagger step since these
  // are many small elements in one chart rather than a few big cards --
  // capped so a long history doesn't push the last point in absurdly late.
  const pointDelay = (i) => 700 + Math.min(i * 40, 400);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="nmpa-linechart" role="img" aria-label={label || 'Trend chart'}>
      <title>{label || 'Trend chart'}</title>
      <path d={pathD} pathLength={1} className="nmpa-linechart__path" fill="none" />
      {points.map((p, i) => (
        <g key={i}>
          <circle
            cx={p.x}
            cy={p.y}
            r={4}
            className="nmpa-linechart__point"
            style={{ '--nmpa-anim-delay': `${pointDelay(i)}ms` }}
          />
          <text x={p.x} y={height - 8} className="nmpa-linechart__xlabel" textAnchor="middle">{p.date?.slice(5) || ''}</text>
        </g>
      ))}
    </svg>
  );
}
