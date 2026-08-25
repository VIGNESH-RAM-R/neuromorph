// Pure logic for choosing/toggling the active theme. No DOM or
// localStorage access lives here on purpose -- useTheme.js owns those side
// effects -- so theme resolution stays Node-testable like every other
// engine in this app.
export const THEMES = ['light', 'dark'];
export const DEFAULT_THEME = 'light';
export const THEME_STORAGE_KEY = 'nmpa-theme';

export const ThemeEngine = {
  isValidTheme(theme) {
    return THEMES.includes(theme);
  },

  // Precedence: an explicit prior choice (stored) always wins over the
  // system's OS-level preference, which only matters the very first time
  // someone opens the app on a given browser.
  resolveInitialTheme({ stored, systemPrefersDark } = {}) {
    if (this.isValidTheme(stored)) return stored;
    return systemPrefersDark ? 'dark' : DEFAULT_THEME;
  },

  toggle(theme) {
    return theme === 'dark' ? 'light' : 'dark';
  },
};
