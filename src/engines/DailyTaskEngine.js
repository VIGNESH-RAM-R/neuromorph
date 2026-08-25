import { DAILY_TASK_TEMPLATE } from '../config/dailyTaskConfig.js';

// Turns the Daily Set template + today's raw completion state into the
// checklist the Home screen renders, plus the derived "is today's full set
// done" flag every other engine (streak, momentum) needs.
export const DailyTaskEngine = {
  buildChecklist(completion = {}) {
    return DAILY_TASK_TEMPLATE.map((task) => ({
      ...task,
      completed: completion[task.id] === true,
    }));
  },

  isFullyComplete(completion = {}) {
    return DAILY_TASK_TEMPLATE.every((task) => completion[task.id] === true);
  },

  completionCount(completion = {}) {
    const done = DAILY_TASK_TEMPLATE.filter((task) => completion[task.id] === true).length;
    return { done, total: DAILY_TASK_TEMPLATE.length };
  },

  completionFraction(completion = {}) {
    const { done, total } = this.completionCount(completion);
    if (total === 0) return 0;
    return done / total;
  },
};
