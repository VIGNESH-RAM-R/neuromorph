// Four simple isometric-cube line drawings: "standard" is the correct
// target shape; the other three are distinct, clearly-wrong distractors
// (a missing edge, a mirrored top face, and squashed proportions) rather
// than subtle near-duplicates -- keeps the task about visuospatial
// matching, not about spotting a 2px difference.
const CUBES = {
  standard: <g fill="none" stroke="currentColor" strokeWidth="3"><polygon points="50,10 85,28 85,68 50,86 15,68 15,28" /><polygon points="50,10 85,28 50,46 15,28" /><line x1="50" y1="46" x2="50" y2="86" /></g>,
  noTopEdge: <g fill="none" stroke="currentColor" strokeWidth="3"><polygon points="50,10 85,28 85,68 50,86 15,68 15,28" /><line x1="50" y1="10" x2="85" y2="28" /><line x1="15" y1="28" x2="50" y2="46" /><line x1="50" y1="46" x2="50" y2="86" /></g>,
  mirrored: <g fill="none" stroke="currentColor" strokeWidth="3"><polygon points="50,10 85,28 85,68 50,86 15,68 15,28" /><polygon points="50,10 15,28 50,46 85,28" /><line x1="50" y1="46" x2="50" y2="86" /></g>,
  squashed: <g fill="none" stroke="currentColor" strokeWidth="3"><polygon points="50,25 80,35 80,65 50,80 20,65 20,35" /><polygon points="50,25 80,35 50,45 20,35" /><line x1="50" y1="45" x2="50" y2="80" /></g>,
};

export default function CubeIcon({ variant = 'standard', size = 90 }) {
  const shape = CUBES[variant] || CUBES.standard;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className="nmpa-object-icon" role="img" aria-label="cube">
      {shape}
    </svg>
  );
}
