import { DEFAULT_LANGUAGE } from '../config/i18nConfig.js';

// Shared factory behind every domain string file (authStrings.js and the
// newer src/i18n/strings/*.js files) -- one "STRINGS[lang][key], fall back
// to English, never throw, never render blank" contract everywhere, so a
// `t()` call behaves identically no matter which screen it's called from.
// This is the same lookup shape authStrings.js already used by hand; this
// factory just removes the need to hand-write it once per domain file.
export function createStringLookup(STRINGS) {
  return function get(language, key) {
    const dict = STRINGS[language] || STRINGS[DEFAULT_LANGUAGE];
    return dict?.[key] ?? STRINGS[DEFAULT_LANGUAGE]?.[key] ?? key;
  };
}

// For SECTIONS-style arrays that need a translated label/description per
// item rather than a flat key -- looks up `${idPrefix}${item.id}${suffix}`
// so config arrays (sectionsConfig.js, gamesConfig.js, etc.) don't need to
// be duplicated per language; only their translatable text does.
export function createListLookup(STRINGS) {
  const get = createStringLookup(STRINGS);
  return function getFor(language, id, field) {
    return get(language, `${id}.${field}`);
  };
}

// Tiny {placeholder} interpolator for strings needing runtime values (counts,
// names, days). Originally lived in home.js (the first file that needed it);
// promoted here once a second file (games.js) needed the same thing too --
// home.js re-exports this for backwards compatibility with existing call
// sites (`import { format } from '../i18n/strings/home.js'`).
export function format(template, values = {}) {
  return template.replace(/\{(\w+)\}/g, (match, key) => (key in values ? String(values[key]) : match));
}
