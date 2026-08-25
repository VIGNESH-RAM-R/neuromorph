import { STREAK_CONFIG } from '../config/momentumConfig.js';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

// Monday-start of the calendar week containing `date`.
function startOfWeek(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0=Sun..6=Sat
  const diffToMonday = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diffToMonday);
  return d;
}

// 2026-08-19: this is deliberately a SEPARATE check from
// WeeklyAdherenceEngine's rolling `dueDate` (which advances 7 days from
// whenever the patient last completed it, and so can land on any weekday,
// drifting away from the calendar weekend over time). The product spec
// specifically wants a reminder tied to the actual calendar weekend
// (Saturday/Sunday), plus one specific rest day (Sunday, see
// momentumConfig.js's STREAK_CONFIG.restDayOfWeek) where completing it is
// mandatory -- so this asks a different, narrower question: "has THIS
// Monday-to-Sunday calendar week's assessment been done yet?", independent
// of the rolling due-date cycle.
export const WeekendAssessmentReminderEngine = {
  isWeekend(now = new Date()) {
    const day = now.getDay();
    return day === 0 || day === 6;
  },

  isRestDay(now = new Date(), config = STREAK_CONFIG) {
    return now.getDay() === config.restDayOfWeek;
  },

  completedThisCalendarWeek(lastCompletedDate, now = new Date()) {
    if (!lastCompletedDate) return false;
    const weekStart = startOfWeek(now);
    const completed = new Date(`${lastCompletedDate}T00:00:00`);
    return completed.getTime() >= weekStart.getTime() && completed.getTime() < weekStart.getTime() + 7 * MS_PER_DAY;
  },

  // The single result GamesSection/HomeSection/AssessmentSection all read,
  // so the three screens can never disagree about whether the reminder
  // should show.
  evaluate(weeklyAssessment, now = new Date(), config = STREAK_CONFIG) {
    const completedThisWeek = this.completedThisCalendarWeek(weeklyAssessment?.lastCompletedDate, now);
    const weekend = this.isWeekend(now);
    const restDay = this.isRestDay(now, config);
    return {
      completedThisWeek,
      isWeekend: weekend,
      isRestDay: restDay,
      // Pending reminder: it's the weekend and this week's assessment isn't done yet.
      showReminder: weekend && !completedThisWeek,
      // Friendly "you're done, no need to retake" notice: it's the weekend and it's already done.
      showAlreadyDoneNotice: weekend && completedThisWeek,
      // Rest-day-specific: no daily mission today, and if the assessment is
      // still pending, it becomes the mandatory thing to do today instead.
      restDayAssessmentMandatory: restDay && !completedThisWeek,
    };
  },
};
