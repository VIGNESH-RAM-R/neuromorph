/**
 * Renders a face stimulus from either a photo (patient-uploaded or the AI
 * pool) or a synthetic descriptor — pure function of `face`'s own fields,
 * extracted from games/faceRecognition/FACERE_3.jsx so Delayed Recognition
 * Memory can faithfully re-display the SAME face it registered via §A.4's
 * shared study-item registry, not a generic placeholder token. A distinct,
 * unrelated abstract symbol standing in for "the face you saw earlier"
 * wouldn't be testing face-recognition memory at all — this is the one
 * piece of Face Recognition's own rendering that had to be shared, not
 * just wrapped, for the cross-game retest to be clinically meaningful.
 */
export default function FaceAvatar({ face }) {
  if (face.kind === 'photo') {
    return (
      <img
        className="face-photo-img"
        src={face.dataURL}
        alt=""
        draggable={false}
        loading="lazy"
        onContextMenu={(e) => e.preventDefault()}
      />
    );
  }

  const { skinTone, hairColor, hairStyle, eyeColor, faceShape, eyebrowStyle, noseWidth, mouthWidth, ageGroup } = face;

  const faceRx = faceShape === 'round' ? 46 : faceShape === 'square' ? 40 : faceShape === 'heart' ? 42 : 44;
  const faceRy = faceShape === 'round' ? 50 : faceShape === 'square' ? 52 : 54;
  const jawWidthFactor = faceShape === 'heart' ? 0.62 : faceShape === 'square' ? 0.92 : 0.8;

  const browY = 78;
  const eyebrowPath = (cx) => {
    if (eyebrowStyle === 'arched') return `M ${cx - 13} ${browY + 2} Q ${cx} ${browY - 8} ${cx + 13} ${browY + 2}`;
    if (eyebrowStyle === 'thick') return `M ${cx - 13} ${browY} L ${cx + 13} ${browY}`;
    if (eyebrowStyle === 'thin') return `M ${cx - 11} ${browY + 1} L ${cx + 11} ${browY + 1}`;
    return `M ${cx - 12} ${browY} Q ${cx} ${browY - 3} ${cx + 12} ${browY}`;
  };
  const eyebrowStroke = eyebrowStyle === 'thick' ? 4.2 : eyebrowStyle === 'thin' ? 1.6 : 2.6;

  return (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={`bg-${face.id}`} cx="50%" cy="35%" r="75%">
          <stop offset="0%" stopColor="#FBFDFF" />
          <stop offset="100%" stopColor="#E7EFF6" />
        </radialGradient>
        <clipPath id={`clip-${face.id}`}>
          <ellipse cx="100" cy="105" rx={faceRx} ry={faceRy} />
        </clipPath>
      </defs>

      <rect x="0" y="0" width="200" height="200" fill={`url(#bg-${face.id})`} />
      <rect x="76" y="150" width="48" height="40" rx="10" fill={skinTone} />
      <path d="M 40 200 Q 100 155 160 200 L 160 200 L 40 200 Z" fill="#DCE4EC" />

      <ellipse cx={100 - faceRx + 2} cy="108" rx="7" ry="11" fill={skinTone} />
      <ellipse cx={100 + faceRx - 2} cy="108" rx="7" ry="11" fill={skinTone} />
      <ellipse cx="100" cy="105" rx={faceRx} ry={faceRy} fill={skinTone} />

      <path
        d={`M ${100 - faceRx * jawWidthFactor} 130 Q 100 ${105 + faceRy} ${100 + faceRx * jawWidthFactor} 130 L ${100 + faceRx * jawWidthFactor} ${105 + faceRy} L ${100 - faceRx * jawWidthFactor} ${105 + faceRy} Z`}
        fill={skinTone}
        clipPath={`url(#clip-${face.id})`}
      />

      {ageGroup === 'senior' && (
        <g stroke="rgba(0,0,0,0.14)" strokeWidth="1" clipPath={`url(#clip-${face.id})`}>
          <path d="M 68 118 Q 100 124 132 118" fill="none" />
          <path d="M 62 92 Q 66 88 70 92" fill="none" />
          <path d="M 130 92 Q 134 88 138 92" fill="none" />
        </g>
      )}

      {hairStyle !== 'bald' && (
        <g>
          {hairStyle === 'short' && <path d="M 58 90 Q 60 48 100 46 Q 140 48 142 90 Q 130 66 100 64 Q 70 66 58 90 Z" fill={hairColor} />}
          {hairStyle === 'medium' && (
            <path d="M 54 100 Q 54 44 100 42 Q 146 44 146 100 Q 148 130 138 118 Q 140 70 100 62 Q 60 70 62 118 Q 52 130 54 100 Z" fill={hairColor} />
          )}
          {hairStyle === 'side-part' && (
            <path d="M 56 92 Q 58 46 104 44 Q 144 48 142 92 Q 134 62 100 60 Q 76 60 60 78 Q 55 84 56 92 Z" fill={hairColor} />
          )}
          {hairStyle === 'curly' && (
            <g fill={hairColor}>
              <circle cx="66" cy="70" r="14" />
              <circle cx="86" cy="56" r="15" />
              <circle cx="112" cy="55" r="15" />
              <circle cx="134" cy="70" r="14" />
              <circle cx="100" cy="50" r="14" />
              <circle cx="76" cy="88" r="10" />
              <circle cx="124" cy="88" r="10" />
            </g>
          )}
          {hairStyle === 'bun' && (
            <g fill={hairColor}>
              <path d="M 58 96 Q 58 46 100 44 Q 142 46 142 96 Q 130 68 100 66 Q 70 68 58 96 Z" />
              <circle cx="100" cy="38" r="13" />
            </g>
          )}
        </g>
      )}

      <ellipse cx="80" cy="102" rx="8.5" ry="6" fill="white" />
      <ellipse cx="120" cy="102" rx="8.5" ry="6" fill="white" />
      <circle cx="80" cy="102" r="4.2" fill={eyeColor} />
      <circle cx="120" cy="102" r="4.2" fill={eyeColor} />
      <circle cx="80" cy="102" r="1.5" fill="#1A1A1A" />
      <circle cx="120" cy="102" r="1.5" fill="#1A1A1A" />

      <path d={eyebrowPath(80)} fill="none" stroke="#2A1B12" strokeWidth={eyebrowStroke} strokeLinecap="round" />
      <path d={eyebrowPath(120)} fill="none" stroke="#2A1B12" strokeWidth={eyebrowStroke} strokeLinecap="round" />

      <path d={`M 100 100 L ${100 - noseWidth / 2} 122 Q 100 128 ${100 + noseWidth / 2} 122 Z`} fill="rgba(0,0,0,0.10)" />
      <line x1={100 - mouthWidth / 2} y1="140" x2={100 + mouthWidth / 2} y2="140" stroke="#8A4B44" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
