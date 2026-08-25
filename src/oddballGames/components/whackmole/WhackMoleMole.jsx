/**
 * Friendly, simple flat-vector mole — consistent with the rest of
 * Neuromorph's locally-rendered icon style (no external image assets, spec
 * sections 70, 103). `state` only changes appearance (CSS), never timing.
 */
export default function WhackMoleMole({ state = 'up' }) {
  return (
    <svg viewBox="0 0 100 90" className={`wm-mole wm-mole--${state}`} aria-hidden="true">
      <ellipse cx="50" cy="86" rx="34" ry="8" fill="rgba(59, 39, 25, 0.18)" />
      <path
        d="M50 14c-20 0-33 16-33 36 0 16 9 28 22 32 3 1 6-1 6-4 0-2-1-3-3-4-9-4-15-13-15-24 0-16 10-27 23-27s23 11 23 27c0 11-6 20-15 24-2 1-3 2-3 4 0 3 3 5 6 4 13-4 22-16 22-32 0-20-13-36-33-36z"
        fill="#8B6A4E"
      />
      <path
        d="M50 20c-16 0-27 13-27 30 0 13 7 23 18 26 1 0 2-1 2-2 0-6-5-8-5-8-8-4-12-10-12-16 0-13 10-22 24-22s24 9 24 22c0 6-4 12-12 16 0 0-5 2-5 8 0 1 1 2 2 2 11-3 18-13 18-26 0-17-11-30-27-30z"
        fill="#C9A67C"
      />
      <ellipse cx="35" cy="38" rx="4.5" ry="6" fill="#3D2A1E" />
      <ellipse cx="65" cy="38" rx="4.5" ry="6" fill="#3D2A1E" />
      <ellipse cx="36" cy="36.5" rx="1.4" ry="1.8" fill="#fff" />
      <ellipse cx="66" cy="36.5" rx="1.4" ry="1.8" fill="#fff" />
      <ellipse cx="50" cy="48" rx="7" ry="5" fill="#F2A6A6" stroke="#B96B6B" strokeWidth="1.2" />
      <path d="M50 51v6" stroke="#8B6A4E" strokeWidth="2" strokeLinecap="round" />
      <path d="M38 60c4 4 20 4 24 0" fill="none" stroke="#6B4E38" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M22 44c-4-2-8-2-10 0M22 50c-4 0-8 1-9 3" stroke="#6B4E38" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <path d="M78 44c4-2 8-2 10 0M78 50c4 0 8 1 9 3" stroke="#6B4E38" strokeWidth="1.6" strokeLinecap="round" fill="none" />
    </svg>
  );
}
