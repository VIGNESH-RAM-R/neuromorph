// StudyItemRegistry
// -----------------------------------------------------------------------------
// Ported verbatim from the teammate's delayed_recognition_test project. Shared
// cross-task bridge (sessionStorage-backed): any task can register() the
// study items it showed a participant, and a LATER task (Delayed Recognition
// Memory) retrieves them to test true delayed recognition after other tasks
// fill the interval. Because this app runs every lobar task in one single
// page (not separate origins like the teammate's own separate Vite projects),
// this bridge works cleanly with no cross-origin limitation.
const STORAGE_KEY = 'neuromorph:studyItemRegistry:v1';

function readAll() {
  if (typeof sessionStorage === 'undefined') return [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) { return []; }
}
function writeAll(entries) {
  if (typeof sessionStorage === 'undefined') return;
  try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(entries)); } catch (e) { /* ignore quota errors */ }
}

export const StudyItemRegistry = {
  register({ sourceModule, itemType, items, presentedAt }) {
    const entries = readAll();
    entries.push({ sourceModule, itemType, items, presentedAt: presentedAt || new Date().toISOString() });
    writeAll(entries);
  },
  retrieveAll() {
    return readAll();
  },
  retrieveByType(itemType) {
    return readAll().filter((e) => e.itemType === itemType);
  },
  clear() {
    writeAll([]);
  },
};
