import { ODDBALL_CONFIG } from '../config/oddballConfig.js';
// median/mean/standardDeviation/roundMetric now live in the shared
// ../utils/stats.js (used by other Neuromorph modules too); re-exported
// here so existing imports in this module keep working unchanged.
import { median, mean, standardDeviation, roundMetric } from './stats.js';

export { median, mean, standardDeviation, roundMetric };

/**
 * Inverse standard normal CDF (probit function), via Peter Acklam's
 * rational approximation (accurate to ~1.15e-9). Used to convert hit/false
 * alarm rates into z-scores for signal-detection measures (d′, criterion) —
 * the same underlying calculation used by clinical CPT instruments
 * (Conners CPT-3, TOVA) to score "detectability".
 */
export function inverseNormalCDF(p) {
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;

  const a = [
    -3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2,
    1.38357751867269e2, -3.066479806614716e1, 2.506628277459239e0,
  ];
  const b = [
    -5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2,
    6.680131188771972e1, -1.328068155288572e1,
  ];
  const c = [
    -7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838e0,
    -2.549732539343734e0, 4.374664141464968e0, 2.938163982698783e0,
  ];
  const d = [
    7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996e0,
    3.754408661907416e0,
  ];

  const pLow = 0.02425;
  const pHigh = 1 - pLow;

  if (p < pLow) {
    const q = Math.sqrt(-2 * Math.log(p));
    return (
      (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    );
  }
  if (p <= pHigh) {
    const q = p - 0.5;
    const r = q * q;
    return (
      (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) *
      q /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
    );
  }
  const q = Math.sqrt(-2 * Math.log(1 - p));
  return -(
    (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
    ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
  );
}

/**
 * Signal-detection measures: d′ (detectability) and criterion (response
 * bias). This is the standard scoring approach used by clinical Continuous
 * Performance Tests (Conners CPT-3, TOVA) — d′ = Z(hit rate) − Z(false
 * alarm rate); criterion = −0.5 × (Z(hit rate) + Z(false alarm rate)).
 *
 * Uses the log-linear correction (add 0.5 to the count, 1 to the total)
 * so a perfect or zero hit/false-alarm rate never produces an infinite
 * z-score. Returns nulls when there are no target or no non-target trials
 * to measure against.
 */
export function calculateSignalDetection(hits, targetTrialCount, falseAlarms, nonTargetTrialCount) {
  if (!targetTrialCount || !nonTargetTrialCount) {
    return { dPrime: null, criterion: null };
  }
  const hitRateAdj = (hits + 0.5) / (targetTrialCount + 1);
  const falseAlarmRateAdj = (falseAlarms + 0.5) / (nonTargetTrialCount + 1);
  const zHit = inverseNormalCDF(hitRateAdj);
  const zFalseAlarm = inverseNormalCDF(falseAlarmRateAdj);
  return {
    dPrime: zHit - zFalseAlarm,
    criterion: -0.5 * (zHit + zFalseAlarm),
  };
}

/** Summarizes hit rate / hit reaction time for one subset of trials (a "half" of the session). */
function summarizeSubset(subset) {
  const targets = subset.filter((t) => t.stimulusType === 'target');
  const hits = subset.filter((t) => t.responseType === 'HIT');
  const hitReactionTimes = hits
    .map((t) => t.reactionTime)
    .filter((rt) => typeof rt === 'number' && Number.isFinite(rt));
  return {
    targetTrials: targets.length,
    hits: hits.length,
    targetDetectionRate: targets.length ? (hits.length / targets.length) * 100 : null,
    meanReactionTime: hitReactionTimes.length ? mean(hitReactionTimes) : null,
  };
}

/**
 * Splits the session into a first and second half (by trial order) and
 * summarizes each — the same "time-on-task" comparison clinical CPT tools
 * (e.g. TOVA) use to detect a vigilance decrement across a session, as
 * distinct from an overall average.
 */
function calculateSessionHalves(trials) {
  if (!trials.length) return null;
  const midpoint = Math.ceil(trials.length / 2);
  return {
    firstHalf: summarizeSubset(trials.slice(0, midpoint)),
    secondHalf: summarizeSubset(trials.slice(midpoint)),
  };
}

/**
 * Computes all behavioural metrics for a completed set of actual-assessment
 * trial records. Practice trials must never be passed here.
 *
 * Trial records are expected to carry: stimulusType ('standard' | 'target'),
 * reactionTime (number | null), responseType
 * ('HIT' | 'MISS' | 'FALSE_ALARM' | 'CORRECT_REJECTION').
 *
 * All division-by-zero / empty-set cases resolve to null, never NaN.
 */
export function calculateOddballMetrics(trials, config = ODDBALL_CONFIG) {
  const safeTrials = Array.isArray(trials) ? trials : [];

  const targetTrials = safeTrials.filter((t) => t.stimulusType === 'target');
  const nonTargetTrials = safeTrials.filter((t) => t.stimulusType === 'standard');

  const hits = safeTrials.filter((t) => t.responseType === 'HIT');
  const misses = safeTrials.filter((t) => t.responseType === 'MISS');
  const falseAlarms = safeTrials.filter((t) => t.responseType === 'FALSE_ALARM');
  const correctRejections = safeTrials.filter((t) => t.responseType === 'CORRECT_REJECTION');

  const hitReactionTimes = hits
    .map((t) => t.reactionTime)
    .filter((rt) => typeof rt === 'number' && Number.isFinite(rt));

  const targetDetectionRate = targetTrials.length
    ? (hits.length / targetTrials.length) * 100
    : null;

  const falseAlarmRate = nonTargetTrials.length
    ? (falseAlarms.length / nonTargetTrials.length) * 100
    : null;

  const accuracy = safeTrials.length
    ? ((hits.length + correctRejections.length) / safeTrials.length) * 100
    : null;

  const medianReactionTime = hitReactionTimes.length ? median(hitReactionTimes) : null;
  const meanReactionTime = hitReactionTimes.length ? mean(hitReactionTimes) : null;
  const reactionTimeStdDev = hitReactionTimes.length ? standardDeviation(hitReactionTimes) : null;
  const reactionTimeCV =
    reactionTimeStdDev != null && meanReactionTime ? reactionTimeStdDev / meanReactionTime : null;

  const lapseCount = hitReactionTimes.filter((rt) => rt > config.lapseThresholdMs).length;

  const { dPrime, criterion } = calculateSignalDetection(
    hits.length,
    targetTrials.length,
    falseAlarms.length,
    nonTargetTrials.length
  );

  // Responses under the perseveration threshold are too fast to reflect a
  // genuine stimulus-driven reaction (anticipatory / random tapping),
  // regardless of whether they happened to land on a target or not.
  const perseverativeResponses = safeTrials.filter(
    (t) =>
      (t.responseType === 'HIT' || t.responseType === 'FALSE_ALARM') &&
      typeof t.reactionTime === 'number' &&
      t.reactionTime < config.perseverationThresholdMs
  ).length;

  const sessionHalves = calculateSessionHalves(safeTrials);

  return {
    totalTrials: safeTrials.length,
    targetTrials: targetTrials.length,
    nonTargetTrials: nonTargetTrials.length,
    hits: hits.length,
    misses: misses.length,
    falseAlarms: falseAlarms.length,
    correctRejections: correctRejections.length,
    targetDetectionRate,
    accuracy,
    falseAlarmRate,
    medianReactionTime,
    meanReactionTime,
    reactionTimeStdDev,
    reactionTimeCV,
    lapseCount,
    dPrime,
    responseCriterion: criterion,
    perseverativeResponses,
    sessionHalves,
  };
}
