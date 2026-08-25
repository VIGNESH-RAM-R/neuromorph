import { accuracyScore } from './assessmentScoringUtils.js';

// Untimed, accuracy-only -- same shape as CubeCopyEngine. Real embedded
// figures testing is about perceptual accuracy (was the shape found at
// all), not reaction speed.
export const EmbeddedFigureEngine = {
  // responses: [{ correctShapeId, selectedShapeId }]
  score(responses = []) {
    if (responses.length === 0) return { score: 0, accuracy: 0, correctCount: 0 };
    const correctCount = responses.filter((r) => r.selectedShapeId === r.correctShapeId).length;
    const accuracy = accuracyScore(correctCount, responses.length);
    return { score: accuracy, accuracy, correctCount };
  },
};
