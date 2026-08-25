// 2026-08-25 ADDITION -- the real NEUROMORPH logo (VR: "this is our logo
// remember this, it should be used everywhere wherever needed"), replacing
// the plain text "NEUROMORPH" brand mark used across every screen (topbar,
// auth panels, loading screens, error boundary, etc.). One component so the
// logo file only ever needs to be swapped in ONE place
// (public/brand/neuromorph-logo.png) if it's ever updated again.
//
// `size`: 'sm' (topbar-scale, matches the old .nmpa-brand-mark) or 'lg'
// (loading/auth-screen scale, matches the old .nmpa-brand-mark--lg).
// `withWordmark`: the logo image already has the "NEUROMORPH" wordmark
// baked in, so this is false by default; a caller can still ask for an
// adjacent text label (e.g. for places that need it to stay a real,
// selectable/localizable text node for accessibility) via this prop.
export default function BrandLogo({ size = 'sm', withWordmark = false, className = '' }) {
  return (
    <span className={`nmpa-brand-logo nmpa-brand-logo--${size} ${className}`}>
      <img src="/brand/neuromorph-logo-transparent.png" alt="NEUROMORPH" className="nmpa-brand-logo__img" />
      {withWordmark && <span className="nmpa-sr-only">NEUROMORPH</span>}
    </span>
  );
}
