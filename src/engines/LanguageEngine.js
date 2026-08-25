import { LANGUAGE_CODES, DEFAULT_LANGUAGE, languageInfo } from '../config/i18nConfig.js';

// Pure logic only (no localStorage/DOM) -- same split as ThemeEngine.js /
// useTheme.js, so language resolution stays Node-testable.
export const LanguageEngine = {
  isValidLanguage(code) {
    return LANGUAGE_CODES.includes(code);
  },

  // 2026-08-19 FIX: previously returned '' for English/unknown codes, which
  // meant Gemini only got a language instruction when the app-wide selector
  // was explicitly switched away from English -- so a user who typed in
  // Tamil, Telugu, or Tanglish (code-mixed) while the selector still said
  // "English" (the default) got no instruction telling Morphy to match
  // that. Real AI chatbots detect the language of what was actually typed,
  // not a separately-set display preference. This is now ALWAYS appended
  // (never ''), telling Gemini to detect and match the user's own message,
  // with the app-wide selection only as a fallback preference when the
  // message itself doesn't give a clear signal (e.g., very short replies
  // like "yes" or "ok"). The local FAQ text is still English-only
  // (translating it is the separate, deferred "translate the whole app"
  // task -- see i18nConfig.js's header) -- useMorphyChat.js/useDoctorChat.js
  // still skip that local shortcut whenever a non-English language is
  // selected app-wide, for that unrelated reason.
  promptInstruction(code) {
    const isValidNonDefault = code && code !== DEFAULT_LANGUAGE && this.isValidLanguage(code);
    const preference = isValidNonDefault
      ? `If the user's own message doesn't clearly signal a language (e.g. it's very short, or ambiguous), prefer ${languageInfo(code).label} (${languageInfo(code).nativeLabel}), since that's the app's currently selected display language.`
      : `If the user's own message doesn't clearly signal a language, default to English.`;
    return `\n\nLANGUAGE: Detect the language (or code-mixed style, e.g. "Tanglish" -- Tamil written in casual English-mixed script) of the user's most recent message, and reply naturally in that same language and style. Support English, Hindi, Tamil, French, Telugu, Urdu, and Spanish fluently, including their common code-mixed forms. ${preference} If the user explicitly asks you to switch languages mid-conversation, switch. Keep the same tone, structure, and safety rules regardless of which language you're replying in.`;
  },

  // Same precedence rule as ThemeEngine.resolveInitialTheme: an explicit
  // prior choice always wins; otherwise fall back to the app default
  // (there's no reliable "system language" signal worth trusting here the
  // way prefers-color-scheme is for theme).
  resolveInitialLanguage({ stored } = {}) {
    if (this.isValidLanguage(stored)) return stored;
    return DEFAULT_LANGUAGE;
  },
};
