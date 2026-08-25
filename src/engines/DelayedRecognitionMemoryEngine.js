// DelayedRecognitionMemoryEngine
// -----------------------------------------------------------------------------
// Ported near-verbatim from the teammate's delayed_recognition_test project
// (MemoryRetrievalEngine + RecognitionEngine + ValidationEngine +
// MetricsEngine + InterpretationEngine), combined into one file the way this
// app's other multi-part engines already are. No scoring math changed.
import { ITEM_POOLS, DISTRACTOR_COUNT_BY_TYPE, SCORING_CONFIG, MOCK_SESSION_LOG } from '../config/delayedRecognitionMemoryConfig.js';
import { StudyItemRegistry } from './StudyItemRegistry.js';

export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---- MemoryRetrievalEngine: retrieve items other tasks registered ----
export const MemoryRetrievalEngine = {
  retrieveAll({ allowMockFallback = true } = {}) {
    const registered = StudyItemRegistry.retrieveAll();
    if (registered.length > 0) return registered;
    return allowMockFallback ? MOCK_SESSION_LOG : [];
  },
};

// ---- RecognitionEngine: build one category's recognition grid ----
export const RecognitionEngine = {
  buildTrial(studySet) {
    const pool = ITEM_POOLS[studySet.itemType];
    if (!pool) throw new Error(`No distractor pool configured for item type "${studySet.itemType}" yet.`);
    const targetIds = new Set(studySet.items.map((i) => i.id));
    const distractorCandidates = pool.filter((id) => !targetIds.has(id));
    const distractorCount = Math.min(DISTRACTOR_COUNT_BY_TYPE[studySet.itemType] ?? 3, distractorCandidates.length);
    const distractors = shuffle(distractorCandidates).slice(0, distractorCount).map((id) => ({ id, wasRecognizedAtEncoding: null }));
    const grid = [...studySet.items.map((o) => ({ ...o, isTarget: true })), ...distractors.map((o) => ({ ...o, isTarget: false }))];
    return shuffle(grid);
  },
};

// ---- ValidationEngine ----
export const ValidationEngine = {
  validate(selectedIds, grid) {
    let hits = 0, misses = 0, falsePositives = 0, correctRejections = 0;
    const targetOutcomes = [];
    grid.forEach((item) => {
      const selected = selectedIds.includes(item.id);
      if (item.isTarget && selected) hits++;
      else if (item.isTarget && !selected) misses++;
      else if (!item.isTarget && selected) falsePositives++;
      else correctRejections++;
      if (item.isTarget) targetOutcomes.push({ id: item.id, wasRecognizedAtEncoding: item.wasRecognizedAtEncoding, recognizedNow: selected });
    });
    return {
      hits, misses, falsePositives, correctRejections,
      totalTargets: grid.filter((g) => g.isTarget).length,
      totalDistractors: grid.filter((g) => !g.isTarget).length,
      targetOutcomes,
    };
  },
};

// ---- MetricsEngine ----
const clamp = (v) => Math.max(0, Math.min(100, v));

export const MetricsEngine = {
  compute(trials, config = SCORING_CONFIG) {
    let totalHits = 0, totalMisses = 0, totalFP = 0, totalCR = 0, totalTargets = 0, totalDistractors = 0;
    let allOutcomes = [];
    trials.forEach((t) => {
      totalHits += t.hits; totalMisses += t.misses; totalFP += t.falsePositives; totalCR += t.correctRejections;
      totalTargets += t.totalTargets; totalDistractors += t.totalDistractors;
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

    const strong = allOutcomes.filter((o) => o.wasRecognizedAtEncoding === true);
    const strongStillRecognized = strong.filter((o) => o.recognizedNow).length;
    const encodingPreservationScore = strong.length ? clamp((strongStillRecognized / strong.length) * 100) : 0;
    const memoryDecayIndex = strong.length ? clamp(100 - encodingPreservationScore) : 0;

    const delayedRetentionScore = hitRate;

    const speedScore = clamp(100 - (avgTime / 30000) * 100);
    const rsw = config.retrievalSubWeights;
    const retrievalScore = clamp(rsw.correctRejection * correctRejectionRate + rsw.speed * speedScore);

    const ew = config.efficiencyWeights;
    const recognitionEfficiency = clamp(ew.accuracy * delayedRecognitionAccuracy + ew.speed * speedScore);

    const cv = avgTime > 0 ? sd / avgTime : 0;
    const attentionConsistency = clamp(100 * (1 - Math.min(cv, 1)));
    const processingSpeedScore = speedScore;

    const rawScore = clamp(trials.reduce((s, t) => s + Math.max(0, ((t.hits - t.falsePositives) / t.totalTargets) * 100), 0) / trials.length);
    const normalizedScore = clamp(rawScore);

    const cw = config.cognitiveWeights;
    const cognitiveScore = clamp(
      cw.retention * delayedRetentionScore + cw.encoding * encodingPreservationScore + cw.retrieval * retrievalScore + cw.processingSpeed * processingSpeedScore
    );

    return {
      delayedRecognitionAccuracy, hitRate, missRate, falsePositiveRate, correctRejectionRate,
      averageRecognitionTimeMs: Math.round(avgTime), fastestRecognitionTimeMs: fastestTime, slowestRecognitionTimeMs: slowestTime,
      reactionTimeVariability: Math.round(sd), timeouts,
      encodingPreservationScore, retrievalScore, delayedRetentionScore, recognitionEfficiency, memoryDecayIndex,
      attentionConsistency, processingSpeedScore,
      rawScore, normalizedScore, cognitiveScore,
      incorrectSelections: totalFP,
    };
  },
};

// ---- InterpretationEngine ----
export const InterpretationEngine = {
  interpret(cognitiveScore, thresholds = SCORING_CONFIG.interpretationThresholds) {
    if (cognitiveScore >= thresholds.excellent) return { severity: 'EXCELLENT', interpretation: 'Delayed recognition performance is excellent relative to this assessment.' };
    if (cognitiveScore >= thresholds.normal) return { severity: 'NORMAL', interpretation: 'Delayed recognition performance is within the expected range.' };
    if (cognitiveScore >= thresholds.mildlyReduced) return { severity: 'MILDLY_REDUCED', interpretation: 'Delayed recognition shows a mild reduction in retention or retrieval over the delay interval.' };
    return { severity: 'REDUCED', interpretation: 'Delayed recognition shows a reduction across multiple measures after the delay interval.' };
  },
};

// ---- top-level score() (replaces ResultModel) ----
export const DelayedRecognitionMemoryEngine = {
  score(trialResults, { sessionId } = {}) {
    const metrics = MetricsEngine.compute(trialResults);
    const { severity, interpretation } = InterpretationEngine.interpret(metrics.cognitiveScore);
    const retrievedSourceModules = [...new Set(trialResults.map((t) => t.sourceModule))];
    return {
      sessionId,
      testName: 'Delayed Recognition Memory Test',
      timestamp: new Date().toISOString(),
      score: Math.round(metrics.cognitiveScore),
      ...metrics,
      severity,
      interpretation,
      retrievedSourceModules,
      trialResults,
    };
  },
};
