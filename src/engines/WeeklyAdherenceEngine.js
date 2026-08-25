// Mirrors the Doctor Dashboard's AdherenceEngine, from the patient's own
// side: is this week's Detection Assessment done, due today, or overdue?
// Pure function of (weeklyAssessment, now) so it's trivially testable.
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const WeeklyAdherenceEngine = {
  evaluate(weeklyAssessment, now = new Date()) {
    if (!weeklyAssessment?.dueDate) {
      return { status: 'unknown', daysUntilDue: undefined };
    }
    const due = new Date(weeklyAssessment.dueDate);
    const daysUntilDue = Math.round((due.getTime() - now.getTime()) / MS_PER_DAY);

    if (daysUntilDue < 0) return { status: 'overdue', daysUntilDue };
    if (daysUntilDue === 0) return { status: 'due-today', daysUntilDue };
    return { status: 'not-due-yet', daysUntilDue };
  },
};
