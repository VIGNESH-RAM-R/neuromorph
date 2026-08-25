import { TREND_CONFIG } from '../config/operationalConfig.js';
import { round1 } from './mathUtils.js';

// Classifies session-over-session change for any numeric score series.
// "stable" is a real band, not a fallback -- a doctor should be able to
// trust that "declining" means the delta genuinely exceeded the configured
// threshold, not just "went down by any amount".
export const TrendAnalysisEngine = {
  classify(delta, config = TREND_CONFIG) {
    if (typeof delta !== 'number' || Number.isNaN(delta)) return 'insufficient-data';
    if (delta > config.stableBandPoints) return 'improving';
    if (delta < -config.stableBandPoints) return 'declining';
    return 'stable';
  },

  // series: [{ date, score }] sorted oldest -> newest, already built by caller.
  trendFromSeries(series, config = TREND_CONFIG) {
    const points = (series || []).filter((p) => typeof p.score === 'number');
    if (points.length < 2) {
      return { trend: 'insufficient-data', delta: undefined, series: points };
    }
    const latest = points[points.length - 1].score;
    const previous = points[points.length - 2].score;
    const delta = round1(latest - previous);
    return { trend: this.classify(delta, config), delta, series: points };
  },

  // sessions: array sorted oldest -> newest. scoreSelector(session) => number|undefined
  buildSeries(sessions, scoreSelector) {
    return (sessions || [])
      .map((s) => ({ date: s.date, score: scoreSelector(s) }))
      .filter((point) => typeof point.score === 'number');
  },

  overallTrend(sessions, scoreSelector, config = TREND_CONFIG) {
    const series = this.buildSeries(sessions, scoreSelector);
    return this.trendFromSeries(series, config);
  },

  // Convenience for building trend for every key in one pass, given the raw
  // score accessor path (e.g. 'domainScoresRaw').
  trendForKeys(sessions, keys, rawFieldName, config = TREND_CONFIG) {
    const out = {};
    for (const key of keys) {
      out[key] = this.overallTrend(sessions, (s) => s?.[rawFieldName]?.[key], config);
    }
    return out;
  },
};
