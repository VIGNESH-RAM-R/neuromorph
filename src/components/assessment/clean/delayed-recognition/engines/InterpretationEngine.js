// InterpretationEngine
// -----------------------------------------------------------------------------
// Single responsibility: map cognitiveScore to a task-performance band.
// Same platform-wide rule as every other NeuroMorph module: task-performance
// vocabulary only (EXCELLENT / NORMAL / MILDLY_REDUCED / REDUCED), never
// disease-severity or diagnostic language. This is the only file allowed to
// hold that vocabulary.
import { SCORING_CONFIG } from '../config/scoringConfig.js';

export const InterpretationEngine = {
  interpret(cognitiveScore, thresholds = SCORING_CONFIG.interpretationThresholds) {
    if (cognitiveScore >= thresholds.excellent) {
      return { severity: 'EXCELLENT', interpretation: 'Delayed recognition performance is excellent relative to this assessment.' };
    }
    if (cognitiveScore >= thresholds.normal) {
      return { severity: 'NORMAL', interpretation: 'Delayed recognition performance is within the expected range.' };
    }
    if (cognitiveScore >= thresholds.mildlyReduced) {
      return { severity: 'MILDLY_REDUCED', interpretation: 'Delayed recognition shows a mild reduction in retention or retrieval over the delay interval.' };
    }
    return { severity: 'REDUCED', interpretation: 'Delayed recognition shows a reduction across multiple measures after the delay interval.' };
  }
};
