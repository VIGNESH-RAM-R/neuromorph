// Momentum Score = a blend of (a) how much of today's Daily Set was
// completed and (b) how well the patient performed on what they did
// complete. Two patients who both "did their tasks" shouldn't look
// identical if one is trending down in performance -- and one patient
// skipping tasks shouldn't be hidden by a single strong game score. This is
// intentionally a SEPARATE number from the weekly Cognitive Score: Momentum
// is about daily engagement + performance together, Cognitive Score is the
// clinical weekly read.
export const MOMENTUM_CONFIG = {
  completionWeight: 0.5,
  performanceWeight: 0.5,
};

// Streak counts consecutive days where the FULL Daily Set was completed --
// soft-mandatory, not a hard lockout, per the project's non-punitive UX
// decision for a cognitively-vulnerable user base.
export const STREAK_CONFIG = {
  requireFullCompletionForStreak: true,

  // 2026-08-19: one designated rest day per week where the daily mission
  // isn't required at all -- see StreakEngine.js, "0" is Sunday (matches
  // JS Date#getDay()). A rest day is SKIPPED entirely by the streak count
  // (neither breaks nor extends it), the same "streak freeze" mechanic used
  // by other habit-tracking apps, so a patient who takes the designated day
  // off never loses a streak they earned the other 6 days. Sunday was
  // chosen because it pairs naturally with the weekend Detection Assessment
  // reminder (see WeekendAssessmentReminderEngine.js) -- Saturday stays a
  // normal daily-mission day, so the weekend reminder has already had one
  // full day's notice before the mandatory rest-day-with-assessment-due
  // messaging kicks in on Sunday.
  restDayOfWeek: 0,
};

// 2026-08-19: real streak-based reward system (task: "set any rewards that
// makes them happy... play this daily consistently for long time"). No
// points/currency/redeemable-store here -- there's no real backend for
// redemption, and inventing one would be exactly the kind of fabricated
// feature this project has been actively removing elsewhere (see Morphy's
// Caregiver Mode/EEG correction). Named streak-length badges are honest,
// fully computable from data already tracked (StreakEngine), and are a
// well-established, real gamification pattern (Duolingo, Headspace, etc.)
// for exactly this "come back every day" goal.
export const STREAK_MILESTONES = [
  { days: 3, id: 'spark', label: 'Spark', message: "3 days in a row -- you're building a real habit." },
  { days: 7, id: 'week-one', label: 'One Week Strong', message: 'A full week of daily check-ins. Great consistency.' },
  { days: 14, id: 'fortnight', label: 'Two-Week Streak', message: 'Two weeks straight -- this is really sticking.' },
  { days: 30, id: 'month', label: 'One-Month Milestone', message: 'A full month of consistency. Outstanding.' },
  { days: 60, id: 'two-month', label: '60-Day Streak', message: '60 days in a row. Remarkable dedication.' },
  { days: 100, id: 'century', label: 'Century Streak', message: '100 days. This is genuinely exceptional.' },
];
