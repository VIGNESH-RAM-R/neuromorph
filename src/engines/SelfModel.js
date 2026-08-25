import { DailyTaskEngine } from './DailyTaskEngine.js';
import { StreakEngine } from './StreakEngine.js';
import { MomentumScoreEngine } from './MomentumScoreEngine.js';
import { WeeklyAdherenceEngine } from './WeeklyAdherenceEngine.js';
import { DomainInsightEngine } from './DomainInsightEngine.js';
import { ActivityHeatmapEngine } from './ActivityHeatmapEngine.js';
import { DailyGameRotationEngine } from './DailyGameRotationEngine.js';
import { MilestoneEngine } from './MilestoneEngine.js';
import { WeekendAssessmentReminderEngine } from './WeekendAssessmentReminderEngine.js';
import { STREAK_CONFIG } from '../config/momentumConfig.js';

const toIsoDate = (date) => date.toISOString().slice(0, 10);

// The single assembler every screen reads from -- same philosophy as the
// Doctor Dashboard's ReportModel. Components never compute a streak,
// checklist status, or Momentum Score themselves; they only render what
// this already decided.
export const SelfModel = {
  build(self, now = new Date()) {
    const checklist = DailyTaskEngine.buildChecklist(self.today?.completion);
    const { done, total } = DailyTaskEngine.completionCount(self.today?.completion);
    const todayFullyComplete = DailyTaskEngine.isFullyComplete(self.today?.completion);

    const streak = StreakEngine.currentStreak(self.dailyHistory);
    const longestStreak = StreakEngine.longestStreak(self.dailyHistory);

    // 2026-08-19: today's rest-day status is judged off the REAL current
    // date (`now`), not `self.today.date` -- a brand-new patient or one who
    // hasn't opened the app yet today has no `today.date` set (day-rollover
    // is lazy, see UserProfileEngine's own comment), but rest-day-ness still
    // needs to be known before they've done anything.
    const isRestDay = now.getDay() === STREAK_CONFIG.restDayOfWeek;
    const nowIsoDate = toIsoDate(now);

    // Momentum reveal gate: the real number is only shown once all 5 Daily
    // Set items are done, so it lands as a genuine "here's how you did
    // today" reveal rather than a number that just ticks up as a live
    // progress bar (see task spec: "after playing all those 5 they come to
    // know about their real momentum score of the day"). On the designated
    // rest day there's no mandatory mission to gate behind, so today's
    // number (whatever was optionally played) is shown as-is.
    const rawTodayMomentum = MomentumScoreEngine.scoreForDay(self.today);
    const todayMomentum = (todayFullyComplete || isRestDay)
      ? { ...rawTodayMomentum, revealed: true }
      : { revealed: false, completedCount: done, totalCount: total };

    const momentumHistory = MomentumScoreEngine.historyWithScores(self.dailyHistory);

    const weeklyAdherence = WeeklyAdherenceEngine.evaluate(self.weeklyAssessment, now);
    const weekendReminder = WeekendAssessmentReminderEngine.evaluate(self.weeklyAssessment, now);

    // Today's specific pick for each of the 3 rotating categories --
    // computed once here so every screen (Home, Games) shows the identical
    // "today's Memory game is X" label, never recomputed per component.
    const gamePicks = DailyGameRotationEngine.todaysPicks(self.today?.date || nowIsoDate);

    const milestone = {
      current: MilestoneEngine.currentMilestone(streak),
      next: MilestoneEngine.nextMilestone(streak),
    };

    // 2026-08-17: Progress screen insights -- domain breakdown (with
    // per-domain % change), an honest "not measured yet" list for domains
    // with no active source task, plain-language clinical callouts, and a
    // 12-week activity heatmap. All derived here (never computed inline in
    // a component) so every screen that needs them reads the same numbers,
    // same as every other value on this model.
    const domainBreakdown = DomainInsightEngine.breakdown(self.domainScoreHistory || {});
    const pendingDomains = DomainInsightEngine.pendingDomains();
    const clinicalInsights = DomainInsightEngine.insights(domainBreakdown);
    const activitySource = self.activityLog || self.dailyHistory || [];
    // Keep the established 12-week model for existing consumers, and expose
    // a separate full-year calendar for the dedicated Activity page.
    const activityHeatmap = ActivityHeatmapEngine.build(activitySource, { weeks: 12, asOf: now });
    const activityCalendar = ActivityHeatmapEngine.buildCalendarYear(activitySource, { year: now.getFullYear() });

    return {
      name: self.name,
      age: self.age,
      patientId: self.patientId,
      today: {
        date: self.today?.date,
        checklist,
        completedCount: done,
        totalCount: total,
        fullyComplete: todayFullyComplete,
        momentum: todayMomentum,
        isRestDay,
        gamePicks,
      },
      streak,
      longestStreak,
      milestone,
      momentumHistory,
      weeklyAssessment: {
        ...self.weeklyAssessment,
        ...weeklyAdherence,
      },
      weekendReminder,
      weeklyCognitiveScoreHistory: self.weeklyCognitiveScoreHistory || [],
      monthlyCognitiveScoreHistory: self.monthlyCognitiveScoreHistory || [],
      domainBreakdown,
      pendingDomains,
      clinicalInsights,
      activityHeatmap,
      activityCalendar,
    };
  },
};
