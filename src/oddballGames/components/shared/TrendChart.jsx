/**
 * Lightweight, dependency-free SVG line chart for longitudinal metrics.
 * Shared across Neuromorph modules — used on both the light Results
 * screens and the dark History screens, so all theming is opt-in via the
 * `dark` prop (default false, matching every existing call site exactly).
 * Avoids pulling in a charting library for a single trend line and keeps
 * every axis explicitly labelled with its unit.
 */
export default function TrendChart({ points, unit, label, dark = false, lineColor: lineColorProp }) {
  if (!points || points.length < 2) {
    return (
      <div className={`oddball-chart-empty${dark ? ' oddball-chart-empty--dark' : ''}`}>
        <p>Complete at least one more assessment to see a performance trend.</p>
      </div>
    );
  }

  const width = 640;
  const height = 260;
  const padding = { top: 20, right: 24, bottom: 40, left: 56 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const values = points.map((p) => p.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const valueRange = maxValue - minValue || 1;
  const yPad = valueRange * 0.15;
  const yMin = Math.max(0, minValue - yPad);
  const yMax = maxValue + yPad;

  const xFor = (i) => padding.left + (i / (points.length - 1)) * innerWidth;
  const yFor = (v) => padding.top + innerHeight - ((v - yMin) / (yMax - yMin)) * innerHeight;

  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i).toFixed(1)} ${yFor(p.value).toFixed(1)}`)
    .join(' ');

  const yTicks = 4;
  const tickValues = Array.from({ length: yTicks + 1 }, (_, i) => yMin + ((yMax - yMin) * i) / yTicks);
  // Small-magnitude metrics (e.g. d′, typically 0–4) need decimal precision;
  // ms-scale / count-scale metrics read better rounded to whole numbers.
  const tickDecimals = yMax - yMin < 10 ? 2 : 0;
  const formatTick = (v) => (tickDecimals ? v.toFixed(tickDecimals) : Math.round(v));

  const axisTitle = unit ? `${label} (${unit})` : label;
  const ariaLabel = unit ? `${label} over time, in ${unit}` : `${label} over time`;

  const gridColor = dark ? 'rgba(125, 178, 255, 0.18)' : '#E5E9F0';
  // lineColor is optional and only ever passed by callers that explicitly
  // want a different accent (e.g. Oddball Results' violet trend line) —
  // every existing call site omits it and keeps the exact palette below.
  const lineColor = lineColorProp || (dark ? '#38BDF8' : '#2563EB');

  return (
    <div className={`oddball-chart${dark ? ' oddball-chart--dark' : ''}`}>
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" role="img" aria-label={ariaLabel}>
        {tickValues.map((tv, i) => (
          <g key={i}>
            <line
              x1={padding.left}
              x2={width - padding.right}
              y1={yFor(tv)}
              y2={yFor(tv)}
              stroke={gridColor}
              strokeWidth="1"
            />
            <text
              x={padding.left - 8}
              y={yFor(tv) + 4}
              textAnchor="end"
              className={`oddball-chart-axis-label${dark ? ' oddball-chart-axis-label--dark' : ''}`}
            >
              {formatTick(tv)}
            </text>
          </g>
        ))}

        <path d={pathD} fill="none" stroke={lineColor} strokeWidth="2.5" />

        {points.map((p, i) => (
          <g key={i}>
            <circle cx={xFor(i)} cy={yFor(p.value)} r="4" fill={lineColor} />
            <text
              x={xFor(i)}
              y={height - padding.bottom + 20}
              textAnchor="middle"
              className={`oddball-chart-axis-label${dark ? ' oddball-chart-axis-label--dark' : ''}`}
            >
              {p.dateLabel}
            </text>
          </g>
        ))}

        <text
          x={-(height / 2)}
          y={16}
          transform="rotate(-90)"
          textAnchor="middle"
          className={`oddball-chart-axis-title${dark ? ' oddball-chart-axis-title--dark' : ''}`}
        >
          {axisTitle}
        </text>
      </svg>
    </div>
  );
}
