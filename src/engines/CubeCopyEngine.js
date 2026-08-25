import { accuracyScore } from './assessmentScoringUtils.js';

// Untimed, accuracy-only -- unlike the naming tasks, real Cube Copy testing
// isn't scored on speed, only on whether the correct construction was
// identified/reproduced.
export const CubeCopyEngine = {
  // responses: [{ correctVariant, selectedVariant }]
  score(responses = []) {
    if (responses.length === 0) return { score: 0, accuracy: 0, correctCount: 0 };
    const correctCount = responses.filter((r) => r.selectedVariant === r.correctVariant).length;
    const accuracy = accuracyScore(correctCount, responses.length);
    return { score: accuracy, accuracy, correctCount };
  },
};
