// Simple, dependency-free inline SVG shapes for the Embedded Figure task --
// same "no icon library" convention as CubeIcon.jsx and ObjectIcon.jsx.
const SIMPLE_SHAPES = {
  triangle: <polygon points="50,15 85,80 15,80" fill="none" stroke="currentColor" strokeWidth="4" />,
  square: <rect x="20" y="20" width="60" height="60" fill="none" stroke="currentColor" strokeWidth="4" />,
  star: <polygon points="50,10 61,38 92,38 67,57 76,88 50,70 24,88 33,57 8,38 39,38" fill="none" stroke="currentColor" strokeWidth="4" />,
  cross: <g fill="currentColor"><rect x="40" y="10" width="20" height="80" /><rect x="10" y="40" width="80" height="20" /></g>,
};

export function SimpleShapeIcon({ id, size = 90 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className="nmpa-object-icon" role="img" aria-label={id}>
      {SIMPLE_SHAPES[id]}
    </svg>
  );
}

// Three fixed "clutter" compositions. Each genuinely contains the outline
// of its round's correctShapeId (see embeddedFigureConfig.js), plus 3-4
// distractor lines/shapes at reduced opacity that cross through it -- the
// distractors never trace a full alternate candidate shape exactly, so
// there's always exactly one right answer among the 4 choices offered.
const CLUTTER = {
  // Embeds the triangle from SIMPLE_SHAPES.triangle.
  clutterA: (
    <g>
      <line x1="10" y1="20" x2="90" y2="90" stroke="currentColor" strokeWidth="2" opacity="0.35" />
      <line x1="90" y1="15" x2="15" y2="65" stroke="currentColor" strokeWidth="2" opacity="0.35" />
      <circle cx="65" cy="30" r="18" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.35" />
      <line x1="10" y1="55" x2="90" y2="45" stroke="currentColor" strokeWidth="2" opacity="0.35" />
      <polygon points="50,15 85,80 15,80" fill="none" stroke="currentColor" strokeWidth="4" />
    </g>
  ),
  // Embeds the square from SIMPLE_SHAPES.square.
  clutterB: (
    <g>
      <line x1="0" y1="10" x2="100" y2="90" stroke="currentColor" strokeWidth="2" opacity="0.35" />
      <line x1="0" y1="90" x2="100" y2="10" stroke="currentColor" strokeWidth="2" opacity="0.35" />
      <line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" strokeWidth="2" opacity="0.35" />
      <circle cx="20" cy="80" r="14" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.35" />
      <rect x="20" y="20" width="60" height="60" fill="none" stroke="currentColor" strokeWidth="4" />
    </g>
  ),
  // Embeds the star from SIMPLE_SHAPES.star.
  clutterC: (
    <g>
      <line x1="5" y1="50" x2="95" y2="50" stroke="currentColor" strokeWidth="2" opacity="0.35" />
      <line x1="50" y1="5" x2="50" y2="95" stroke="currentColor" strokeWidth="2" opacity="0.35" />
      <line x1="15" y1="15" x2="85" y2="85" stroke="currentColor" strokeWidth="2" opacity="0.35" />
      <line x1="85" y1="15" x2="15" y2="85" stroke="currentColor" strokeWidth="2" opacity="0.35" />
      <polygon points="50,10 61,38 92,38 67,57 76,88 50,70 24,88 33,57 8,38 39,38" fill="none" stroke="currentColor" strokeWidth="4" />
    </g>
  ),
};

export default function EmbeddedFigureIcon({ variant, size = 140 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className="nmpa-object-icon" role="img" aria-label="embedded figure">
      {CLUTTER[variant]}
    </svg>
  );
}
