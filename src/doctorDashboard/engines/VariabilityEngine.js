import { coefficientOfVariation, round1 } from './mathUtils.js';
import { VARIABILITY_CONFIG } from '../config/trendIntelligenceConfig.js';

// VariabilityEngine is deliberately blind to the MEAN of the series -- it
// only asks "has this patient become more inconsistent session to session
// than they used to be?" That is a real, separate early-warning signal
// (intra-individual response variability rising is associated with
// increased dementia risk independent of raw accuracy/speed) that a
// pure trend/mean check can miss entirely: a patient can average the exact
// same score across every session while swinging much harder around that
// average than they did earlier on.
export const VariabilityEngine = {
  // series: [{ date, score }], any order.
  analyze(series, config = VARIABILITY_CONFIG) {
    const points = (series || [])
      .filter((p) => typeof p.score === 'number' && p.date)
      .map((p) => ({ date: p.date, score: p.score, t: new Date(p.date).getTime() }))
      .sort((a, b) => a.t - b.t);

    if (points.length < config.minSessionsForVariability) {
      return { evaluable: false, flagged: false, earlierCv: undefined, laterCv: undefined, riseRatio: undefined, n: points.length };
    }

    const mid = Math.floor(points.length / 2);
    const earlier = points.slice(0, mid).map((p) => p.score);
    const later = points.slice(mid).map((p) => p.score);

    const earlierCv = coefficientOfVariation(earlier);
    const laterCv = coefficientOfVariation(later);

    if (earlierCv === undefined || laterCv === undefined || earlierCv === 0) {
      return { evaluable: earlierCv !== undefined && laterCv !== undefined, flagged: false, earlierCv, laterCv, riseRatio: undefined, n: points.length };
    }

    const riseRatio = laterCv / earlierCv;
    const flagged = riseRatio >= config.riseRatioThreshold && laterCv >= config.minLaterCv;

    return {
      evaluable: true,
      flagged,
      earlierCv: round1(earlierCv * 100), // reported as a percent, easier for a doctor to read than a raw ratio
      laterCv: round1(laterCv * 100),
      riseRatio: round1(riseRatio),
      n: points.length,
    };
  },

  analyzeSessions(sessions, scoreSelector, config = VARIABILITY_CONFIG) {
    const series = (sessions || [])
      .map((s) => ({ date: s.date, score: scoreSelector(s) }))
      .filter((p) => typeof p.score === 'number');
    return this.analyze(series, config);
  },
};
