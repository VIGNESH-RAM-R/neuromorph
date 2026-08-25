/**
 * Flat, locally-rendered vector icons for the Image Pairs controlled
 * stimulus library (spec sections 17-18). No photographic or external
 * images are used — every stimulus is the same simple, flat-fill style so
 * recognizability depends on the object itself, not on rendering quality,
 * and nothing ever depends on network access. Shapes are common household
 * / everyday / nature objects chosen to be familiar and culturally
 * neutral, with no text or region-specific symbols.
 */
const STROKE = 'rgba(15, 23, 42, 0.22)';

function Svg({ children }) {
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">
      {children}
    </svg>
  );
}

const ICONS = {
  cup: (
    <Svg>
      <path
        d="M26 34h40l-3 34a10 10 0 0 1-10 9H39a10 10 0 0 1-10-9z"
        fill="#0D9488"
        stroke={STROKE}
        strokeWidth="2.5"
      />
      <path d="M66 40h6a10 10 0 0 1 0 20h-8" fill="none" stroke="#0D9488" strokeWidth="6" strokeLinecap="round" />
      <line x1="24" y1="34" x2="68" y2="34" stroke={STROKE} strokeWidth="2.5" />
    </Svg>
  ),
  key: (
    <Svg>
      <circle cx="34" cy="40" r="16" fill="none" stroke="#CA8A04" strokeWidth="8" />
      <rect x="44" y="46" width="40" height="9" rx="2" fill="#CA8A04" transform="rotate(35 64 50)" />
      <rect x="62" y="60" width="9" height="14" fill="#CA8A04" transform="rotate(35 66 66)" />
      <rect x="72" y="70" width="9" height="10" fill="#CA8A04" transform="rotate(35 76 74)" />
    </Svg>
  ),
  clock: (
    <Svg>
      <circle cx="50" cy="52" r="34" fill="#F8FAFC" stroke="#1E3A5F" strokeWidth="4" />
      <line x1="50" y1="52" x2="50" y2="30" stroke="#1E3A5F" strokeWidth="4" strokeLinecap="round" />
      <line x1="50" y1="52" x2="65" y2="58" stroke="#1E3A5F" strokeWidth="4" strokeLinecap="round" />
      <circle cx="50" cy="52" r="3.5" fill="#1E3A5F" />
      <rect x="42" y="10" width="16" height="7" rx="3" fill="#1E3A5F" />
    </Svg>
  ),
  book: (
    <Svg>
      <path d="M50 24c-9-6-24-6-32-2v52c8-4 23-4 32 2z" fill="#4338CA" stroke={STROKE} strokeWidth="2.5" />
      <path d="M50 24c9-6 24-6 32-2v52c-8-4-23-4-32 2z" fill="#6366F1" stroke={STROKE} strokeWidth="2.5" />
      <line x1="50" y1="24" x2="50" y2="76" stroke="rgba(255,255,255,0.55)" strokeWidth="2" />
    </Svg>
  ),
  umbrella: (
    <Svg>
      <path
        d="M14 46a36 36 0 0 1 72 0c-4-6-10-6-14 0s-10 6-14 0-10-6-14 0-10 6-14 0-10-6-16 0z"
        fill="#2563EB"
        stroke={STROKE}
        strokeWidth="2.5"
      />
      <line x1="50" y1="46" x2="50" y2="82" stroke="#1E3A5F" strokeWidth="4" strokeLinecap="round" />
      <path d="M50 82c0 6-5 8-9 6" fill="none" stroke="#1E3A5F" strokeWidth="4" strokeLinecap="round" />
      <line x1="50" y1="18" x2="50" y2="26" stroke="#1E3A5F" strokeWidth="4" strokeLinecap="round" />
    </Svg>
  ),
  tree: (
    <Svg>
      <rect x="45" y="60" width="10" height="24" rx="2" fill="#92643A" />
      <circle cx="50" cy="38" r="26" fill="#16A34A" stroke={STROKE} strokeWidth="2.5" />
      <circle cx="32" cy="50" r="16" fill="#16A34A" stroke={STROKE} strokeWidth="2.5" />
      <circle cx="68" cy="50" r="16" fill="#16A34A" stroke={STROKE} strokeWidth="2.5" />
    </Svg>
  ),
  sun: (
    <Svg>
      <circle cx="50" cy="50" r="20" fill="#EAB308" stroke={STROKE} strokeWidth="2.5" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
        <line
          key={angle}
          x1="50"
          y1="24"
          x2="50"
          y2="14"
          stroke="#EAB308"
          strokeWidth="5"
          strokeLinecap="round"
          transform={`rotate(${angle} 50 50)`}
        />
      ))}
    </Svg>
  ),
  bird: (
    <Svg>
      <ellipse cx="46" cy="54" rx="24" ry="18" fill="#0EA5E9" stroke={STROKE} strokeWidth="2.5" />
      <circle cx="70" cy="42" r="10" fill="#0EA5E9" stroke={STROKE} strokeWidth="2.5" />
      <path d="M78 40 L88 43 L78 47 Z" fill="#F97316" />
      <circle cx="73" cy="39" r="1.6" fill="#0F2440" />
      <path d="M30 52c10-10 22-8 26 2-10 4-20 2-26-2z" fill="#0369A1" />
      <path d="M30 76c8 4 18 4 26 0" fill="none" stroke="#0369A1" strokeWidth="3" strokeLinecap="round" />
    </Svg>
  ),
  apple: (
    <Svg>
      <path
        d="M50 38c9-10 26-8 26 10 0 20-16 34-26 34S24 68 24 48c0-18 17-20 26-10z"
        fill="#DC2626"
        stroke={STROKE}
        strokeWidth="2.5"
      />
      <path d="M50 38c-2-8 2-14 8-16" fill="none" stroke="#92643A" strokeWidth="4" strokeLinecap="round" />
      <path d="M52 24c6-4 12-2 14 3-6 3-11 1-14-3z" fill="#16A34A" />
    </Svg>
  ),
  bicycle: (
    <Svg>
      <circle cx="26" cy="66" r="16" fill="none" stroke="#334155" strokeWidth="4.5" />
      <circle cx="74" cy="66" r="16" fill="none" stroke="#334155" strokeWidth="4.5" />
      <path
        d="M26 66l16-32h14l18 32M42 34h-8M50 34l14 20"
        fill="none"
        stroke="#334155"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M26 66h48" fill="none" stroke="#334155" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M60 34h10" fill="none" stroke="#334155" strokeWidth="4.5" strokeLinecap="round" />
    </Svg>
  ),
  cloud: (
    <Svg>
      <g fill="#7DD3FC" stroke={STROKE} strokeWidth="2.5">
        <rect x="18" y="52" width="64" height="26" rx="13" />
        <circle cx="34" cy="52" r="17" />
        <circle cx="56" cy="44" r="21" />
        <circle cx="76" cy="54" r="13" />
      </g>
    </Svg>
  ),
};

export default function ImagePairsIcon({ iconId, className }) {
  return <span className={className}>{ICONS[iconId] || null}</span>;
}
