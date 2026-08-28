// 2026-08-27 ADDITION -- Detection Assessment full-screen mode (VR: "full
// page ah cover panra maari test venum - like full screen mode preferrable
// ah irukanum - like skillrack test"). A thin, defensive wrapper around the
// browser's Fullscreen API, not a component -- kept here (not inline in
// AssessmentSection.jsx) so the vendor-prefix handling and "never throw,
// never crash the assessment over this" posture lives in one tested place.
// Named *Engine for the same reason ThemeEngine/LanguageEngine are --
// browser-facing but small enough to keep as one importable module rather
// than a hook, since it holds no React state of its own.
//
// WHY DEFENSIVE: requestFullscreen() is a real DOM API that can reject or
// throw for reasons entirely outside this app's control -- the tab isn't
// the active one, the browser/OS denies it, an iframe embed lacks the
// `allowfullscreen` attribute, or (Safari/older browsers) only the
// `webkit`-prefixed method exists at all. None of that should ever be
// allowed to break the actual cognitive assessment underneath it -- full-
// screen is a nice-to-have presentation mode, not a requirement to
// function, so every failure here is swallowed, never surfaced to the
// patient mid-task.
function fullscreenElement() {
  if (typeof document === 'undefined') return null;
  return document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement || null;
}

export const FullscreenEngine = {
  isSupported() {
    if (typeof document === 'undefined') return false;
    const el = document.documentElement;
    return Boolean(el && (el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen));
  },

  // Must be called synchronously from within a real user-gesture handler
  // (a button onClick) -- browsers reject a request that happens later,
  // e.g. inside a useEffect that only *reacts* to the click. See
  // AssessmentIntro.jsx's "Begin" button, the one place this is called
  // from.
  request(element) {
    if (typeof document === 'undefined') return;
    const el = element || document.documentElement;
    const request = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
    if (!request) return;
    try {
      const result = request.call(el);
      if (result && typeof result.catch === 'function') result.catch(() => {});
    } catch (e) {
      // Swallow -- see header comment.
    }
  },

  // Safe to call any time, including when not currently full-screen
  // (no-op) -- AssessmentSection.jsx calls this unconditionally on
  // completion/restart rather than tracking full-screen state itself.
  exit() {
    if (typeof document === 'undefined' || !fullscreenElement()) return;
    const exit = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;
    if (!exit) return;
    try {
      const result = exit.call(document);
      if (result && typeof result.catch === 'function') result.catch(() => {});
    } catch (e) {
      // Swallow -- see header comment.
    }
  },
};
