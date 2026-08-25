// Simple, dependency-free inline SVG illustrations for the naming tasks --
// same "no icon library, no external assets" convention as the rest of the
// platform. `variant="silhouette"` renders a flat, detail-free solid shape
// (used by the occipital Visual Object Naming task, which is meant to test
// basic visual recognition under reduced visual detail); `variant="detailed"`
// renders a simple but multi-part line illustration (used by the temporal
// Naming/confrontation-naming task).
const SHAPES = {
  house: { viewBox: '0 0 100 100', detailed: <><polygon points="50,15 90,45 80,45 80,85 20,85 20,45 10,45" fill="none" stroke="currentColor" strokeWidth="4" /><rect x="42" y="60" width="16" height="25" fill="currentColor" /></>, silhouette: <polygon points="50,15 90,50 75,50 75,90 25,90 25,50 10,50" fill="currentColor" /> },
  umbrella: { viewBox: '0 0 100 100', detailed: <><path d="M10 45 A40 40 0 0 1 90 45" fill="none" stroke="currentColor" strokeWidth="4" /><line x1="50" y1="45" x2="50" y2="85" stroke="currentColor" strokeWidth="4" /><path d="M50 85 q0 10 10 8" fill="none" stroke="currentColor" strokeWidth="4" /></>, silhouette: <path d="M10 45 A40 40 0 0 1 90 45 L50 45 Z" fill="currentColor" /> },
  key: { viewBox: '0 0 100 100', detailed: <><circle cx="30" cy="35" r="15" fill="none" stroke="currentColor" strokeWidth="4" /><line x1="42" y1="47" x2="80" y2="85" stroke="currentColor" strokeWidth="4" /><line x1="65" y1="70" x2="75" y2="60" stroke="currentColor" strokeWidth="4" /></>, silhouette: <><circle cx="30" cy="35" r="15" fill="currentColor" /><rect x="35" y="42" width="50" height="8" transform="rotate(45 30 35)" fill="currentColor" /></> },
  clock: { viewBox: '0 0 100 100', detailed: <><circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="4" /><line x1="50" y1="50" x2="50" y2="28" stroke="currentColor" strokeWidth="4" /><line x1="50" y1="50" x2="66" y2="55" stroke="currentColor" strokeWidth="4" /></>, silhouette: <circle cx="50" cy="50" r="35" fill="currentColor" /> },
  star: { viewBox: '0 0 100 100', detailed: <polygon points="50,10 61,38 92,38 67,57 76,88 50,70 24,88 33,57 8,38 39,38" fill="none" stroke="currentColor" strokeWidth="4" />, silhouette: <polygon points="50,10 61,38 92,38 67,57 76,88 50,70 24,88 33,57 8,38 39,38" fill="currentColor" /> },
  cup: { viewBox: '0 0 100 100', detailed: <><path d="M25 30 h40 v40 a20 20 0 0 1 -40 0 Z" fill="none" stroke="currentColor" strokeWidth="4" /><path d="M65 40 q20 0 20 15 t-20 15" fill="none" stroke="currentColor" strokeWidth="4" /></>, silhouette: <path d="M25 30 h40 v40 a20 20 0 0 1 -40 0 Z" fill="currentColor" /> },
  tree: { viewBox: '0 0 100 100', detailed: <><circle cx="50" cy="35" r="25" fill="none" stroke="currentColor" strokeWidth="4" /><rect x="45" y="55" width="10" height="30" fill="currentColor" /></>, silhouette: <><circle cx="50" cy="35" r="25" fill="currentColor" /><rect x="45" y="55" width="10" height="30" fill="currentColor" /></> },
  bicycle: { viewBox: '0 0 100 100', detailed: <><circle cx="25" cy="70" r="18" fill="none" stroke="currentColor" strokeWidth="4" /><circle cx="75" cy="70" r="18" fill="none" stroke="currentColor" strokeWidth="4" /><path d="M25 70 L45 35 L75 70 M45 35 L60 35 M25 70 L60 35" fill="none" stroke="currentColor" strokeWidth="4" /></>, silhouette: <><circle cx="25" cy="70" r="18" fill="currentColor" /><circle cx="75" cy="70" r="18" fill="currentColor" /></> },
};

export default function ObjectIcon({ id, variant = 'detailed', size = 96 }) {
  const shape = SHAPES[id];
  if (!shape) return null;
  return (
    <svg width={size} height={size} viewBox={shape.viewBox} className="nmpa-object-icon" role="img" aria-label={id}>
      {variant === 'silhouette' ? shape.silhouette : shape.detailed}
    </svg>
  );
}
