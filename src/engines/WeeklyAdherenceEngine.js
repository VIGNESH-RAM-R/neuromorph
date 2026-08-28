// Mirrors the Doctor Dashboard's AdherenceEngine, from the patient's own
// side: is this week's Detection Assessment done, due today, or overdue?
// Pure function of (weeklyAssessment, now) so it's trivially testable.
const MS_PER_DAY = 24 * 60 * 60 * 1000;

// 2026-08-27 BUGFIX (Detection Assessment date/time audit). `new
// Date('2026-08-08')` -- a plain date-only string -- parses per the JS
// spec as UTC MIDNIGHT, not local midnight. Comparing that against `now`
// (a real local instant) mixed two different timezone anchors: for a
// patient in IST (UTC+5:30), UTC midnight on the due date is already
// 5:30am the PREVIOUS local day, so this could report "not due yet" or
// "overdue" up to a day off depending on the time of day the patient
// happens to open the app. This parses the due date as a genuine LOCAL
// calendar date instead, and compares local-midnight to local-midnight
// (not instant-to-instant) so a few hours' difference in time-of-day
// never changes which calendar day this resolves to.
function parseLocalDate(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}
function startOfLocalDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export const WeeklyAdherenceEngine = {
  evaluate(weeklyAssessment, now = new Date()) {
    if (!weeklyAssessment?.dueDate) {
      return { status: 'unknown', daysUntilDue: undefined };
    }
    const due = parseLocalDate(weeklyAssessment.dueDate);
    const today = startOfLocalDay(now);
    const daysUntilDue = Math.round((due.getTime() - today.getTime()) / MS_PER_DAY);

    if (daysUntilDue < 0) return { status: 'overdue', daysUntilDue };
    if (daysUntilDue === 0) return { status: 'due-today', daysUntilDue };
    return { status: 'not-due-yet', daysUntilDue };
  },
};
