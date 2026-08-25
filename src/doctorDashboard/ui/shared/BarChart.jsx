// Dependency-free inline SVG horizontal bar chart for domain/lobe score
// comparisons (six domains or four lobes at a glance).
export default function BarChart({ items = [], colorFor, height = 28, label }) {
  const width = 480;
  const barHeight = height;
  const gap = 12;
  const labelWidth = 150;
  const chartWidth = width - labelWidth - 40;

  return (
    <svg
      viewBox={`0 0 ${width} ${(barHeight + gap) * items.length}`}
      className="nmdd-barchart"
      role="img"
      aria-label={label || 'Score comparison chart'}
    >
      <title>{label || 'Score comparison chart'}</title>
      {items.map((item, i) => {
        const y = i * (barHeight + gap);
        const pct = Math.max(0, Math.min(100, item.score || 0));
        const barW = (pct / 100) * chartWidth;
        const color = colorFor ? colorFor(item) : 'var(--nmdd-accent)';
        return (
          <g key={item.key || item.label}>
            <text x={0} y={y + barHeight / 2 + 4} className="nmdd-barchart__label">{item.label}</text>
            <rect x={labelWidth} y={y} width={chartWidth} height={barHeight} className="nmdd-barchart__track" rx={4} />
            <rect x={labelWidth} y={y} width={barW} height={barHeight} fill={color} rx={4} />
            <text x={labelWidth + chartWidth + 8} y={y + barHeight / 2 + 4} className="nmdd-barchart__value">
              {typeof item.score === 'number' ? item.score : '—'}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
