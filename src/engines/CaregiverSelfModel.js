import { CaregiverMicroCheckinEngine } from './CaregiverMicroCheckinEngine.js';
import { CaregiverDeepCheckinEngine } from './CaregiverDeepCheckinEngine.js';
import { CaregiverStreakEngine } from './CaregiverStreakEngine.js';

// 2026-08-27 BUGFIX (found during the Detection Assessment date/time
// audit, VR: "correct date, time, month, year - all time tracking la
// irukanum, illana anga present panna mudiyathu"). This used to be
// `date.toISOString().slice(0, 10)`, which converts to UTC before reading
// the date -- WRONG for any patient not in the UTC timezone, which is
// almost every real user of an India-focused app (IST is UTC+5:30). A
// patient completing their weekly check-in between 12:00am-5:29am IST
// would have it silently recorded under the PREVIOUS calendar day (still
// "yesterday" in UTC at that hour), throwing off "last completed", the
// +7-day due date calculation, weekend detection, and streaks by a day --
// exactly around midnight, the one time a date bug is easiest to miss in
// testing and hardest for a patient to explain to their doctor. This now
// reads the LOCAL calendar date (the device's own timezone, i.e. the
// patient's actual "today"), which is what every caller here actually
// means by "today's date".
const toIsoDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// The caregiver counterpart to SelfModel.js -- the single assembler
// CaregiverHomeSection reads from. Components never compute checklist
// status or streak themselves.
//
// 2026-08-24 REDESIGN: now assembles TWO independent check-in view models
// (micro + deep) instead of one -- see CaregiverProfileEngine.js's header
// comment for why.
export const CaregiverSelfModel = {
  build(caregiver, now = new Date()) {
    const todayIso = caregiver?.microToday?.date || toIsoDate(now);
    const microCompletion = caregiver?.microToday?.completion || {};
    const microChecklist = CaregiverMicroCheckinEngine.buildChecklist(microCompletion);
    const microCount = CaregiverMicroCheckinEngine.completionCount(microCompletion);
    const microFullyComplete = CaregiverMicroCheckinEngine.isFullyComplete(microCompletion);

    const streak = CaregiverStreakEngine.currentStreak(caregiver?.microDailyHistory || []);
    const longestStreak = CaregiverStreakEngine.longestStreak(caregiver?.microDailyHistory || []);

    const deep = caregiver?.deepCheckin || { status: 'locked', unlockedForDate: null, questions: [], completion: {} };
    const deepChecklist = CaregiverDeepCheckinEngine.buildChecklist(deep.questions, deep.completion);
    const deepCount = CaregiverDeepCheckinEngine.completionCount(deep.questions, deep.completion);

    return {
      name: caregiver?.name,
      linkedPatientUid: caregiver?.linkedPatientUid || null,
      linkedPatientName: caregiver?.linkedPatientName || null,
      isLinked: Boolean(caregiver?.linkedPatientUid),

      micro: {
        date: todayIso,
        checklist: microChecklist,
        completedCount: microCount.done,
        totalCount: microCount.total,
        fullyComplete: microFullyComplete,
      },
      streak,
      longestStreak,

      deep: {
        status: deep.status, // 'locked' | 'available' | 'completed'
        unlockedForDate: deep.unlockedForDate,
        checklist: deepChecklist,
        completedCount: deepCount.done,
        totalCount: deepCount.total,
      },
    };
  },
};
