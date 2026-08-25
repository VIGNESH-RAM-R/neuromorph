import { CAREGIVER_MICRO_QUESTIONS } from '../config/caregiverMicroCheckinConfig.js';

// The lightweight, calendar-daily counterpart to CaregiverDeepCheckinEngine.js
// -- structurally similar to the old (now retired) CaregiverDailyTaskEngine,
// but far simpler: the question list is fixed (see caregiverMicroCheckinConfig.js's
// header for why), so nothing here needs to be date-aware the way the deep
// check-in's rotation was.
export const CaregiverMicroCheckinEngine = {
  buildChecklist(completion = {}) {
    return CAREGIVER_MICRO_QUESTIONS.map((q) => ({
      ...q,
      completed: this._isAnswered(completion[q.id]),
    }));
  },

  isFullyComplete(completion = {}) {
    return CAREGIVER_MICRO_QUESTIONS.every((q) => this._isAnswered(completion[q.id]));
  },

  completionCount(completion = {}) {
    const done = CAREGIVER_MICRO_QUESTIONS.filter((q) => this._isAnswered(completion[q.id])).length;
    return { done, total: CAREGIVER_MICRO_QUESTIONS.length };
  },

  _isAnswered(value) {
    return value !== undefined && value !== null && value !== '';
  },
};
