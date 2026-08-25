import { ASSESSMENT_INTERVAL_DAYS } from '../config/operationalConfig.js';

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const toIsoDate = (date) => date.toISOString().slice(0, 10);

// Pure shaping logic for a Firestore user-profile document -- no Firestore
// SDK import here on purpose, so this stays Node-testable like every other
// engine in this app. FirestoreUserService.js is the only place that
// actually talks to the database; it calls into this engine to decide
// WHAT to write.
export const UserProfileEngine = {
  // The document created the very first time a uid is ever seen -- either
  // right after signup() or the first time a social sign-in has no
  // existing profile yet. Deliberately starts with empty history (never
  // fabricated sample data) and onboardingComplete: false, mirroring the
  // old mock signup() override.
  // 2026-08-21: privacyConsentAcceptedAt (see PrivacyPolicyScreen.jsx /
  // DEPLOYMENT_READINESS.md item 4) -- an ISO timestamp recorded ONLY when
  // the password-signup path (the one path where a required, gated
  // checkbox click precedes account creation) is taken. Left null for the
  // social-auth "first sign-in creates a profile" path -- see
  // useAuth.js's own comment at that call site for why this is an honest,
  // disclosed gap rather than a fabricated timestamp.
  buildNewProfileDoc({ name, email, authProvider, privacyConsentAcceptedAt = null } = {}) {
    return {
      name: name || 'there',
      email: email || null,
      authProvider: authProvider || 'password',
      privacyConsentAcceptedAt,
      onboardingComplete: false,
      today: { date: null, completion: {}, performanceScores: {} },
      dailyHistory: [],
      weeklyAssessment: { lastCompletedDate: null, dueDate: null },
      weeklyCognitiveScoreHistory: [],
    };
  },

  // Same update recordCompletedAssessment() used to do directly on React
  // state -- now returns the plain object to WRITE, so the hook and the
  // Firestore service both consume the exact same, tested logic.
  applyAssessmentCompletion(profile, score, now = new Date()) {
    const completedDate = toIsoDate(now);
    const nextDueDate = toIsoDate(new Date(now.getTime() + ASSESSMENT_INTERVAL_DAYS * MS_PER_DAY));
    const historyEntry = typeof score === 'number' ? [{ date: completedDate, score }] : [];
    return {
      ...profile,
      weeklyAssessment: { ...profile?.weeklyAssessment, lastCompletedDate: completedDate, dueDate: nextDueDate },
      weeklyCognitiveScoreHistory: [...(profile?.weeklyCognitiveScoreHistory || []), ...historyEntry],
    };
  },

  applyOnboardingProfile(profile, onboardingProfile) {
    return { ...profile, ...onboardingProfile };
  },

  // Marks one Daily Set item (e.g. 'facial-expressivity') complete for
  // today, with its performance score if the task produced one (a task
  // with no performance-bearing score, e.g. future self-report daily
  // questions, still counts toward completion without inventing a number
  // -- see MomentumScoreEngine's own honest-fallback comment).
  //
  // Day-rollover is handled lazily here rather than via a cron job: if
  // `today.date` doesn't match the real calendar date, yesterday's `today`
  // record is archived into `dailyHistory` first (this is also what feeds
  // StreakEngine), then a fresh `today` starts for the new date. This means
  // the rollover only actually happens the moment a user completes their
  // first daily task on a new day, not at midnight -- acceptable since
  // nothing reads `today` until the user opens the app that day anyway.
  applyDailyTaskCompletion(profile, taskId, score, now = new Date()) {
    const todayDate = toIsoDate(now);
    const isNewDay = profile?.today?.date && profile.today.date !== todayDate;
    const dailyHistory = isNewDay ? [...(profile?.dailyHistory || []), profile.today] : (profile?.dailyHistory || []);
    const baseToday = isNewDay || !profile?.today?.date
      ? { date: todayDate, completion: {}, performanceScores: {} }
      : profile.today;

    const completion = { ...baseToday.completion, [taskId]: true };
    const performanceScores = typeof score === 'number'
      ? { ...baseToday.performanceScores, [taskId]: score }
      : baseToday.performanceScores;

    return {
      ...profile,
      today: { ...baseToday, date: todayDate, completion, performanceScores },
      dailyHistory,
    };
  },
};
