import { mean, median, standardDeviation } from './stats.js';

/**
 * Descriptive first/middle/final-third reaction-time trend (spec section
 * 32). Purely descriptive — the "direction" label uses a fixed 10%-of-
 * first-third-RT threshold to decide "faster/slower/stable" for display
 * only. This is NOT a validated clinical trend-detection method; it exists
 * so the result screen can say something more useful than a raw table.
 * Returns all-nulls when there are too few valid trials for thirds to be
 * meaningful (fewer than 6).
 */
export function calculatePerformanceTrend(hitTrials) {
  const safe = Array.isArray(hitTrials) ? hitTrials : [];
  if (safe.length < 6) {
    return { firstThirdMeanRT: null, middleThirdMeanRT: null, finalThirdMeanRT: null, direction: null };
  }

  const sorted = [...safe].sort((a, b) => a.trial - b.trial);
  const n = sorted.length;
  const thirdSize = Math.floor(n / 3);
  const firstThird = sorted.slice(0, thirdSize);
  const finalThird = sorted.slice(n - thirdSize);
  const middleThird = sorted.slice(thirdSize, n - thirdSize);

  const firstThirdMeanRT = mean(firstThird.map((t) => t.reactionTime));
  const middleThirdMeanRT = middleThird.length ? mean(middleThird.map((t) => t.reactionTime)) : null;
  const finalThirdMeanRT = mean(finalThird.map((t) => t.reactionTime));

  let direction = null;
  if (firstThirdMeanRT != null && finalThirdMeanRT != null) {
    const diff = finalThirdMeanRT - firstThirdMeanRT;
    const threshold = firstThirdMeanRT * 0.1;
    direction = diff > threshold ? 'slower' : diff < -threshold ? 'faster' : 'stable';
  }

  return { firstThirdMeanRT, middleThirdMeanRT, finalThirdMeanRT, direction };
}

/**
 * Aggregates a completed run's raw trial records + false-response events
 * into the assessment-level summary. `trials` includes every target
 * opportunity (result: 'correct' | 'miss' | 'truncated' — a trial voided
 * by a pause or by the assessment ending mid-window is 'truncated' and is
 * excluded from accuracy/RT statistics, since the participant was never
 * given the full, standardized response window for it — spec sections 28,
 * 29, 81). False responses are tracked as fully separate events and must
 * never be folded into hits/misses/totalOpportunities.
 *
 * All division-by-zero / empty-set cases resolve to null, never NaN.
 */
export function calculateAssessmentSummary(trials, falseResponseEvents, meta = {}) {
  const safeTrials = Array.isArray(trials) ? trials : [];
  const safeFalse = Array.isArray(falseResponseEvents) ? falseResponseEvents : [];

  const validTrials = safeTrials.filter((t) => t.result === 'correct' || t.result === 'miss');
  const hitTrials = validTrials.filter((t) => t.result === 'correct');
  const missTrials = validTrials.filter((t) => t.result === 'miss');
  const truncatedTrialCount = safeTrials.length - validTrials.length;

  const totalOpportunities = validTrials.length;
  const hits = hitTrials.length;
  const misses = missTrials.length;
  const falseResponses = safeFalse.length;

  const reactionTimes = hitTrials
    .map((t) => t.reactionTime)
    .filter((v) => typeof v === 'number' && Number.isFinite(v) && v >= 0);

  const meanReactionTime = reactionTimes.length ? mean(reactionTimes) : null;
  const medianReactionTime = reactionTimes.length ? median(reactionTimes) : null;
  const minReactionTime = reactionTimes.length ? Math.min(...reactionTimes) : null;
  const maxReactionTime = reactionTimes.length ? Math.max(...reactionTimes) : null;
  const reactionTimeSD = reactionTimes.length ? standardDeviation(reactionTimes) : null;
  const coefficientOfVariation =
    meanReactionTime != null && meanReactionTime !== 0 && reactionTimeSD != null
      ? (reactionTimeSD / meanReactionTime) * 100
      : null;

  const accuracy = totalOpportunities ? (hits / totalOpportunities) * 100 : null;
  const missRate = totalOpportunities ? (misses / totalOpportunities) * 100 : null;
  // Rate relative to all recorded responses (valid target opportunities +
  // false responses) — an engineering convenience figure, documented as
  // such; the raw falseResponses count is the primary reported measure.
  const falseResponseRate =
    totalOpportunities + falseResponses > 0 ? (falseResponses / (totalOpportunities + falseResponses)) * 100 : null;

  const trend = calculatePerformanceTrend(hitTrials);

  return {
    totalOpportunities,
    hits,
    misses,
    falseResponses,
    truncatedTrialCount,
    accuracy,
    missRate,
    falseResponseRate,
    meanReactionTime,
    medianReactionTime,
    minReactionTime,
    maxReactionTime,
    reactionTimeSD,
    coefficientOfVariation,
    trend,
    score: meta.score ?? null,
    paused: (meta.pauseCount ?? 0) > 0,
    pauseCount: meta.pauseCount ?? 0,
    totalPausedDurationMs: meta.totalPausedDurationMs ?? 0,
    completionReason: meta.reason ?? null,
  };
}
