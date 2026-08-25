import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'neuromorph:doctorDashboard:theme';

// Small, single-purpose hook: reads/writes the light|dark preference and
// applies it as a data-attribute the CSS variables key off. Persisted via
// localStorage since this is a real delivered app running in the doctor's
// own browser, not a Claude-hosted artifact.
export function useTheme() {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    return window.localStorage.getItem(STORAGE_KEY) || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {
      // ignore storage errors (private browsing, etc.)
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'));
  }, []);

  return { theme, toggleTheme };
}
