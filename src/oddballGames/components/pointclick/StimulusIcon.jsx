import { STIMULUS_COLORS } from '../../config/pointClickConfig';

function colorHex(colorId) {
  return STIMULUS_COLORS.find((c) => c.id === colorId)?.hex || '#334155';
}

function starPoints(cx, cy, outerR, innerR, points) {
  const result = [];
  const step = Math.PI / points;
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = i * step - Math.PI / 2;
    result.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
  }
  return result.join(' ');
}

/**
 * Plain, flat-fill vector shape renderer for Point & Click stimuli. Every
 * shape/color combination is rendered by the same component so objects
 * stay visually consistent (no photographic or gamified art), and a thin
 * dark outline keeps every color — including light ones — readable against
 * the light board background.
 */
export default function StimulusIcon({ shapeId, colorId, size = 44 }) {
  const fill = colorHex(colorId);
  const stroke = 'rgba(255, 255, 255, 0.4)';
  const common = { viewBox: '0 0 100 100', width: size, height: size, 'aria-hidden': true };

  switch (shapeId) {
    case 'circle':
      return (
        <svg {...common}>
          <circle cx="50" cy="50" r="41" fill={fill} stroke={stroke} strokeWidth="2" />
        </svg>
      );
    case 'square':
      return (
        <svg {...common}>
          <rect x="12" y="12" width="76" height="76" rx="12" fill={fill} stroke={stroke} strokeWidth="2" />
        </svg>
      );
    case 'triangle':
      return (
        <svg {...common}>
          <polygon points="50,9 92,88 8,88" fill={fill} stroke={stroke} strokeWidth="2" strokeLinejoin="round" />
        </svg>
      );
    case 'star':
      return (
        <svg {...common}>
          <polygon
            points={starPoints(50, 52, 42, 18, 5)}
            fill={fill}
            stroke={stroke}
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'diamond':
      return (
        <svg {...common}>
          <polygon points="50,6 94,50 50,94 6,50" fill={fill} stroke={stroke} strokeWidth="2" strokeLinejoin="round" />
        </svg>
      );
    case 'cloud':
      return (
        <svg {...common}>
          <g fill={fill} stroke={stroke} strokeWidth="2">
            <rect x="20" y="52" width="66" height="28" rx="14" />
            <circle cx="34" cy="52" r="18" />
            <circle cx="58" cy="44" r="22" />
            <circle cx="78" cy="55" r="14" />
          </g>
        </svg>
      );
    case 'leaf':
      return (
        <svg {...common}>
          <path
            d="M50 8 C86 20 90 62 50 92 C10 62 14 20 50 8 Z"
            fill={fill}
            stroke={stroke}
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path d="M50 22 L50 84" stroke="rgba(15,23,42,0.28)" strokeWidth="3" fill="none" strokeLinecap="round" />
        </svg>
      );
    case 'heart':
      return (
        <svg {...common}>
          <path
            d="M50 89 C14 65 4 39 22 23 C34 12 48 17 50 32 C52 17 66 12 78 23 C96 39 86 65 50 89 Z"
            fill={fill}
            stroke={stroke}
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="50" cy="50" r="41" fill={fill} stroke={stroke} strokeWidth="2" />
        </svg>
      );
  }
}
