import { CaregiverDeepCheckinEngine } from './CaregiverDeepCheckinEngine.js';

const toIsoDate = (date) => date.toISOString().slice(0, 10);

// The caregiver counterpart to UserProfileEngine.js -- pure shaping logic
// for a Firestore /caregivers/{uid} document, no Firestore SDK import here
// (same Node-testable convention every engine in this app follows).
// FirestoreCaregiverService.js is the only place that actually talks to
// the database.
export const CaregiverProfileEngine = {
  // linkedPatientUid starts null -- a caregiver account exists the moment
  // they sign up, but isn't useful (and shouldn't show any check-in UI)
  // until they've entered a real patient's invite code. See
  // useCaregiverAuth.js for the linking step itself.
  // 2026-08-21: same privacyConsentAcceptedAt treatment as
  // UserProfileEngine.js's buildNewProfileDoc -- see that file's comment.
  //
  // 2026-08-24 REDESIGN -- replaces the old single `today`/`dailyHistory`
  // shape with TWO independent tracks (VR: "give the caregiver some
  // simpler tasks on a day to day basis" alongside the weekly deep one):
  //   - deepCheckin / deepCheckinHistory: the 15-question set, now
  //     unlocked once per patient assessment rather than once per day --
  //     see CaregiverWeeklyUnlockEngine.js for the trigger logic and
  //     CaregiverDeepCheckinEngine.js for the question-set logic.
  //   - microToday / microDailyHistory: the new lightweight 2-question
  //     daily pulse check -- see caregiverMicroCheckinConfig.js.
  buildNewProfileDoc({ name, email, authProvider, privacyConsentAcceptedAt = null } = {}) {
    return {
      name: name || 'there',
      email: email || null,
      authProvider: authProvider || 'password',
      privacyConsentAcceptedAt,
      onboardingComplete: false,
      linkedPatientUid: null,
      linkedPatientName: null,
      // 2026-08-23 ADDITION -- connection redesign (see
      // FirestoreCareRelationshipService.js's careRelationships section).
      // Redeeming an invite code no longer links instantly -- it sends a
      // request the patient must accept. `linkRequestStatus` lets the UI
      // (CaregiverLinkPatientScreen.jsx) show a real waiting/declined
      // state instead of a binary linked/not-linked gate.
      pendingPatientUid: null,
      pendingPatientName: null,
      linkRequestStatus: 'none', // 'none' | 'pending' | 'declined'
      // 'locked' (no assessment completed yet to unlock a set) | 'available'
      // (a set is ready to answer) | 'completed' (answered, waiting for the
      // NEXT assessment). unlockedForDate is the patient assessment date
      // (YYYY-MM-DD) this exact set corresponds to.
      deepCheckin: { status: 'locked', unlockedForDate: null, questions: [], completion: {} },
      deepCheckinHistory: [], // [{ unlockedForDate, questions, completion, status: 'completed'|'expired', recordedAt }]
      microToday: { date: null, completion: {} },
      microDailyHistory: [],
    };
  },

  applyOnboardingProfile(profile, onboardingProfile) {
    return { ...profile, ...onboardingProfile };
  },

  // Final link, applied only once the PATIENT has accepted the request
  // (see useCaregiverAuth.js's self-heal check against
  // getAcceptedRelationshipForCaregiver). Clears the pending fields since
  // they're no longer relevant once actually linked.
  applyPatientLink(profile, patientUid, patientName) {
    return {
      ...profile,
      linkedPatientUid: patientUid,
      linkedPatientName: patientName || null,
      pendingPatientUid: null,
      pendingPatientName: null,
      linkRequestStatus: 'none',
    };
  },

  // A caregiver just redeemed a code and sent a request -- not yet linked,
  // waiting on the patient. Distinct from applyPatientLink above (that one
  // is the real, accepted link).
  applyPendingPatientLink(profile, patientUid, patientName) {
    return {
      ...profile,
      pendingPatientUid: patientUid,
      pendingPatientName: patientName || null,
      linkRequestStatus: 'pending',
    };
  },

  // The patient declined the request -- clear the pending fields but keep
  // linkRequestStatus so the screen can say so, and let the caregiver try
  // a different code right away.
  applyLinkDeclined(profile) {
    return {
      ...profile,
      pendingPatientUid: null,
      pendingPatientName: null,
      linkRequestStatus: 'declined',
    };
  },

  // ==========================================================================
  // Daily MICRO check-in (2 questions, every day, no rotation).
  // ==========================================================================
  applyMicroCheckinAnswer(profile, questionId, value, now = new Date()) {
    const todayDate = toIsoDate(now);
    const isNewDay = profile?.microToday?.date && profile.microToday.date !== todayDate;
    const microDailyHistory = isNewDay
      ? [...(profile?.microDailyHistory || []), profile.microToday]
      : (profile?.microDailyHistory || []);
    const baseToday = isNewDay || !profile?.microToday?.date
      ? { date: todayDate, completion: {} }
      : profile.microToday;

    const completion = { ...baseToday.completion, [questionId]: value };

    return {
      ...profile,
      microToday: { ...baseToday, date: todayDate, completion },
      microDailyHistory,
    };
  },

  // ==========================================================================
  // Weekly DEEP check-in (15 questions, unlocked per patient assessment).
  // ==========================================================================

  // Called by useCaregiverAuth.js once it detects (via
  // CaregiverWeeklyUnlockEngine.shouldUnlock) that the patient has a newer
  // completed assessment than the caregiver's current set corresponds to.
  // `cycleIndex` picks which chunk of the rotating pool this new set uses
  // (see CaregiverDeepCheckinEngine.rotatingQuestionsForCycle) -- the
  // caller is responsible for incrementing it (deepCheckinHistory.length
  // is the natural source, since it counts exactly how many sets have
  // been generated so far).
  unlockDeepCheckin(profile, assessmentDate, cycleIndex, now = new Date()) {
    const priorExpired = profile?.deepCheckin?.unlockedForDate
      && profile.deepCheckin.unlockedForDate !== assessmentDate
      && profile.deepCheckin.status === 'available';

    const deepCheckinHistory = priorExpired
      ? [...(profile?.deepCheckinHistory || []), { ...profile.deepCheckin, status: 'expired', recordedAt: now.toISOString() }]
      : (profile?.deepCheckinHistory || []);

    const questions = CaregiverDeepCheckinEngine.questionSetForCycle(cycleIndex);

    return {
      ...profile,
      deepCheckin: { status: 'available', unlockedForDate: assessmentDate, questions, completion: {} },
      deepCheckinHistory,
    };
  },

  applyDeepCheckinAnswer(profile, questionId, value, now = new Date()) {
    const current = profile?.deepCheckin || { status: 'locked', unlockedForDate: null, questions: [], completion: {} };
    const completion = { ...current.completion, [questionId]: value };
    const updated = { ...current, completion };

    // If that answer just completed the set, roll it into history
    // immediately (status 'completed') -- the doctor's report should be
    // able to show a finished set the moment it's finished, not only once
    // the NEXT assessment triggers the next unlock.
    const isNowComplete = CaregiverDeepCheckinEngine.isFullyComplete(updated.questions, completion);
    if (isNowComplete && current.status !== 'completed') {
      return {
        ...profile,
        deepCheckin: { ...updated, status: 'completed' },
        deepCheckinHistory: [...(profile?.deepCheckinHistory || []), { ...updated, status: 'completed', recordedAt: now.toISOString() }],
      };
    }

    return { ...profile, deepCheckin: updated };
  },
};
