/**
 * Trial-level scoring for Sequence Memory. Kept separate from UI and from
 * assessment-level aggregation (sequenceMetrics.js) so it can be tested and
 * validated independently.
 *
 * A mistake mid-sequence does not stop response collection — the full
 * response is always recorded and scored, preserving both exact-correctness
 * and partial-recall information (they are different, and both matter).
 */

/**
 * @param {string[]} targetSequence - the presented sequence, in order.
 * @param {string[]} userSequence - the participant's tapped sequence, in order.
 * @param {{ recallStartTime: number, tapTimestamps: number[] }} timestamps -
 *   hi-res (performance.now()) timestamps: when REPEAT began, and each tap.
 */
export function calculateTrialResult(targetSequence, userSequence, timestamps = {}) {
  const { recallStartTime = null, tapTimestamps = [] } = timestamps;
  const length = targetSequence.length;

  let numberCorrect = 0;
  let firstErrorPosition = null;
  for (let i = 0; i < length; i++) {
    if (userSequence[i] === targetSequence[i]) {
      numberCorrect += 1;
    } else if (firstErrorPosition === null) {
      firstErrorPosition = i + 1; // 1-indexed, matching how positions are described to clinicians
    }
  }

  const exactCorrect = numberCorrect === length && userSequence.length === length;
  const partialAccuracy = length ? numberCorrect / length : null;

  const firstResponseLatency =
    tapTimestamps.length && recallStartTime != null ? tapTimestamps[0] - recallStartTime : null;

  const totalRecallTime =
    tapTimestamps.length && recallStartTime != null
      ? tapTimestamps[tapTimestamps.length - 1] - recallStartTime
      : null;

  const interTapIntervals = [];
  for (let i = 1; i < tapTimestamps.length; i++) {
    interTapIntervals.push(tapTimestamps[i] - tapTimestamps[i - 1]);
  }

  return {
    exactCorrect,
    numberCorrect,
    partialAccuracy,
    firstErrorPosition,
    totalRecallTime,
    firstResponseLatency,
    interTapIntervals,
  };
}
