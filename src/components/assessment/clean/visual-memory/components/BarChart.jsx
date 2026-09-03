// BarChart
// -----------------------------------------------------------------------------
// Shared, dependency-free inline SVG bar chart used by RecognitionAccuracyChart,
// ResponseTimeChart, and DifficultyPerformanceChart. No charting library --
// keeps the production bundle free of unnecessary third-party dependencies.
export default function BarChart({ labels, values, barColor, maxValue = 100 }) {
  const width = 560, height = 160, pad = 24, gap = 8;
  const n = values.length || 1;
  const barWidth = (width - pad * 2 - gap * (n - 1)) / n;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" role="img" aria-label="Bar chart">
      <line x1={pad} y1={height - pad} x2={width - pad} y2={height - pad} stroke="var(--vmt-border-strong)" />
      {values.map((v, i) => {
        const clamped = Math.max(0, Math.min(maxValue, v));
        const barHeight = ((height - pad * 2) * clamped) / maxValue;
        const x = pad + i * (barWidth + gap);
        const y = height - pad - barHeight;
        const color = typeof barColor === 'function' ? barColor(i) : barColor;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barWidth} height={barHeight} rx={3} fill={color} />
            <text x={x + barWidth / 2} y={height - pad + 16} fontSize="12" textAnchor="middle" fill="var(--vmt-text-secondary)">
              {labels[i]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
