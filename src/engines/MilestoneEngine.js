import { STREAK_MILESTONES } from '../config/momentumConfig.js';

// Pure lookup over a real streak number -- no separate "has this been
// celebrated yet" state to persist, so this can never drift out of sync
// with the streak it describes (re-derived fresh every render, same
// philosophy as every other engine in this app).
export const MilestoneEngine = {
  // The highest milestone the current streak has already reached, or
  // undefined if it hasn't hit the first one yet.
  currentMilestone(streak = 0) {
    const eligible = STREAK_MILESTONES.filter((m) => streak >= m.days);
    return eligible.length > 0 ? eligible[eligible.length - 1] : undefined;
  },

  // The next milestone still ahead, plus how many more days of streak it
  // takes to reach it -- undefined once every milestone has been passed.
  nextMilestone(streak = 0) {
    const next = STREAK_MILESTONES.find((m) => streak < m.days);
    if (!next) return undefined;
    return { ...next, daysRemaining: next.days - streak };
  },
};
