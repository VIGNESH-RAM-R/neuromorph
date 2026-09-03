// MetricsEngine
// -----------------------------------------------------------------------------
// Single responsibility: aggregate an array of scored trial results into the
// full metrics set. Every formula reads its weights from a scoringConfig
// parameter (defaulting to SCORING_CONFIG) rather than hardcoding literals,
// so clinical validation can retune weights without an engine change.
//
// This always computes and returns EVERY metric -- core and research alike.
// Which ones the completion report renders is a UI-layer decision (see
// config/scoringConfig.js CORE_METRIC_KEYS / RESEARCH_METRIC_KEYS), not a
// data-layer one.
import { SCORING_CONFIG } from '../config/scoringConfig.js';

const clamp = (v) => Math.max(0, Math.min(100, v));

export const MetricsEngine = {
  compute(trials, config = SCORING_CONFIG) {
    let totalHits = 0, totalMisses = 0, totalFP = 0, totalCR = 0, totalTargets = 0, totalDistractors = 0;
    trials.forEach((t) => {
      totalHits += t.hits;
      totalMisses += t.misses;
      totalFP += t.falsePositives;
      totalCR += t.correctRejections;
      totalTargets += t.totalTargets;
      totalDistractors += t.totalDistractors;
    });

    const times = trials.map((t) => t.reactionTimeMs);
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const fastestTime = Math.min(...times);
    const slowestTime = Math.max(...times);
    const variance = times.reduce((s, t) => s + (t - avgTime) ** 2, 0) / times.length;
    const sd = Math.sqrt(variance);
    const timeouts = trials.filter((t) => t.timedOut).length;

    const hitRate = clamp((totalHits / totalTargets) * 100);
    const missRate = clamp((totalMisses / totalTargets) * 100);
    const falsePositiveRate = clamp((totalFP / totalDistractors) * 100);
    const correctRejectionRate = clamp((totalCR / totalDistractors) * 100);
    const overallRecognitionAccuracy = clamp(((totalHits + totalCR) / (totalTargets + totalDistractors)) * 100);

    const dw = config.difficultyWeights;
    let wSum = 0, encSum = 0;
    trials.forEach((t) => {
      const w = dw[t.difficulty];
      wSum += w;
      encSum += (t.hits / t.totalTargets) * 100 * w;
    });
    const encodingScore = clamp(encSum / wSum);

    const speedScore = clamp(100 - (avgTime / 30000) * 100);
    const rsw = config.retrievalSubWeights;
    const retrievalScore = clamp(rsw.correctRejection * correctRejectionRate + rsw.speed * speedScore);

    // Delay is fixed at 10s for every trial by clinical rule, so hit rate
    // after that fixed delay is retention's direct operationalization --
    // there's no decay curve to fit without a variable delay (see spec §8).
    const memoryRetentionScore = hitRate;

    const vmw = config.visualMemoryWeights;
    const visualMemoryScore = clamp(
      vmw.encoding * encodingScore + vmw.retrieval * retrievalScore + vmw.retention * memoryRetentionScore
    );

    const cv = avgTime > 0 ? sd / avgTime : 0;
    const attentionConsistency = clamp(100 * (1 - Math.min(cv, 1)));
    const processingSpeedScore = speedScore;

    const rawScore = clamp(
      trials.reduce((s, t) => s + Math.max(0, ((t.hits - t.falsePositives) / t.totalTargets) * 100), 0) / trials.length
    );
    const normalizedScore = clamp(rawScore);

    const cw = config.cognitiveWeights;
    const cognitiveScore = clamp(
      cw.visualMemory * visualMemoryScore +
      cw.encoding * encodingScore +
      cw.retrieval * retrievalScore +
      cw.processingSpeed * processingSpeedScore
    );

    return {
      overallRecognitionAccuracy, hitRate, missRate, falsePositiveRate, correctRejectionRate,
      averageRecognitionTimeMs: Math.round(avgTime), fastestRecognitionTimeMs: fastestTime, slowestRecognitionTimeMs: slowestTime,
      reactionTimeVariability: Math.round(sd), timeouts,
      encodingScore, retrievalScore, memoryRetentionScore, visualMemoryScore,
      attentionConsistency, processingSpeedScore,
      rawScore, normalizedScore, cognitiveScore,
      incorrectSelections: totalFP
    };
  }
};
