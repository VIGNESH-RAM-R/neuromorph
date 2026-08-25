import { ASSESSMENT_INTERVAL_DAYS } from '../config/operationalConfig.js';

function daysBetween(dateA, dateB) {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((dateB.getTime() - dateA.getTime()) / msPerDay);
}

// Computes how many days since the last completed session and whether the
// patient is overdue for their next assessment under NEUROMORPH's standard
// cadence. Pure function of (lastSessionDate, now) so it's trivially
// testable with a fixed "now".
export const AdherenceEngine = {
  evaluate(lastSessionDateStr, now = new Date(), intervalDays = ASSESSMENT_INTERVAL_DAYS) {
    if (!lastSessionDateStr) {
      return { daysSinceLast: undefined, overdue: false, nextDueDate: undefined };
    }
    const lastDate = new Date(lastSessionDateStr);
    const daysSinceLast = daysBetween(lastDate, now);
    const nextDue = new Date(lastDate.getTime() + intervalDays * 24 * 60 * 60 * 1000);
    return {
      daysSinceLast,
      overdue: daysSinceLast > intervalDays,
      nextDueDate: nextDue.toISOString().slice(0, 10),
    };
  },
};
