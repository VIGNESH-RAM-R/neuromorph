// Same pattern as StudyItemRegistry elsewhere in NEUROMORPH: a thin
// sessionStorage-backed log, guarded so it no-ops (rather than throwing) in
// a Node test environment where sessionStorage doesn't exist.
//
// Purpose: every question Morphy couldn't confidently answer gets logged
// here, session-side. It's not sent anywhere automatically -- the intent is
// that a teammate can review `retrieveAll()` during development (e.g. via
// the browser console) and turn recurring gaps into new FAQ entries. This
// is what makes the "I've noted it down" message in AiFallbackService true
// rather than a throwaway line.
const STORAGE_KEY = 'neuromorph:morphyUnansweredLog:v1';

function hasSessionStorage() {
  return typeof sessionStorage !== 'undefined' && sessionStorage !== null;
}

export const UnansweredQuestionLog = {
  log(question, meta = {}) {
    if (!hasSessionStorage() || !question) return;
    const existing = this.retrieveAll();
    existing.push({ question, meta, loggedAt: new Date().toISOString() });
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  },

  retrieveAll() {
    if (!hasSessionStorage()) return [];
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  },

  clear() {
    if (!hasSessionStorage()) return;
    sessionStorage.removeItem(STORAGE_KEY);
  },
};
