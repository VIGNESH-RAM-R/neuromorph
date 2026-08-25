import { DailyTaskEngine } from './DailyTaskEngine.js';
import { STREAK_CONFIG } from '../config/momentumConfig.js';

// Streak = consecutive days, counting back from the most recent COMPLETED
// day in history, where the full Daily Set was finished. Today is
// deliberately excluded from this calculation -- it's still in progress,
// so it can't yet be judged "kept" or "broken"; the Home screen shows
// today's live status separately from the streak number.
//
// 2026-08-19: the designated weekly rest day (config.restDayOfWeek, see
// momentumConfig.js) is SKIPPED entirely here -- it neither breaks nor
// extends the streak, regardless of whether any Daily Set task was done
// that day. This is the standard "streak freeze" mechanic other habit apps
// use for an intentional day off, and it's what makes the rest day actually
// restful: a patient who does nothing on their rest day keeps the streak
// they earned the other 6 days.
function isRestDay(dateStr, config) {
  if (config.restDayOfWeek === undefined || config.restDayOfWeek === null || !dateStr) return false;
  return new Date(`${dateStr}T00:00:00`).getDay() === config.restDayOfWeek;
}

export const StreakEngine = {
  currentStreak(dailyHistory = [], config = STREAK_CONFIG) {
    const sorted = [...dailyHistory].sort((a, b) => new Date(a.date) - new Date(b.date));
    let streak = 0;
    for (let i = sorted.length - 1; i >= 0; i--) {
      if (isRestDay(sorted[i].date, config)) continue;
      const isFull = config.requireFullCompletionForStreak
        ? DailyTaskEngine.isFullyComplete(sorted[i].completion)
        : DailyTaskEngine.completionFraction(sorted[i].completion) > 0;
      if (isFull) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  },

  longestStreak(dailyHistory = [], config = STREAK_CONFIG) {
    const sorted = [...dailyHistory].sort((a, b) => new Date(a.date) - new Date(b.date));
    let longest = 0;
    let running = 0;
    for (const day of sorted) {
      if (isRestDay(day.date, config)) continue;
      const isFull = config.requireFullCompletionForStreak
        ? DailyTaskEngine.isFullyComplete(day.completion)
        : DailyTaskEngine.completionFraction(day.completion) > 0;
      running = isFull ? running + 1 : 0;
      longest = Math.max(longest, running);
    }
    return longest;
  },
};
