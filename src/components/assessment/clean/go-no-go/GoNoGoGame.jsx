import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";

/* =========================================================================
   NeuroTrack — Go/No-Go Test
   Response inhibition / executive-function screening module. Same clinical
   instrumentation design language as the rest of the NeuroTrack suite
   (Trail Making Test, etc.): navy/blue diagnostic palette, monospaced data
   tiles, a single deliberate motion cue, no game-like feedback during the
   scored assessment.
   ========================================================================= */

/* ---------------------------- Configuration ------------------------------ */
const CONFIG = {
  TEST_NAME: "Go/No-Go Test",
  TEST_VERSION: "1.0.0",
  DOMAINS: [
    "Executive Function",
    "Response Inhibition",
    "Impulse Control",
    "Sustained Attention",
    "Selective Attention",
    "Vigilance",
    "Processing Speed",
    "Cognitive Control",
  ],
  // Was 20 practice trials — reported as too many for a practice round
  // (the scored round is also 20, so practice ran exactly as long as the
  // real thing). 8 GO / 2 NO-GO keeps the same 20% NO-GO ratio as before.
  PRACTICE_TRIAL_COUNT: 10,
  PRACTICE_NOGO_COUNT: 2, // 8 GO / 2 NO-GO, no forced repeats - keep practice predictable
  PRACTICE_MAX_RUN_LENGTH: 4,

  SCORED_TRIAL_COUNT: 20,
  SCORED_NOGO_COUNT: 7, // 13 GO / 7 NO-GO - deliberately harder ratio than practice
  SCORED_MAX_RUN_LENGTH: 4,
  // NO-GO trials are normally spaced apart, but the scored deck randomly
  // allows 1-2 back-to-back NO-GO pairs per session (never forced, never
  // more than 2 in a row) so participants can't learn "it never repeats".
  SCORED_ALLOW_REPEAT_NOGO: true,

  STIMULUS_DISPLAY_MS: 1000,
  RESPONSE_WINDOW_MS: 1500,
  ITI_MIN_MS: 800,
  ITI_MAX_MS: 1200,
  COUNTDOWN_STEPS: ["3", "2", "1", "GO"],
  COUNTDOWN_STEP_MS: 800,
};

/* ============================ Business logic =============================
   Pure functions only — trial generation, response validation, and metric
   calculation never touch React state directly. Screens call these and
   render the results.
   ========================================================================= */

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Generates a randomized GO/NO-GO trial sequence with an exact GO/NO-GO
 * split, capping consecutive GO runs at maxRunLength. NO-GO trials are
 * distributed into randomly-sized, randomly-ordered "gaps" of GO trials -
 * the only way to guarantee both the exact ratio and the run-length cap
 * in one deterministic pass.
 *
 * When allowRepeatNoGo is true, 0, 1, or 2 of those gaps are randomly
 * (not guaranteed - roughly an 85% chance of at least one) collapsed to
 * zero, which places two NO-GO trials back-to-back. This is capped so a
 * NO-GO run never exceeds 2 in a row, and merge sites are spaced apart so
 * multiple repeats (when they occur) land in different parts of the test.
 */
function generateTrials(total, noGoCount, maxRunLength, allowRepeatNoGo = false) {
  const goCount = total - noGoCount;
  const gapCount = noGoCount + 1;
  const baseGapSize = Math.floor(goCount / gapCount);
  const remainder = goCount % gapCount;

  const gapIndexOrder = shuffle([...Array(gapCount).keys()]);
  const gapSizes = new Array(gapCount).fill(baseGapSize);
  for (let i = 0; i < remainder; i++) gapSizes[gapIndexOrder[i]] += 1;

  if (allowRepeatNoGo && gapCount >= 2) {
    const r = Math.random();
    const numMerges = r < 0.15 ? 0 : r < 0.65 ? 1 : 2; // mostly 1, sometimes 2, occasionally none
    const excluded = new Set();
    let merges = 0;
    let attempts = 0;
    while (merges < numMerges && attempts < 30) {
      attempts += 1;
      const candidates = gapSizes.map((_, i) => i).filter((i) => gapSizes[i] > 0 && !excluded.has(i));
      if (candidates.length === 0) break;
      const i = candidates[Math.floor(Math.random() * candidates.length)];
      const neighbors = [];
      if (i - 1 >= 0) neighbors.push(i - 1);
      if (i + 1 < gapCount) neighbors.push(i + 1);
      const j = neighbors[Math.floor(Math.random() * neighbors.length)];
      const merged = gapSizes[i] + gapSizes[j];
      if (merged <= maxRunLength) {
        gapSizes[j] = merged;
        gapSizes[i] = 0;
        [i - 1, i, i + 1].forEach((k) => { if (k >= 0 && k < gapCount) excluded.add(k); });
        merges += 1;
      }
    }
  }

  const sequence = [];
  gapSizes.forEach((size, gapIndex) => {
    for (let g = 0; g < size; g++) sequence.push("GO");
    if (gapIndex < gapSizes.length - 1) sequence.push("NOGO");
  });

  return sequence.map((stimulusType, idx) => ({ trialNumber: idx + 1, stimulusType }));
}

/** Classifies a trial's outcome: HIT / OMISSION_ERROR / CORRECT_INHIBITION / COMMISSION_ERROR. */
function validateResponse(trial, responded, responseTimeMs, responseWindowMs) {
  const withinWindow =
    responded && typeof responseTimeMs === "number" && responseTimeMs >= 0 && responseTimeMs <= responseWindowMs;
  if (trial.stimulusType === "GO") return withinWindow ? "HIT" : "OMISSION_ERROR";
  return withinWindow ? "COMMISSION_ERROR" : "CORRECT_INHIBITION";
}
function isCorrectOutcome(outcome) {
  return outcome === "HIT" || outcome === "CORRECT_INHIBITION";
}

function reactionTimeStats(scoredTrials) {
  const rts = scoredTrials.filter((t) => t.outcome === "HIT" && typeof t.reactionTime === "number").map((t) => t.reactionTime);
  if (rts.length === 0) return { averageReactionTime: 0, fastestReactionTime: 0, slowestReactionTime: 0, reactionTimeVariability: 0 };
  const avg = rts.reduce((s, v) => s + v, 0) / rts.length;
  const variance = rts.reduce((s, v) => s + (v - avg) ** 2, 0) / rts.length;
  return {
    averageReactionTime: Math.round(avg),
    fastestReactionTime: Math.min(...rts),
    slowestReactionTime: Math.max(...rts),
    reactionTimeVariability: Math.round(Math.sqrt(variance)),
  };
}

/** Inverse standard-normal CDF (Abramowitz & Stegun approximation), used for d-prime. */
function inverseNormalCDF(p) {
  const pc = Math.max(0.01, Math.min(0.99, p));
  const a = [-39.69683028665376, 220.9460984245205, -275.9285104469687, 138.3577518672690, -30.66479806614716, 2.506628277459239];
  const b = [-54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972, -13.28068155288572];
  const c = [-0.007784894002430293, -0.3223964580411365, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [0.007784695709041462, 0.3224671290700398, 2.445134137142996, 3.754408661907416];
  const pLow = 0.02425, pHigh = 1 - pLow;
  if (pc < pLow) {
    const q = Math.sqrt(-2 * Math.log(pc));
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  if (pc <= pHigh) {
    const q = pc - 0.5, r = q * q;
    return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  }
  const q = Math.sqrt(-2 * Math.log(1 - pc));
  return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
}

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function round1(n) { return Math.round(n * 10) / 10; }
function round2(n) { return Math.round(n * 100) / 100; }

/** Computes every NeuroTrack Go/No-Go executive-function metric from validated scored trials. */
function calculateMetrics(scoredTrials) {
  const total = scoredTrials.length;
  const goTrials = scoredTrials.filter((t) => t.stimulusType === "GO");
  const noGoTrials = scoredTrials.filter((t) => t.stimulusType === "NOGO");

  const correctGoResponses = goTrials.filter((t) => t.outcome === "HIT").length;
  const omissionErrors = goTrials.filter((t) => t.outcome === "OMISSION_ERROR").length;
  const correctNoGoInhibitions = noGoTrials.filter((t) => t.outcome === "CORRECT_INHIBITION").length;
  const commissionErrors = noGoTrials.filter((t) => t.outcome === "COMMISSION_ERROR").length;

  const goAccuracy = (correctGoResponses / goTrials.length) * 100;
  const noGoAccuracy = (correctNoGoInhibitions / noGoTrials.length) * 100;
  const overallAccuracy = ((correctGoResponses + correctNoGoInhibitions) / total) * 100;

  const hitRate = correctGoResponses / goTrials.length;
  const falseAlarmRate = commissionErrors / noGoTrials.length;

  const rtStats = reactionTimeStats(scoredTrials);

  const commissionRTs = noGoTrials.filter((t) => t.outcome === "COMMISSION_ERROR").map((t) => t.reactionTime).filter((rt) => typeof rt === "number");
  const avgCommissionRT = commissionRTs.length ? commissionRTs.reduce((s, v) => s + v, 0) / commissionRTs.length : null;

  const dPrime = inverseNormalCDF(hitRate) - inverseNormalCDF(falseAlarmRate);

  const responseInhibitionScore = clamp(noGoAccuracy, 0, 100);
  const impulsivityPenalty = avgCommissionRT !== null && rtStats.averageReactionTime > 0
    ? clamp(((rtStats.averageReactionTime - avgCommissionRT) / rtStats.averageReactionTime) * 20, 0, 20)
    : 0;
  const impulseControlScore = clamp(100 - falseAlarmRate * 100 - impulsivityPenalty, 0, 100);
  const selectiveAttentionScore = clamp(((dPrime + 1) / 5.65) * 100, 0, 100);

  const midpoint = Math.floor(total / 2);
  const halfAccuracy = (half) => {
    if (half.length === 0) return 100;
    const correct = half.filter((t) => t.outcome === "HIT" || t.outcome === "CORRECT_INHIBITION").length;
    return (correct / half.length) * 100;
  };
  const firstHalfAccuracy = halfAccuracy(scoredTrials.slice(0, midpoint));
  const secondHalfAccuracy = halfAccuracy(scoredTrials.slice(midpoint));
  const vigilanceDecrement = clamp(firstHalfAccuracy - secondHalfAccuracy, 0, 100);
  const sustainedAttentionScore = clamp(100 - vigilanceDecrement, 0, 100);
  const vigilanceScore = clamp(secondHalfAccuracy, 0, 100);

  const processingSpeedScore = clamp(100 - ((rtStats.averageReactionTime - 250) / (1500 - 250)) * 100, 0, 100);

  const executiveFunctionScore = clamp(
    (responseInhibitionScore + impulseControlScore + selectiveAttentionScore + sustainedAttentionScore + vigilanceScore + processingSpeedScore) / 6,
    0, 100
  );

  const rawScore = correctGoResponses * 1 + correctNoGoInhibitions * 2 - commissionErrors * 2 - omissionErrors * 1;
  const maxRawScore = goTrials.length * 1 + noGoTrials.length * 2;
  const normalizedScore = clamp((rawScore / maxRawScore) * 100, 0, 100);
  const cognitiveScore = Math.round(clamp(0.6 * executiveFunctionScore + 0.4 * normalizedScore, 0, 100));

  return {
    overallAccuracy: round1(overallAccuracy),
    goAccuracy: round1(goAccuracy),
    noGoAccuracy: round1(noGoAccuracy),
    correctGoResponses,
    correctNoGoInhibitions,
    commissionErrors,
    omissionErrors,
    hitRate: round2(hitRate),
    falseAlarmRate: round2(falseAlarmRate),
    ...rtStats,
    dPrime: round2(dPrime),
    responseInhibitionScore: round1(responseInhibitionScore),
    impulseControlScore: round1(impulseControlScore),
    selectiveAttentionScore: round1(selectiveAttentionScore),
    sustainedAttentionScore: round1(sustainedAttentionScore),
    vigilanceScore: round1(vigilanceScore),
    processingSpeedScore: round1(processingSpeedScore),
    executiveFunctionScore: round1(executiveFunctionScore),
    rawScore,
    maxRawScore,
    normalizedScore: round1(normalizedScore),
    cognitiveScore,
  };
}

/**
 * Maps Overall Cognitive Score to a clinical interpretation + severity band.
 * NOTE: placeholder cutoffs for the software architecture — require
 * calibration against a normed reference population before clinical use.
 */
function interpretScore(cognitiveScore) {
  if (cognitiveScore >= 85) return { interpretation: "Executive function performance within normal range", severity: "None" };
  if (cognitiveScore >= 70) return { interpretation: "Mildly reduced executive function / response inhibition", severity: "Mild" };
  if (cognitiveScore >= 55) return { interpretation: "Moderately reduced executive function - possible early cognitive concern warranting follow-up", severity: "Moderate" };
  return { interpretation: "Significantly reduced executive function - clinical follow-up recommended", severity: "Severe" };
}

/** Assembles the standardized NeuroTrack ResultModel shared across every assessment module. */
function buildResultModel({ sessionId, completionTime, clickHistory, metrics, interpretationResult }) {
  return {
    testName: CONFIG.TEST_NAME,
    sessionId,
    testVersion: CONFIG.TEST_VERSION,
    domains: CONFIG.DOMAINS,
    completionTime,
    accuracy: metrics.overallAccuracy,
    errors: metrics.commissionErrors + metrics.omissionErrors,
    completed: true,
    averageReactionTime: metrics.averageReactionTime,
    fastestReactionTime: metrics.fastestReactionTime,
    slowestReactionTime: metrics.slowestReactionTime,
    rawScore: metrics.rawScore,
    normalizedScore: metrics.normalizedScore,
    cognitiveScore: metrics.cognitiveScore,
    interpretation: interpretationResult.interpretation,
    severity: interpretationResult.severity,
    clickHistory,
    metrics: {
      goAccuracy: metrics.goAccuracy,
      noGoAccuracy: metrics.noGoAccuracy,
      correctGoResponses: metrics.correctGoResponses,
      correctNoGoInhibitions: metrics.correctNoGoInhibitions,
      commissionErrors: metrics.commissionErrors,
      omissionErrors: metrics.omissionErrors,
      falseAlarmRate: metrics.falseAlarmRate,
      hitRate: metrics.hitRate,
      responseInhibitionScore: metrics.responseInhibitionScore,
      impulseControlScore: metrics.impulseControlScore,
      selectiveAttentionScore: metrics.selectiveAttentionScore,
      sustainedAttentionScore: metrics.sustainedAttentionScore,
      executiveFunctionScore: metrics.executiveFunctionScore,
      processingSpeedScore: metrics.processingSpeedScore,
      vigilanceScore: metrics.vigilanceScore,
      reactionTimeVariability: metrics.reactionTimeVariability,
    },
  };
}

function generateSessionId() {
  return `GNG-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function formatTime(ms) {
  const totalMs = Math.max(0, ms);
  const s = Math.floor(totalMs / 1000);
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  const cs = String(Math.floor((totalMs % 1000) / 10)).padStart(2, "0");
  return `${mm}:${ss}.${cs}`;
}
function formatMsValue(ms) {
  if (ms == null) return "—";
  return `${ms} ms`;
}

/* ------------------------------- Icons ----------------------------------- */
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
    <path d="M4 13l5 5L20 6" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const ClockIcon = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
    <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.8" />
    <path d="M12 7v5l3.5 2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);
const AlertIcon = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
    <path d="M12 4l9 16H3z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M12 10v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="12" cy="16.6" r="0.9" fill="currentColor" />
  </svg>
);
const ProgressIcon = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
    <path d="M4 19V9M12 19V5M20 19v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
const HandIcon = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
    <path d="M9 11.5V6a1.5 1.5 0 0 1 3 0v5M12 11.5V5a1.5 1.5 0 0 1 3 0v6.5M15 11.5V7a1.5 1.5 0 0 1 3 0v7c0 3.3-2.2 6-6 6-2.6 0-3.8-1-5-2.5L4.8 14a1.4 1.4 0 0 1 2-2l2.2 2" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ============================ Instructions ================================ */
function InstructionScreen({ onStart }) {
  return (
    <div className="screen center-screen">
      <div className="card welcome-card">
        <div className="eyebrow">Cognitive Assessment Suite</div>
        <h1 className="display-xl">Go / No-Go Test</h1>
        <p className="lead">
          This assessment measures response inhibition, impulse control, and
          sustained attention. One stimulus will appear at a time. If it is a{" "}
          <strong>GO signal</strong>, press the response button (or Spacebar) as
          quickly as possible. If it is a <strong>NO-GO signal</strong>, do not
          respond. Respond quickly and accurately.
        </p>

        <div className="mode-grid" aria-hidden="true">
          <div className="mode-card mode-card--active mode-card--static">
            <span className="mode-tag">Go signal</span>
            <div className="example-circle example-circle--go" />
            <span className="mode-desc">Press the button or Spacebar as quickly as possible.</span>
          </div>
          <div className="mode-card mode-card--static">
            <span className="mode-tag">No-Go signal</span>
            <div className="example-circle example-circle--nogo" />
            <span className="mode-desc">Do not respond. Withhold any button press.</span>
          </div>
        </div>

        <ul className="instruction-notes">
          <li><CheckIcon /> <span>A short, unscored practice round comes first so you can get a feel for the pacing.</span></li>
          <li><ClockIcon /> <span>Each stimulus is shown briefly; you have a limited window to respond after it appears.</span></li>
          <li><AlertIcon /> <span>Only one response is accepted per trial, and no feedback is shown during the scored assessment.</span></li>
        </ul>

        <button type="button" className="btn btn--primary btn--large" onClick={onStart}>
          Start Assessment
        </button>
      </div>
    </div>
  );
}

/* ============================ Trial loop hook ============================= 
   Shared timing engine for Practice and Assessment screens — stimulus
   display window, response capture (Spacebar or button, one response per
   trial), fixed-duration response window, randomized ITI, auto-advance.
   Kept as a single hook so the two screens never duplicate this logic.
   ========================================================================= */
function useTrialLoop({ trials, onEachTrial, onComplete }) {
  const [index, setIndex] = useState(0);
  const [stimulusVisible, setStimulusVisible] = useState(false);
  const respondedRef = useRef(false);
  const pendingRef = useRef({ responded: false, responseTimeMs: null });
  const onsetRef = useRef(0);
  const timersRef = useRef([]);

  useEffect(() => {
    const trial = trials[index];
    if (!trial) return undefined;

    respondedRef.current = false;
    pendingRef.current = { responded: false, responseTimeMs: null };
    onsetRef.current = performance.now();
    setStimulusVisible(true);

    const displayTimer = setTimeout(() => setStimulusVisible(false), CONFIG.STIMULUS_DISPLAY_MS);
    const windowTimer = setTimeout(() => {
      const response = pendingRef.current;
      const outcome = validateResponse(trial, response.responded, response.responseTimeMs, CONFIG.RESPONSE_WINDOW_MS);
      onEachTrial({
        trialNumber: trial.trialNumber,
        stimulusType: trial.stimulusType,
        responded: response.responded,
        reactionTime: response.responseTimeMs,
        outcome,
      });

      const itiMs = Math.round(CONFIG.ITI_MIN_MS + Math.random() * (CONFIG.ITI_MAX_MS - CONFIG.ITI_MIN_MS));
      const itiTimer = setTimeout(() => {
        if (index + 1 < trials.length) setIndex((i) => i + 1);
        else onComplete();
      }, itiMs);
      timersRef.current.push(itiTimer);
    }, CONFIG.RESPONSE_WINDOW_MS);

    timersRef.current.push(displayTimer, windowTimer);
    return () => {
      clearTimeout(displayTimer);
      clearTimeout(windowTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, trials]);

  useEffect(() => {
    const timers = timersRef.current;
    return () => timers.forEach((id) => clearTimeout(id));
  }, []);

  const respond = useCallback(() => {
    if (respondedRef.current) return; // one response per trial
    respondedRef.current = true;
    pendingRef.current = { responded: true, responseTimeMs: Math.round(performance.now() - onsetRef.current) };
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.code === "Space" || e.key === " ") {
        e.preventDefault();
        respond();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [respond]);

  return { currentTrial: trials[index], stimulusVisible, index, respond };
}

/* ------------------------- Shared stimulus stage --------------------------- */
function StimulusStage({ trial, visible }) {
  return (
    <div className="stimulus-frame">
      <div className="stimulus-stage">
        {trial && visible ? (
          <div className={`stimulus-circle ${trial.stimulusType === "GO" ? "stimulus-circle--go" : "stimulus-circle--nogo"}`} />
        ) : (
          <div className="stimulus-fixation" aria-hidden="true">+</div>
        )}
      </div>
    </div>
  );
}

/* ============================== Practice =================================== */
function PracticeScreen({ onDone }) {
  const trials = useMemo(() => generateTrials(CONFIG.PRACTICE_TRIAL_COUNT, CONFIG.PRACTICE_NOGO_COUNT, CONFIG.PRACTICE_MAX_RUN_LENGTH, false), []);
  const [feedback, setFeedback] = useState(null);
  const doneRef = useRef(false);
  // Practice trials were previously discarded entirely (this game's own UI
  // never needed them) — accumulated here, mirroring AssessmentScreen's
  // historyRef pattern below, so the contract adapter can report them via
  // onPracticeComplete (features/04 §A.5: practice attempts get logged too).
  const historyRef = useRef([]);

  const handleEachTrial = useCallback((record) => {
    setFeedback({ correct: isCorrectOutcome(record.outcome) });
    historyRef.current = [...historyRef.current, record];
  }, []);

  const handleComplete = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    onDone(historyRef.current);
  }, [onDone]);

  const { currentTrial, stimulusVisible, index, respond } = useTrialLoop({
    trials,
    onEachTrial: handleEachTrial,
    onComplete: handleComplete,
  });

  useEffect(() => {
    if (stimulusVisible) setFeedback(null);
  }, [stimulusVisible, index]);

  return (
    <div className="screen assessment-screen">
      <div className="hud" role="status" aria-live="polite">
        <div className="hud-item">
          <span className="hud-label">Mode</span>
          <span className="hud-value hud-value--mode">Practice — Unscored</span>
        </div>
        <div className="hud-item">
          <span className="hud-label"><ProgressIcon /> Trial</span>
          <span className="hud-value hud-mono">{index + 1} / {trials.length}</span>
        </div>
        <div className="hud-item">
          <span className="hud-label"><CheckIcon /> Feedback</span>
          <span className={`hud-value hud-mono ${feedback ? (feedback.correct ? "hud-good" : "hud-errors") : ""}`}>
            {feedback ? (feedback.correct ? "Correct" : "Incorrect") : "—"}
          </span>
        </div>
      </div>

      <StimulusStage trial={currentTrial} visible={stimulusVisible} />

      <button type="button" className="btn btn--primary btn--large response-btn" onClick={respond}>
        <HandIcon /> Response (Spacebar)
      </button>
      <p className="practice-hint">Practice trials are not scored.</p>
    </div>
  );
}

/* ============================== Countdown ================================= */
function CountdownScreen({ onDone }) {
  const steps = CONFIG.COUNTDOWN_STEPS;
  const [i, setI] = useState(0);

  useEffect(() => {
    if (i >= steps.length) {
      const t = setTimeout(onDone, 380);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setI((v) => v + 1), CONFIG.COUNTDOWN_STEP_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);

  return (
    <div className="screen center-screen countdown-screen">
      <div className="countdown-ring">
        <span key={i} className={`countdown-num ${steps[i] === "GO" ? "countdown-go" : ""}`}>
          {steps[i] ?? ""}
        </span>
      </div>
      <p className="countdown-caption">Prepare to begin</p>
    </div>
  );
}

/* ============================== Assessment ================================= */
function AssessmentScreen({ onFinish }) {
  const trials = useMemo(() => generateTrials(CONFIG.SCORED_TRIAL_COUNT, CONFIG.SCORED_NOGO_COUNT, CONFIG.SCORED_MAX_RUN_LENGTH, CONFIG.SCORED_ALLOW_REPEAT_NOGO), []);
  const historyRef = useRef([]);
  const startRef = useRef(performance.now());
  const [elapsed, setElapsed] = useState(0);
  const doneRef = useRef(false);

  useEffect(() => {
    const t = setInterval(() => setElapsed(performance.now() - startRef.current), 100);
    return () => clearInterval(t);
  }, []);

  const handleEachTrial = useCallback((record) => {
    historyRef.current = [...historyRef.current, record];
  }, []);

  const handleComplete = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    const completionTime = Math.round((performance.now() - startRef.current) / 1000);
    onFinish({ clickHistory: historyRef.current, completionTime });
  }, [onFinish]);

  const { currentTrial, stimulusVisible, index, respond } = useTrialLoop({
    trials,
    onEachTrial: handleEachTrial,
    onComplete: handleComplete,
  });

  return (
    <div className="screen assessment-screen">
      <div className="hud" role="status" aria-live="polite">
        <div className="hud-item">
          <span className="hud-label">Mode</span>
          <span className="hud-value hud-value--mode">Scored Assessment</span>
        </div>
        <div className="hud-item">
          <span className="hud-label"><ProgressIcon /> Trial</span>
          <span className="hud-value hud-mono">{index + 1} / {trials.length}</span>
        </div>
        <div className="hud-item">
          <span className="hud-label"><ClockIcon /> Time</span>
          <span className="hud-value hud-mono">{formatTime(elapsed)}</span>
        </div>
      </div>

      <StimulusStage trial={currentTrial} visible={stimulusVisible} />

      <button type="button" className="btn btn--primary btn--large response-btn" onClick={respond}>
        <HandIcon /> Response (Spacebar)
      </button>
      <p className="practice-hint practice-hint--muted">No feedback is shown during the scored assessment.</p>
    </div>
  );
}

/* ============================== Completion ================================= */
function TrialReviewTable({ clickHistory }) {
  const outcomeLabel = { HIT: "Hit", OMISSION_ERROR: "Omission Error", CORRECT_INHIBITION: "Correct Inhibition", COMMISSION_ERROR: "Commission Error" };
  return (
    <div className="trial-review-wrapper">
      <table className="trial-review-table">
        <thead>
          <tr>
            <th>Trial</th><th>Stimulus</th><th>Response</th><th>Expected</th><th>Reaction Time</th><th>Outcome</th>
          </tr>
        </thead>
        <tbody>
          {clickHistory.map((row) => (
            <tr key={row.trialNumber} className={isCorrectOutcome(row.outcome) ? "row-correct" : "row-incorrect"}>
              <td className="hud-mono">{row.trialNumber}</td>
              <td>{row.stimulusType === "GO" ? "GO" : "NO-GO"}</td>
              <td>{row.responded ? "Pressed" : "No response"}</td>
              <td>{row.stimulusType === "GO" ? "Press" : "No response"}</td>
              <td className="hud-mono">{row.reactionTime !== null ? `${row.reactionTime} ms` : "—"}</td>
              <td>
                <span className={`outcome-pill ${isCorrectOutcome(row.outcome) ? "outcome-pill--correct" : "outcome-pill--incorrect"}`}>
                  {outcomeLabel[row.outcome]}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ScoreBar({ label, value }) {
  return (
    <div className="score-bar-row">
      <span className="score-bar-label">{label}</span>
      <div className="score-bar-track">
        <div className="score-bar-fill" style={{ width: `${Math.min(100, value)}%` }} />
      </div>
      <span className="score-bar-value hud-mono">{value}</span>
    </div>
  );
}

function CompletionScreen({ resultModel, onRestart, onHome }) {
  const [reviewOpen, setReviewOpen] = useState(false);
  const m = resultModel.metrics;
  const severityClass = `severity-badge severity-badge--${resultModel.severity.toLowerCase()}`;

  return (
    <div className="screen center-screen">
      <div className="card completion-card completion-card--wide">
        <div className="completion-badge"><CheckIcon /></div>
        <div className="eyebrow">Session {resultModel.sessionId}</div>
        <h2 className="display-lg">Assessment Completed</h2>
        <p className="lead lead--tight">Go / No-Go Test &middot; standardized NeuroTrack report</p>

        <div className="metrics-grid">
          <div className="metric-tile metric-tile--primary">
            <span className="metric-label">Overall Cognitive Score</span>
            <span className="metric-value hud-mono">{resultModel.cognitiveScore}</span>
            <span className={severityClass}>{resultModel.severity} severity</span>
            <span className="interpretation-text">{resultModel.interpretation}</span>
          </div>

          <div className="metric-tile"><span className="metric-label">Overall Accuracy</span><span className="metric-value hud-mono">{resultModel.accuracy}%</span></div>
          <div className="metric-tile"><span className="metric-label">Completion Time</span><span className="metric-value hud-mono">{resultModel.completionTime}s</span></div>
          <div className="metric-tile"><span className="metric-label">Correct GO Responses</span><span className="metric-value hud-mono">{m.correctGoResponses}</span></div>
          <div className="metric-tile"><span className="metric-label">Correct NO-GO Inhibitions</span><span className="metric-value hud-mono">{m.correctNoGoInhibitions}</span></div>
          <div className="metric-tile"><span className="metric-label">Commission Errors</span><span className="metric-value hud-mono metric-value--warn">{m.commissionErrors}</span></div>
          <div className="metric-tile"><span className="metric-label">Omission Errors</span><span className="metric-value hud-mono metric-value--warn">{m.omissionErrors}</span></div>
          <div className="metric-tile"><span className="metric-label">Hit Rate</span><span className="metric-value hud-mono">{m.hitRate}</span></div>
          <div className="metric-tile"><span className="metric-label">False Alarm Rate</span><span className="metric-value hud-mono">{m.falseAlarmRate}</span></div>
          <div className="metric-tile"><span className="metric-label">Avg. Reaction Time</span><span className="metric-value hud-mono">{formatMsValue(resultModel.averageReactionTime)}</span></div>
          <div className="metric-tile"><span className="metric-label">Fastest Reaction</span><span className="metric-value hud-mono">{formatMsValue(resultModel.fastestReactionTime)}</span></div>
          <div className="metric-tile"><span className="metric-label">Slowest Reaction</span><span className="metric-value hud-mono">{formatMsValue(resultModel.slowestReactionTime)}</span></div>
          <div className="metric-tile"><span className="metric-label">RT Variability (SD)</span><span className="metric-value hud-mono">{formatMsValue(m.reactionTimeVariability)}</span></div>
        </div>

        <div className="exec-summary">
          <div className="instruction-label">Executive Function Summary</div>
          <ScoreBar label="Response Inhibition" value={m.responseInhibitionScore} />
          <ScoreBar label="Impulse Control" value={m.impulseControlScore} />
          <ScoreBar label="Selective Attention" value={m.selectiveAttentionScore} />
          <ScoreBar label="Sustained Attention" value={m.sustainedAttentionScore} />
          <ScoreBar label="Vigilance" value={m.vigilanceScore} />
          <ScoreBar label="Processing Speed" value={m.processingSpeedScore} />
          <ScoreBar label="Executive Function (composite)" value={m.executiveFunctionScore} />
        </div>

        <button
          type="button"
          className="btn btn--ghost trial-review-toggle"
          onClick={() => setReviewOpen((o) => !o)}
          aria-expanded={reviewOpen}
        >
          {reviewOpen ? "Hide" : "Show"} Trial Review ({resultModel.clickHistory.length} trials)
        </button>
        {reviewOpen && <TrialReviewTable clickHistory={resultModel.clickHistory} />}

        <div className="row-actions">
          <button type="button" className="btn btn--ghost" onClick={onHome}>Return to Home</button>
          <button type="button" className="btn btn--primary btn--large" onClick={onRestart}>Restart Assessment</button>
        </div>
      </div>
    </div>
  );
}

/* ============================ Contract adapter ==============================
   See src/features/games/weekly/go-no-go/adapter.js for the mount/unmount
   wrapper this component gets rendered through. */
function toContractTrials(clickHistory) {
  return clickHistory.map((r) => ({
    responseTimeMs: r.reactionTime ?? 0,
    correct: isCorrectOutcome(r.outcome),
    errorType: isCorrectOutcome(r.outcome) ? undefined : r.outcome === "COMMISSION_ERROR" ? "commission" : "omission",
  }));
}

/* ================================== App ==================================== */
export default function GoNoGoGame({ config, onComplete, onPracticeComplete }) {
  const [screen, setScreen] = useState("instructions");
  const [resultModel, setResultModel] = useState(null);

  const goPractice = () => setScreen("practice");
  const goCountdown = (practiceHistory) => {
    if (practiceHistory) onPracticeComplete?.({ score: null, trials: toContractTrials(practiceHistory) });
    setScreen("countdown");
  };
  const goAssessment = () => setScreen("assessment");
  const goHome = () => {
    setResultModel(null);
    setScreen("instructions");
  };

  const handleAssessmentFinish = useCallback(({ clickHistory, completionTime }) => {
    const metrics = calculateMetrics(clickHistory);
    const interpretationResult = interpretScore(metrics.cognitiveScore);
    const model = buildResultModel({
      sessionId: generateSessionId(),
      completionTime,
      clickHistory,
      metrics,
      interpretationResult,
    });
    setResultModel(model);
    setScreen("completion");
    onComplete?.({ score: model.cognitiveScore, trials: toContractTrials(clickHistory), rawLog: model });
  }, [onComplete]);

  const handleRestart = () => {
    setResultModel(null);
    setScreen("practice");
  };
  void config;

  return (
    <div className="ntx-root">
      <style>{CSS}</style>

      <header className="app-topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="18" height="18">
              <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.6" />
              <path d="M8 13l2.2 2.4L16 9" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="brand-module">Go / No-Go Test</span>
        </div>
      </header>

      <main className="app-main">
        {screen === "instructions" && <InstructionScreen onStart={goPractice} />}
        {screen === "practice" && <PracticeScreen onDone={goCountdown} />}
        {screen === "countdown" && <CountdownScreen onDone={goAssessment} />}
        {screen === "assessment" && <AssessmentScreen onFinish={handleAssessmentFinish} />}
        {screen === "completion" && resultModel && (
          <CompletionScreen resultModel={resultModel} onRestart={handleRestart} onHome={goHome} />
        )}
      </main>
    </div>
  );
}

/* ================================== CSS ==================================== */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500;600;700&display=swap');

:root{
  --paper:#F5F8FC;
  --panel:#FFFFFF;
  --ink:#0F2540;
  --ink-soft:#54647C;
  --line:#DDE5F0;
  --line-soft:#EAF0F8;
  --primary:#2E5FDC;
  --primary-dark:#1B3F9E;
  --primary-tint:#E9EFFC;
  --success:#12805A;
  --success-tint:#E1F5EC;
  --error:#C7433F;
  --error-tint:#FBEAE9;
  --warning:#B7791F;
  --warning-tint:#FBF1DE;
  --radius-lg:20px;
  --radius-md:14px;
  --radius-sm:10px;
  --shadow-card:0 1px 2px rgba(15,37,64,0.04),0 12px 32px -16px rgba(15,37,64,0.16);
  --font-display:'Sora',sans-serif;
  --font-body:'Inter',sans-serif;
  --font-mono:'JetBrains Mono',monospace;
}

.ntx-root{
  min-height:100vh;
  width:100%;
  background:
    radial-gradient(1100px 480px at 85% -10%, rgba(46,95,220,0.06), transparent 60%),
    var(--paper);
  color:var(--ink);
  font-family:var(--font-body);
  display:flex;
  flex-direction:column;
  box-sizing:border-box;
}
.ntx-root *{ box-sizing:border-box; }
.ntx-root button{ font-family:inherit; }
.ntx-root button:focus-visible{ outline:3px solid var(--primary); outline-offset:2px; }

@media (prefers-reduced-motion: reduce){
  .ntx-root *{ animation-duration:0.001ms !important; transition-duration:0.001ms !important; }
}

/* ---------------- Topbar ---------------- */
.app-topbar{
  display:flex; align-items:center;
  padding:18px 28px;
  border-bottom:1px solid var(--line);
  background:rgba(255,255,255,0.7);
  backdrop-filter:blur(6px);
}
.brand{ display:flex; align-items:center; gap:10px; color:var(--ink); }
.brand-mark{ color:var(--primary); display:flex; }
.brand-module{ color:var(--ink-soft); font-size:14px; font-weight:500; }

.app-main{ flex:1; display:flex; }

/* ---------------- Generic screen shells ---------------- */
.screen{ flex:1; width:100%; display:flex; }
.center-screen{ align-items:center; justify-content:center; padding:32px 20px; }

.card{
  width:100%;
  background:var(--panel);
  border:1px solid var(--line);
  border-radius:var(--radius-lg);
  box-shadow:var(--shadow-card);
  /* Was 44px 44px 38px — combined with this card's own content (title,
     lead, a 2-card mode grid, a 3-item list, the button), that padding
     plus SessionPlayer's own top bar pushed "Start Assessment" below the
     fold on ordinary laptop-height viewports, reported as the button not
     being visible at all rather than just needing a scroll. Trimmed here
     and throughout this screen's other spacing below so the whole card
     reliably fits in one view instead. */
  padding:28px 32px 26px;
}
.welcome-card{ max-width:720px; }
.completion-card{ max-width:640px; text-align:center; }
.completion-card--wide{ max-width:820px; }

.eyebrow{
  font-family:var(--font-mono);
  font-size:11.5px;
  letter-spacing:0.10em;
  text-transform:uppercase;
  color:var(--primary);
  font-weight:600;
  margin-bottom:14px;
}
.display-xl{ font-family:var(--font-display); font-size:36px; line-height:1.15; margin:0 0 14px; letter-spacing:-0.01em; }
.display-lg{ font-family:var(--font-display); font-size:26px; line-height:1.2; margin:0 0 14px; letter-spacing:-0.01em; }
.lead{ font-size:16px; line-height:1.6; color:var(--ink-soft); margin:0 0 16px; max-width:56ch; }
.lead--tight{ margin:0 auto 26px; }

/* ---------------- Stimulus examples (instruction screen) ---------------- */
.mode-grid{ display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:14px; }
.mode-card{
  text-align:center;
  background:var(--paper);
  border:1.5px solid var(--line);
  border-radius:var(--radius-md);
  padding:14px 16px;
  display:flex; flex-direction:column; align-items:center; gap:6px;
}
.mode-card--active{ border-color:var(--success); background:var(--success-tint); }
.mode-card--static{ cursor:default; }
.mode-tag{ font-family:var(--font-mono); font-size:11px; font-weight:600; color:var(--ink-soft); letter-spacing:0.06em; text-transform:uppercase; }
.mode-desc{ font-size:13.5px; color:var(--ink-soft); line-height:1.5; }
.example-circle{ width:40px; height:40px; border-radius:50%; box-shadow:var(--shadow-card); }
.example-circle--go{ background:var(--success); }
.example-circle--nogo{ background:var(--error); }

/* ---------------- Buttons ---------------- */
.btn{
  font-weight:600;
  border-radius:12px;
  border:1.5px solid transparent;
  cursor:pointer;
  transition:transform .12s ease, box-shadow .15s ease, background .15s ease, border-color .15s ease;
  font-size:14.5px;
  padding:12px 20px;
}
.btn--primary{ background:var(--primary); color:#fff; box-shadow:0 10px 24px -10px rgba(46,95,220,0.55); }
.btn--primary:hover{ background:var(--primary-dark); transform:translateY(-1px); }
.btn--primary:active{ transform:translateY(0); }
.btn--large{ padding:16px 28px; font-size:16px; width:100%; display:flex; align-items:center; justify-content:center; gap:8px; }
.btn--ghost{ background:transparent; color:var(--ink-soft); border-color:var(--line); }
.btn--ghost:hover{ border-color:#B7C6EA; color:var(--ink); }

.row-actions{ display:flex; gap:12px; margin-top:20px; }
.row-actions .btn--ghost{ flex:0 0 auto; }
.row-actions .btn--primary{ flex:1; }

.instruction-notes{ list-style:none; padding:0; margin:10px 0 16px; display:flex; flex-direction:column; gap:6px; }
.instruction-notes li{ display:flex; align-items:flex-start; gap:10px; font-size:13.5px; color:var(--ink-soft); }
.instruction-notes li svg{ flex:0 0 auto; margin-top:2px; color:var(--primary); }

/* ---------------- Countdown ---------------- */
.countdown-screen{ flex-direction:column; gap:22px; }
.countdown-ring{
  width:180px; height:180px; border-radius:50%;
  border:2px solid var(--line);
  display:flex; align-items:center; justify-content:center;
  background:var(--panel);
  box-shadow:var(--shadow-card);
}
.countdown-num{ font-family:var(--font-display); font-size:64px; font-weight:700; color:var(--primary); animation:ntxFade .38s ease; }
.countdown-go{ color:var(--success); font-size:44px; letter-spacing:0.04em; }
.countdown-caption{ color:var(--ink-soft); font-size:14px; }
@keyframes ntxFade{ from{ opacity:0; transform:scale(0.85);} to{ opacity:1; transform:scale(1);} }

/* ---------------- Practice / Assessment ---------------- */
.assessment-screen{ flex-direction:column; align-items:center; padding:28px 22px 34px; gap:18px; max-width:640px; margin:0 auto; }

.hud{
  width:100%;
  display:grid;
  grid-template-columns:repeat(3, 1fr);
  gap:1px;
  background:var(--line);
  border:1px solid var(--line);
  border-radius:var(--radius-md);
  overflow:hidden;
}
.hud-item{ background:var(--panel); padding:12px 16px; display:flex; flex-direction:column; gap:6px; }
.hud-label{ font-size:11px; text-transform:uppercase; letter-spacing:0.06em; color:var(--ink-soft); font-weight:600; display:flex; align-items:center; gap:5px; }
.hud-label svg{ color:var(--primary); }
.hud-value{ font-family:var(--font-display); font-size:15px; font-weight:600; color:var(--ink); }
.hud-mono{ font-family:var(--font-mono); font-size:18px; }
.hud-value--mode{ font-size:14px; }
.hud-good{ color:var(--success); }
.hud-errors{ color:var(--error); }

.stimulus-frame{
  width:100%;
  border:1px solid var(--line);
  border-radius:var(--radius-lg);
  background:var(--panel);
  box-shadow:var(--shadow-card);
  padding:18px;
  display:flex;
}
.stimulus-stage{
  flex:1;
  min-height:220px;
  display:flex;
  align-items:center;
  justify-content:center;
  background:
    linear-gradient(var(--line-soft) 1px, transparent 1px) 0 0/32px 32px,
    linear-gradient(90deg, var(--line-soft) 1px, transparent 1px) 0 0/32px 32px,
    #FCFDFF;
  border-radius:var(--radius-md);
  border:1px solid var(--line-soft);
}
.stimulus-circle{ width:120px; height:120px; border-radius:50%; box-shadow:0 12px 28px -10px rgba(15,37,64,0.35); }
.stimulus-circle--go{ background:var(--success); }
.stimulus-circle--nogo{ background:var(--error); }
.stimulus-fixation{ font-size:36px; color:var(--ink-soft); opacity:0.4; user-select:none; }

.response-btn{ max-width:320px; }
.practice-hint{ font-size:12.5px; color:var(--ink-soft); margin:0; }
.practice-hint--muted{ opacity:0.75; }

/* ---------------- Completion ---------------- */
.completion-badge{
  width:52px; height:52px; border-radius:50%;
  background:var(--success-tint); color:var(--success);
  display:flex; align-items:center; justify-content:center;
  margin:0 auto 18px;
}
.metrics-grid{ display:grid; grid-template-columns:repeat(4, 1fr); gap:12px; margin:8px 0 26px; }
.metric-tile{
  border:1px solid var(--line);
  border-radius:var(--radius-sm);
  padding:16px 14px;
  display:flex; flex-direction:column; gap:6px;
  background:var(--paper);
  text-align:left;
}
.metric-tile--primary{
  grid-column:span 4;
  background:var(--primary-tint);
  border-color:#C8D7F7;
  align-items:flex-start;
}
.metric-label{ font-size:11.5px; color:var(--ink-soft); text-transform:uppercase; letter-spacing:0.05em; font-weight:600; }
.metric-value{ font-size:20px; font-weight:700; color:var(--ink); }
.metric-value--warn{ color:var(--error); }
.metric-tile--primary .metric-value{ font-size:38px; color:var(--primary-dark); }
.interpretation-text{ font-size:13px; color:var(--ink-soft); margin-top:2px; }

.severity-badge{ display:inline-block; padding:4px 12px; border-radius:999px; font-size:11.5px; font-weight:700; margin-top:2px; }
.severity-badge--none{ background:var(--success-tint); color:var(--success); }
.severity-badge--mild{ background:var(--warning-tint); color:var(--warning); }
.severity-badge--moderate{ background:var(--warning-tint); color:var(--warning); }
.severity-badge--severe{ background:var(--error-tint); color:var(--error); }

.exec-summary{ text-align:left; margin-bottom:24px; }
.instruction-label{ font-family:var(--font-display); font-weight:600; font-size:14.5px; margin-bottom:12px; color:var(--ink); }
.score-bar-row{ display:grid; grid-template-columns:180px 1fr 40px; align-items:center; gap:12px; margin-bottom:10px; }
.score-bar-label{ font-size:12.5px; color:var(--ink-soft); font-weight:600; }
.score-bar-track{ height:10px; background:var(--line-soft); border-radius:999px; overflow:hidden; }
.score-bar-fill{ height:100%; background:var(--primary); border-radius:999px; transition:width .4s ease; }
.score-bar-value{ font-size:12.5px; font-weight:700; text-align:right; }

.trial-review-toggle{ width:100%; margin-bottom:10px; }
.trial-review-wrapper{ max-height:360px; overflow:auto; border:1px solid var(--line); border-radius:var(--radius-sm); margin-bottom:10px; text-align:left; }
.trial-review-table{ width:100%; border-collapse:collapse; font-size:12.5px; }
.trial-review-table thead th{ position:sticky; top:0; background:var(--paper); text-align:left; padding:9px 12px; color:var(--ink-soft); font-weight:700; border-bottom:1px solid var(--line); }
.trial-review-table td{ padding:8px 12px; border-bottom:1px solid var(--line-soft); color:var(--ink); }
.row-incorrect{ background:rgba(199,67,63,0.05); }
.outcome-pill{ display:inline-block; padding:3px 10px; border-radius:999px; font-size:11.5px; font-weight:700; }
.outcome-pill--correct{ background:var(--success-tint); color:var(--success); }
.outcome-pill--incorrect{ background:var(--error-tint); color:var(--error); }

/* ---------------- Responsive ---------------- */
@media (max-width: 720px){
  .card{ padding:30px 22px 26px; }
  .display-xl{ font-size:28px; }
  .mode-grid{ grid-template-columns:1fr; }
  .hud{ grid-template-columns:1fr; }
  .metrics-grid{ grid-template-columns:1fr 1fr; }
  .metric-tile--primary{ grid-column:span 2; }
  .app-topbar{ padding:14px 18px; }
  .stimulus-frame{ padding:10px; }
  .score-bar-row{ grid-template-columns:120px 1fr 34px; }
}
@media (max-width: 420px){
  .metrics-grid{ grid-template-columns:1fr; }
  .metric-tile--primary{ grid-column:span 1; }
  .row-actions{ flex-direction:column-reverse; }
}
`;
