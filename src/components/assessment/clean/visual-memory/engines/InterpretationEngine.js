// InterpretationEngine
// -----------------------------------------------------------------------------
// Single responsibility: map a cognitiveScore to a task-performance band.
//
// NEUROMORPH clinical rule: this module contributes to the unified Cognitive
// Score but does not diagnose dementia or any condition on its own, so the
// vocabulary here is task-performance language (EXCELLENT / NORMAL /
// MILDLY_REDUCED / REDUCED), never disease-severity language. This is the
// only file allowed to hold that vocabulary -- no other engine or component
// should invent its own severity wording.
import { SCORING_CONFIG } from '../config/scoringConfig.js';

export const InterpretationEngine = {
  interpret(cognitiveScore, thresholds = SCORING_CONFIG.interpretationThresholds) {
    if (cognitiveScore >= thresholds.excellent) {
      return { severity: 'EXCELLENT', interpretation: 'Visual memory task performance is excellent relative to this assessment.' };
    }
    if (cognitiveScore >= thresholds.normal) {
      return { severity: 'NORMAL', interpretation: 'Visual memory task performance is within the expected range.' };
    }
    if (cognitiveScore >= thresholds.mildlyReduced) {
      return { severity: 'MILDLY_REDUCED', interpretation: 'Visual memory task performance shows a mild reduction in recognition accuracy, retention, or processing speed.' };
    }
    return { severity: 'REDUCED', interpretation: 'Visual memory task performance shows a reduction across multiple measures on this task.' };
  }
};
