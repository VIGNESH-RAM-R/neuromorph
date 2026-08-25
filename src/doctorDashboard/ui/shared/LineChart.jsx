// Dependency-free inline SVG line chart (no chart library, consistent with
// every other NEUROMORPH module -- see prior modules' BarChart.jsx). Takes
// a simple [{date,score}] series and renders a readable trend line with
// point markers and a light band-reference grid.
export default function LineChart({ series = [], height = 160, band4 = true, label }) {
  const valid = series.filter((p) => typeof p.score === 'number');
  if (valid.length < 2) {
    return <div className="nmdd-chart-empty">Not enough sessions yet to plot a trend.</div>;
  }
  const width = 480;
  const padding = 32;
  const min = 0;
  const max = 100;
  const stepX = (width - padding * 2) / (valid.length - 1);
  const toY = (score) => padding + (1 - (score - min) / (max - min)) * (height - padding * 2);
  const points = valid.map((p, i) => ({ x: padding + i * stepX, y: toY(p.score), ...p }));
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');

  const bandLines = band4 ? [50, 70, 85] : [];

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="nmdd-linechart" role="img" aria-label={label || 'Trend chart'}>
      <title>{label || 'Trend chart'}</title>
      {bandLines.map((v) => (
        <line key={v} x1={padding} x2={width - padding} y1={toY(v)} y2={toY(v)} className="nmdd-linechart__gridline" />
      ))}
      <path d={pathD} className="nmdd-linechart__path" fill="none" />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={4} className="nmdd-linechart__point" />
          <text x={p.x} y={height - 8} className="nmdd-linechart__xlabel" textAnchor="middle">{p.date?.slice(5) || ''}</text>
        </g>
      ))}
    </svg>
  );
}
