// Soft, organic decorative shapes behind the brand panel -- the calm,
// rounded-blob backdrop treatment common to modern health-product
// branding, built as a plain inline SVG (no illustration library).
// Colors come entirely from currentColor + CSS opacity so it re-tints
// automatically between the light and dark themes.
export default function AuthBlobBackdrop() {
  return (
    <svg
      className="nmpa-auth-blobs"
      viewBox="0 0 600 800"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <circle cx="80" cy="120" r="220" fill="currentColor" opacity="0.14" />
      <circle cx="520" cy="640" r="260" fill="currentColor" opacity="0.12" />
      <circle cx="470" cy="90" r="130" fill="currentColor" opacity="0.10" />
      <path
        d="M40 420 C 40 300, 180 260, 260 340 C 340 420, 480 380, 520 480 C 560 580, 460 700, 320 700 C 180 700, 40 560, 40 420 Z"
        fill="currentColor"
        opacity="0.08"
      />
    </svg>
  );
}
