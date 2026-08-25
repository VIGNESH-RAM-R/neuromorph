// Language selector config -- the 7 languages requested for the login/
// signup screens (2026-08-17). Only these screens are actually translated
// right now (see src/i18n/authStrings.js); this is the deliberate first
// slice of the bigger "translate the whole app" ask, not the whole thing --
// see that file's header comment for the honest scope note. Adding a
// language elsewhere later is: add its code here, add its dictionary in
// authStrings.js (and whichever other *Strings.js files exist by then).
export const LANGUAGES = [
  { code: 'en', label: 'English', nativeLabel: 'English', dir: 'ltr' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी', dir: 'ltr' },
  { code: 'ta', label: 'Tamil', nativeLabel: 'தமிழ்', dir: 'ltr' },
  { code: 'fr', label: 'French', nativeLabel: 'Français', dir: 'ltr' },
  { code: 'te', label: 'Telugu', nativeLabel: 'తెలుగు', dir: 'ltr' },
  { code: 'ur', label: 'Urdu', nativeLabel: 'اردو', dir: 'rtl' },
  { code: 'es', label: 'Spanish', nativeLabel: 'Español', dir: 'ltr' },
];

export const LANGUAGE_CODES = LANGUAGES.map((l) => l.code);
export const DEFAULT_LANGUAGE = 'en';
export const LANGUAGE_STORAGE_KEY = 'nmpa-language';

export function languageInfo(code) {
  return LANGUAGES.find((l) => l.code === code) || LANGUAGES.find((l) => l.code === DEFAULT_LANGUAGE);
}

// BCP-47 locale tags for the Web Speech API's SpeechRecognition (used by
// useVoiceInput.js for the chat's mic button) -- a different, more specific
// format than the plain `code` above (the browser needs e.g. "hi-IN", not
// just "hi"). One reasonable region per language; not meant to cover every
// dialect.
export const SPEECH_RECOGNITION_LOCALE = {
  en: 'en-US',
  hi: 'hi-IN',
  ta: 'ta-IN',
  fr: 'fr-FR',
  te: 'te-IN',
  ur: 'ur-PK',
  es: 'es-ES',
};
