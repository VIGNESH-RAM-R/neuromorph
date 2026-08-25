// VisualMemoryEngine
// -----------------------------------------------------------------------------
// Ported near-verbatim from the teammate's visual_memory project
// (ObjectGenerationEngine + SceneEngine + RecognitionEngine + ValidationEngine
// + MetricsEngine + ResultModel + InterpretationEngine), combined into one
// file the way this app's other multi-part engines already are. No scoring
// math changed.
import { OBJECT_POOL, DIFFICULTY_CONFIG } from '../config/visualMemoryConfig.js';

export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---- ObjectGenerationEngine ----
export const ObjectGenerationEngine = {
  getPool() { return OBJECT_POOL.objects; },
  generateTrial(difficulty) {
    const cfg = DIFFICULTY_CONFIG[difficulty];
    if (!cfg) throw new Error(`Unknown difficulty: ${difficulty}`);
    const pool = shuffle(OBJECT_POOL.objects);
    const targets = pool.slice(0, cfg.targets);
    const remaining = pool.slice(cfg.targets);
    const distractorCount = cfg.options - cfg.targets;
    let distractors;
    if (difficulty === 'hard') {
      const pairPartners = remaining.filter((o) => o.pairGroup && targets.some((t) => t.pairGroup === o.pairGroup));
      const rest = remaining.filter((o) => !pairPartners.includes(o));
      distractors = shuffle(pairPartners.concat(rest)).slice(0, distractorCount);
    } else {
      distractors = shuffle(remaining).slice(0, distractorCount);
    }
    return { targets: shuffle(targets), distractors: shuffle(distractors) };
  },
};

// ---- SceneEngine ----
export const SceneEngine = { arrange(targets) { return shuffle(targets); } };

// ---- RecognitionEngine ----
export const RecognitionEngine = {
  buildGrid(targets, distractors) {
    const grid = [...targets.map((o) => ({ ...o, isTarget: true })), ...distractors.map((o) => ({ ...o, isTarget: false }))];
    return shuffle(grid);
  },
};

// ---- ValidationEngine ----
export const ValidationEngine = {
  validate(selectedIds, grid) {
    let hits = 0, misses = 0, falsePositives = 0, correctRejections = 0;
    grid.forEach((item) => {
      const selected = selectedIds.includes(item.id);
      if (item.isTarget && selected) hits++;
      else if (item.isTarget && !selected) misses++;
      else if (!item.isTarget && selected) falsePositives++;
      else correctRejections++;
    });
    return {
      hits, misses, falsePositives, correctRejections,
      totalTargets: grid.filter((g) => g.isTarget).length,
      totalDistractors: grid.filter((g) => !g.isTarget).length,
    };
  },
};

// ---- MetricsEngine (scoring weights ported verbatim from teammate's scoringConfig.js) ----
const SCORING_CONFIG = {
  difficultyWeights: { easy: 1, medium: 1.15, hard: 1.3 },
  retrievalSubWeights: { correctRejection: 0.7, speed: 0.3 },
  visualMemoryWeights: { encoding: 0.4, retrieval: 0.3, retention: 0.3 },
  cognitiveWeights: { visualMemory: 0.35, encoding: 0.25, retrieval: 0.20, processingSpeed: 0.20 },
};
const clamp = (v) => Math.max(0, Math.min(100, v));

export const MetricsEngine = {
  compute(trials, config = SCORING_CONFIG) {
    let totalHits = 0, totalMisses = 0, totalFP = 0, totalCR = 0, totalTargets = 0, totalDistractors = 0;
    trials.forEach((t) => { totalHits += t.hits; totalMisses += t.misses; totalFP += t.falsePositives; totalCR += t.correctRejections; totalTargets += t.totalTargets; totalDistractors += t.totalDistractors; });

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
    trials.forEach((t) => { const w = dw[t.difficulty]; wSum += w; encSum += (t.hits / t.totalTargets) * 100 * w; });
    const encodingScore = clamp(encSum / wSum);

    const speedScore = clamp(100 - (avgTime / 30000) * 100);
    const rsw = config.retrievalSubWeights;
    const retrievalScore = clamp(rsw.correctRejection * correctRejectionRate + rsw.speed * speedScore);
    const memoryRetentionScore = hitRate;

    const vmw = config.visualMemoryWeights;
    const visualMemoryScore = clamp(vmw.encoding * encodingScore + vmw.retrieval * retrievalScore + vmw.retention * memoryRetentionScore);

    const cv = avgTime > 0 ? sd / avgTime : 0;
    const attentionConsistency = clamp(100 * (1 - Math.min(cv, 1)));
    const processingSpeedScore = speedScore;

    const rawScore = clamp(trials.reduce((s, t) => s + Math.max(0, ((t.hits - t.falsePositives) / t.totalTargets) * 100), 0) / trials.length);
    const normalizedScore = clamp(rawScore);

    const cw = config.cognitiveWeights;
    const cognitiveScore = clamp(cw.visualMemory * visualMemoryScore + cw.encoding * encodingScore + cw.retrieval * retrievalScore + cw.processingSpeed * processingSpeedScore);

    return {
      overallRecognitionAccuracy, hitRate, missRate, falsePositiveRate, correctRejectionRate,
      averageRecognitionTimeMs: Math.round(avgTime), fastestRecognitionTimeMs: fastestTime, slowestRecognitionTimeMs: slowestTime,
      reactionTimeVariability: Math.round(sd), timeouts,
      encodingScore, retrievalScore, memoryRetentionScore, visualMemoryScore, attentionConsistency, processingSpeedScore,
      rawScore, normalizedScore, cognitiveScore, incorrectSelections: totalFP,
    };
  },
};

// ---- InterpretationEngine ----
export const InterpretationEngine = {
  interpret(cognitiveScore) {
    if (cognitiveScore >= 85) return { severity: 'EXCELLENT', interpretation: 'Visual memory performance is excellent -- strong encoding, retrieval, and retention.' };
    if (cognitiveScore >= 65) return { severity: 'NORMAL', interpretation: 'Visual memory performance is within the normal range.' };
    if (cognitiveScore >= 45) return { severity: 'MILDLY_REDUCED', interpretation: 'Mildly reduced visual memory -- some difficulty encoding or retrieving visually presented material.' };
    return { severity: 'REDUCED', interpretation: 'Reduced visual memory performance -- notable difficulty across encoding, retrieval, or retention.' };
  },
};

// ---- top-level score() (replaces ResultModel) ----
export const VisualMemoryEngine = {
  score(trials, { sessionId } = {}) {
    const metrics = MetricsEngine.compute(trials);
    const { severity, interpretation } = InterpretationEngine.interpret(metrics.cognitiveScore);
    return {
      sessionId,
      testName: 'Visual Memory Test',
      timestamp: new Date().toISOString(),
      score: Math.round(metrics.cognitiveScore),
      ...metrics,
      severity,
      interpretation,
      trials,
    };
  },
};
