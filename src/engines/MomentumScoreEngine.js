import { DailyTaskEngine } from './DailyTaskEngine.js';
import { average, round1 } from './mathUtils.js';
import { MOMENTUM_CONFIG } from '../config/momentumConfig.js';

// Momentum Score = a blend of today's Daily Set completion and today's
// performance on whatever was actually completed. If nothing
// performance-bearing has been done yet (e.g. only the self-report
// questions so far), there's nothing honest to average in for the
// performance half -- the score falls back to completion alone rather than
// inventing a performance number, and callers can tell this happened
// because `performanceAvg` comes back undefined.
export const MomentumScoreEngine = {
  scoreForDay(day, config = MOMENTUM_CONFIG) {
    const completion = day?.completion || {};
    const performanceScores = day?.performanceScores || {};
    const completionPct = DailyTaskEngine.completionFraction(completion) * 100;
    const performanceAvg = average(Object.values(performanceScores));

    if (performanceAvg === undefined) {
      return { score: round1(completionPct), completionPct: round1(completionPct), performanceAvg: undefined };
    }
    const score = completionPct * config.completionWeight + performanceAvg * config.performanceWeight;
    return { score: round1(score), completionPct: round1(completionPct), performanceAvg: round1(performanceAvg) };
  },

  historyWithScores(dailyHistory = [], config = MOMENTUM_CONFIG) {
    return [...dailyHistory]
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map((day) => ({ date: day.date, ...this.scoreForDay(day, config) }));
  },
};
