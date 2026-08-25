// Language selector config for Doctor_Dashboard -- ports the exact pattern
// already established in app_page's src/config/i18nConfig.js (see that
// file's header comment) into this separate app/repo. Same 7 languages,
// same shape, so the two apps stay consistent for anyone working across
// both. Doctor_Dashboard has no voice-input feature today, so (unlike
// app_page) there's no SPEECH_RECOGNITION_LOCALE map here -- add one only
// if/when this app grows a mic-based feature that needs it.
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
export const LANGUAGE_STORAGE_KEY = 'neuromorph:doctorDashboard:language';

export function languageInfo(code) {
  return LANGUAGES.find((l) => l.code === code) || LANGUAGES.find((l) => l.code === DEFAULT_LANGUAGE);
}
