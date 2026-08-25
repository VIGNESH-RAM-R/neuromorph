import { useState, useEffect, useCallback } from 'react';
import { LanguageEngine } from '../engines/LanguageEngine.js';
import { LANGUAGE_STORAGE_KEY, DEFAULT_LANGUAGE } from '../config/i18nConfig.js';

function readStoredLanguage() {
  try {
    return window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  } catch {
    return null;
  }
}

// Mirrors useTheme.js's shape exactly (resolve once from localStorage on
// mount, persist on every change). Language is app-wide state (lifted to
// App.jsx), not per-screen -- the login screen, the access-pending screen,
// and the dashboard shell all read the same value, and a returning doctor
// who already picked a language sees it correctly from the very first
// screen (including the brief "Loading your session..." state), since this
// resolves synchronously from localStorage before first render, same
// precedent as app_page's RoleGateScreen decision (see PROGRESS.md,
// 2026-08-20 04:48 entry).
export function useLanguage() {
  const [language, setLanguageState] = useState(() =>
    LanguageEngine.resolveInitialLanguage({ stored: readStoredLanguage() })
  );

  useEffect(() => {
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch {
      // Nothing else to do -- choice just won't survive a reload.
    }
  }, [language]);

  const setLanguage = useCallback((next) => {
    setLanguageState(LanguageEngine.isValidLanguage(next) ? next : DEFAULT_LANGUAGE);
  }, []);

  return { language, setLanguage };
}
