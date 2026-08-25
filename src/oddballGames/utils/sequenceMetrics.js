import { mean, median, standardDeviation } from './stats.js';

/**
 * "Mean Span": a partial-credit span estimate, in the spirit of the
 * psychophysically-derived mean-span scoring used in span-task reliability
 * research (as opposed to the traditional all-or-nothing "maximum span").
 * Studies comparing scoring methods found mean-span-style metrics have
 * higher test-retest reliability than max-span/total-correct — relevant
 * here because Neuromorph's value is in longitudinal comparison.
 *
 * Method: for each sequence length actually tested, compute the proportion
 * of trials passed at that length (0, 0.5, or 1 with 2 trials/level). Sum
 * those proportions and add the length just below the shortest length
 * tested, as a baseline offset. A participant who passes every trial at
 * every tested length gets a mean span equal to the top tested length;
 * one who passes nothing scores just below the shortest tested length.
 *
 * This is an engineering approximation of the published "mean span"
 * concept, not a validated clinical formula — documented here so the
 * exact method is transparent and reproducible.
 */
export function calculateMeanSpan(trials) {
  const safeTrials = Array.isArray(trials) ? trials : [];
  if (!safeTrials.length) return null;

  const byLength = new Map();
  safeTrials.forEach((t) => {
    if (!byLength.has(t.sequenceLength)) byLength.set(t.sequenceLength, []);
    byLength.get(t.sequenceLength).push(t);
  });

  const lengths = [...byLength.keys()].sort((a, b) => a - b);
  const baselineOffset = lengths[0] - 1;

  const proportionSum = lengths.reduce((sum, length) => {
    const group = byLength.get(length);
    const correctCount = group.filter((t) => t.exactCorrect === true).length;
    return sum + correctCount / group.length;
  }, 0);

  return baselineOffset + proportionSum;
}

/**
 * Aggregates a completed set of assessment trial records into the
 * assessment-level summary. Practice trials must never be passed here.
 *
 * All division-by-zero / empty-set cases resolve to null, never NaN.
 */
export function calculateAssessmentSummary(trials) {
  const safeTrials = Array.isArray(trials) ? trials : [];
  const totalTrialCount = safeTrials.length;

  const correctTrials = safeTrials.filter((t) => t.exactCorrect === true);
  const correctTrialCount = correctTrials.length;

  // "Maximum Sequence Span": the longest sequence length successfully
  // reproduced exactly. Not assumed to equal "working-memory capacity" —
  // it is one behavioural indicator among several reported.
  const maximumSequenceSpan = correctTrials.length
    ? Math.max(...correctTrials.map((t) => t.sequenceLength))
    : null;

  const meanSpan = calculateMeanSpan(safeTrials);

  // A common Corsi-style composite: span achieved x number of sequences
  // correctly reproduced. Only meaningful once at least one trial was
  // exactly correct.
  const compositeScore =
    maximumSequenceSpan != null ? maximumSequenceSpan * correctTrialCount : null;

  const overallAccuracy = totalTrialCount ? correctTrialCount / totalTrialCount : null;

  const partialAccuracies = safeTrials
    .map((t) => t.partialAccuracy)
    .filter((v) => typeof v === 'number' && Number.isFinite(v));
  const meanPartialAccuracy = partialAccuracies.length ? mean(partialAccuracies) : null;

  const recallTimes = safeTrials
    .map((t) => t.totalRecallTime)
    .filter((v) => typeof v === 'number' && Number.isFinite(v));
  const meanRecallTime = recallTimes.length ? mean(recallTimes) : null;
  const medianRecallTime = recallTimes.length ? median(recallTimes) : null;
  // Recall-time consistency across trials — complements the average speed
  // figure the same way response-time variability complements mean
  // reaction time in attention tasks.
  const recallTimeStdDev = recallTimes.length ? standardDeviation(recallTimes) : null;

  const firstResponseLatencies = safeTrials
    .map((t) => t.firstResponseLatency)
    .filter((v) => typeof v === 'number' && Number.isFinite(v));
  const meanFirstResponseLatency = firstResponseLatencies.length
    ? mean(firstResponseLatencies)
    : null;

  const totalErrors = totalTrialCount - correctTrialCount;

  return {
    maximumSequenceSpan,
    meanSpan,
    compositeScore,
    overallAccuracy,
    meanPartialAccuracy,
    meanRecallTime,
    medianRecallTime,
    recallTimeStdDev,
    meanFirstResponseLatency,
    totalErrors,
    correctTrialCount,
    totalTrialCount,
  };
}
