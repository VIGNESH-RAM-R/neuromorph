// FigureSVG
// -----------------------------------------------------------------------------
// Presentation-only: renders a reference figure's vector components (polygon,
// line, circle) as SVG. Never touches drawing/scoring state.
export default function FigureSVG({ figure, size = 220, stroke = 'var(--gsc-ink, #2b2b3a)', strokeWidth = 2.5 }) {
  if (!figure) return null;
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      role="img"
      aria-label={`Reference figure: ${figure.name}`}
    >
      {figure.components.map((comp, i) => {
        if (comp.type === 'polygon') {
          return (
            <polygon
              key={i}
              points={comp.vertices.map((v) => v.join(',')).join(' ')}
              fill="none"
              stroke={stroke}
              strokeWidth={strokeWidth}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          );
        }
        if (comp.type === 'line') {
          const [a, b] = comp.points;
          return (
            <line
              key={i}
              x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]}
              stroke={stroke}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
          );
        }
        if (comp.type === 'circle') {
          return (
            <circle
              key={i}
              cx={comp.cx} cy={comp.cy} r={comp.r}
              fill="none"
              stroke={stroke}
              strokeWidth={strokeWidth}
            />
          );
        }
        return null;
      })}
    </svg>
  );
}
