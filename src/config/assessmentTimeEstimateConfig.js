// A real, derived "how long will this take" estimate for the whole
// Detection Assessment (8 active Lobar Function Test tasks + the 10-item
// Question Bank) -- built from each task's OWN documented/configured
// timing (trial counts, view/delay/response-window durations, existing
// "~X min typical" comments already in each task's config file), not a
// guessed round number. Every line below either cites the source constant
// it's derived from or states the assumption plainly, same documentation
// standard as the rest of this app's config files.
//
// Each task gets a {minSec, maxSec} RANGE, not a single fake-precise
// number -- min assumes a typical/fast responder using little of the
// available time-per-trial, max assumes a slower responder using more of
// it (never the absolute timeout ceiling summed across every trial, which
// would be unrealistically pessimistic -- almost nobody uses the full
// 5-second Stroop timeout on every single trial).
import { LOBAR_TASKS } from './lobarTaskRegistryConfig.js';
import { QUESTION_BANK_INFO } from './lobarConfig.js';

// Fixed "3-2-1-GO" countdown (see TaskCountdown.jsx: 4 steps x 550ms + a
// final 350ms pause = ~2.55s) plays once per task, between its practice and
// scored phases. Rounded up to 3s per task as a small, honest buffer for
// reading each task's on-screen instruction line before the first trial.
const COUNTDOWN_AND_INSTRUCTION_OVERHEAD_SEC = 3;

// Per-task {minSec, maxSec}, keyed by the same task ids used throughout
// lobarTaskRegistryConfig.js.
export const TASK_TIME_ESTIMATES_SEC = {
  // 10 practice + 15 scored = 25 trials (stroopConfig.js). Practice trials
  // pause 650ms for feedback after each answer; scored trials pause 150ms.
  // Typical Stroop RT is well under the 5000ms timeout (STROOP_TRIAL_TIMEOUT_MS)
  // -- assumed ~0.9-1.8s per response here, not the timeout itself.
  // min: 10*(0.9+0.65) + 15*(0.9+0.15) = 15.5+15.75 ~= 31s
  // max: 10*(1.8+0.65) + 15*(1.8+0.15) = 24.5+29.25 ~= 54s
  stroop: { minSec: 31, maxSec: 54 },

  // FIXED duration, not typical -- every trial waits the full
  // RESPONSE_WINDOW_MS (1500ms) before advancing regardless of response
  // speed (see GoNoGoTask.jsx's windowTimer), plus a randomized ITI_MIN_MS-
  // ITI_MAX_MS (800-1200ms) gap. 20 practice + 20 scored = 40 trials.
  // min: 40*(1.5+0.8) = 92s   max: 40*(1.5+1.2) = 108s
  goNoGo: { minSec: 92, maxSec: 108 },

  // 1 practice + 9 scored (3 easy/3 medium/3 hard) = 10 trials, self-paced
  // with generous per-difficulty time LIMITS (TOKEN_TIME_LIMIT_MS: 20-28s)
  // that are ceilings, not typical times -- a token-touching response is
  // assumed ~8-15s typical here.
  tokenTest: { minSec: 80, maxSec: 150 },

  // Cited directly from matrixReasoningConfig.js's own header comment:
  // "the teammate's own default... README documents this as a ~60-110s
  // typical session" -- same 1-practice + 6-scored plan used here.
  matrixReasoning: { minSec: 60, maxSec: 110 },

  // Cited directly from geometricShapeCopyConfig.js's TIME-BUDGET
  // CALIBRATION comment: "~3-4 min typical" for the 1-practice + 6-scored
  // (2 easy/2 medium/2 hard) sequence used here.
  geometricShapeCopy: { minSec: 180, maxSec: 240 },

  // 1 practice + 3 scored (easy/medium/hard). FIXED view + delay portions
  // from visualMemoryConfig.js (DIFFICULTY_CONFIG.viewSec, DELAY_SEC=10):
  // practice(assume easy tier, 15+10) + easy(15+10) + medium(12+10) +
  // hard(10+10) = 25+25+22+20 = 92s fixed, plus a variable recognition
  // response per trial (cap RECOGNITION_MAX_SEC=30s; assumed ~6-15s
  // typical) across the 4 trials (practice + 3 scored).
  // min: 92 + 4*6 = 116s   max: 92 + 4*15 = 152s
  visualMemory: { minSec: 116, maxSec: 152 },

  // 1 practice + 3 scored (easy/medium/hard). FIXED observation windows
  // from faceRecognitionConfig.js's DIFFICULTY_TIERS.observationMs:
  // practice(assume easy, 8s) + easy(8s) + medium(9s) + hard(10s) = 35s
  // fixed, plus a variable recognition response per trial (cap
  // RECOGNITION_TIMEOUT_MS=30s; assumed ~5-12s typical) across 4 trials.
  // min: 35 + 4*5 = 55s   max: 35 + 4*12 = 83s
  faceRecognition: { minSec: 55, maxSec: 83 },

  // Deliberately last (see lobarTaskRegistryConfig.js) -- no new study
  // material, just a countdown then one recognition trial per retrieved
  // category (typically 2: the object set from Visual Memory Test and the
  // face set from Face Recognition Test, via StudyItemRegistry). Each
  // capped at RECOGNITION_MAX_SEC=30s (delayedRecognitionMemoryConfig.js);
  // assumed ~8-15s typical response per category.
  // min: 2*8 = 16s   max: 2*15 = 30s
  delayedRecognitionMemory: { minSec: 16, maxSec: 30 },
};

// The Question Bank isn't in LOBAR_TASKS (it's the 13th run-order step,
// see AssessmentSection.jsx), so it's estimated separately: 10 untimed,
// 4-choice multiple-choice questions (questionBankConfig.js has no
// per-question timer), assumed ~8-15s typical reading+choosing time each.
const QUESTION_BANK_TIME_SEC = {
  minSec: QUESTION_BANK_INFO.totalQuestions * 8,
  maxSec: QUESTION_BANK_INFO.totalQuestions * 15,
};

// Sums every currently-ACTIVE lobar task's estimate (so a future re-enable
// or retirement of a task via lobarTaskRegistryConfig.js's `active` flag
// automatically updates this total, nothing to hand-edit here) plus the
// Question Bank and one countdown/instruction buffer per task.
function computeTotalRangeSec() {
  let minSec = QUESTION_BANK_TIME_SEC.minSec;
  let maxSec = QUESTION_BANK_TIME_SEC.maxSec;

  for (const task of LOBAR_TASKS) {
    const estimate = TASK_TIME_ESTIMATES_SEC[task.id];
    if (!estimate) continue; // a newly-activated task without an estimate yet -- don't crash, just omit it
    minSec += estimate.minSec + COUNTDOWN_AND_INSTRUCTION_OVERHEAD_SEC;
    maxSec += estimate.maxSec + COUNTDOWN_AND_INSTRUCTION_OVERHEAD_SEC;
  }

  return { minSec, maxSec };
}

// Public API: whole-assessment estimate in whole minutes (floor the low
// end, ceil the high end, so the displayed range never overstates the
// fast case or understates the slow one). As of the 8-task Final 8 lineup,
// this computes to roughly 12-18 minutes -- comfortably inside the
// ~20-minute Detection Assessment time budget referenced in several other
// config files' own comments (matrixReasoningConfig.js,
// geometricShapeCopyConfig.js, visualMemoryConfig.js), which is a good
// independent sanity check that this estimate isn't wildly off.
export function estimateAssessmentMinutes() {
  const { minSec, maxSec } = computeTotalRangeSec();
  return {
    minMinutes: Math.max(1, Math.floor(minSec / 60)),
    maxMinutes: Math.ceil(maxSec / 60),
  };
}
