import { DEFAULT_LANGUAGE } from '../config/i18nConfig.js';

// Shared factory behind every domain string file in src/i18n/strings/ --
// ported verbatim from app_page's src/i18n/createStringLookup.js so both
// apps' i18n code reads identically to anyone working across the two
// repos. One "STRINGS[lang][key], fall back to English, never throw, never
// render blank" contract everywhere.
export function createStringLookup(STRINGS) {
  return function get(language, key) {
    const dict = STRINGS[language] || STRINGS[DEFAULT_LANGUAGE];
    return dict?.[key] ?? STRINGS[DEFAULT_LANGUAGE]?.[key] ?? key;
  };
}

// For SECTIONS-style arrays that need a translated label/description per
// item rather than a flat key -- looks up `${idPrefix}${item.id}${suffix}`
// so config arrays don't need to be duplicated per language; only their
// translatable text does. Not used yet in this app (no config-array
// checklist item here today), kept for parity with app_page's factory so
// the two files stay drop-in interchangeable.
export function createListLookup(STRINGS) {
  const get = createStringLookup(STRINGS);
  return function getFor(language, id, field) {
    return get(language, `${id}.${field}`);
  };
}

// Tiny {placeholder} interpolator for strings needing runtime values
// (counts, dates). Ported from app_page's createStringLookup.js (promoted
// there from home.js once a second file needed it).
export function format(template, values = {}) {
  return template.replace(/\{(\w+)\}/g, (match, key) => (key in values ? String(values[key]) : match));
}
