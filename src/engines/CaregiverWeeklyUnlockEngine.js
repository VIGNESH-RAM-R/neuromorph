// 2026-08-24 ADDITION -- the pure decision logic behind the deep
// check-in's new trigger: "once after the patient completes the detection
// assessment", not on a calendar cadence. Kept as its own tiny, framework-
// free engine (same "one focused decision per file" convention as
// AssessmentModeGuard.js) so the actual trigger RULE is one readable,
// independently-testable place -- useCaregiverAuth.js is the only caller,
// and it's the one place that talks to Firestore to find out the
// patient's latest assessment date in the first place.
export const CaregiverWeeklyUnlockEngine = {
  // `latestAssessmentDate`: the patient's most recently completed Detection
  // Assessment date (YYYY-MM-DD), or null if they haven't completed one
  // yet. `deepCheckin`: the caregiver's own current deep-checkin state
  // ({ status, unlockedForDate, ... }).
  //
  // A fresh unlock is due whenever the patient has a real completed
  // assessment date that this caregiver's current set doesn't already
  // correspond to -- covers all three real cases: nothing has ever
  // unlocked yet (unlockedForDate is null), the current set is still
  // sitting there unanswered from a PRIOR assessment (status 'available'
  // for an older date -- this is the "expires, move on" case), and the
  // current set was already completed for a prior assessment (status
  // 'completed' for an older date).
  shouldUnlock(latestAssessmentDate, deepCheckin) {
    if (!latestAssessmentDate) return false;
    return deepCheckin?.unlockedForDate !== latestAssessmentDate;
  },

  // Whether the CURRENT set (if any) was left unanswered when a newer
  // assessment came in -- used purely to decide whether to record that
  // prior set into history as 'expired' (vs. simply having nothing to
  // expire because nothing was ever unlocked, or the prior set was
  // already properly completed).
  priorSetExpired(latestAssessmentDate, deepCheckin) {
    return Boolean(
      deepCheckin?.unlockedForDate
      && deepCheckin.unlockedForDate !== latestAssessmentDate
      && deepCheckin.status === 'available',
    );
  },
};
