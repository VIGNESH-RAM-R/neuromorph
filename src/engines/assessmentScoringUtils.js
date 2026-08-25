import { round1 } from './mathUtils.js';

// Shared helpers every lobar task engine builds its 0-100 score from, so
// the same "what does a good score mean" logic isn't reinvented 12 times
// with subtly different rounding or clamping behavior.
export function clampScore(n) {
  if (typeof n !== 'number' || Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(100, round1(n)));
}

export function accuracyScore(correct, total) {
  if (!total || total <= 0) return 0;
  return clampScore((correct / total) * 100);
}

// Converts a reaction time into a 0-100 speed score: at or under `targetMs`
// is full credit, at or over `maxMs` is zero credit, linear in between.
// Never penalizes below zero or rewards above 100 for an unrealistically
// fast time.
export function speedScore(reactionTimeMs, { targetMs, maxMs }) {
  if (typeof reactionTimeMs !== 'number' || Number.isNaN(reactionTimeMs)) return 0;
  if (reactionTimeMs <= targetMs) return 100;
  if (reactionTimeMs >= maxMs) return 0;
  const fraction = 1 - (reactionTimeMs - targetMs) / (maxMs - targetMs);
  return clampScore(fraction * 100);
}

// Blends an accuracy score and a speed score by configured weights
// (defaulting to accuracy-weighted, since correctness matters more than
// raw speed for a screening tool -- never the other way around).
export function blendedScore(accuracyPct, speedPct, { accuracyWeight = 0.7, speedWeight = 0.3 } = {}) {
  if (typeof accuracyPct !== 'number') return 0;
  if (typeof speedPct !== 'number') return clampScore(accuracyPct);
  return clampScore(accuracyPct * accuracyWeight + speedPct * speedWeight);
}
