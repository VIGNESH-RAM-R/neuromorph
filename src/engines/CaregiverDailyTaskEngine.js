import { CaregiverDailyRotationEngine } from './CaregiverDailyRotationEngine.js';

// The caregiver counterpart to DailyTaskEngine.js -- structurally similar
// (buildChecklist/isFullyComplete/completionCount/completionFraction), but
// the caregiver's "template" isn't a fixed list -- 10 of the 15 questions
// rotate by date (see CaregiverDailyRotationEngine.js), so every method
// here takes `dateIso` to know which exact 15 questions applied that day.
// 'text'-type questions (free-form notes) are always optional and never
// count toward "fully complete" or the completion fraction -- forcing a
// caregiver to write something every day would be the exact punitive UX
// this whole project avoids elsewhere.
export const CaregiverDailyTaskEngine = {
  buildChecklist(dateIso, completion = {}) {
    return CaregiverDailyRotationEngine.questionsFor(dateIso).map((q) => ({
      ...q,
      completed: this._isAnswered(completion[q.id]),
    }));
  },

  isFullyComplete(dateIso, completion = {}) {
    return CaregiverDailyRotationEngine.questionsFor(dateIso)
      .filter((q) => q.type !== 'text')
      .every((q) => this._isAnswered(completion[q.id]));
  },

  completionCount(dateIso, completion = {}) {
    const required = CaregiverDailyRotationEngine.questionsFor(dateIso).filter((q) => q.type !== 'text');
    const done = required.filter((q) => this._isAnswered(completion[q.id])).length;
    return { done, total: required.length };
  },

  completionFraction(dateIso, completion = {}) {
    const { done, total } = this.completionCount(dateIso, completion);
    if (total === 0) return 0;
    return done / total;
  },

  _isAnswered(value) {
    return value !== undefined && value !== null && value !== '';
  },
};
