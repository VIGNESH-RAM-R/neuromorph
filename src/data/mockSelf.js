// Mock data for the logged-in patient's own view. Stands in for whatever
// backend eventually stores per-user daily completion and performance --
// see README "What's real vs. mocked" for the swap-in path, same philosophy
// used in the Doctor Dashboard's mockPatients.js.
//
// Only RAW facts live here (what was completed, what score resulted).
// Streaks and Momentum Score are always computed from this by the engines,
// never hardcoded, so there is exactly one source of truth per day.
function day(date, completion, performanceScores = {}) {
  return { date, completion, performanceScores };
}

function isoDate(d) {
  return d.toISOString().slice(0, 10);
}

// Generates a deterministic (not Math.random -- repeatable, no test
// flakiness) ~12-week activity log ending YESTERDAY relative to whenever
// this module loads, purely so the Activity Heatmap card on the Progress
// screen looks freshly populated no matter which of the next few days this
// gets demoed on, rather than pinned to a hardcoded past date the way
// dailyHistory above is (dailyHistory stays untouched -- streak/momentum
// tests depend on its exact shape). This is demo/mock data like everything
// else in this file, not a real backend log -- see file header.
// 2026-08-19: keys updated to the new 5-item Daily Set shape (face, speech,
// memory, reaction, attention) -- see dailyTaskConfig.js's header comment
// for why 'rotating-game' (a single slot covering all 3 games) and
// 'daily-questions' (never wired to a real component) were retired.
function buildDemoActivityLog(weeks = 12) {
  const totalDays = weeks * 7;
  const end = new Date();
  end.setUTCHours(0, 0, 0, 0);
  end.setUTCDate(end.getUTCDate() - 1); // ends yesterday, so "today" is always an honest gap, not a fake pre-filled day
  const log = [];
  for (let i = totalDays - 1; i >= 0; i--) {
    const d = new Date(end.getTime() - i * 24 * 60 * 60 * 1000);
    const cycle = (totalDays - 1 - i) % 9; // repeating 9-day pattern: mostly-full weeks with the occasional light/missed day
    let completion;
    let performanceScores;
    if (cycle === 4) {
      // one lighter day per cycle -- partial set, matches dailyHistory's own precedent of one broken day
      completion = { 'facial-expressivity': false, speech: true, memory: true, reaction: true, attention: false };
      performanceScores = { speech: 66 + (i % 4), memory: 70 + (i % 5), reaction: 71 + (i % 4) };
    } else if (cycle === 8) {
      // one fully-missed day per cycle -- realistic, not every day is perfect
      completion = {};
      performanceScores = {};
    } else {
      completion = { 'facial-expressivity': true, speech: true, memory: true, reaction: true, attention: true };
      performanceScores = { 'facial-expressivity': 70 + (i % 6), speech: 68 + (i % 7), memory: 72 + (i % 9), reaction: 74 + (i % 8), attention: 71 + (i % 6) };
    }
    log.push(day(isoDate(d), completion, performanceScores));
  }
  return log;
}

export const MOCK_SELF = {
  name: 'Robert Hayes',
  age: 72,
  patientId: 'NMX-2001',

  // Robert is the established demo patient -- logging IN as him should
  // never re-trigger onboarding. A fresh signup explicitly overrides this
  // to `false` in useAuth.js regardless of this default (see signup()).
  onboardingComplete: true,

  // Today's own live state -- what the Home screen's checklist reads from.
  // 2026-08-07 is a Friday (not the Sunday rest day) -- 3 of the 5 mandatory
  // items done, so the Momentum Score stays hidden (reveal gate) until the
  // remaining 2 are finished. See dailyTaskConfig.js for the 5-item shape.
  today: {
    date: '2026-08-07',
    completion: { 'facial-expressivity': true, speech: true, memory: true, reaction: false, attention: false },
    performanceScores: { 'facial-expressivity': 82, speech: 79, memory: 84 },
  },

  // Last 10 completed days, oldest -> newest. Deliberately includes one
  // partial day (2026-07-31, breaks the streak) AND one real rest day
  // (2026-08-02, a Sunday -- shown as a genuine day off, completion: {} --
  // to demonstrate the streak-skip behavior: StreakEngine.currentStreak
  // over this exact history is 5, not 6, because it skips clean over the
  // rest day rather than counting an empty day as "kept" or "broken").
  dailyHistory: [
    day('2026-07-28', { 'facial-expressivity': true, speech: true, memory: true, reaction: true, attention: true }, { 'facial-expressivity': 70, speech: 68, memory: 71, reaction: 69, attention: 72 }),
    day('2026-07-29', { 'facial-expressivity': true, speech: true, memory: true, reaction: true, attention: true }, { 'facial-expressivity': 72, speech: 70, memory: 73, reaction: 71, attention: 74 }),
    day('2026-07-30', { 'facial-expressivity': true, speech: true, memory: true, reaction: true, attention: true }, { 'facial-expressivity': 74, speech: 71, memory: 75, reaction: 73, attention: 75 }),
    day('2026-07-31', { 'facial-expressivity': false, speech: true, memory: true, reaction: true, attention: true }, { speech: 69, memory: 74, reaction: 72, attention: 73 }),
    day('2026-08-01', { 'facial-expressivity': true, speech: true, memory: true, reaction: true, attention: true }, { 'facial-expressivity': 75, speech: 73, memory: 76, reaction: 74, attention: 76 }),
    day('2026-08-02', {}, {}), // Sunday -- the designated rest day, genuinely nothing played
    day('2026-08-03', { 'facial-expressivity': true, speech: true, memory: true, reaction: true, attention: true }, { 'facial-expressivity': 76, speech: 74, memory: 78, reaction: 75, attention: 77 }),
    day('2026-08-04', { 'facial-expressivity': true, speech: true, memory: true, reaction: true, attention: true }, { 'facial-expressivity': 78, speech: 77, memory: 79, reaction: 77, attention: 78 }),
    day('2026-08-05', { 'facial-expressivity': true, speech: true, memory: true, reaction: true, attention: true }, { 'facial-expressivity': 80, speech: 78, memory: 81, reaction: 79, attention: 80 }),
    day('2026-08-06', { 'facial-expressivity': true, speech: true, memory: true, reaction: true, attention: true }, { 'facial-expressivity': 81, speech: 80, memory: 83, reaction: 81, attention: 82 }),
  ],

  // The weekly formal Detection Assessment -- separate cadence from the
  // daily set above.
  weeklyAssessment: {
    lastCompletedDate: '2026-08-01',
    dueDate: '2026-08-08',
  },

  // Overall weekly Cognitive Score history, for the Progress section's
  // trend chart.
  weeklyCognitiveScoreHistory: [
    { date: '2026-07-04', score: 74 },
    { date: '2026-07-11', score: 75 },
    { date: '2026-07-18', score: 77 },
    { date: '2026-07-25', score: 76 },
    { date: '2026-08-01', score: 78 },
  ],

  // Monthly rollup of the same overall Cognitive Score -- a coarser trend
  // for the "Monthly Trend" card, same score scale (0-100), same chart
  // component, just fewer/wider-spaced points.
  monthlyCognitiveScoreHistory: [
    { date: '2026-05-01', score: 69 },
    { date: '2026-06-01', score: 72 },
    { date: '2026-07-01', score: 75 },
    { date: '2026-08-01', score: 78 },
  ],

  // Per-domain weekly score history -- same 5 dates as
  // weeklyCognitiveScoreHistory above, one array per domain that currently
  // has an ACTIVE source task (see domainInsightConfig.js -- processingSpeed
  // and language are intentionally absent; no active task feeds them yet,
  // so DomainInsightEngine reports them as "not measured" rather than this
  // file inventing a number). recognitionMemory's real dip and attention's
  // real uptick here are deliberate -- they're what produce the "-13%" /
  // "+8%"-style callouts on the dashboard, not scripted display text.
  domainScoreHistory: {
    attention: [
      { date: '2026-07-04', score: 66 },
      { date: '2026-07-11', score: 68 },
      { date: '2026-07-18', score: 70 },
      { date: '2026-07-25', score: 65 },
      { date: '2026-08-01', score: 70 },
    ],
    executiveFunction: [
      { date: '2026-07-04', score: 72 },
      { date: '2026-07-11', score: 74 },
      { date: '2026-07-18', score: 77 },
      { date: '2026-07-25', score: 79 },
      { date: '2026-08-01', score: 81 },
    ],
    visualMemory: [
      { date: '2026-07-04', score: 75 },
      { date: '2026-07-11', score: 77 },
      { date: '2026-07-18', score: 74 },
      { date: '2026-07-25', score: 70 },
      { date: '2026-08-01', score: 73 },
    ],
    recognitionMemory: [
      { date: '2026-07-04', score: 80 },
      { date: '2026-07-11', score: 78 },
      { date: '2026-07-18', score: 75 },
      { date: '2026-07-25', score: 70 },
      { date: '2026-08-01', score: 61 },
    ],
  },

  // Feeds the Activity Heatmap card -- see buildDemoActivityLog above for
  // why this is generated relative to "today" rather than hardcoded like
  // dailyHistory.
  activityLog: buildDemoActivityLog(12),
};
