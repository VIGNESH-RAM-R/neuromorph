/**
 * Shared cross-module bridge for §A.4 — Visual Memory / Face Recognition
 * publish the study items they showed the patient; Delayed Recognition
 * reads them back to build its old/new recognition trial from real,
 * session-specific stimuli. sessionStorage is scoped per browser tab under
 * one origin, which is exactly right now that all three run in the same
 * SPA tab (this is the "shared package" that
 * games/delayed_recognition_test.../src/engines/StudyItemRegistry.js's own
 * comment anticipated needing once more than a couple of modules used it —
 * that file's per-module copy is now dead code, superseded by this one).
 *
 * This is the fast, same-tab path. The durable, cross-session copy lives in
 * the backend `StudyItemRegistry` table, written when a scored Visual
 * Memory/Face Recognition attempt is logged (server/src/routes/assessment.js)
 * — Delayed Recognition's adapter reads sessionStorage first and only falls
 * back to `GET /study-items` on a reload mid-session.
 */
const STORAGE_KEY = 'neuromorph:studyItemRegistry:v1';

function readAll() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeAll(entries) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // sessionStorage unavailable (privacy mode, etc.) — registry stays
    // empty for this session; the backend copy still gets written normally.
  }
}

export const StudyItemRegistry = {
  register({ sourceModule, itemType, items, presentedAt = new Date().toISOString() }) {
    const entries = readAll();
    entries.push({ sourceModule, itemType, items, presentedAt });
    writeAll(entries);
  },
  retrieveAll() {
    return readAll();
  },
  retrieveByType(itemType) {
    return readAll().filter((e) => e.itemType === itemType);
  },
  clear() {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* noop */
    }
  },
};
