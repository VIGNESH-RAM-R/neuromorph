import { speedScore, blendedScore, clampScore } from './assessmentScoringUtils.js';
import { TRAIL_MAKING_TIMING, TRAIL_NODE_COUNT } from '../config/trailMakingConfig.js';

// Scores a completed Trail Making run from the raw click log. Two signals:
// total time to connect all 13 nodes in order (speed), and how many
// mis-clicks happened along the way (accuracy, expressed as a 0-100 score
// that loses points per error rather than an all-or-nothing pass/fail).
const POINTS_LOST_PER_ERROR = 8;

export const TrailMakingEngine = {
  // totalTimeMs: time from first click to the 13th correct click.
  // errorCount: number of clicks on the wrong (non-next) node.
  score(totalTimeMs, errorCount = 0, timing = TRAIL_MAKING_TIMING) {
    const accuracy = clampScore(100 - errorCount * POINTS_LOST_PER_ERROR);
    const speed = typeof totalTimeMs === 'number' ? speedScore(totalTimeMs, timing) : undefined;
    const score = blendedScore(accuracy, speed, { accuracyWeight: 0.5, speedWeight: 0.5 });
    return { score, accuracy, errorCount, totalTimeMs, nodeCount: TRAIL_NODE_COUNT };
  },
};
