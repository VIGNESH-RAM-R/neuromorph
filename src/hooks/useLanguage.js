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

// Mirrors useTheme.js's shape exactly (resolve -> persist on change).
// Language is app-wide state (lifted to App.jsx), not per-screen, so
// switching languages on the login screen still holds after navigating to
// signup, and (once more of the app is translated) everywhere else too.
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
