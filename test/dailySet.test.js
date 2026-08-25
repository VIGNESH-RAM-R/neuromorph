import assert from 'node:assert/strict';

import { DAILY_TASK_TEMPLATE, DAILY_TASK_KEYS } from '../src/config/dailyTaskConfig.js';
import { DailyTaskEngine } from '../src/engines/DailyTaskEngine.js';
import { MomentumScoreEngine } from '../src/engines/MomentumScoreEngine.js';
import { StreakEngine } from '../src/engines/StreakEngine.js';
import { UserProfileEngine } from '../src/engines/UserProfileEngine.js';
import { round1 } from '../src/engines/mathUtils.js';
import {
  BaselineNormalizationEngine, ExpressivityMetricsEngine, ResponseLatencyEngine,
  BlinkRateEngine, SymmetryEngine, InterpretationEngine, SessionAssemblyEngine, FacialExpressivityEngine,
} from '../src/engines/FacialExpressivityEngine.js';
import { PROMPT_SEQUENCE, CALIBRATION_DURATION_MS, EXPRESSIVITY_CHANNELS } from '../src/config/facialExpressivityConfig.js';

let passed = 0;
function check(name, fn) {
  try { fn(); passed++; } catch (err) { console.error(`FAIL: ${name}`); throw err; }
}

// ---------- dailyTaskConfig / DailyTaskEngine ----------
// 2026-08-19: updated for the 5-item Daily Set redesign (face, speech,
// memory, reaction, attention) -- see dailyTaskConfig.js's header comment.
check('DAILY_TASK_TEMPLATE: exactly the 5 agreed items, facial-expressivity among them', () => {
  assert.equal(DAILY_TASK_TEMPLATE.length, 5);
  assert.ok(DAILY_TASK_KEYS.includes('facial-expressivity'));
  assert.ok(DAILY_TASK_KEYS.includes('speech'));
  assert.ok(DAILY_TASK_KEYS.includes('memory'));
  assert.ok(DAILY_TASK_KEYS.includes('reaction'));
  assert.ok(DAILY_TASK_KEYS.includes('attention'));
});

check('DailyTaskEngine.buildChecklist: marks completed items from a raw completion map', () => {
  const checklist = DailyTaskEngine.buildChecklist({ 'facial-expressivity': true });
  const item = checklist.find((t) => t.id === 'facial-expressivity');
  assert.equal(item.completed, true);
  assert.equal(checklist.find((t) => t.id === 'speech').completed, false);
});

check('DailyTaskEngine.isFullyComplete: requires every template item, not just some', () => {
  const full = { 'facial-expressivity': true, speech: true, memory: true, reaction: true, attention: true };
  assert.equal(DailyTaskEngine.isFullyComplete(full), true);
  assert.equal(DailyTaskEngine.isFullyComplete({ memory: true }), false);
  assert.equal(DailyTaskEngine.isFullyComplete({}), false);
});

// ---------- MomentumScoreEngine ----------
check('MomentumScoreEngine.scoreForDay: falls back to completion-only when nothing performance-bearing is done yet', () => {
  const result = MomentumScoreEngine.scoreForDay({ completion: { 'facial-expressivity': true }, performanceScores: {} });
  assert.equal(result.performanceAvg, undefined);
  assert.equal(result.score, result.completionPct);
});

check('MomentumScoreEngine.scoreForDay: blends completion and performance once both exist', () => {
  const day = {
    completion: { 'facial-expressivity': true, speech: true, memory: true, reaction: true, attention: true },
    performanceScores: { 'facial-expressivity': 70, speech: 60, memory: 90 },
  };
  const result = MomentumScoreEngine.scoreForDay(day);
  assert.equal(result.completionPct, 100);
  assert.equal(result.performanceAvg, round1((70 + 60 + 90) / 3));
  assert.equal(result.score, round1(100 * 0.5 + result.performanceAvg * 0.5));
});

// ---------- StreakEngine ----------
check('StreakEngine.currentStreak: counts consecutive fully-complete days back from the most recent', () => {
  const full = { 'facial-expressivity': true, speech: true, memory: true, reaction: true, attention: true };
  const history = [
    // 2026-08-10/11 are a Monday/Tuesday -- no rest day in this window, so
    // this exercises the plain break case, not the rest-day skip (that has
    // its own dedicated tests in engines.test.js).
    { date: '2026-08-10', completion: full },
    { date: '2026-08-11', completion: full },
    { date: '2026-08-12', completion: { speech: true } }, // broke the streak
  ];
  assert.equal(StreakEngine.currentStreak(history), 0);
  assert.equal(StreakEngine.currentStreak(history.slice(0, 2)), 2);
});

// ---------- UserProfileEngine.applyDailyTaskCompletion ----------
check('applyDailyTaskCompletion: marks a task complete and records its score for today', () => {
  const profile = { today: { date: '2026-08-14', completion: {}, performanceScores: {} }, dailyHistory: [] };
  const updated = UserProfileEngine.applyDailyTaskCompletion(profile, 'facial-expressivity', 72, new Date('2026-08-14T10:00:00Z'));
  assert.equal(updated.today.completion['facial-expressivity'], true);
  assert.equal(updated.today.performanceScores['facial-expressivity'], 72);
  assert.equal(updated.dailyHistory.length, 0); // same day, nothing archived
});

check('applyDailyTaskCompletion: rolls yesterday into dailyHistory when the calendar date has moved on', () => {
  const profile = { today: { date: '2026-08-13', completion: { speech: true }, performanceScores: { speech: 60 } }, dailyHistory: [] };
  const updated = UserProfileEngine.applyDailyTaskCompletion(profile, 'facial-expressivity', 80, new Date('2026-08-14T09:00:00Z'));
  assert.equal(updated.dailyHistory.length, 1);
  assert.equal(updated.dailyHistory[0].date, '2026-08-13');
  assert.equal(updated.today.date, '2026-08-14');
  assert.equal(updated.today.completion.speech, undefined); // fresh day, doesn't carry over
  assert.equal(updated.today.completion['facial-expressivity'], true);
});

check('applyDailyTaskCompletion: a non-numeric score still marks completion without inventing a performance number', () => {
  const profile = { today: { date: '2026-08-14', completion: {}, performanceScores: {} }, dailyHistory: [] };
  const updated = UserProfileEngine.applyDailyTaskCompletion(profile, 'attention', undefined, new Date('2026-08-14T10:00:00Z'));
  assert.equal(updated.today.completion.attention, true);
  assert.equal(updated.today.performanceScores.attention, undefined);
});

// ---------- FacialExpressivityEngine (real teammate project, face_module) ----------
function makeFrame(t, overrides = {}) {
  return { timestampMs: t, blendshapes: { mouthSmileLeft: 0, mouthSmileRight: 0, eyeBlinkLeft: 0, eyeBlinkRight: 0, ...overrides } };
}

check('BaselineNormalizationEngine.computeBaseline: averages each channel across baseline frames', () => {
  const frames = [makeFrame(0, { mouthSmileLeft: 0.1 }), makeFrame(150, { mouthSmileLeft: 0.3 })];
  const baseline = BaselineNormalizationEngine.computeBaseline(frames, { mouthSmileLeft: 1 });
  assert.equal(baseline.mouthSmileLeft, 0.2);
});

check('BaselineNormalizationEngine.computeBaseline: channels with no data default to 0, never throw', () => {
  const baseline = BaselineNormalizationEngine.computeBaseline([], EXPRESSIVITY_CHANNELS);
  assert.equal(baseline.mouthSmileLeft, 0);
});

check('ExpressivityMetricsEngine.scorePrompt: peak deviation from baseline drives the score, not the raw value', () => {
  const baseline = { mouthSmileLeft: 0.1 };
  const frames = [makeFrame(0, { mouthSmileLeft: 0.1 }), makeFrame(150, { mouthSmileLeft: 0.9 })];
  const config = { channelWeights: { mouthSmileLeft: 1 } };
  const result = ExpressivityMetricsEngine.scorePrompt(frames, baseline, config);
  assert.ok(result.score > 70, `expected a high score from a strong deviation, got ${result.score}`);
});

check('ResponseLatencyEngine.detectLatency: returns null (not 0) when no channel ever crosses the threshold', () => {
  const baseline = { mouthSmileLeft: 0 };
  const frames = [makeFrame(0, { mouthSmileLeft: 0.02 }), makeFrame(150, { mouthSmileLeft: 0.03 })];
  const config = { channelWeights: { mouthSmileLeft: 1 }, reactionThreshold: 0.12 };
  assert.equal(ResponseLatencyEngine.detectLatency(frames, baseline, config), null);
});

check('ResponseLatencyEngine.detectLatency: returns the timestamp of the first real crossing', () => {
  const baseline = { mouthSmileLeft: 0 };
  const frames = [makeFrame(0, { mouthSmileLeft: 0.02 }), makeFrame(300, { mouthSmileLeft: 0.5 })];
  const config = { channelWeights: { mouthSmileLeft: 1 }, reactionThreshold: 0.12 };
  assert.equal(ResponseLatencyEngine.detectLatency(frames, baseline, config), 300);
});

check('BlinkRateEngine.detectBlinks: counts a rising-edge crossing as one blink, debounced', () => {
  const frames = [
    makeFrame(0, { eyeBlinkLeft: 0.1, eyeBlinkRight: 0.1 }),
    makeFrame(150, { eyeBlinkLeft: 0.8, eyeBlinkRight: 0.8 }), // blink 1
    makeFrame(300, { eyeBlinkLeft: 0.7, eyeBlinkRight: 0.7 }), // still up, debounced -- not a second blink
    makeFrame(450, { eyeBlinkLeft: 0.1, eyeBlinkRight: 0.1 }),
  ];
  const blinks = BlinkRateEngine.detectBlinks(frames, 0.5, 250);
  assert.equal(blinks.length, 1);
});

check('BlinkRateEngine.blinkRateFromWindows: never throws on an empty session, rate comes back null not NaN', () => {
  const result = BlinkRateEngine.blinkRateFromWindows([]);
  assert.equal(result.blinkCount, 0);
  assert.equal(result.blinkRatePerMinute, null);
});

check('SymmetryEngine.computeOverallSymmetry: identical left/right movement scores 100', () => {
  const { overallSymmetryScore } = SymmetryEngine.computeOverallSymmetry({ mouthSmileLeft: 0.5, mouthSmileRight: 0.5 }, [['mouthSmileLeft', 'mouthSmileRight']]);
  assert.equal(overallSymmetryScore, 100);
});

check('SymmetryEngine.computeOverallSymmetry: lopsided movement scores below 100', () => {
  const { overallSymmetryScore } = SymmetryEngine.computeOverallSymmetry({ mouthSmileLeft: 0.9, mouthSmileRight: 0.1 }, [['mouthSmileLeft', 'mouthSmileRight']]);
  assert.ok(overallSymmetryScore < 100);
});

check('InterpretationEngine.interpret: every band always carries the non-removable confound caveat', () => {
  for (const score of [10, 30, 50, 90]) {
    const result = InterpretationEngine.interpret(score);
    assert.ok(result.caveat && result.caveat.length > 20);
  }
});

check('SessionAssemblyEngine.assemble: never throws on an empty (no-frames) session', () => {
  const { sessionMetrics } = SessionAssemblyEngine.assemble({}, PROMPT_SEQUENCE, undefined, undefined, { calibrationFrames: [], calibrationDurationMs: CALIBRATION_DURATION_MS });
  assert.equal(sessionMetrics.overallExpressivityScore, 0);
  // Capture windows still have real durations even with zero frames in
  // them, so the rate is a real 0, not null -- null is reserved for when
  // there's genuinely no window duration to divide by at all.
  assert.equal(sessionMetrics.blinkRatePerMinute, 0);
});

check('FacialExpressivityEngine.score: returns a 0-100 score field for MomentumScoreEngine to consume', () => {
  const framesByPromptId = {};
  for (const p of PROMPT_SEQUENCE) {
    framesByPromptId[p.id] = p.type === 'stimulus'
      ? [makeFrame(0, { mouthSmileLeft: 0.05 }), makeFrame(150, { mouthSmileLeft: 0.6 })]
      : [makeFrame(0, { mouthSmileLeft: 0.05 })];
  }
  const raw = FacialExpressivityEngine.score({
    sessionId: 'test', framesByPromptId, promptSequence: PROMPT_SEQUENCE,
    startedAt: 1000, completedAt: 41000, completed: true,
    calibrationFrames: [], calibrationDurationMs: CALIBRATION_DURATION_MS,
  });
  assert.ok(typeof raw.score === 'number' && raw.score >= 0 && raw.score <= 100);
  assert.equal(raw.testName, 'Facial Expressivity Test');
  assert.ok(raw.interpretationCaveat);
});

check('FacialExpressivityEngine.score: a fully-empty session (no camera data) never throws, scores 0', () => {
  const raw = FacialExpressivityEngine.score({
    sessionId: 'test', framesByPromptId: {}, promptSequence: PROMPT_SEQUENCE,
    startedAt: 1000, completedAt: 2000, completed: false,
    calibrationFrames: [], calibrationDurationMs: CALIBRATION_DURATION_MS,
  });
  assert.equal(raw.score, 0);
  assert.equal(raw.completed, false);
});

console.log(`\n${passed} assertions passed.`);
