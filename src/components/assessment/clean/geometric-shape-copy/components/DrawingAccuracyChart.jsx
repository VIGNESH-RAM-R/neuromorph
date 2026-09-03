// DrawingAccuracyChart
// -----------------------------------------------------------------------------
// Lightweight inline SVG bar chart -- no charting library dependency, per the
// "no unnecessary third-party libraries" constraint. Shows per-figure overall
// drawing accuracy across the 12 scored figures.
export default function DrawingAccuracyChart({ perFigureResults }) {
  const width = 560, height = 180, pad = 24;
  const barGap = 6;
  const n = perFigureResults.length || 1;
  const barWidth = (width - pad * 2 - barGap * (n - 1)) / n;

  const colorFor = (difficulty) =>
    difficulty === 'easy' ? '#3ecf8e' : difficulty === 'medium' ? '#f5a524' : '#f5484c';

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" role="img" aria-label="Per-figure drawing accuracy">
      <line x1={pad} y1={height - pad} x2={width - pad} y2={height - pad} stroke="var(--gsc-grid, #d8d8e2)" />
      {perFigureResults.map((r, i) => {
        const score = r.drawingMetrics ? r.drawingMetrics.overallDrawingAccuracy : 0;
        const barHeight = ((height - pad * 2) * score) / 100;
        const x = pad + i * (barWidth + barGap);
        const y = height - pad - barHeight;
        return (
          <g key={r.figureId + i}>
            <rect x={x} y={y} width={barWidth} height={barHeight} rx={3} fill={colorFor(r.difficulty)} />
            <text x={x + barWidth / 2} y={height - pad + 14} fontSize="9" textAnchor="middle" fill="var(--gsc-muted, #8a8aa3)">
              {i + 1}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
