// MemoryRetrievalEngine
// -----------------------------------------------------------------------------
// Single responsibility: retrieve study items presented earlier in the
// session by other NeuroMorph modules, via StudyItemRegistry. Falls back to
// a mocked session log only when the registry is genuinely empty (no other
// module has registered anything yet) -- purely so this module stays
// demoable while other modules are incrementally retrofitted to register.
// Now that all three occipital/temporal modules run in one shell app, this
// reads the SHARED bridge (src/features/games/lib/studyItemRegistry.js)
// instead of a per-module copy — see that file's doc comment.
import { StudyItemRegistry } from '../../../lib/studyItemRegistry.js';
import { MOCK_SESSION_LOG } from '../data/mockSessionLog.js';

export const MemoryRetrievalEngine = {
  retrieveAll({ allowMockFallback = true } = {}) {
    const registered = StudyItemRegistry.retrieveAll();
    if (registered.length > 0) return registered;
    return allowMockFallback ? MOCK_SESSION_LOG : [];
  }
};
