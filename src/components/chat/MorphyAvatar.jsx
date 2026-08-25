import { useState } from 'react';

// Morphy the octopus -- the official brand mascot artwork, served as a
// static image (public/morphy.png) rather than the hand-drawn SVG this
// component used to render.
//
// `pose` is kept in the API for forward compatibility: if pose-specific
// artwork is ever added (e.g. public/morphy-wave.png, public/morphy-thinking.png),
// drop the file in `public/` with that exact name and this component picks
// it up automatically -- no code change needed. Until then, every pose
// silently falls back to the single official image via onError, so nothing
// breaks in the meantime.
const DEFAULT_SRC = '/morphy.png';
const POSE_SRC = {
  wave: '/morphy-wave.png',
  thinking: '/morphy-thinking.png',
  idle: DEFAULT_SRC,
};

export default function MorphyAvatar({ pose = 'idle', size = 96, label = 'Morphy the octopus' }) {
  const [src, setSrc] = useState(POSE_SRC[pose] || DEFAULT_SRC);

  return (
    <img
      src={src}
      onError={() => setSrc(DEFAULT_SRC)}
      alt={label}
      width={size}
      height={size}
      className="morphy-avatar"
      style={{ objectFit: 'contain' }}
    />
  );
}
