// DrawingTimeChart
// -----------------------------------------------------------------------------
// Lightweight inline SVG bar chart of per-figure response time (ms) against
// each figure's own allotted time limit -- no charting library dependency.
export default function DrawingTimeChart({ perFigureResults }) {
  const width = 560, height = 180, pad = 24;
  const barGap = 6;
  const n = perFigureResults.length || 1;
  const barWidth = (width - pad * 2 - barGap * (n - 1)) / n;
  const maxLimitMs = Math.max(...perFigureResults.map((r) => r.timeLimitSec * 1000), 1000);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" role="img" aria-label="Per-figure response time versus time limit">
      <line x1={pad} y1={height - pad} x2={width - pad} y2={height - pad} stroke="var(--gsc-grid, #d8d8e2)" />
      {perFigureResults.map((r, i) => {
        const responseMs = Math.min(r.responseTimeMs || 0, maxLimitMs);
        const limitMs = r.timeLimitSec * 1000;
        const x = pad + i * (barWidth + barGap);
        const limitHeight = ((height - pad * 2) * limitMs) / maxLimitMs;
        const responseHeight = ((height - pad * 2) * responseMs) / maxLimitMs;
        return (
          <g key={r.figureId + i}>
            <rect x={x} y={height - pad - limitHeight} width={barWidth} height={limitHeight} rx={3} fill="var(--gsc-grid, #e7e7f0)" />
            <rect
              x={x} y={height - pad - responseHeight} width={barWidth} height={responseHeight} rx={3}
              fill={r.status === 'timed_out' ? '#f5484c' : '#4c6ef5'}
            />
            <text x={x + barWidth / 2} y={height - pad + 14} fontSize="9" textAnchor="middle" fill="var(--gsc-muted, #8a8aa3)">
              {i + 1}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
