import { linearRegression, round1 } from './mathUtils.js';
import { DRIFT_CONFIG } from '../config/trendIntelligenceConfig.js';

const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

// DriftEngine looks at a score's FULL history (not just the two most recent
// sessions, which is all TrendAnalysisEngine sees) and fits a straight line
// through it. That catches a slow, real decline that never moves enough in
// any single step to trip a two-point delta check, while the slope's own
// standard error keeps a single noisy session from being over-read as a
// "trend" -- the two failure modes a naive "compare first to last" check
// (see RiskAlertEngine's cumulative check) can't tell apart on its own.
export const DriftEngine = {
  // series: [{ date: 'YYYY-MM-DD', score: number }], any order.
  analyze(series, config = DRIFT_CONFIG) {
    const points = (series || [])
      .filter((p) => typeof p.score === 'number' && p.date)
      .map((p) => ({ date: p.date, score: p.score, t: new Date(p.date).getTime() }))
      .sort((a, b) => a.t - b.t);

    if (points.length < config.minSessionsForDrift) {
      return { evaluable: false, trend: 'insufficient-data', weeklyRate: undefined, significant: false, totalChange: undefined, n: points.length };
    }

    const t0 = points[0].t;
    const regressionPoints = points.map((p) => ({ x: (p.t - t0) / MS_PER_WEEK, y: p.score }));
    const { slope, slopeStdError, n } = linearRegression(regressionPoints);

    if (slope === undefined) {
      return { evaluable: false, trend: 'insufficient-data', weeklyRate: undefined, significant: false, totalChange: undefined, n };
    }

    const weeklyRate = round1(slope);
    const totalWeeks = regressionPoints[regressionPoints.length - 1].x;
    const totalChange = round1(slope * totalWeeks);

    // slopeStdError is only defined for n > 2 (needs residual degrees of
    // freedom); with exactly minSessionsForDrift=3 points it's defined, so
    // this branch is reachable in practice, but the guard keeps the engine
    // from throwing if that config is ever lowered.
    // A slopeStdError of exactly 0 (a perfectly linear series, no residual
    // noise at all) is the MOST significant case possible, not an unknown --
    // guard on "is this a number" rather than truthiness, since 0 is falsy.
    const ratio = typeof slopeStdError === 'number'
      ? (slopeStdError === 0 ? Infinity : Math.abs(slope) / slopeStdError)
      : undefined;
    const statisticallySignificant = ratio !== undefined && ratio >= config.significanceRatio;
    const clinicallyMeaningful = Math.abs(totalChange) >= config.minTotalChangePoints;
    const significant = statisticallySignificant && clinicallyMeaningful;

    let trend = 'stable';
    if (significant) trend = slope < 0 ? 'declining' : 'improving';

    return { evaluable: true, trend, weeklyRate, totalChange, significant, significanceRatio: ratio !== undefined ? round1(ratio) : undefined, n };
  },

  // sessions: array sorted oldest -> newest. scoreSelector(session) => number|undefined
  analyzeSessions(sessions, scoreSelector, config = DRIFT_CONFIG) {
    const series = (sessions || [])
      .map((s) => ({ date: s.date, score: scoreSelector(s) }))
      .filter((p) => typeof p.score === 'number');
    return this.analyze(series, config);
  },

  // Convenience for running drift on every domain key in one pass.
  analyzeForKeys(sessions, keys, rawFieldName, config = DRIFT_CONFIG) {
    const out = {};
    for (const key of keys) {
      out[key] = this.analyzeSessions(sessions, (s) => s?.[rawFieldName]?.[key], config);
    }
    return out;
  },
};
