import { mean, median, standardDeviation } from './stats.js';

/**
 * Assessment-level aggregation for Point & Click, kept separate from the UI
 * and from trial generation. Trial-level classification (HIT / MISS /
 * FALSE_ALARM / CORRECT_REJECTION) is produced by the trial engine at
 * response time; this function only summarizes an already-classified trial
 * list. Accuracy (hit rate on target-present trials) is reported separately
 * from correctRejectionRate/falseAlarmRate rather than blended into one
 * ambiguous percentage. Every field is null-safe for empty/partial input.
 */
export function calculatePointClickResults(trials) {
  const safeTrials = Array.isArray(trials) ? trials : [];
  const totalTrials = safeTrials.length;

  const targetPresentTrials = safeTrials.filter((t) => t.targetPresent);
  const noTargetTrials = safeTrials.filter((t) => !t.targetPresent);

  const hits = safeTrials.filter((t) => t.responseType === 'HIT');
  const misses = safeTrials.filter((t) => t.responseType === 'MISS');
  const falseAlarms = safeTrials.filter((t) => t.responseType === 'FALSE_ALARM');
  const correctRejections = safeTrials.filter((t) => t.responseType === 'CORRECT_REJECTION');

  const falseAlarmsOnTargetPresent = falseAlarms.filter((t) => t.targetPresent).length;
  const falseAlarmsOnNoTarget = falseAlarms.filter((t) => !t.targetPresent).length;

  const accuracy = targetPresentTrials.length ? (hits.length / targetPresentTrials.length) * 100 : null;
  const correctRejectionRate = noTargetTrials.length ? (correctRejections.length / noTargetTrials.length) * 100 : null;
  const falseAlarmRate = noTargetTrials.length ? (falseAlarmsOnNoTarget / noTargetTrials.length) * 100 : null;

  const hitResponseTimes = hits
    .map((t) => t.responseTime)
    .filter((rt) => typeof rt === 'number' && Number.isFinite(rt));

  const meanResponseTime = hitResponseTimes.length ? mean(hitResponseTimes) : null;
  const medianResponseTime = hitResponseTimes.length ? median(hitResponseTimes) : null;
  const fastestResponseTime = hitResponseTimes.length ? Math.min(...hitResponseTimes) : null;
  const slowestResponseTime = hitResponseTimes.length ? Math.max(...hitResponseTimes) : null;
  const responseTimeStdDev = hitResponseTimes.length ? standardDeviation(hitResponseTimes) : null;
  const responseTimeCV =
    responseTimeStdDev != null && meanResponseTime ? (responseTimeStdDev / meanResponseTime) * 100 : null;

  const levels = [...new Set(safeTrials.map((t) => t.difficultyLevel))].sort((a, b) => a - b);
  const difficultyResults = levels.map((level) => {
    const levelTrials = safeTrials.filter((t) => t.difficultyLevel === level);
    const levelTargetPresent = levelTrials.filter((t) => t.targetPresent);
    const levelHits = levelTrials.filter((t) => t.responseType === 'HIT');
    const levelHitRTs = levelHits
      .map((t) => t.responseTime)
      .filter((rt) => typeof rt === 'number' && Number.isFinite(rt));
    return {
      level,
      trials: levelTrials.length,
      accuracy: levelTargetPresent.length ? (levelHits.length / levelTargetPresent.length) * 100 : null,
      medianResponseTime: levelHitRTs.length ? median(levelHitRTs) : null,
    };
  });

  const trialResponseTimes = safeTrials.map((t) => ({
    trialNumber: t.trialNumber,
    responseTime: t.responseType === 'HIT' ? t.responseTime : null,
    responseType: t.responseType,
  }));

  return {
    totalTrials,
    targetPresentTrials: targetPresentTrials.length,
    noTargetTrials: noTargetTrials.length,
    correctHits: hits.length,
    misses: misses.length,
    falseAlarms: falseAlarms.length,
    falseAlarmsOnTargetPresent,
    falseAlarmsOnNoTarget,
    correctRejections: correctRejections.length,
    accuracy,
    correctRejectionRate,
    falseAlarmRate,
    meanResponseTime,
    medianResponseTime,
    fastestResponseTime,
    slowestResponseTime,
    responseTimeStdDev,
    responseTimeCV,
    difficultyResults,
    trialResponseTimes,
  };
}
