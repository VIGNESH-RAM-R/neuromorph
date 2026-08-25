import { bandFromScore, BAND_INTERPRETATION_TEMPLATES, DEFAULT_BAND_THRESHOLDS, NON_DIAGNOSTIC_DISCLAIMER } from '../config/scoringBands.js';

// The single place that turns a completed AssessmentSessionModel session
// into the weekly "Cognitive Score" a patient sees and a doctor reviews.
// Reuses the exact same banding thresholds and vocabulary as the Doctor
// Dashboard (scoringBands.js is mirrored from there) so a score computed
// here and a band computed over there always mean the same thing.
export const CognitiveScoreEngine = {
  compute(session) {
    const score = session?.overallRawScore;
    const band = bandFromScore(score, DEFAULT_BAND_THRESHOLDS);
    return {
      score,
      band,
      interpretation: BAND_INTERPRETATION_TEMPLATES[band],
      disclaimer: NON_DIAGNOSTIC_DISCLAIMER,
    };
  },
};
