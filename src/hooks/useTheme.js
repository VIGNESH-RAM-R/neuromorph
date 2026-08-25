import { useState, useEffect, useCallback } from 'react';
import { ThemeEngine, THEME_STORAGE_KEY, DEFAULT_THEME } from '../engines/ThemeEngine.js';

function readStoredTheme() {
  try {
    return window.localStorage.getItem(THEME_STORAGE_KEY);
  } catch {
    // Private browsing / storage disabled -- fall through to system pref.
    return null;
  }
}

function systemPrefersDark() {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-color-scheme: dark)').matches
    : false;
}

// Applies the active theme as a `data-theme` attribute on <html>, which
// every CSS custom property in theme.css branches on -- so switching theme
// is one attribute write, not a re-render of styled components. Persists
// the explicit choice so a reload doesn't flash back to the system default.
export function useTheme() {
  const [theme, setThemeState] = useState(() =>
    ThemeEngine.resolveInitialTheme({ stored: readStoredTheme(), systemPrefersDark: systemPrefersDark() })
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Nothing else to do -- theme just won't survive a reload.
    }
  }, [theme]);

  const setTheme = useCallback((next) => {
    setThemeState(ThemeEngine.isValidTheme(next) ? next : DEFAULT_THEME);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => ThemeEngine.toggle(prev));
  }, []);

  return { theme, setTheme, toggleTheme };
}
