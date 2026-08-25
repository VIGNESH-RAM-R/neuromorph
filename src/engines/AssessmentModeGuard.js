import { ASSESSMENT_MODE_SAFE_CATEGORIES } from '../config/assessmentModeConfig.js';

// Pure decision: given the current assessment phase and (if one was
// matched) an FAQ entry's category, should Morphy answer normally or defer
// per Mode 1 (Cognitive Assessment Mode)? Extracted out of useMorphyChat's
// routing so this rule is Node-testable on its own, the same way every
// other scoring/eligibility decision in this codebase is -- hooks stay
// orchestration-only, decisions live in pure functions.
export const AssessmentModeGuard = {
  shouldDefer(phase, category) {
    if (phase !== 'running') return false;
    return !ASSESSMENT_MODE_SAFE_CATEGORIES.includes(category);
  },
};
