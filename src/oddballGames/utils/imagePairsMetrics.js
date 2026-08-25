import { mean, median, standardDeviation } from './stats.js';

/**
 * Aggregates a completed (or timed-out/interrupted) engine state into the
 * assessment-level summary. Card selections and pair decisions are tracked
 * as separate counters throughout (see engines/imagePairsEngine.js) and
 * must stay separate here too — accuracy is computed from pair decisions,
 * never from raw card-click counts (spec sections 22-25, 69).
 *
 * All division-by-zero / empty-set cases resolve to null, never NaN.
 */
export function calculateImagePairsSummary(engineState) {
  const pairDecisions = Array.isArray(engineState?.pairDecisions) ? engineState.pairDecisions : [];
  const cardEvents = Array.isArray(engineState?.cardEvents) ? engineState.cardEvents : [];

  const correctPairs = pairDecisions.filter((d) => d.correct).length;
  const incorrectAttempts = pairDecisions.filter((d) => !d.correct).length;
  const totalPairDecisions = pairDecisions.length;

  // accuracy = correct pair decisions / total pair decisions x 100 (spec section 23)
  const accuracy = totalPairDecisions ? (correctPairs / totalPairDecisions) * 100 : null;

  const totalPairs = engineState?.totalPairs ?? null;
  const unmatchedPairs = totalPairs != null ? Math.max(0, totalPairs - correctPairs) : null;

  const completionTimeMs =
    engineState?.startTime != null && engineState?.endTime != null
      ? engineState.endTime - engineState.startTime
      : null;

  const decisionTimes = pairDecisions
    .map((d) => d.decisionTimeMs)
    .filter((v) => typeof v === 'number' && Number.isFinite(v));
  const meanDecisionTimeMs = decisionTimes.length ? mean(decisionTimes) : null;
  const medianDecisionTimeMs = decisionTimes.length ? median(decisionTimes) : null;
  const decisionTimeStdDevMs = decisionTimes.length ? standardDeviation(decisionTimes) : null;

  const totalCardSelections = cardEvents.length;

  // Efficiency: an engineering-defined convenience ratio (not a validated
  // clinical index — documented here exactly like Sequence Memory's
  // compositeScore) comparing actual card flips against the theoretical
  // minimum needed to find every pair with perfect recall (2 per pair).
  // 100% = perfect play; lower values mean more exploratory/incorrect flips.
  const efficiency =
    totalCardSelections > 0 && totalPairs
      ? Math.min(100, (totalPairs * 2 * 100) / totalCardSelections)
      : null;

  const completed = engineState?.completionReason === 'ALL_MATCHED';

  return {
    totalPairs,
    correctPairs,
    incorrectAttempts,
    totalPairDecisions,
    unmatchedPairs,
    accuracy,
    completionTimeMs,
    meanDecisionTimeMs,
    medianDecisionTimeMs,
    decisionTimeStdDevMs,
    totalCardSelections,
    efficiency,
    completed,
    completionReason: engineState?.completionReason ?? null,
  };
}
