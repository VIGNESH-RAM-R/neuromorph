import { LOBES } from '../config/lobarConfig.js';
import { InterpretationEngine } from './InterpretationEngine.js';
import { average } from './mathUtils.js';

// Maps a session's raw per-task scores into the four lobe cards. Only tasks
// actually present in the session's lobarTaskScores are treated as
// "administered this session" and listed as contributing tasks -- so a
// lighter/demo protocol that skips a task doesn't silently claim it ran.
export const LobarMappingEngine = {
  mapLobes(session) {
    const raw = session?.lobarTaskScores || {};
    return LOBES.map((lobe) => {
      const taskIds = Object.keys(lobe.tasks);
      const administeredIds = taskIds.filter((id) => typeof raw[id] === 'number');
      const score = average(administeredIds.map((id) => raw[id]));
      const { band, interpretation } = InterpretationEngine.interpret(score);
      return {
        key: lobe.key,
        label: lobe.label,
        primaryFunctions: lobe.primaryFunctions,
        score,
        band,
        explanation: interpretation,
        contributingTasks: administeredIds.map((id) => lobe.tasks[id]),
      };
    });
  },
};
