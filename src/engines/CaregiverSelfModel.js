import { CaregiverMicroCheckinEngine } from './CaregiverMicroCheckinEngine.js';
import { CaregiverDeepCheckinEngine } from './CaregiverDeepCheckinEngine.js';
import { CaregiverStreakEngine } from './CaregiverStreakEngine.js';

const toIsoDate = (date) => date.toISOString().slice(0, 10);

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
