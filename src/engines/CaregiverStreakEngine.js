import { CaregiverMicroCheckinEngine } from './CaregiverMicroCheckinEngine.js';

// 2026-08-24 REPOINTED: streaks are now a property of the daily MICRO
// check-in (CaregiverMicroCheckinEngine), not the weekly deep 15-question
// one -- the deep check-in no longer happens on a daily cadence at all
// (see CaregiverWeeklyUnlockEngine.js), so "consecutive days completed"
// stopped being a meaningful concept for it. The micro check-in is the
// thing that actually happens every day now, so it's the one with a real
// day-to-day streak to track. Same "consecutive days, counting back from
// the most recent, today excluded" logic as before, and as the patient's
// own StreakEngine.js -- no designated rest day here on purpose, same
// reasoning as before: a caregiver's daily pulse on the patient doesn't
// have an equivalent "day off" built in.
export const CaregiverStreakEngine = {
  currentStreak(microDailyHistory = []) {
    const sorted = [...microDailyHistory].sort((a, b) => new Date(a.date) - new Date(b.date));
    let streak = 0;
    for (let i = sorted.length - 1; i >= 0; i--) {
      if (CaregiverMicroCheckinEngine.isFullyComplete(sorted[i].completion)) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  },

  longestStreak(microDailyHistory = []) {
    const sorted = [...microDailyHistory].sort((a, b) => new Date(a.date) - new Date(b.date));
    let longest = 0;
    let running = 0;
    for (const day of sorted) {
      const isFull = CaregiverMicroCheckinEngine.isFullyComplete(day.completion);
      running = isFull ? running + 1 : 0;
      longest = Math.max(longest, running);
    }
    return longest;
  },
};
