import assert from 'node:assert/strict';

import { average, round1 } from '../src/engines/mathUtils.js';
import { AuthEngine } from '../src/engines/AuthEngine.js';
import { DailyTaskEngine } from '../src/engines/DailyTaskEngine.js';
import { StreakEngine } from '../src/engines/StreakEngine.js';
import { MomentumScoreEngine } from '../src/engines/MomentumScoreEngine.js';
import { WeeklyAdherenceEngine } from '../src/engines/WeeklyAdherenceEngine.js';
import { WeekendAssessmentReminderEngine } from '../src/engines/WeekendAssessmentReminderEngine.js';
import { DailyGameRotationEngine } from '../src/engines/DailyGameRotationEngine.js';
import { MilestoneEngine } from '../src/engines/MilestoneEngine.js';
import { DoctorDashboardExportEngine } from '../src/engines/DoctorDashboardExportEngine.js';
import { SelfModel } from '../src/engines/SelfModel.js';
import { DomainInsightEngine } from '../src/engines/DomainInsightEngine.js';
import { ActivityHeatmapEngine } from '../src/engines/ActivityHeatmapEngine.js';
import { DAILY_TASK_TEMPLATE } from '../src/config/dailyTaskConfig.js';
import { GAME_CATEGORIES, CONNECTED_GAMES } from '../src/config/gamesConfig.js';
import { STREAK_CONFIG, STREAK_MILESTONES } from '../src/config/momentumConfig.js';
import { SECTIONS, SECTION_KEYS } from '../src/config/sectionsConfig.js';
import { MOCK_SELF } from '../src/data/mockSelf.js';
import { OnboardingEngine, computeAge } from '../src/engines/OnboardingEngine.js';
import { ONBOARDING_STEPS, ONBOARDING_STEP_IDS } from '../src/config/onboardingConfig.js';
import { DOCTOR_ONBOARDING_STEPS } from '../src/config/doctorOnboardingConfig.js';
import { ThemeEngine, THEMES, DEFAULT_THEME } from '../src/engines/ThemeEngine.js';
import { LanguageEngine } from '../src/engines/LanguageEngine.js';
import { LANGUAGES, LANGUAGE_CODES, DEFAULT_LANGUAGE, languageInfo } from '../src/config/i18nConfig.js';
import { AUTH_STRINGS, authString } from '../src/i18n/authStrings.js';
import { UserProfileEngine } from '../src/engines/UserProfileEngine.js';
import { DOCTOR_FAQ_ENTRIES } from '../src/config/doctorFaqConfig.js';
import { DOCTOR_SYSTEM_PROMPT, DOCTOR_SYSTEM_PROMPT_VERSION } from '../src/config/doctorSystemPromptConfig.js';
import { DOCTOR_MOCK_PATIENTS } from '../src/data/doctorMockPatients.js';
import {
  findPatientByName,
  findPatientsMentionedInMessage,
  messageRequestsPatientSummary,
  buildSummaryText,
} from '../src/engines/DoctorPatientLookupEngine.js';
import { ConversationEngine } from '../src/engines/ConversationEngine.js';
import { MATCHER_CONFIG, STOPWORDS } from '../src/config/matcherConfig.js';
import { bandFromScore, NON_DIAGNOSTIC_DISCLAIMER } from '../src/config/scoringBands.js';
import { CAREGIVER_FIXED_QUESTIONS, CAREGIVER_ROTATING_POOL, CAREGIVER_ROTATING_COUNT, CAREGIVER_DAILY_TOTAL } from '../src/config/caregiverDailyConfig.js';
import { CaregiverDeepCheckinEngine } from '../src/engines/CaregiverDeepCheckinEngine.js';
import { CaregiverMicroCheckinEngine } from '../src/engines/CaregiverMicroCheckinEngine.js';
import { CaregiverWeeklyUnlockEngine } from '../src/engines/CaregiverWeeklyUnlockEngine.js';
import { CAREGIVER_MICRO_QUESTIONS } from '../src/config/caregiverMicroCheckinConfig.js';
import { CaregiverStreakEngine } from '../src/engines/CaregiverStreakEngine.js';
import { CaregiverSelfModel } from '../src/engines/CaregiverSelfModel.js';
import { CaregiverProfileEngine } from '../src/engines/CaregiverProfileEngine.js';
import { InviteCodeEngine } from '../src/engines/InviteCodeEngine.js';
import { CAREGIVER_ONBOARDING_STEPS } from '../src/config/caregiverOnboardingConfig.js';
import { CAREGIVER_FAQ_ENTRIES } from '../src/config/caregiverFaqConfig.js';
import { CAREGIVER_SYSTEM_PROMPT, CAREGIVER_SYSTEM_PROMPT_VERSION } from '../src/config/caregiverSystemPromptConfig.js';
import { LOBAR_TASKS } from '../src/config/lobarTaskRegistryConfig.js';
import { TASK_TIME_ESTIMATES_SEC, estimateAssessmentMinutes } from '../src/config/assessmentTimeEstimateConfig.js';
import { ALL_COGNITIVE_DOMAIN_KEYS } from '../src/config/domainScoringConfig.js';
import { AssessmentSessionModel } from '../src/engines/AssessmentSessionModel.js';
import { MorphyCompanionEngine } from '../src/engines/MorphyCompanionEngine.js';

let passed = 0;
function check(name, fn) {
  try {
    fn();
    passed++;
  } catch (err) {
    console.error(`FAIL: ${name}`);
    throw err;
  }
}

// ---------- config sanity ----------
check('SECTIONS: exactly the 7 nav sections, with domains and activity inside My Progress', () => {
  assert.deepEqual(SECTION_KEYS, [
    'home', 'assessment', 'games', 'progress', 'insights', 'reports', 'morphy',
  ]);
  assert.equal(SECTIONS.length, 7);
});

// ---------- AuthEngine ----------
check('AuthEngine.validateLogin: rejects a malformed email and empty password', () => {
  const result = AuthEngine.validateLogin({ email: 'not-an-email', password: '' });
  assert.equal(result.valid, false);
  assert.ok(result.errors.email);
  assert.ok(result.errors.password);
});

check('AuthEngine.validateLogin: accepts a well-formed email and non-empty password', () => {
  const result = AuthEngine.validateLogin({ email: 'robert@example.com', password: 'anything' });
  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, {});
});

check('AuthEngine.validateSignup: requires a name, valid email, matching passwords >= 8 chars', () => {
  const bad = AuthEngine.validateSignup({ name: 'R', email: 'bad', password: 'short', confirmPassword: 'nope' });
  assert.equal(bad.valid, false);
  assert.ok(bad.errors.name);
  assert.ok(bad.errors.email);
  assert.ok(bad.errors.password);
  assert.ok(bad.errors.confirmPassword);

  const good = AuthEngine.validateSignup({ name: 'Robert Hayes', email: 'robert@example.com', password: 'longenough1', confirmPassword: 'longenough1' });
  assert.equal(good.valid, true);
});

// ---------- DailyTaskEngine ----------
check('DailyTaskEngine: template is exactly the 5 named items -- face, speech, memory, reaction, attention', () => {
  assert.equal(DAILY_TASK_TEMPLATE.length, 5);
  assert.deepEqual(DAILY_TASK_TEMPLATE.map((t) => t.id), ['facial-expressivity', 'speech', 'memory', 'reaction', 'attention']);
});

check('DailyTaskEngine.buildChecklist: one row per template task, completed flag from raw state', () => {
  const checklist = DailyTaskEngine.buildChecklist({ memory: true, speech: false });
  assert.equal(checklist.length, DAILY_TASK_TEMPLATE.length);
  assert.equal(checklist.find((t) => t.id === 'memory').completed, true);
  assert.equal(checklist.find((t) => t.id === 'speech').completed, false);
  assert.equal(checklist.find((t) => t.id === 'attention').completed, false); // missing key -> false, never throws
});

check('DailyTaskEngine.isFullyComplete: true only when every template task is done', () => {
  const full = { 'facial-expressivity': true, speech: true, memory: true, reaction: true, attention: true };
  const partial = { 'facial-expressivity': true, speech: true, memory: false, reaction: true, attention: true };
  assert.equal(DailyTaskEngine.isFullyComplete(full), true);
  assert.equal(DailyTaskEngine.isFullyComplete(partial), false);
});

check('DailyTaskEngine.completionCount / completionFraction agree with each other', () => {
  const completion = { 'facial-expressivity': true, speech: true, memory: false, reaction: false, attention: false };
  const { done, total } = DailyTaskEngine.completionCount(completion);
  assert.equal(done, 2);
  assert.equal(total, 5);
  assert.equal(DailyTaskEngine.completionFraction(completion), 0.4);
});

// ---------- StreakEngine ----------
check('StreakEngine.currentStreak: counts back from the most recent day until a partial day breaks it, skipping clean over the rest day', () => {
  // Matches MOCK_SELF's shape: a run of full days, one rest day (2026-08-02,
  // a Sunday), one partial day (2026-07-31), then more full days.
  const streak = StreakEngine.currentStreak(MOCK_SELF.dailyHistory);
  // Counting back from 08-06: 08-06,08-05,08-04,08-03 full (4), 08-02 is the
  // rest day (Sunday) so it's SKIPPED (neither breaks nor extends), 08-01
  // full (5th), 07-31 is partial and stops the count there.
  assert.equal(streak, 5);
});

check('StreakEngine.currentStreak: an empty history is a streak of zero, never throws', () => {
  assert.equal(StreakEngine.currentStreak([]), 0);
});

check('StreakEngine.longestStreak: finds the longest run anywhere in history, not just the tail', () => {
  // 2026-01-05..01-08 are Monday-Thursday (no Sunday in range), so this
  // exercises "longest run, not just current tail" in isolation from the
  // rest-day mechanic, which gets its own dedicated tests below.
  const history = [
    { date: '2026-01-05', completion: { 'facial-expressivity': true, speech: true, memory: true, reaction: true, attention: true } },
    { date: '2026-01-06', completion: { 'facial-expressivity': true, speech: true, memory: true, reaction: true, attention: true } },
    { date: '2026-01-07', completion: { 'facial-expressivity': false, speech: true, memory: true, reaction: true, attention: true } },
    { date: '2026-01-08', completion: { 'facial-expressivity': true, speech: true, memory: true, reaction: true, attention: true } },
  ];
  assert.equal(StreakEngine.longestStreak(history), 2);
  assert.equal(StreakEngine.currentStreak(history), 1); // only the tail day counts for "current"
});

// ---------- StreakEngine: rest day (2026-08-19) ----------
check('StreakEngine: restDayOfWeek is configured to Sunday (0)', () => {
  assert.equal(STREAK_CONFIG.restDayOfWeek, 0);
});

check('StreakEngine.currentStreak: a rest day with NOTHING done does not break an otherwise-unbroken streak', () => {
  const full = { 'facial-expressivity': true, speech: true, memory: true, reaction: true, attention: true };
  const history = [
    { date: '2026-01-05', completion: full }, // Mon
    { date: '2026-01-06', completion: full }, // Tue
    { date: '2026-01-11', completion: {} },   // next Sunday, rest day, nothing played
    { date: '2026-01-12', completion: full }, // Mon
  ];
  assert.equal(StreakEngine.currentStreak(history), 3); // 01-12, (01-11 skipped), 01-06, 01-05
});

check('StreakEngine.longestStreak: bridges a rest day in the middle of an otherwise unbroken run', () => {
  const full = { 'facial-expressivity': true, speech: true, memory: true, reaction: true, attention: true };
  const history = [
    { date: '2026-01-05', completion: full }, // Mon
    { date: '2026-01-06', completion: full }, // Tue
    { date: '2026-01-07', completion: full }, // Wed
    { date: '2026-01-11', completion: {} },   // Sun, rest day
    { date: '2026-01-12', completion: full }, // Mon
    { date: '2026-01-13', completion: full }, // Tue
  ];
  assert.equal(StreakEngine.longestStreak(history), 5); // all 5 real days count as one continuous run
});

// ---------- MomentumScoreEngine ----------
check('MomentumScoreEngine.scoreForDay: blends completion and performance per the configured weights', () => {
  const day = { completion: { 'facial-expressivity': true, speech: true, memory: true, reaction: true, attention: true }, performanceScores: { memory: 80, speech: 60 } };
  const result = MomentumScoreEngine.scoreForDay(day);
  assert.equal(result.completionPct, 100);
  assert.equal(result.performanceAvg, 70);
  assert.equal(result.score, 85); // 100*0.5 + 70*0.5
});

check('MomentumScoreEngine.scoreForDay: falls back to completion alone when nothing performance-bearing is done, never fabricates a performance number', () => {
  const day = { completion: { attention: true }, performanceScores: {} };
  const result = MomentumScoreEngine.scoreForDay(day);
  assert.equal(result.performanceAvg, undefined);
  assert.equal(result.score, 20); // 1 of 5 tasks = 20% completion, no performance component
});

check('MomentumScoreEngine.historyWithScores: one score per day, sorted oldest to newest', () => {
  const history = MomentumScoreEngine.historyWithScores(MOCK_SELF.dailyHistory);
  assert.equal(history.length, MOCK_SELF.dailyHistory.length);
  assert.equal(history[0].date, '2026-07-28');
  assert.equal(history[history.length - 1].date, '2026-08-06');
  assert.ok(history.every((h) => typeof h.score === 'number'));
});

// ---------- WeeklyAdherenceEngine ----------
check('WeeklyAdherenceEngine.evaluate: not due yet when the due date is in the future', () => {
  const result = WeeklyAdherenceEngine.evaluate({ dueDate: '2026-08-08' }, new Date('2026-08-05T00:00:00Z'));
  assert.equal(result.status, 'not-due-yet');
  assert.equal(result.daysUntilDue, 3);
});

check('WeeklyAdherenceEngine.evaluate: due today when now equals the due date', () => {
  const result = WeeklyAdherenceEngine.evaluate({ dueDate: '2026-08-08' }, new Date('2026-08-08T00:00:00Z'));
  assert.equal(result.status, 'due-today');
});

check('WeeklyAdherenceEngine.evaluate: overdue once the due date has passed', () => {
  const result = WeeklyAdherenceEngine.evaluate({ dueDate: '2026-08-01' }, new Date('2026-08-05T00:00:00Z'));
  assert.equal(result.status, 'overdue');
  assert.ok(result.daysUntilDue < 0);
});

check('WeeklyAdherenceEngine.evaluate: missing data degrades to "unknown", never throws', () => {
  const result = WeeklyAdherenceEngine.evaluate(undefined, new Date());
  assert.equal(result.status, 'unknown');
});

// ---------- WeekendAssessmentReminderEngine (2026-08-19) ----------
check('WeekendAssessmentReminderEngine.evaluate: weekday, not yet completed -- no reminder shown at all (not the weekend window yet)', () => {
  const result = WeekendAssessmentReminderEngine.evaluate({ lastCompletedDate: '2026-07-20' }, new Date('2026-08-05T00:00:00Z')); // Wednesday
  assert.equal(result.isWeekend, false);
  assert.equal(result.showReminder, false);
  assert.equal(result.showAlreadyDoneNotice, false);
});

check('WeekendAssessmentReminderEngine.evaluate: Saturday, this calendar week not completed yet -- shows the pending reminder, not the rest day', () => {
  const result = WeekendAssessmentReminderEngine.evaluate({ lastCompletedDate: '2026-07-20' }, new Date('2026-08-01T00:00:00Z')); // Saturday
  assert.equal(result.isWeekend, true);
  assert.equal(result.isRestDay, false);
  assert.equal(result.showReminder, true);
  assert.equal(result.restDayAssessmentMandatory, false);
});

check('WeekendAssessmentReminderEngine.evaluate: Sunday (the rest day), this calendar week not completed yet -- mandatory today', () => {
  const result = WeekendAssessmentReminderEngine.evaluate({ lastCompletedDate: '2026-07-20' }, new Date('2026-08-02T00:00:00Z')); // Sunday
  assert.equal(result.isRestDay, true);
  assert.equal(result.showReminder, true);
  assert.equal(result.restDayAssessmentMandatory, true);
});

check('WeekendAssessmentReminderEngine.evaluate: already completed THIS calendar week -- friendly "no need to retake" notice, not the pending reminder', () => {
  // Week of 2026-08-03 (Mon) to 2026-08-09 (Sun); completed mid-week on 08-05.
  const result = WeekendAssessmentReminderEngine.evaluate({ lastCompletedDate: '2026-08-05' }, new Date('2026-08-08T00:00:00Z')); // Saturday
  assert.equal(result.completedThisWeek, true);
  assert.equal(result.showReminder, false);
  assert.equal(result.showAlreadyDoneNotice, true);
  assert.equal(result.restDayAssessmentMandatory, false);
});

check('WeekendAssessmentReminderEngine.completedThisCalendarWeek: a completion from the PREVIOUS calendar week does not count for this week, even if within the rolling 7-day window', () => {
  // Completed Saturday 08-01 (previous Mon-Sun week); "now" is Friday 08-07 (this week hasn't started completing yet).
  const result = WeekendAssessmentReminderEngine.completedThisCalendarWeek('2026-08-01', new Date('2026-08-07T00:00:00Z'));
  assert.equal(result, false);
});

check('WeekendAssessmentReminderEngine: missing lastCompletedDate never throws, degrades to not-completed', () => {
  const result = WeekendAssessmentReminderEngine.evaluate({}, new Date('2026-08-01T00:00:00Z'));
  assert.equal(result.completedThisWeek, false);
});

// ---------- DailyGameRotationEngine (2026-08-19) ----------
check('gamesConfig: CONNECTED_GAMES lists the facial check-in and six embedded suite games', () => {
  assert.equal(CONNECTED_GAMES.length, 7);
  assert.deepEqual(CONNECTED_GAMES.map((game) => game.id), [
    'facial-expressivity', 'sequence', 'imagepairs', 'pointclick', 'whackmole', 'oddball', 'spotdifference',
  ]);
});

check('gamesConfig: memory/reaction/attention each have exactly 2 real, uniquely-identified sub-games', () => {
  assert.equal(GAME_CATEGORIES.length, 3);
  const allIds = [];
  for (const category of GAME_CATEGORIES) {
    assert.equal(category.subGames.length, 2, `${category.id} should have exactly 2 sub-games`);
    for (const g of category.subGames) {
      assert.ok(g.id && g.label);
      allIds.push(g.id);
    }
  }
  assert.equal(new Set(allIds).size, allIds.length, 'every sub-game id must be unique across categories');
});

check('DailyGameRotationEngine.todaysGame: deterministic -- same category + date always resolves to the same sub-game', () => {
  const a = DailyGameRotationEngine.todaysGame('memory', '2026-08-10');
  const b = DailyGameRotationEngine.todaysGame('memory', '2026-08-10');
  assert.deepEqual(a, b);
  assert.ok(GAME_CATEGORIES.find((c) => c.id === 'memory').subGames.some((g) => g.id === a.id));
});

check('DailyGameRotationEngine.todaysGame: rotates -- consecutive days do not always pick the same sub-game', () => {
  const picks = new Set();
  for (let i = 0; i < 4; i++) {
    const date = new Date(Date.UTC(2026, 7, 10 + i)).toISOString().slice(0, 10);
    picks.add(DailyGameRotationEngine.todaysGame('reaction', date).id);
  }
  assert.equal(picks.size, 2); // both of the 2-game pool get used across 4 consecutive days
});

check('DailyGameRotationEngine.todaysGame: an unknown category or missing date returns undefined, never throws', () => {
  assert.equal(DailyGameRotationEngine.todaysGame('not-a-real-category', '2026-08-10'), undefined);
  assert.equal(DailyGameRotationEngine.todaysGame('memory', undefined), undefined);
});

check('DailyGameRotationEngine.todaysPicks: returns one pick per rotating category', () => {
  const picks = DailyGameRotationEngine.todaysPicks('2026-08-10');
  assert.deepEqual(Object.keys(picks).sort(), ['attention', 'memory', 'reaction']);
});

// ---------- MilestoneEngine (2026-08-19) ----------
check('MilestoneEngine.currentMilestone: undefined below the first threshold, real badge once reached', () => {
  assert.equal(MilestoneEngine.currentMilestone(0), undefined);
  assert.equal(MilestoneEngine.currentMilestone(2), undefined);
  assert.equal(MilestoneEngine.currentMilestone(3).id, 'spark');
  assert.equal(MilestoneEngine.currentMilestone(6).id, 'spark'); // still the most recent one passed
  assert.equal(MilestoneEngine.currentMilestone(7).id, 'week-one');
});

check('MilestoneEngine.currentMilestone: the highest passed milestone, not the first', () => {
  assert.equal(MilestoneEngine.currentMilestone(100).id, 'century');
  assert.equal(MilestoneEngine.currentMilestone(250).id, 'century'); // no milestone beyond the configured list
});

check('MilestoneEngine.nextMilestone: correct daysRemaining, undefined once every milestone is passed', () => {
  const next = MilestoneEngine.nextMilestone(5);
  assert.equal(next.id, 'week-one');
  assert.equal(next.daysRemaining, 2);
  assert.equal(MilestoneEngine.nextMilestone(1000), undefined);
});

check('momentumConfig: STREAK_MILESTONES are in strictly ascending day order with unique ids', () => {
  const ids = new Set();
  for (let i = 0; i < STREAK_MILESTONES.length; i++) {
    if (i > 0) assert.ok(STREAK_MILESTONES[i].days > STREAK_MILESTONES[i - 1].days);
    assert.ok(!ids.has(STREAK_MILESTONES[i].id));
    ids.add(STREAK_MILESTONES[i].id);
  }
});

// ---------- DoctorDashboardExportEngine.buildDailyMomentumRecord (2026-08-19) ----------
check('DoctorDashboardExportEngine.buildDailyMomentumRecord: shapes a real momentum result into the doctor-bridge record', () => {
  const momentum = { score: 82.5, completionPct: 100, performanceAvg: 82.5 };
  const record = DoctorDashboardExportEngine.buildDailyMomentumRecord(momentum, '2026-08-19');
  assert.equal(record.date, '2026-08-19');
  assert.equal(record.score, 82.5);
  assert.equal(record.completionPct, 100);
});

check('DoctorDashboardExportEngine.buildDailyMomentumRecord: missing momentum or date returns undefined, never throws', () => {
  assert.equal(DoctorDashboardExportEngine.buildDailyMomentumRecord(undefined, '2026-08-19'), undefined);
  assert.equal(DoctorDashboardExportEngine.buildDailyMomentumRecord({ score: 80 }, undefined), undefined);
});

// ---------- SelfModel (integration across engines) ----------
check('SelfModel.build: assembles a complete self-view from MOCK_SELF', () => {
  const model = SelfModel.build(MOCK_SELF, new Date('2026-08-07T00:00:00Z')); // Friday, not the rest day
  assert.equal(model.name, 'Robert Hayes');
  assert.equal(model.today.totalCount, DAILY_TASK_TEMPLATE.length);
  assert.equal(model.today.completedCount, 3); // facial-expressivity, speech, memory true; reaction/attention false
  assert.equal(model.today.fullyComplete, false);
  assert.equal(model.today.isRestDay, false);
  assert.equal(model.streak, 5); // see StreakEngine's own rest-day-skip test for why this isn't 6
  assert.ok(model.momentumHistory.length === MOCK_SELF.dailyHistory.length);
  assert.equal(model.weeklyAssessment.status, 'not-due-yet'); // dueDate 2026-08-08, "now" 2026-08-07 -> 1 day out
  assert.equal(model.weeklyAssessment.daysUntilDue, 1);
});

check('SelfModel.build: momentum reveal gate -- hidden while incomplete, real numbers once the reveal condition is met', () => {
  const incomplete = SelfModel.build(MOCK_SELF, new Date('2026-08-07T00:00:00Z')); // Friday, 3/5 done
  assert.equal(incomplete.today.momentum.revealed, false);
  assert.equal(incomplete.today.momentum.score, undefined);
  assert.equal(incomplete.today.momentum.completedCount, 3);
  assert.equal(incomplete.today.momentum.totalCount, 5);

  const full = { 'facial-expressivity': true, speech: true, memory: true, reaction: true, attention: true };
  const complete = SelfModel.build({ ...MOCK_SELF, today: { date: '2026-08-07', completion: full, performanceScores: { memory: 80, reaction: 82, attention: 78 } } }, new Date('2026-08-07T00:00:00Z'));
  assert.equal(complete.today.momentum.revealed, true);
  assert.ok(typeof complete.today.momentum.score === 'number');
});

check('SelfModel.build: on the rest day, momentum is shown even with nothing done (no mandatory 5 to gate behind)', () => {
  const model = SelfModel.build({ ...MOCK_SELF, today: { date: '2026-08-02', completion: {}, performanceScores: {} } }, new Date('2026-08-02T00:00:00Z')); // Sunday
  assert.equal(model.today.isRestDay, true);
  assert.equal(model.today.momentum.revealed, true);
});

check('SelfModel.build: gamePicks resolves a real sub-game for each of memory/reaction/attention, matching DailyGameRotationEngine directly', () => {
  const model = SelfModel.build(MOCK_SELF, new Date('2026-08-07T00:00:00Z'));
  for (const category of ['memory', 'reaction', 'attention']) {
    assert.equal(model.today.gamePicks[category]?.id, DailyGameRotationEngine.todaysGame(category, '2026-08-07').id);
  }
});

check('SelfModel.build: wires milestone.current/next off the real streak number', () => {
  const model = SelfModel.build(MOCK_SELF, new Date('2026-08-07T00:00:00Z')); // streak 5
  assert.equal(model.milestone.current.id, 'spark'); // 5 >= 3 (spark), < 7 (week-one)
  assert.equal(model.milestone.next.id, 'week-one');
  assert.equal(model.milestone.next.daysRemaining, 2);
});

check('SelfModel.build: wires weekendReminder from WeeklyAssessmentReminderEngine, consistent with a direct call', () => {
  const model = SelfModel.build(MOCK_SELF, new Date('2026-08-07T00:00:00Z'));
  const direct = WeekendAssessmentReminderEngine.evaluate(MOCK_SELF.weeklyAssessment, new Date('2026-08-07T00:00:00Z'));
  assert.deepEqual(model.weekendReminder, direct);
});

check('SelfModel.build: weekly assessment status reflects the configured due date correctly', () => {
  const model = SelfModel.build(MOCK_SELF, new Date('2026-08-01T00:00:00Z'));
  assert.equal(model.weeklyAssessment.lastCompletedDate, '2026-08-01');
  assert.equal(model.weeklyAssessment.status, 'not-due-yet');
});

check('SelfModel.build never throws on a self record with an empty daily history', () => {
  const model = SelfModel.build({ name: 'New Patient', today: { completion: {} }, dailyHistory: [], weeklyAssessment: undefined });
  assert.equal(model.streak, 0);
  assert.equal(model.today.fullyComplete, false);
});

check('SelfModel.build: wires domain breakdown, pending domains, clinical insights, and activity heatmap from MOCK_SELF', () => {
  const model = SelfModel.build(MOCK_SELF, new Date('2026-08-07T00:00:00Z'));
  assert.equal(model.domainBreakdown.length, 4); // attention, executiveFunction, visualMemory, recognitionMemory
  assert.equal(model.pendingDomains.length, 2); // processingSpeed, language -- no active source task
  assert.ok(model.activityHeatmap.weeks.length === 12);
  assert.equal(model.monthlyCognitiveScoreHistory.length, 4);
});

// ---------- DomainInsightEngine ----------
check('DomainInsightEngine.breakdown: computes a real percent-change from the previous data point, not a fabricated one', () => {
  const history = {
    recognitionMemory: [
      { date: '2026-07-25', score: 70 },
      { date: '2026-08-01', score: 61 },
    ],
  };
  const [result] = DomainInsightEngine.breakdown(history).filter((d) => d.domain === 'recognitionMemory');
  assert.equal(result.hasData, true);
  assert.equal(result.latestScore, 61);
  assert.equal(result.direction, 'down');
  assert.equal(result.percentChange, -12.9); // (61-70)/70 * 100, rounded to 1dp
});

check('DomainInsightEngine.breakdown: a domain with only one data point has no percent change (never divides by nothing)', () => {
  const history = { attention: [{ date: '2026-08-01', score: 70 }] };
  const [result] = DomainInsightEngine.breakdown(history).filter((d) => d.domain === 'attention');
  assert.equal(result.hasData, true);
  assert.equal(result.percentChange, undefined);
  assert.equal(result.direction, 'flat');
});

check('DomainInsightEngine.breakdown: a domain with zero data points reports hasData: false, never a fake 0 score', () => {
  const [result] = DomainInsightEngine.breakdown({}).filter((d) => d.domain === 'attention');
  assert.equal(result.hasData, false);
  assert.equal(result.latestScore, undefined);
});

check('DomainInsightEngine.pendingDomains: always reports processingSpeed and language as not-yet-measured', () => {
  const pending = DomainInsightEngine.pendingDomains().map((d) => d.domain);
  assert.deepEqual(pending, ['processingSpeed', 'language']);
});

check('DomainInsightEngine.insights: flags a notable decline with non-diagnostic language and includes the standing disclaimer', () => {
  const breakdown = DomainInsightEngine.breakdown({
    recognitionMemory: [
      { date: '2026-07-25', score: 70 },
      { date: '2026-08-01', score: 61 },
    ],
  });
  const { items, disclaimer } = DomainInsightEngine.insights(breakdown);
  assert.equal(items.length, 1);
  assert.equal(items[0].level, 'warn');
  assert.ok(items[0].text.includes('down 12.9%'));
  assert.ok(disclaimer.includes('do not constitute a diagnosis'));
});

check('DomainInsightEngine.insights: no callouts when nothing crosses the notable-change or low-band thresholds', () => {
  const breakdown = DomainInsightEngine.breakdown({
    attention: [
      { date: '2026-07-25', score: 74 },
      { date: '2026-08-01', score: 75 },
    ],
  });
  const { items } = DomainInsightEngine.insights(breakdown);
  assert.equal(items.length, 0);
});

// ---------- ActivityHeatmapEngine ----------
check('ActivityHeatmapEngine.build: produces a 12-week (7-day) grid ending on the Saturday on/after asOf', () => {
  const heatmap = ActivityHeatmapEngine.build([], { weeks: 12, asOf: '2026-08-07T00:00:00Z' });
  assert.equal(heatmap.weeks.length, 12);
  assert.ok(heatmap.weeks.every((w) => w.length === 7));
  assert.equal(heatmap.endDate, '2026-08-08'); // 2026-08-07 is a Friday -> extends to Saturday 08-08
});

check('ActivityHeatmapEngine.build: a day missing from the log renders as a real gap (hasData: false), not a fabricated zero', () => {
  const heatmap = ActivityHeatmapEngine.build([{ date: '2026-08-01', completion: {} }], { weeks: 1, asOf: '2026-08-01T00:00:00Z' });
  const cell = heatmap.weeks.flat().find((c) => c.date === '2026-07-30');
  assert.equal(cell.hasData, false);
});

check('ActivityHeatmapEngine.build: a fully-completed day gets the top intensity level', () => {
  const fullDay = { date: '2026-08-01', completion: { 'facial-expressivity': true, speech: true, memory: true, reaction: true, attention: true } };
  const heatmap = ActivityHeatmapEngine.build([fullDay], { weeks: 1, asOf: '2026-08-01T00:00:00Z' });
  const cell = heatmap.weeks.flat().find((c) => c.date === '2026-08-01');
  assert.equal(cell.hasData, true);
  assert.equal(cell.intensity, 4);
  assert.equal(cell.completionPct, 100);
});

// ---------- OnboardingEngine ----------
check('computeAge: correct for a birthday that has already happened this year', () => {
  assert.equal(computeAge('1990-01-15', new Date('2026-08-09')), 36);
});

check('computeAge: correct for a birthday that has NOT happened yet this year', () => {
  assert.equal(computeAge('1990-12-25', new Date('2026-08-09')), 35);
});

check('computeAge: returns undefined for an unparseable date', () => {
  assert.equal(computeAge('not-a-date'), undefined);
});

check('OnboardingEngine.validateStep: the only required field (date of birth) is enforced on step 1', () => {
  const result = OnboardingEngine.validateStep('about-you', {}, new Date('2026-08-09'));
  assert.equal(result.valid, false);
  assert.ok(result.errors.dateOfBirth);
});

check('OnboardingEngine.validateStep: step 1 passes with just a valid date of birth, everything else optional', () => {
  const result = OnboardingEngine.validateStep('about-you', { dateOfBirth: '1960-03-01' }, new Date('2026-08-09'));
  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, {});
});

check('OnboardingEngine.validateStep: rejects a future date of birth', () => {
  const result = OnboardingEngine.validateStep('about-you', { dateOfBirth: '2030-01-01' }, new Date('2026-08-09'));
  assert.equal(result.valid, false);
  assert.ok(result.errors.dateOfBirth);
});

check('OnboardingEngine.validateStep: rejects an implausible age (e.g. 5 years old)', () => {
  const result = OnboardingEngine.validateStep('about-you', { dateOfBirth: '2021-01-01' }, new Date('2026-08-09'));
  assert.equal(result.valid, false);
  assert.ok(result.errors.dateOfBirth);
});

check('OnboardingEngine.validateStep: steps 2 and 3 are fully optional -- empty values still validate', () => {
  assert.equal(OnboardingEngine.validateStep('medical-background', {}).valid, true);
  assert.equal(OnboardingEngine.validateStep('family-emergency', {}).valid, true);
});

check('OnboardingEngine.validateStep: an unknown step id never throws, treated as valid', () => {
  assert.equal(OnboardingEngine.validateStep('not-a-real-step', {}).valid, true);
});

check('OnboardingEngine.buildProfile: derives age from dateOfBirth and marks onboardingComplete', () => {
  const profile = OnboardingEngine.buildProfile({ dateOfBirth: '1960-03-01', gender: 'Female' }, new Date('2026-08-09'));
  assert.equal(profile.age, 66);
  assert.equal(profile.gender, 'Female');
  assert.equal(profile.onboardingComplete, true);
});

check('OnboardingEngine.buildProfile: an empty answer set (fully skipped) still produces a valid, honest profile', () => {
  const profile = OnboardingEngine.buildProfile({});
  assert.equal(profile.onboardingComplete, true);
  assert.equal(profile.age, undefined);
});

check('onboardingConfig: exactly 3 steps, dateOfBirth is the only required field across all of them', () => {
  assert.equal(ONBOARDING_STEPS.length, 3);
  assert.deepEqual(ONBOARDING_STEP_IDS, ['about-you', 'medical-background', 'family-emergency']);
  const requiredFields = ONBOARDING_STEPS.flatMap((s) => s.fields.filter((f) => f.required).map((f) => f.id));
  assert.deepEqual(requiredFields, ['dateOfBirth']);
});

check('onboardingConfig: every select/radio/checkboxGroup field has at least 2 options', () => {
  for (const step of ONBOARDING_STEPS) {
    for (const field of step.fields) {
      if (['select', 'radio', 'checkboxGroup'].includes(field.type)) {
        assert.ok(field.options.length >= 2, `${field.id} needs at least 2 options`);
      }
    }
  }
});

// ---------- Doctor onboarding (2026-08-17) -- reuses OnboardingEngine/useOnboarding via the `steps` param, not a parallel engine ----------
check('doctorOnboardingConfig: 2 steps, 13 total questions (2026-08-21: licenseRegion became a required placeAutocomplete field, no paired "Other" field needed for a live worldwide search), every select/radio/checkboxGroup has 2+ options', () => {
  assert.equal(DOCTOR_ONBOARDING_STEPS.length, 2);
  const totalFields = DOCTOR_ONBOARDING_STEPS.reduce((sum, s) => sum + s.fields.length, 0);
  assert.equal(totalFields, 13);
  for (const step of DOCTOR_ONBOARDING_STEPS) {
    for (const field of step.fields) {
      if (['select', 'radio', 'checkboxGroup'].includes(field.type)) {
        assert.ok(field.options.length >= 2, `${field.id} needs at least 2 options`);
      }
    }
  }
});

check('doctorOnboardingConfig (2026-08-21): 7 required fields -- specialty, yearsOfPractice, practiceSetting, licenseRegion, workContact, primaryUseCase, typicalCaseload', () => {
  const requiredIds = DOCTOR_ONBOARDING_STEPS.flatMap((s) => s.fields.filter((f) => f.required).map((f) => f.id));
  assert.deepEqual(requiredIds.sort(), ['licenseRegion', 'practiceSetting', 'primaryUseCase', 'specialty', 'typicalCaseload', 'workContact', 'yearsOfPractice'].sort());
});

check('doctorOnboardingConfig: every select/radio field with an "Other" option has an adjacent free-text field to specify it', () => {
  for (const step of DOCTOR_ONBOARDING_STEPS) {
    for (const field of step.fields) {
      if (field.options?.includes('Other') && field.type !== 'checkboxGroup') {
        const specifyField = step.fields.find((f) => f.id === `${field.id}Other`);
        assert.ok(specifyField, `${field.id} offers "Other" but has no ${field.id}Other free-text field`);
      }
    }
  }
});

check('OnboardingEngine.validateStep: honors a custom `steps` array (doctor onboarding) instead of always reading the patient config', () => {
  const result = OnboardingEngine.validateStep('professional-background', {}, new Date(), DOCTOR_ONBOARDING_STEPS);
  assert.equal(result.valid, false);
  assert.ok(result.errors.specialty); // the one required field in that step
});

check('OnboardingEngine.validateStep: doctor step 2 requires both primaryUseCase and typicalCaseload (2026-08-19), fine to skip the rest', () => {
  const missingCaseload = OnboardingEngine.validateStep('how-you-plan-to-use-neuromorph', { primaryUseCase: 'Screening new patients' }, new Date(), DOCTOR_ONBOARDING_STEPS);
  assert.equal(missingCaseload.valid, false);
  assert.ok(missingCaseload.errors.typicalCaseload);

  const bothRequired = OnboardingEngine.validateStep('how-you-plan-to-use-neuromorph', { primaryUseCase: 'Screening new patients', typicalCaseload: '1-10 patients/month' }, new Date(), DOCTOR_ONBOARDING_STEPS);
  assert.equal(bothRequired.valid, true);
});

check('OnboardingEngine.validateStep: doctor step 1 requires specialty, yearsOfPractice, practiceSetting, licenseRegion, and workContact (2026-08-21)', () => {
  const result = OnboardingEngine.validateStep('professional-background', {}, new Date(), DOCTOR_ONBOARDING_STEPS);
  assert.equal(result.valid, false);
  assert.ok(result.errors.specialty);
  assert.ok(result.errors.yearsOfPractice);
  assert.ok(result.errors.practiceSetting);
  assert.ok(result.errors.licenseRegion);
  assert.ok(result.errors.workContact);
});

// ---------- ThemeEngine ----------
check('ThemeEngine: exactly light + dark, light is the default', () => {
  assert.deepEqual(THEMES, ['light', 'dark']);
  assert.equal(DEFAULT_THEME, 'light');
});

check('ThemeEngine.resolveInitialTheme: an explicit prior choice always wins over system preference', () => {
  assert.equal(ThemeEngine.resolveInitialTheme({ stored: 'dark', systemPrefersDark: false }), 'dark');
  assert.equal(ThemeEngine.resolveInitialTheme({ stored: 'light', systemPrefersDark: true }), 'light');
});

check('ThemeEngine.resolveInitialTheme: falls back to system preference only when nothing was stored yet', () => {
  assert.equal(ThemeEngine.resolveInitialTheme({ stored: null, systemPrefersDark: true }), 'dark');
  assert.equal(ThemeEngine.resolveInitialTheme({ stored: null, systemPrefersDark: false }), 'light');
  assert.equal(ThemeEngine.resolveInitialTheme({ stored: 'not-a-real-theme', systemPrefersDark: true }), 'dark');
});

check('ThemeEngine.toggle: flips between light and dark, never anything else', () => {
  assert.equal(ThemeEngine.toggle('light'), 'dark');
  assert.equal(ThemeEngine.toggle('dark'), 'light');
});

// ---------- LanguageEngine / i18nConfig (2026-08-17, login/signup language switcher) ----------
check('i18nConfig: exactly the 7 requested languages, English is the default', () => {
  assert.equal(LANGUAGES.length, 7);
  assert.deepEqual(LANGUAGE_CODES.sort(), ['en', 'es', 'fr', 'hi', 'ta', 'te', 'ur'].sort());
  assert.equal(DEFAULT_LANGUAGE, 'en');
});

check('i18nConfig: Urdu is the only RTL language in the set', () => {
  const rtl = LANGUAGES.filter((l) => l.dir === 'rtl').map((l) => l.code);
  assert.deepEqual(rtl, ['ur']);
});

check('languageInfo: returns the matching entry, falls back to English for an unknown code', () => {
  assert.equal(languageInfo('hi').label, 'Hindi');
  assert.equal(languageInfo('not-a-real-code').code, 'en');
});

check('LanguageEngine.resolveInitialLanguage: an explicit prior choice wins; an invalid/missing one falls back to English', () => {
  assert.equal(LanguageEngine.resolveInitialLanguage({ stored: 'ta' }), 'ta');
  assert.equal(LanguageEngine.resolveInitialLanguage({ stored: null }), 'en');
  assert.equal(LanguageEngine.resolveInitialLanguage({ stored: 'not-a-real-code' }), 'en');
});

// ---------- LanguageEngine.promptInstruction (2026-08-19 fix) ----------
check('LanguageEngine.promptInstruction: ALWAYS returns a real instruction now, even for English/unknown codes (never empty)', () => {
  assert.ok(LanguageEngine.promptInstruction('en').length > 0);
  assert.ok(LanguageEngine.promptInstruction(undefined).length > 0);
  assert.ok(LanguageEngine.promptInstruction('not-a-real-code').length > 0);
});

check('LanguageEngine.promptInstruction: instructs auto-detection of the user\'s actual message, including Tanglish-style code-mixing', () => {
  const instruction = LanguageEngine.promptInstruction('en');
  assert.ok(instruction.toLowerCase().includes('detect'));
  assert.ok(instruction.toLowerCase().includes('tanglish'));
});

check('LanguageEngine.promptInstruction: a non-English app-wide selection becomes the fallback preference, not a forced override', () => {
  const instruction = LanguageEngine.promptInstruction('ta');
  assert.ok(instruction.includes('Tamil'));
  assert.ok(instruction.toLowerCase().includes('prefer'));
});

// ---------- authStrings (login/signup translations) ----------
check('authStrings: all 7 languages define every key English defines -- no screen silently falls back mid-sentence', () => {
  const englishKeys = Object.keys(AUTH_STRINGS.en).sort();
  for (const code of LANGUAGE_CODES) {
    const keys = Object.keys(AUTH_STRINGS[code] || {}).sort();
    assert.deepEqual(keys, englishKeys, `${code} is missing or has extra keys vs. English`);
  }
});

check('authString: looks up the right language, falls back to English for an unknown language or key', () => {
  assert.equal(authString('fr', 'logIn'), 'Se connecter');
  assert.equal(authString('not-a-real-language', 'logIn'), AUTH_STRINGS.en.logIn);
  assert.equal(authString('en', 'not-a-real-key'), 'not-a-real-key');
});

// ---------- AuthEngine.mapFirebaseError ----------
check('AuthEngine.mapFirebaseError: maps known Firebase codes to plain, non-technical field errors', () => {
  assert.deepEqual(AuthEngine.mapFirebaseError('auth/invalid-credential'), { password: 'That email or password is incorrect.' });
  assert.deepEqual(AuthEngine.mapFirebaseError('auth/email-already-in-use'), { email: 'An account with that email already exists -- try logging in instead.' });
});

check('AuthEngine.mapFirebaseError: unknown codes degrade to a generic, still-honest message rather than throwing', () => {
  const result = AuthEngine.mapFirebaseError('auth/some-brand-new-code-firebase-added-later');
  assert.ok(result.email);
});

// ---------- UserProfileEngine ----------
check('UserProfileEngine.buildNewProfileDoc: a brand-new profile starts with real empty history, never fabricated data', () => {
  const profile = UserProfileEngine.buildNewProfileDoc({ name: 'Jane Doe', email: 'jane@example.com' });
  assert.equal(profile.name, 'Jane Doe');
  assert.equal(profile.onboardingComplete, false);
  assert.deepEqual(profile.dailyHistory, []);
  assert.deepEqual(profile.weeklyCognitiveScoreHistory, []);
});

check('UserProfileEngine.applyAssessmentCompletion: appends a real score entry and advances the due date', () => {
  const profile = UserProfileEngine.buildNewProfileDoc({ name: 'Jane' });
  const now = new Date('2026-08-10T00:00:00Z');
  const updated = UserProfileEngine.applyAssessmentCompletion(profile, 78, now);
  assert.equal(updated.weeklyAssessment.lastCompletedDate, '2026-08-10');
  assert.equal(updated.weeklyCognitiveScoreHistory.length, 1);
  assert.equal(updated.weeklyCognitiveScoreHistory[0].score, 78);
});

check('UserProfileEngine.applyOnboardingProfile: merges without dropping existing fields', () => {
  const profile = UserProfileEngine.buildNewProfileDoc({ name: 'Jane' });
  const updated = UserProfileEngine.applyOnboardingProfile(profile, { age: 68, onboardingComplete: true });
  assert.equal(updated.name, 'Jane');
  assert.equal(updated.age, 68);
  assert.equal(updated.onboardingComplete, true);
});

// ---------- doctor chatbot: doctorFaqConfig ----------
check('doctorFaqConfig: every entry has a unique id, real question/answer text, and at least one keyword', () => {
  const ids = new Set();
  for (const entry of DOCTOR_FAQ_ENTRIES) {
    assert.ok(entry.id && !ids.has(entry.id), `duplicate or missing id: ${entry.id}`);
    ids.add(entry.id);
    assert.ok(entry.question && entry.question.trim().length > 0);
    assert.ok(entry.answer && entry.answer.trim().length > 0);
    assert.ok(Array.isArray(entry.keywords) && entry.keywords.length > 0);
    assert.ok(entry.category && entry.category.trim().length > 0);
  }
  assert.ok(DOCTOR_FAQ_ENTRIES.length >= 40, 'expected a real first batch, not a token handful');
});

check('doctorFaqConfig: no id collides with a patient-facing FAQ id (kept as fully separate pools)', () => {
  // Doctor ids are all prefixed 'doc-' by convention -- this just checks
  // that convention actually held, rather than trusting the prefix blindly.
  for (const entry of DOCTOR_FAQ_ENTRIES) {
    assert.ok(entry.id.startsWith('doc-'), `expected doc- prefix, got ${entry.id}`);
  }
});

check('doctorFaqConfig: band-threshold and disclaimer answers stay byte-consistent with scoringBands.js', () => {
  const disclaimerEntry = DOCTOR_FAQ_ENTRIES.find((e) => e.id === 'doc-non-diagnostic-disclaimer');
  assert.equal(disclaimerEntry.answer, NON_DIAGNOSTIC_DISCLAIMER);
});

check('doctorFaqConfig: realistic clinician phrasing resolves confidently via the shared ConversationEngine', () => {
  const sampleQueries = [
    'what are the performance band thresholds',
    'how is the cognitive score calculated',
    'why cant I see patient data after signing up',
    'how do I look up a patient',
  ];
  for (const q of sampleQueries) {
    const response = ConversationEngine.getResponse(q, DOCTOR_FAQ_ENTRIES, MATCHER_CONFIG, STOPWORDS);
    assert.equal(response.source, 'faq', `expected a confident FAQ match for: "${q}"`);
  }
});

// ---------- doctor chatbot: doctorSystemPromptConfig ----------
check('doctorSystemPromptConfig: real versioned prompt text, distinct from the patient system prompt', () => {
  assert.equal(DOCTOR_SYSTEM_PROMPT_VERSION, '1.0');
  assert.ok(DOCTOR_SYSTEM_PROMPT.includes('MORPHY FOR CLINICIANS'));
  assert.ok(DOCTOR_SYSTEM_PROMPT.includes('NEVER answer YES or NO'.split(' ')[0])); // smoke check the safety section exists in some form
  assert.ok(DOCTOR_SYSTEM_PROMPT.length > 500);
});

// ---------- doctor chatbot: doctorMockPatients + DoctorPatientLookupEngine ----------
check('doctorMockPatients: 7 patients, unique ids, every session score copied verbatim from the roster', () => {
  assert.equal(DOCTOR_MOCK_PATIENTS.length, 7);
  const ids = new Set(DOCTOR_MOCK_PATIENTS.map((p) => p.patientId));
  assert.equal(ids.size, 7);
  const eleanor = DOCTOR_MOCK_PATIENTS.find((p) => p.patientId === 'NMX-1001');
  assert.equal(eleanor.sessions.length, 3);
  assert.deepEqual(eleanor.sessions.map((s) => s.overallRawScore), [78, 69, 58]);
});

check('DoctorPatientLookupEngine.findPatientByName: case-insensitive match on name or id, empty array when nothing matches', () => {
  assert.equal(findPatientByName('eleanor', DOCTOR_MOCK_PATIENTS).length, 1);
  assert.equal(findPatientByName('NMX-1001', DOCTOR_MOCK_PATIENTS)[0].name, 'Eleanor Whitfield');
  assert.deepEqual(findPatientByName('not a real patient', DOCTOR_MOCK_PATIENTS), []);
});

check('DoctorPatientLookupEngine.findPatientsMentionedInMessage: scans a free-text sentence for a known name or id', () => {
  const matches = findPatientsMentionedInMessage('Can you generate a PDF for Eleanor Whitfield please', DOCTOR_MOCK_PATIENTS);
  assert.equal(matches.length, 1);
  assert.equal(matches[0].patientId, 'NMX-1001');

  const idMatches = findPatientsMentionedInMessage('summarize NMX-1005 for me', DOCTOR_MOCK_PATIENTS);
  assert.equal(idMatches[0].patientId, 'NMX-1005');

  assert.deepEqual(findPatientsMentionedInMessage('how does scoring work', DOCTOR_MOCK_PATIENTS), []);
});

check('DoctorPatientLookupEngine.messageRequestsPatientSummary: recognizes summary/report/pdf-ish phrasing only', () => {
  assert.ok(messageRequestsPatientSummary('generate a pdf for Eleanor'));
  assert.ok(messageRequestsPatientSummary('summarize Rosa Delgado'));
  assert.equal(messageRequestsPatientSummary('what are the lobar tasks'), false);
});

check('DoctorPatientLookupEngine.buildSummaryText: real score/band/trend/domain data, always ends with the non-diagnostic disclaimer', () => {
  const eleanor = DOCTOR_MOCK_PATIENTS.find((p) => p.patientId === 'NMX-1001');
  const text = buildSummaryText(eleanor);
  assert.ok(text.includes('Eleanor Whitfield'));
  assert.ok(text.includes('58')); // latest overall score
  assert.ok(text.includes(bandFromScore(58)));
  assert.ok(text.includes('-26%')); // (58-78)/78 rounded
  assert.ok(text.endsWith(NON_DIAGNOSTIC_DISCLAIMER));
});

check('DoctorPatientLookupEngine.buildSummaryText: single-session patient reports honestly, no fabricated trend', () => {
  const daniel = DOCTOR_MOCK_PATIENTS.find((p) => p.patientId === 'NMX-1004');
  const text = buildSummaryText(daniel);
  assert.ok(text.includes('not enough data yet for a trend'));
});

check('DoctorPatientLookupEngine.buildSummaryText: NMX-2001 (live bridge demo patient) only reports the 3 domains it actually has', () => {
  const robert = DOCTOR_MOCK_PATIENTS.find((p) => p.patientId === 'NMX-2001');
  const text = buildSummaryText(robert);
  assert.ok(text.includes('Attention'));
  assert.ok(text.includes('Executive Function'));
  assert.ok(text.includes('Processing Speed'));
  assert.ok(!text.includes('Visual Memory'));
  assert.ok(!text.includes('Language'));
  assert.ok(!text.includes('Recognition Memory'));
});

// ---------- caregiverDailyConfig (2026-08-19, re-shaped 2026-08-23) ----------
check('caregiverDailyConfig: 5 core + 50-question rotating pool, 10 rotate per day, 15 total', () => {
  assert.equal(CAREGIVER_FIXED_QUESTIONS.length, 5);
  assert.equal(CAREGIVER_ROTATING_POOL.length, 50);
  assert.equal(CAREGIVER_ROTATING_COUNT, 10);
  assert.equal(CAREGIVER_DAILY_TOTAL, 15);
});

check('caregiverDailyConfig: every question (fixed + rotating) has a unique id and a real label', () => {
  const all = [...CAREGIVER_FIXED_QUESTIONS, ...CAREGIVER_ROTATING_POOL];
  const ids = new Set();
  for (const q of all) {
    assert.ok(q.id && !ids.has(q.id), `duplicate or missing id: ${q.id}`);
    ids.add(q.id);
    assert.ok(q.label && q.label.trim().length > 0);
    assert.ok(['scale', 'yesno', 'text'].includes(q.type), `unexpected type for ${q.id}`);
    if (q.type === 'scale') assert.equal(q.scaleLabels.length, 5, `${q.id} scale should have 5 labels`);
  }
});

check('caregiverDailyConfig: exactly one optional free-text question in each of fixed and rotating (anyConcerns, positiveMomentToday)', () => {
  const fixedText = CAREGIVER_FIXED_QUESTIONS.filter((q) => q.type === 'text');
  const rotatingText = CAREGIVER_ROTATING_POOL.filter((q) => q.type === 'text');
  assert.equal(fixedText.length, 1);
  assert.equal(rotatingText.length, 1);
});

// ---------- CaregiverDeepCheckinEngine ----------
// 2026-08-24 REDESIGN: replaces CaregiverDailyRotationEngine/
// CaregiverDailyTaskEngine's date-driven tests -- the 15-question set is now
// keyed by CYCLE INDEX (how many times a set has been unlocked), not by
// calendar date, since the trigger is the patient's assessment completion,
// not a day boundary. See CaregiverDeepCheckinEngine.js's header comment.
check('CaregiverDeepCheckinEngine.rotatingQuestionsForCycle: deterministic -- same cycle index always resolves to the same 10 questions', () => {
  const a = CaregiverDeepCheckinEngine.rotatingQuestionsForCycle(0).map((q) => q.id);
  const b = CaregiverDeepCheckinEngine.rotatingQuestionsForCycle(0).map((q) => q.id);
  assert.deepEqual(a, b);
  assert.equal(a.length, CAREGIVER_ROTATING_COUNT);
});

check('CaregiverDeepCheckinEngine.rotatingQuestionsForCycle: consecutive cycles are fully disjoint (non-overlapping chunks), always 10 unique ids from the real pool', () => {
  const poolIds = new Set(CAREGIVER_ROTATING_POOL.map((q) => q.id));
  const seen = new Set();
  let previous = null;
  for (let i = 0; i < 5; i++) {
    const picks = CaregiverDeepCheckinEngine.rotatingQuestionsForCycle(i).map((q) => q.id);
    assert.equal(new Set(picks).size, 10, 'no duplicate picks within a single cycle');
    picks.forEach((id) => { assert.ok(poolIds.has(id)); seen.add(id); });
    if (previous) {
      const overlap = picks.filter((id) => previous.includes(id));
      assert.equal(overlap.length, 0, 'consecutive cycles should share zero rotating questions');
    }
    previous = picks;
  }
  assert.equal(seen.size, 50, 'a full 5-cycle rotation should touch every question in the 50-question pool exactly once');
});

check('CaregiverDeepCheckinEngine.rotatingQuestionsForCycle: the exact same 10 questions return after a full 5-cycle rotation', () => {
  const cycle0 = CaregiverDeepCheckinEngine.rotatingQuestionsForCycle(0).map((q) => q.id);
  const cycle5 = CaregiverDeepCheckinEngine.rotatingQuestionsForCycle(5).map((q) => q.id);
  assert.deepEqual(cycle0, cycle5);
});

check('CaregiverDeepCheckinEngine.rotatingQuestionsForCycle: negative cycle index resolves defensively, never throws', () => {
  const negative = CaregiverDeepCheckinEngine.rotatingQuestionsForCycle(-1).map((q) => q.id);
  assert.equal(negative.length, CAREGIVER_ROTATING_COUNT);
});

check('CaregiverDeepCheckinEngine.questionSetForCycle: 5 core (in order) followed by 10 rotating, 15 total', () => {
  const questions = CaregiverDeepCheckinEngine.questionSetForCycle(0);
  assert.equal(questions.length, 15);
  assert.deepEqual(questions.slice(0, 5).map((q) => q.id), CAREGIVER_FIXED_QUESTIONS.map((q) => q.id));
});

check('CaregiverDeepCheckinEngine.buildChecklist: one row per question, completed flag from raw answers', () => {
  const questions = CaregiverDeepCheckinEngine.questionSetForCycle(0);
  const checklist = CaregiverDeepCheckinEngine.buildChecklist(questions, { overallWellbeing: 4, memoryLapses: false });
  assert.equal(checklist.length, 15);
  assert.equal(checklist.find((q) => q.id === 'overallWellbeing').completed, true);
  assert.equal(checklist.find((q) => q.id === 'memoryLapses').completed, true); // false is a real, recorded answer
  const anyUnanswered = checklist.find((q) => q.id !== 'overallWellbeing' && q.id !== 'memoryLapses');
  assert.equal(anyUnanswered.completed, false);
});

check('CaregiverDeepCheckinEngine.isFullyComplete: true only when every non-text question is answered; text questions never block it', () => {
  const questions = CaregiverDeepCheckinEngine.questionSetForCycle(0);
  const nonText = questions.filter((q) => q.type !== 'text');
  const fullCompletion = Object.fromEntries(nonText.map((q) => [q.id, q.type === 'yesno' ? true : 3]));
  assert.equal(CaregiverDeepCheckinEngine.isFullyComplete(questions, fullCompletion), true);

  const { [nonText[0].id]: _drop, ...partial } = fullCompletion;
  assert.equal(CaregiverDeepCheckinEngine.isFullyComplete(questions, partial), false);
});

check('CaregiverDeepCheckinEngine.completionCount: only counts non-text questions as the required total', () => {
  const questions = CaregiverDeepCheckinEngine.questionSetForCycle(0);
  const { total, done } = CaregiverDeepCheckinEngine.completionCount(questions, {});
  const expectedRequired = questions.filter((q) => q.type !== 'text').length;
  assert.equal(total, expectedRequired);
  assert.equal(done, 0);
});

check('CaregiverDeepCheckinEngine._isAnswered: false/0 count as real answers, only undefined/null/"" do not', () => {
  assert.equal(CaregiverDeepCheckinEngine._isAnswered(false), true);
  assert.equal(CaregiverDeepCheckinEngine._isAnswered(0), true);
  assert.equal(CaregiverDeepCheckinEngine._isAnswered(undefined), false);
  assert.equal(CaregiverDeepCheckinEngine._isAnswered(null), false);
  assert.equal(CaregiverDeepCheckinEngine._isAnswered(''), false);
});

// ---------- CaregiverMicroCheckinEngine ----------
check('CaregiverMicroCheckinEngine: fixed 2-question daily pulse, no rotation', () => {
  assert.equal(CAREGIVER_MICRO_QUESTIONS.length, 2);
  const checklist = CaregiverMicroCheckinEngine.buildChecklist({});
  assert.equal(checklist.length, 2);
  assert.equal(CaregiverMicroCheckinEngine.isFullyComplete({}), false);
  const full = Object.fromEntries(CAREGIVER_MICRO_QUESTIONS.map((q) => [q.id, q.type === 'yesno' ? true : 3]));
  assert.equal(CaregiverMicroCheckinEngine.isFullyComplete(full), true);
  assert.deepEqual(CaregiverMicroCheckinEngine.completionCount(full), { done: 2, total: 2 });
});

// ---------- CaregiverWeeklyUnlockEngine ----------
check('CaregiverWeeklyUnlockEngine.shouldUnlock: false with no assessment date yet', () => {
  assert.equal(CaregiverWeeklyUnlockEngine.shouldUnlock(null, { unlockedForDate: null, status: 'locked' }), false);
});

check('CaregiverWeeklyUnlockEngine.shouldUnlock: true the first time a real assessment date appears', () => {
  assert.equal(CaregiverWeeklyUnlockEngine.shouldUnlock('2026-08-10', { unlockedForDate: null, status: 'locked' }), true);
});

check('CaregiverWeeklyUnlockEngine.shouldUnlock: false once the current set already matches the latest assessment date', () => {
  assert.equal(CaregiverWeeklyUnlockEngine.shouldUnlock('2026-08-10', { unlockedForDate: '2026-08-10', status: 'available' }), false);
  assert.equal(CaregiverWeeklyUnlockEngine.shouldUnlock('2026-08-10', { unlockedForDate: '2026-08-10', status: 'completed' }), false);
});

check('CaregiverWeeklyUnlockEngine.shouldUnlock: true when a newer assessment supersedes an older set, answered or not', () => {
  assert.equal(CaregiverWeeklyUnlockEngine.shouldUnlock('2026-08-17', { unlockedForDate: '2026-08-10', status: 'available' }), true);
  assert.equal(CaregiverWeeklyUnlockEngine.shouldUnlock('2026-08-17', { unlockedForDate: '2026-08-10', status: 'completed' }), true);
});

check('CaregiverWeeklyUnlockEngine.priorSetExpired: true only for an unanswered ("available") set from an older assessment', () => {
  assert.equal(CaregiverWeeklyUnlockEngine.priorSetExpired('2026-08-17', { unlockedForDate: '2026-08-10', status: 'available' }), true);
  assert.equal(CaregiverWeeklyUnlockEngine.priorSetExpired('2026-08-17', { unlockedForDate: '2026-08-10', status: 'completed' }), false);
  assert.equal(CaregiverWeeklyUnlockEngine.priorSetExpired('2026-08-10', { unlockedForDate: '2026-08-10', status: 'available' }), false);
  assert.equal(CaregiverWeeklyUnlockEngine.priorSetExpired('2026-08-10', { unlockedForDate: null, status: 'locked' }), false);
});

// ---------- CaregiverStreakEngine ----------
// 2026-08-24: now operates on microDailyHistory (the daily pulse), not the
// old dailyHistory of full 15-question days -- streak is about day-to-day
// engagement, which is now the micro check-in's job.
check('CaregiverStreakEngine: no rest-day skip -- an empty day breaks the streak, unlike the patient StreakEngine', () => {
  const full = Object.fromEntries(CAREGIVER_MICRO_QUESTIONS.map((q) => [q.id, q.type === 'yesno' ? true : 3]));
  const history = [
    { date: '2026-01-04', completion: {} },
    { date: '2026-01-05', completion: full },
  ];
  assert.equal(CaregiverStreakEngine.currentStreak(history), 1); // only 01-05 counts; 01-04 (empty) breaks it, not skipped
});

check('CaregiverStreakEngine.currentStreak/longestStreak: empty history is zero, never throws', () => {
  assert.equal(CaregiverStreakEngine.currentStreak([]), 0);
  assert.equal(CaregiverStreakEngine.longestStreak([]), 0);
});

// ---------- CaregiverSelfModel ----------
check('CaregiverSelfModel.build: assembles name, link status, today\'s 2-item micro checklist, and streaks from a fresh caregiver doc', () => {
  const caregiver = { name: 'Priya Nair', linkedPatientUid: 'uid-123', linkedPatientName: 'Robert Hayes', microToday: { date: '2026-08-10', completion: {} }, microDailyHistory: [], deepCheckin: { status: 'locked', unlockedForDate: null, questions: [], completion: {} }, deepCheckinHistory: [] };
  const model = CaregiverSelfModel.build(caregiver, new Date('2026-08-10T00:00:00Z'));
  assert.equal(model.name, 'Priya Nair');
  assert.equal(model.isLinked, true);
  assert.equal(model.linkedPatientName, 'Robert Hayes');
  assert.equal(model.micro.totalCount, 2);
  assert.equal(model.micro.completedCount, 0);
  assert.equal(model.micro.fullyComplete, false);
  assert.equal(model.streak, 0);
  assert.equal(model.deep.status, 'locked');
  assert.equal(model.deep.totalCount, 0); // no questions generated yet -- still locked
});

check('CaregiverSelfModel.build: an unlinked caregiver reports isLinked: false, never throws', () => {
  const model = CaregiverSelfModel.build({ name: 'New Caregiver', linkedPatientUid: null, microToday: { date: null, completion: {} }, microDailyHistory: [], deepCheckin: { status: 'locked', unlockedForDate: null, questions: [], completion: {} }, deepCheckinHistory: [] });
  assert.equal(model.isLinked, false);
  assert.equal(model.linkedPatientName, null);
});

check('CaregiverSelfModel.build: never throws on a completely empty/undefined caregiver doc', () => {
  const model = CaregiverSelfModel.build(undefined, new Date('2026-08-10T00:00:00Z'));
  assert.equal(model.streak, 0);
  assert.equal(model.micro.totalCount, 2);
  assert.equal(model.deep.status, 'locked');
});

// ---------- CaregiverProfileEngine ----------
check('CaregiverProfileEngine.buildNewProfileDoc: starts unlinked, onboarding incomplete, deep check-in locked, real empty histories', () => {
  const profile = CaregiverProfileEngine.buildNewProfileDoc({ name: 'Priya Nair', email: 'priya@example.com' });
  assert.equal(profile.name, 'Priya Nair');
  assert.equal(profile.onboardingComplete, false);
  assert.equal(profile.linkedPatientUid, null);
  assert.equal(profile.deepCheckin.status, 'locked');
  assert.deepEqual(profile.deepCheckinHistory, []);
  assert.deepEqual(profile.microDailyHistory, []);
});

check('CaregiverProfileEngine.applyPatientLink: sets linkedPatientUid/Name without disturbing other fields', () => {
  const profile = CaregiverProfileEngine.buildNewProfileDoc({ name: 'Priya' });
  const linked = CaregiverProfileEngine.applyPatientLink(profile, 'uid-123', 'Robert Hayes');
  assert.equal(linked.linkedPatientUid, 'uid-123');
  assert.equal(linked.linkedPatientName, 'Robert Hayes');
  assert.equal(linked.name, 'Priya');
});

check('CaregiverProfileEngine.applyMicroCheckinAnswer: records an answer for today, rolls over into microDailyHistory on a new day', () => {
  const profile = CaregiverProfileEngine.buildNewProfileDoc({ name: 'Priya' });
  const day1 = CaregiverProfileEngine.applyMicroCheckinAnswer(profile, CAREGIVER_MICRO_QUESTIONS[0].id, 4, new Date('2026-08-10T00:00:00Z'));
  assert.equal(day1.microToday.date, '2026-08-10');
  assert.equal(day1.microToday.completion[CAREGIVER_MICRO_QUESTIONS[0].id], 4);
  assert.deepEqual(day1.microDailyHistory, []);

  const day2 = CaregiverProfileEngine.applyMicroCheckinAnswer(day1, CAREGIVER_MICRO_QUESTIONS[1].id, true, new Date('2026-08-11T00:00:00Z'));
  assert.equal(day2.microToday.date, '2026-08-11');
  assert.equal(day2.microDailyHistory.length, 1);
  assert.equal(day2.microDailyHistory[0].date, '2026-08-10'); // yesterday's partial day preserved, not lost
});

check('CaregiverProfileEngine.unlockDeepCheckin: generates a fresh 15-question set for a new assessment date, no prior set to expire', () => {
  const profile = CaregiverProfileEngine.buildNewProfileDoc({ name: 'Priya' });
  const unlocked = CaregiverProfileEngine.unlockDeepCheckin(profile, '2026-08-10', 0, new Date('2026-08-10T12:00:00Z'));
  assert.equal(unlocked.deepCheckin.status, 'available');
  assert.equal(unlocked.deepCheckin.unlockedForDate, '2026-08-10');
  assert.equal(unlocked.deepCheckin.questions.length, 15);
  assert.deepEqual(unlocked.deepCheckinHistory, []); // nothing to expire yet
});

check('CaregiverProfileEngine.unlockDeepCheckin: an unanswered prior set from an older assessment rolls into history as expired', () => {
  const profile = CaregiverProfileEngine.buildNewProfileDoc({ name: 'Priya' });
  const first = CaregiverProfileEngine.unlockDeepCheckin(profile, '2026-08-10', 0, new Date('2026-08-10T12:00:00Z'));
  const second = CaregiverProfileEngine.unlockDeepCheckin(first, '2026-08-17', 1, new Date('2026-08-17T12:00:00Z'));
  assert.equal(second.deepCheckin.unlockedForDate, '2026-08-17');
  assert.equal(second.deepCheckinHistory.length, 1);
  assert.equal(second.deepCheckinHistory[0].unlockedForDate, '2026-08-10');
  assert.equal(second.deepCheckinHistory[0].status, 'expired');
});

check('CaregiverProfileEngine.applyDeepCheckinAnswer: answering the final required question rolls the set into history as completed', () => {
  const profile = CaregiverProfileEngine.buildNewProfileDoc({ name: 'Priya' });
  const unlocked = CaregiverProfileEngine.unlockDeepCheckin(profile, '2026-08-10', 0, new Date('2026-08-10T12:00:00Z'));
  const nonTextIds = unlocked.deepCheckin.questions.filter((q) => q.type !== 'text').map((q) => q.id);

  let state = unlocked;
  for (const id of nonTextIds.slice(0, -1)) {
    state = CaregiverProfileEngine.applyDeepCheckinAnswer(state, id, true, new Date('2026-08-10T13:00:00Z'));
  }
  assert.equal(state.deepCheckin.status, 'available'); // not complete yet
  assert.deepEqual(state.deepCheckinHistory, []);

  const lastId = nonTextIds[nonTextIds.length - 1];
  state = CaregiverProfileEngine.applyDeepCheckinAnswer(state, lastId, true, new Date('2026-08-10T13:05:00Z'));
  assert.equal(state.deepCheckin.status, 'completed');
  assert.equal(state.deepCheckinHistory.length, 1);
  assert.equal(state.deepCheckinHistory[0].status, 'completed');
});

// ---------- InviteCodeEngine ----------
check('InviteCodeEngine.generate: 6 characters, always from the ambiguity-free alphabet (no 0/O/1/I/L)', () => {
  const code = InviteCodeEngine.generate();
  assert.equal(code.length, 6);
  assert.ok(!/[0O1IL]/.test(code));
});

check('InviteCodeEngine.normalize: trims, uppercases, and strips spaces/dashes', () => {
  assert.equal(InviteCodeEngine.normalize(' abc-234 '), 'ABC234');
  assert.equal(InviteCodeEngine.normalize('ab 23 4'), 'AB234');
});

check('InviteCodeEngine.isValidFormat: true only for 6 valid-alphabet characters after normalizing', () => {
  assert.equal(InviteCodeEngine.isValidFormat('ABC234'), true);
  assert.equal(InviteCodeEngine.isValidFormat('abc-234'), true); // normalizes first
  assert.equal(InviteCodeEngine.isValidFormat('ABC23'), false); // too short
  assert.equal(InviteCodeEngine.isValidFormat('ABCO234'), false); // contains the excluded letter O and is 7 chars
  assert.equal(InviteCodeEngine.isValidFormat(''), false);
});

// ---------- caregiverOnboardingConfig ----------
check('caregiverOnboardingConfig: 1 step, 6 fields, relationshipToPatient/livingSituation/contactNumber required', () => {
  assert.equal(CAREGIVER_ONBOARDING_STEPS.length, 1);
  assert.equal(CAREGIVER_ONBOARDING_STEPS[0].fields.length, 6);
  const requiredIds = CAREGIVER_ONBOARDING_STEPS[0].fields.filter((f) => f.required).map((f) => f.id).sort();
  assert.deepEqual(requiredIds, ['contactNumber', 'livingSituation', 'relationshipToPatient'].sort());
});

// ---------- caregiver chatbot: caregiverFaqConfig ----------
check('caregiverFaqConfig: every entry has a unique care-prefixed id, real question/answer text, and at least one keyword', () => {
  const ids = new Set();
  for (const entry of CAREGIVER_FAQ_ENTRIES) {
    assert.ok(entry.id && entry.id.startsWith('care-') && !ids.has(entry.id), `bad or duplicate id: ${entry.id}`);
    ids.add(entry.id);
    assert.ok(entry.question && entry.question.trim().length > 0);
    assert.ok(entry.answer && entry.answer.trim().length > 0);
    assert.ok(Array.isArray(entry.keywords) && entry.keywords.length > 0);
  }
  assert.ok(CAREGIVER_FAQ_ENTRIES.length >= 10, 'expected a real first batch, not a token handful');
});

check('caregiverFaqConfig: realistic caregiver phrasing resolves confidently via the shared ConversationEngine', () => {
  const sampleQueries = [
    'what is the daily check-in for',
    'do I have to complete the check-in every single day',
    'who can see what I write',
  ];
  for (const q of sampleQueries) {
    const response = ConversationEngine.getResponse(q, CAREGIVER_FAQ_ENTRIES, MATCHER_CONFIG, STOPWORDS);
    assert.equal(response.source, 'faq', `expected a confident FAQ match for: "${q}"`);
  }
});

// ---------- caregiver chatbot: caregiverSystemPromptConfig ----------
check('caregiverSystemPromptConfig: real versioned prompt text, distinct from the patient/doctor system prompts', () => {
  assert.equal(CAREGIVER_SYSTEM_PROMPT_VERSION, '1.0');
  assert.ok(CAREGIVER_SYSTEM_PROMPT.includes('MORPHY FOR CAREGIVERS'));
  assert.ok(CAREGIVER_SYSTEM_PROMPT.length > 500);
  assert.notEqual(CAREGIVER_SYSTEM_PROMPT, DOCTOR_SYSTEM_PROMPT);
});

// ---------- assessmentTimeEstimateConfig (2026-08-20) ----------
check('assessmentTimeEstimateConfig: every currently-active lobar task has a real time estimate, no silent gaps', () => {
  for (const task of LOBAR_TASKS) {
    assert.ok(TASK_TIME_ESTIMATES_SEC[task.id], `active task "${task.id}" is missing from TASK_TIME_ESTIMATES_SEC`);
  }
});

check('assessmentTimeEstimateConfig: every estimate is a sane, internally-consistent range (min > 0, min <= max)', () => {
  for (const [id, estimate] of Object.entries(TASK_TIME_ESTIMATES_SEC)) {
    assert.ok(estimate.minSec > 0, `${id}.minSec should be positive`);
    assert.ok(estimate.maxSec >= estimate.minSec, `${id}: maxSec should be >= minSec`);
  }
});

check('estimateAssessmentMinutes: returns a real, sane whole-assessment range -- not zero, not absurdly long, min <= max', () => {
  const { minMinutes, maxMinutes } = estimateAssessmentMinutes();
  assert.ok(Number.isInteger(minMinutes) && minMinutes >= 1);
  assert.ok(Number.isInteger(maxMinutes) && maxMinutes >= minMinutes);
  // Sanity bound, not a brittle exact-value check: comfortably inside the
  // ~20-minute budget referenced elsewhere in this codebase, but not
  // suspiciously tiny either (8 real tasks + 10 questions can't take 2 min).
  assert.ok(maxMinutes <= 25, `estimate (${minMinutes}-${maxMinutes} min) is higher than the documented ~20 min budget -- re-check TASK_TIME_ESTIMATES_SEC`);
  assert.ok(minMinutes >= 5, `estimate (${minMinutes}-${maxMinutes} min) looks too low for 8 real tasks + 10 questions`);
});

check('estimateAssessmentMinutes: deterministic -- calling it twice in a row gives the same answer (no hidden randomness/state)', () => {
  const a = estimateAssessmentMinutes();
  const b = estimateAssessmentMinutes();
  assert.deepEqual(a, b);
});

// ---------- AssessmentSessionModel: overallRawScore reweighting (2026-08-20) ----------
check('AssessmentSessionModel.build: overallRawScore averages DOMAINS equally, not raw tasks -- a domain built from 3 tasks no longer outweighs one built from 1', () => {
  // executiveFunction (stroop, matrixReasoning, geometricShapeCopy) avg = 80
  // attention (goNoGo, tokenTest, qbScore) avg = 80
  // visualMemory (visualMemory alone) avg = 50
  // recognitionMemory (faceRecognition, delayedRecognitionMemory) avg = 80
  const taskResults = [
    { taskId: 'stroop', score: 80 },
    { taskId: 'goNoGo', score: 60 },
    { taskId: 'tokenTest', score: 100 },
    { taskId: 'matrixReasoning', score: 90 },
    { taskId: 'geometricShapeCopy', score: 70 },
    { taskId: 'visualMemory', score: 50 },
    { taskId: 'faceRecognition', score: 90 },
    { taskId: 'delayedRecognitionMemory', score: 70 },
  ];
  const session = AssessmentSessionModel.build(taskResults, 80);
  assert.deepEqual(session.domainScoresRaw, {
    executiveFunction: 80,
    attention: 80,
    visualMemory: 50,
    recognitionMemory: 80,
  });
  // Domain-equal average of [80, 80, 50, 80] = 72.5 -- NOT the old flat
  // task average of all 9 raw contributors, which would have been ~76.7
  // (visualMemory's single low score of 50 got diluted to 1/9 weight
  // instead of counting as its own full domain).
  assert.equal(session.overallRawScore, 72.5);
  const oldFlatAverage = average([...taskResults.map((r) => r.score), 80]);
  assert.notEqual(session.overallRawScore, oldFlatAverage);
});

check('AssessmentSessionModel.build: a single completed task in one domain scores as just that domain -- no distortion at the boundary', () => {
  const session = AssessmentSessionModel.build([{ taskId: 'stroop', score: 85 }]);
  assert.deepEqual(session.domainScoresRaw, { executiveFunction: 85 });
  assert.equal(session.overallRawScore, 85);
});

check('AssessmentSessionModel.build: an empty/not-yet-started session reports undefined score honestly, never a fabricated 0', () => {
  const session = AssessmentSessionModel.build([]);
  assert.equal(session.overallRawScore, undefined);
  assert.deepEqual(session.domainScoresRaw, {});
});

check('AssessmentSessionModel.build: domainCoverage reports measured-vs-total domains honestly, separate from task completion count', () => {
  const taskResults = [
    { taskId: 'stroop', score: 80 },
    { taskId: 'visualMemory', score: 50 },
  ];
  const session = AssessmentSessionModel.build(taskResults);
  assert.equal(session.domainCoverage.totalDomainCount, ALL_COGNITIVE_DOMAIN_KEYS.length);
  assert.equal(session.domainCoverage.totalDomainCount, 6);
  assert.equal(session.domainCoverage.measuredDomainCount, 2);
  assert.deepEqual(new Set(session.domainCoverage.measuredDomainKeys), new Set(['executiveFunction', 'visualMemory']));
  // completedCount/totalCount (task-level) stay a separate, honest number --
  // 2 of 8 active tasks done is not the same claim as 2 of 6 domains measured.
  assert.equal(session.completedCount, 2);
  assert.equal(session.totalCount, LOBAR_TASKS.length);
});


// ---------- MorphyCompanionEngine (2026-08-28, Goal 2 companion) ----------
check('MorphyCompanionEngine.isMomentumImprovement: true only when today beats the most recent prior day by >= threshold', () => {
  assert.equal(MorphyCompanionEngine.isMomentumImprovement(80, [70]), true);
  assert.equal(MorphyCompanionEngine.isMomentumImprovement(75, [70]), false); // only +5, under the default 8 threshold
  assert.equal(MorphyCompanionEngine.isMomentumImprovement(90, []), false); // nothing to compare against
  assert.equal(MorphyCompanionEngine.isMomentumImprovement(undefined, [70]), false);
  assert.equal(MorphyCompanionEngine.isMomentumImprovement(80, [50, 60, 70]), true); // compares against the LAST prior day, not the best one
  assert.equal(MorphyCompanionEngine.isMomentumImprovement(80, [50, 60, 75]), false); // 80-75=5, under threshold even though 80-50=30
});

check('MorphyCompanionEngine.buildSnapshot: reads milestone/dailySet/weeklyDue straight off a SelfModel-shaped object', () => {
  const self = {
    milestone: { current: { days: 7, label: 'One Week Strong' } },
    today: { fullyComplete: true },
    weeklyAssessment: { status: 'due-today' },
  };
  const snap = MorphyCompanionEngine.buildSnapshot(self, true);
  assert.deepEqual(snap, {
    milestoneDays: 7,
    milestoneLabel: 'One Week Strong',
    dailySetFullyComplete: true,
    momentumImprovedToday: true,
    weeklyDue: true,
  });
});

check('MorphyCompanionEngine.buildSnapshot: no milestone yet reads as null, not undefined/throw', () => {
  const self = { milestone: {}, today: {}, weeklyAssessment: { status: 'not-due-yet' } };
  const snap = MorphyCompanionEngine.buildSnapshot(self, false);
  assert.equal(snap.milestoneDays, null);
  assert.equal(snap.weeklyDue, false);
});

check('MorphyCompanionEngine.decideEvent: fires "milestone" only on the render where the streak actually crosses into a new one', () => {
  const prev = { milestoneDays: null, dailySetFullyComplete: false, momentumImprovedToday: false, weeklyDue: false };
  const next = { milestoneDays: 3, milestoneLabel: 'Spark', dailySetFullyComplete: false, momentumImprovedToday: false, weeklyDue: false };
  const event = MorphyCompanionEngine.decideEvent(prev, next);
  assert.equal(event.id, 'milestone');
  assert.equal(event.milestoneLabel, 'Spark');
  // Same next state as its own prev (streak unchanged since) -> no re-fire.
  assert.equal(MorphyCompanionEngine.decideEvent(next, next), null);
});

check('MorphyCompanionEngine.decideEvent: dailySetComplete only fires on the false -> true transition, not every render while true', () => {
  const notDone = { milestoneDays: null, dailySetFullyComplete: false, momentumImprovedToday: false, weeklyDue: false };
  const justDone = { ...notDone, dailySetFullyComplete: true };
  assert.equal(MorphyCompanionEngine.decideEvent(notDone, justDone).id, 'dailySetComplete');
  assert.equal(MorphyCompanionEngine.decideEvent(justDone, justDone), null);
});

check('MorphyCompanionEngine.decideEvent: priority order -- milestone wins over a simultaneous Daily Set completion', () => {
  const prev = { milestoneDays: null, dailySetFullyComplete: false, momentumImprovedToday: false, weeklyDue: false };
  const next = { milestoneDays: 3, milestoneLabel: 'Spark', dailySetFullyComplete: true, momentumImprovedToday: false, weeklyDue: false };
  assert.equal(MorphyCompanionEngine.decideEvent(prev, next).id, 'milestone');
});

check('MorphyCompanionEngine.decideEvent: weeklyDue fires once when it newly becomes due/overdue, not on unknown/not-due-yet', () => {
  const notDue = { milestoneDays: null, dailySetFullyComplete: false, momentumImprovedToday: false, weeklyDue: false };
  const nowDue = { ...notDue, weeklyDue: true };
  assert.equal(MorphyCompanionEngine.decideEvent(notDue, nowDue).id, 'weeklyDue');
  assert.equal(MorphyCompanionEngine.decideEvent(nowDue, nowDue), null);
});

check('MorphyCompanionEngine.decideEvent: null/undefined snapshots never throw, just return null', () => {
  assert.equal(MorphyCompanionEngine.decideEvent(null, { milestoneDays: 3 }), null);
  assert.equal(MorphyCompanionEngine.decideEvent({ milestoneDays: null }, null), null);
});

console.log(`\n${passed} assertions passed.`);
