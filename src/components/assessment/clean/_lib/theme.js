/**
 * Token bridge for embedded games (features/04 §A.3), without touching any
 * game's own CSS. Each of the integrated games already themes itself with
 * CSS custom properties (--paper, --ink, --primary, etc., defined light-only
 * in its own :root block) — since custom properties inherit down the DOM,
 * setting them directly on the container element the game mounts into
 * overrides every descendant's existing `var(--x)` reference. No injected
 * stylesheet, no changes to the game's CSS.
 *
 * Gate the call on `config.theme` (itself sourced from the host's existing
 * `data-theme`/`prefers-color-scheme`, same as the rest of the app — see
 * src/styles/globals.css) — never a second theming mechanism for this one
 * folder (§A.3 point 3).
 */
export function applyThemeVars(container, theme, darkVars) {
  if (theme !== 'dark' || !darkVars) return;
  for (const [key, value] of Object.entries(darkVars)) {
    container.style.setProperty(key, value);
  }
}

/**
 * Light/dark hex pairs for games that draw to <canvas> (§A.3 point 4) —
 * CSS custom properties aren't reachable from draw calls, so canvas code
 * reads real values from here, keyed by `config.theme`, instead.
 */
export const CANVAS_THEME = {
  light: { ink: '#0F2540', paper: '#F5F8FC', line: '#DDE5F0', primary: '#2E5FDC', success: '#12805A', error: '#C7433F' },
  dark: { ink: '#E7ECF5', paper: '#0B1424', line: '#233047', primary: '#5B8DEF', success: '#34C793', error: '#F0665F' },
};

export function canvasColors(theme) {
  return CANVAS_THEME[theme] ?? CANVAS_THEME.light;
}
