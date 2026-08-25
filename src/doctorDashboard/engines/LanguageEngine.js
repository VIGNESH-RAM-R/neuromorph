import { LANGUAGE_CODES, DEFAULT_LANGUAGE } from '../config/i18nConfig.js';

// Pure logic only (no localStorage/DOM) -- same split as useTheme.js keeps
// for the theme preference, and the same shape as app_page's own
// LanguageEngine.js (ported, not reinvented -- this app's dashboard has no
// AI chat feature today, so there's no promptInstruction() here, unlike
// app_page's version which feeds Morphy's language instruction).
export const LanguageEngine = {
  isValidLanguage(code) {
    return LANGUAGE_CODES.includes(code);
  },

  // Same precedence rule as ThemeEngine-equivalent resolution: an explicit
  // prior choice (persisted in localStorage) always wins; otherwise fall
  // back to the app default.
  resolveInitialLanguage({ stored } = {}) {
    if (this.isValidLanguage(stored)) return stored;
    return DEFAULT_LANGUAGE;
  },
};
