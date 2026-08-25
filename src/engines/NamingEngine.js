import { accuracyScore, speedScore, blendedScore } from './assessmentScoringUtils.js';
import { average, round1 } from './mathUtils.js';

const NAMING_TIMING = { targetMs: 2000, maxMs: 8000 };

// Shared by both picture-naming tasks (temporal Naming and occipital
// Visual Object Naming) -- same scoring shape, different item sets and
// icon rendering (see ObjectIcon.jsx's `variant` prop), which is what
// actually differentiates what each task tests.
export const NamingEngine = {
  // responses: [{ item: {id, correctLabel}, selectedLabel, reactionTimeMs }]
  score(responses = []) {
    if (responses.length === 0) return { score: 0, accuracy: 0, avgReactionMs: undefined };

    const correctCount = responses.filter((r) => r.selectedLabel === r.item.correctLabel).length;
    const accuracy = accuracyScore(correctCount, responses.length);

    const times = responses.filter((r) => typeof r.reactionTimeMs === 'number').map((r) => r.reactionTimeMs);
    const avgReactionMs = average(times);
    const speed = avgReactionMs === undefined ? undefined : speedScore(avgReactionMs, NAMING_TIMING);
    const score = blendedScore(accuracy, speed);

    return { score, accuracy, avgReactionMs: avgReactionMs === undefined ? undefined : round1(avgReactionMs) };
  },
};
