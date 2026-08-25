import { GO_NO_GO_CONFIG } from '../config/goNoGoConfig.js';

// Teammate's richer Go/No-Go implementation (2026-08-11 integration),
// adapted into this app's engine/config/component convention -- trial
// generation, response validation, and metric calculation are all pure
// here (Node-testable, no DOM); GoNoGoTask.jsx owns only timing/rendering.

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
 * distributed into randomly-sized, randomly-ordered "gaps" of GO trials --
 * the only way to guarantee both the exact ratio and the run-length cap in
 * one deterministic pass.
 *
 * When allowRepeatNoGo is true, 0, 1, or 2 of those gaps are randomly
 * (not guaranteed -- roughly an 85% chance of at least one) collapsed to
 * zero, which places two NO-GO trials back-to-back. This is capped so a
 * NO-GO run never exceeds 2 in a row, and merge sites are spaced apart so
 * multiple repeats (when they occur) land in different parts of the test.
 */
export function generateGoNoGoTrials(total, noGoCount, maxRunLength, allowRepeatNoGo = false) {
  const goCount = total - noGoCount;
  const gapCount = noGoCount + 1;
  const baseGapSize = Math.floor(goCount / gapCount);
  const remainder = goCount % gapCount;

  const gapIndexOrder = shuffle([...Array(gapCount).keys()]);
  const gapSizes = new Array(gapCount).fill(baseGapSize);
  for (let i = 0; i < remainder; i++) gapSizes[gapIndexOrder[i]] += 1;

  if (allowRepeatNoGo && gapCount >= 2) {
    const r = Math.random();
    const numMerges = r < 0.15 ? 0 : r < 0.65 ? 1 : 2;
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
    for (let g = 0; g < size; g++) sequence.push('GO');
    if (gapIndex < gapSizes.length - 1) sequence.push('NOGO');
  });

  return sequence.map((stimulusType, idx) => ({ trialNumber: idx + 1, stimulusType }));
}

/** Classifies a trial's outcome: HIT / OMISSION_ERROR / CORRECT_INHIBITION / COMMISSION_ERROR. */
export function classifyGoNoGoOutcome(trial, responded, responseTimeMs, responseWindowMs) {
  const withinWindow =
    responded && typeof responseTimeMs === 'number' && responseTimeMs >= 0 && responseTimeMs <= responseWindowMs;
  if (trial.stimulusType === 'GO') return withinWindow ? 'HIT' : 'OMISSION_ERROR';
  return withinWindow ? 'COMMISSION_ERROR' : 'CORRECT_INHIBITION';
}
function isCorrectOutcome(outcome) {
  return outcome === 'HIT' || outcome === 'CORRECT_INHIBITION';
}

function reactionTimeStats(scoredTrials) {
  const rts = scoredTrials.filter((t) => t.outcome === 'HIT' && typeof t.reactionTime === 'number').map((t) => t.reactionTime);
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

export const GoNoGoEngine = {
  generateTrials: generateGoNoGoTrials,
  classifyOutcome: classifyGoNoGoOutcome,

  // scoredTrials: [{ trialNumber, stimulusType: 'GO'|'NOGO', responded,
  //   reactionTime, outcome }] -- outcome already classified via
  // classifyOutcome() as each trial resolves (see GoNoGoTask.jsx).
  score(scoredTrials = [], timing = GO_NO_GO_CONFIG) {
    if (scoredTrials.length === 0) {
      return { score: 0, accuracy: 0, cognitiveScore: 0, interpretation: 'No responses recorded.', severity: 'Severe', metrics: {} };
    }

    const total = scoredTrials.length;
    const goTrials = scoredTrials.filter((t) => t.stimulusType === 'GO');
    const noGoTrials = scoredTrials.filter((t) => t.stimulusType === 'NOGO');

    const correctGoResponses = goTrials.filter((t) => t.outcome === 'HIT').length;
    const omissionErrors = goTrials.filter((t) => t.outcome === 'OMISSION_ERROR').length;
    const correctNoGoInhibitions = noGoTrials.filter((t) => t.outcome === 'CORRECT_INHIBITION').length;
    const commissionErrors = noGoTrials.filter((t) => t.outcome === 'COMMISSION_ERROR').length;

    const goAccuracy = goTrials.length ? (correctGoResponses / goTrials.length) * 100 : 0;
    const noGoAccuracy = noGoTrials.length ? (correctNoGoInhibitions / noGoTrials.length) * 100 : 0;
    const overallAccuracy = ((correctGoResponses + correctNoGoInhibitions) / total) * 100;

    const hitRate = goTrials.length ? correctGoResponses / goTrials.length : 0;
    const falseAlarmRate = noGoTrials.length ? commissionErrors / noGoTrials.length : 0;

    const rtStats = reactionTimeStats(scoredTrials);

    const commissionRTs = noGoTrials.filter((t) => t.outcome === 'COMMISSION_ERROR').map((t) => t.reactionTime).filter((rt) => typeof rt === 'number');
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
      const c = half.filter((t) => t.outcome === 'HIT' || t.outcome === 'CORRECT_INHIBITION').length;
      return (c / half.length) * 100;
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
    const normalizedScore = maxRawScore ? clamp((rawScore / maxRawScore) * 100, 0, 100) : 0;
    const cognitiveScore = Math.round(clamp(0.6 * executiveFunctionScore + 0.4 * normalizedScore, 0, 100));

    let interpretation;
    let severity;
    if (cognitiveScore >= 85) { interpretation = 'Executive function performance within normal range'; severity = 'None'; }
    else if (cognitiveScore >= 70) { interpretation = 'Mildly reduced executive function / response inhibition'; severity = 'Mild'; }
    else if (cognitiveScore >= 55) { interpretation = 'Moderately reduced executive function -- possible early cognitive concern warranting follow-up'; severity = 'Moderate'; }
    else { interpretation = 'Significantly reduced executive function -- clinical follow-up recommended'; severity = 'Severe'; }

    return {
      score: cognitiveScore, // alias so the standard onSubmit({score, raw}) call site works unchanged
      accuracy: round1(overallAccuracy),
      commissionErrors,
      omissionErrors,
      cognitiveScore,
      interpretation,
      severity,
      metrics: {
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
      },
    };
  },
};
