/**
 * Small decorative circuit-line flourish used either side of a page title
 * on the dark Sequence Memory screens (How To Play, Practice Complete/
 * Assessment Intro) — purely ornamental, no text/data. Mirrored via CSS
 * for the right-hand side using the `flip` prop.
 */
export default function TitleDecoLine({ flip }) {
  return (
    <svg
      className={`seq-deco-line${flip ? ' seq-deco-line--flip' : ''}`}
      width="90"
      height="20"
      viewBox="0 0 90 20"
      aria-hidden="true"
    >
      <path d="M2 3 L28 3 L38 12 L88 12" stroke="#3B82F6" strokeWidth="1.4" fill="none" opacity="0.65" />
      <circle cx="88" cy="12" r="3" fill="#38BDF8" />
    </svg>
  );
}
