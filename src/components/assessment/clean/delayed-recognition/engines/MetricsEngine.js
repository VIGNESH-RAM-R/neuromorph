// MetricsEngine
// -----------------------------------------------------------------------------
// Single responsibility: aggregate an array of scored category trials into
// the full metrics set. Every weight is read from a scoringConfig parameter
// (defaulting to SCORING_CONFIG) rather than hardcoded, matching every other
// NeuroMorph module's convention.
import { SCORING_CONFIG } from '../config/scoringConfig.js';

const clamp = (v) => Math.max(0, Math.min(100, v));

export const MetricsEngine = {
  compute(trials, config = SCORING_CONFIG) {
    let totalHits = 0, totalMisses = 0, totalFP = 0, totalCR = 0, totalTargets = 0, totalDistractors = 0;
    let allOutcomes = [];
    trials.forEach((t) => {
      totalHits += t.hits;
      totalMisses += t.misses;
      totalFP += t.falsePositives;
      totalCR += t.correctRejections;
      totalTargets += t.totalTargets;
      totalDistractors += t.totalDistractors;
      allOutcomes = allOutcomes.concat(t.targetOutcomes);
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
    const delayedRecognitionAccuracy = clamp(((totalHits + totalCR) / (totalTargets + totalDistractors)) * 100);

    // Encoding Preservation / Memory Decay: restricted to items that were
    // correctly recognized at their SOURCE module's own immediate test.
    // Among those strongly-encoded items, what fraction survive this long
    // delay (preservation) vs are now missed (decay) -- exact complements
    // of each other by construction, both reported since they read
    // differently on a clinical report (higher-is-better vs lower-is-better).
    const strong = allOutcomes.filter((o) => o.wasRecognizedAtEncoding === true);
    const strongStillRecognized = strong.filter((o) => o.recognizedNow).length;
    const encodingPreservationScore = strong.length ? clamp((strongStillRecognized / strong.length) * 100) : 0;
    const memoryDecayIndex = strong.length ? clamp(100 - encodingPreservationScore) : 0;

    // Delayed Retention Score: hit rate across ALL retrieved items regardless
    // of original encoding strength -- the headline "does this survive the
    // long delay and intervening unrelated tasks" number.
    const delayedRetentionScore = hitRate;

    const speedScore = clamp(100 - (avgTime / 30000) * 100);
    const rsw = config.retrievalSubWeights;
    const retrievalScore = clamp(rsw.correctRejection * correctRejectionRate + rsw.speed * speedScore);

    const ew = config.efficiencyWeights;
    const recognitionEfficiency = clamp(ew.accuracy * delayedRecognitionAccuracy + ew.speed * speedScore);

    const cv = avgTime > 0 ? sd / avgTime : 0;
    const attentionConsistency = clamp(100 * (1 - Math.min(cv, 1)));
    const processingSpeedScore = speedScore;

    const rawScore = clamp(
      trials.reduce((s, t) => s + Math.max(0, ((t.hits - t.falsePositives) / t.totalTargets) * 100), 0) / trials.length
    );
    const normalizedScore = clamp(rawScore);

    const cw = config.cognitiveWeights;
    const cognitiveScore = clamp(
      cw.retention * delayedRetentionScore +
      cw.encoding * encodingPreservationScore +
      cw.retrieval * retrievalScore +
      cw.processingSpeed * processingSpeedScore
    );

    return {
      delayedRecognitionAccuracy, hitRate, missRate, falsePositiveRate, correctRejectionRate,
      averageRecognitionTimeMs: Math.round(avgTime), fastestRecognitionTimeMs: fastestTime, slowestRecognitionTimeMs: slowestTime,
      reactionTimeVariability: Math.round(sd), timeouts,
      encodingPreservationScore, retrievalScore, delayedRetentionScore, recognitionEfficiency, memoryDecayIndex,
      attentionConsistency, processingSpeedScore,
      rawScore, normalizedScore, cognitiveScore,
      incorrectSelections: totalFP
    };
  }
};
