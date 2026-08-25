// FaceRecognitionEngine
// -----------------------------------------------------------------------------
// Ported near-verbatim from the teammate's face_recognition project
// (FaceGenerationEngine + SceneEngine + RecognitionEngine + ValidationEngine
// + MetricsEngine + InterpretationEngine), combined into one file the way
// this app's other multi-part engines already are (VisualMemoryEngine,
// DelayedRecognitionMemoryEngine). No scoring math changed.
import { DIFFICULTY_TIERS, SCORING_CONFIG } from '../config/faceRecognitionConfig.js';

export function shuffle(arr, rng = Math.random) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// ---- FaceGenerationEngine: which faces go into this trial ----
// excludeIds is passed fresh per trial by FaceRecognitionTask.jsx (not
// accumulated across the whole session) -- see the FACE POOL SIZE NOTE in
// faceRecognitionConfig.js for why.
//
// preferPairedDistractor / pairGroup below is now effectively inert for the
// 'hard' tier's real-photo pool (every FACE_POOL entry has pairGroup: null
// as of the 2026-08-17 real-photo swap -- see faceRecognitionConfig.js's
// PAIRGROUP NOTE for why) and simply falls through to the random
// remainingCandidates selection just below it. Left in place rather than
// deleted so a future pool that DOES have real similarity metadata (e.g.
// tagged by an actual face-similarity model) can turn it back on for free.
export const FaceGenerationEngine = {
  buildTrial(pool, difficultyKey, excludeIds = [], config = DIFFICULTY_TIERS, rng = Math.random) {
    const tier = config[difficultyKey];
    if (!tier) throw new Error(`Unknown difficulty tier: ${difficultyKey}`);

    const available = pool.filter((f) => !excludeIds.includes(f.id));
    if (available.length < tier.studyCount + tier.distractorCount) {
      throw new Error('Not enough unused faces in the pool to build this trial. Reduce excludeIds or extend the pool.');
    }

    const shuffledAvailable = shuffle(available, rng);
    const studySet = shuffledAvailable.slice(0, tier.studyCount);
    const studyIds = new Set(studySet.map((f) => f.id));

    const distractors = [];

    if (tier.preferPairedDistractor) {
      for (const face of studySet) {
        if (distractors.length >= tier.distractorCount) break;
        if (!face.pairGroup) continue;
        const partner = pool.find((f) => f.pairGroup === face.pairGroup && f.id !== face.id);
        if (
          partner &&
          !studyIds.has(partner.id) &&
          !excludeIds.includes(partner.id) &&
          !distractors.some((d) => d.id === partner.id)
        ) {
          distractors.push(partner);
        }
      }
    }

    const remainingCandidates = shuffle(
      pool.filter((f) => !studyIds.has(f.id) && !excludeIds.includes(f.id) && !distractors.some((d) => d.id === f.id)),
      rng
    );
    for (const candidate of remainingCandidates) {
      if (distractors.length >= tier.distractorCount) break;
      distractors.push(candidate);
    }

    if (distractors.length < tier.distractorCount) {
      throw new Error('Not enough distractor faces available to build this trial.');
    }

    return {
      difficulty: difficultyKey,
      studySet,
      distractors: distractors.slice(0, tier.distractorCount),
      observationMs: tier.observationMs,
      usedIds: [...studyIds, ...distractors.slice(0, tier.distractorCount).map((f) => f.id)],
    };
  },
};

// ---- SceneEngine: the study-phase presentation ----
export const SceneEngine = {
  buildStudyScene(trial) {
    return {
      difficulty: trial.difficulty,
      items: shuffle(trial.studySet).map((face, index) => ({ ...face, position: index })),
      observationMs: trial.observationMs,
    };
  },
};

// ---- RecognitionEngine: the recognition-phase probe set ----
export const RecognitionEngine = {
  buildRecognitionSet(trial) {
    const targets = trial.studySet.map((f) => ({ ...f, isTarget: true }));
    const foils = trial.distractors.map((f) => ({ ...f, isTarget: false }));
    return shuffle([...targets, ...foils]).map((face, index) => ({ ...face, position: index }));
  },
};

// ---- ValidationEngine: scores one completed recognition trial ----
export const ValidationEngine = {
  score(recognitionSet, selections, timeoutMs) {
    const selectedById = new Map(selections.map((s) => [s.id, s.selectedAtMs]));

    let hits = 0, misses = 0, falsePositives = 0, correctRejections = 0;
    const targetOutcomes = [];
    const responseTimes = [];
    let timeouts = 0;

    for (const face of recognitionSet) {
      const wasSelected = selectedById.has(face.id);
      const selectedAtMs = selectedById.get(face.id);

      if (face.isTarget) {
        if (wasSelected) { hits++; responseTimes.push(selectedAtMs); } else { misses++; }
        targetOutcomes.push({ id: face.id, isTarget: true, recognized: wasSelected, responseTimeMs: wasSelected ? selectedAtMs : null });
      } else {
        if (wasSelected) { falsePositives++; responseTimes.push(selectedAtMs); } else { correctRejections++; }
        targetOutcomes.push({ id: face.id, isTarget: false, recognized: wasSelected, responseTimeMs: wasSelected ? selectedAtMs : null });
      }
    }

    if (typeof timeoutMs === 'number' && selections.length === 0) timeouts = 1;

    return {
      hits, misses, falsePositives, correctRejections,
      targetOutcomes, responseTimes, timeouts,
      totalTargets: recognitionSet.filter((f) => f.isTarget).length,
      totalDistractors: recognitionSet.filter((f) => !f.isTarget).length,
    };
  },
};

function average(values) {
  const valid = values.filter((v) => typeof v === 'number' && !Number.isNaN(v));
  if (valid.length === 0) return 0;
  return valid.reduce((a, b) => a + b, 0) / valid.length;
}
function stddev(values) {
  const valid = values.filter((v) => typeof v === 'number' && !Number.isNaN(v));
  if (valid.length < 2) return 0;
  const mean = average(valid);
  return Math.sqrt(average(valid.map((v) => (v - mean) ** 2)));
}
function pct(numerator, denominator) {
  if (!denominator) return 0;
  return Math.round((numerator / denominator) * 1000) / 10;
}

// ---- MetricsEngine ----
export const MetricsEngine = {
  compute(trials, config = SCORING_CONFIG) {
    const totals = { hits: 0, misses: 0, falsePositives: 0, correctRejections: 0, totalTargets: 0, totalDistractors: 0, timeouts: 0 };
    const allResponseTimes = [];
    let weightedAccuracySum = 0;
    let weightSum = 0;
    let pairedCorrect = 0, pairedTotal = 0;
    let unpairedCorrect = 0, unpairedTotal = 0;

    for (const trial of trials) {
      const v = trial.validation;
      totals.hits += v.hits;
      totals.misses += v.misses;
      totals.falsePositives += v.falsePositives;
      totals.correctRejections += v.correctRejections;
      totals.totalTargets += v.totalTargets;
      totals.totalDistractors += v.totalDistractors;
      totals.timeouts += v.timeouts;
      allResponseTimes.push(...v.responseTimes);

      const trialAccuracy = pct(v.hits + v.correctRejections, v.totalTargets + v.totalDistractors) / 100;
      const weight = config.difficultyWeights[trial.difficulty] ?? 1;
      weightedAccuracySum += trialAccuracy * weight;
      weightSum += weight;

      const correctCount = v.hits + v.correctRejections;
      const totalCount = v.totalTargets + v.totalDistractors;
      if (trial.difficulty === 'hard') { pairedCorrect += correctCount; pairedTotal += totalCount; }
      else { unpairedCorrect += correctCount; unpairedTotal += totalCount; }
    }

    const overallRecognitionAccuracy = pct(totals.hits + totals.correctRejections, totals.totalTargets + totals.totalDistractors);
    const hitRate = pct(totals.hits, totals.totalTargets);
    const missRate = pct(totals.misses, totals.totalTargets);
    const falsePositiveRate = pct(totals.falsePositives, totals.totalDistractors);
    const correctRejectionRate = pct(totals.correctRejections, totals.totalDistractors);

    const averageRecognitionTimeMs = allResponseTimes.length ? Math.round(average(allResponseTimes)) : null;
    const fastestRecognitionTimeMs = allResponseTimes.length ? Math.round(Math.min(...allResponseTimes)) : null;
    const slowestRecognitionTimeMs = allResponseTimes.length ? Math.round(Math.max(...allResponseTimes)) : null;
    const reactionTimeVariability = allResponseTimes.length ? Math.round(stddev(allResponseTimes)) : 0;

    const weights = config.faceRecognitionWeights;
    const encodingScore = hitRate;
    const discriminationScore = correctRejectionRate;
    const retrievalScore = Math.round((weightSum ? (weightedAccuracySum / weightSum) : 0) * 1000) / 10;
    const variabilityCeilingMs = 600;
    const consistencyScore = Math.max(0, Math.round((1 - Math.min(reactionTimeVariability, variabilityCeilingMs) / variabilityCeilingMs) * 1000) / 10);
    const speedCeilingMs = 3000;
    const processingSpeedScore = averageRecognitionTimeMs === null
      ? 0
      : Math.max(0, Math.round((1 - Math.min(averageRecognitionTimeMs, speedCeilingMs) / speedCeilingMs) * 1000) / 10);

    const faceRecognitionScore = Math.round((
      encodingScore * weights.encoding +
      retrievalScore * weights.retrieval +
      discriminationScore * weights.discrimination +
      consistencyScore * weights.consistency
    ) * 10) / 10;

    const rawScore = Math.round(((totals.hits + totals.correctRejections) - (totals.misses + totals.falsePositives)) * 10) / 10;
    const normalizedScore = Math.max(0, Math.min(100, faceRecognitionScore));

    const pairedTrialAccuracy = pct(pairedCorrect, pairedTotal);
    const unpairedTrialAccuracy = pct(unpairedCorrect, unpairedTotal);

    return {
      overallRecognitionAccuracy, hitRate, missRate, falsePositiveRate, correctRejectionRate,
      averageRecognitionTimeMs, fastestRecognitionTimeMs, slowestRecognitionTimeMs, reactionTimeVariability,
      timeouts: totals.timeouts,
      encodingScore, discriminationScore, retrievalScore, consistencyScore, processingSpeedScore,
      faceRecognitionScore, rawScore, normalizedScore,
      incorrectSelections: totals.falsePositives,
      pairedTrialAccuracy, unpairedTrialAccuracy,
    };
  },
};

// ---- InterpretationEngine ----
export const InterpretationEngine = {
  interpret(faceRecognitionScore, thresholds = SCORING_CONFIG.interpretationThresholds) {
    let band;
    if (faceRecognitionScore >= thresholds.excellent) band = 'EXCELLENT';
    else if (faceRecognitionScore >= thresholds.normal) band = 'NORMAL';
    else if (faceRecognitionScore >= thresholds.mildlyReduced) band = 'MILDLY_REDUCED';
    else band = 'REDUCED';

    const templates = {
      EXCELLENT: 'Face recognition task performance is within the excellent range.',
      NORMAL: 'Face recognition task performance is within the normal range.',
      MILDLY_REDUCED: 'Face recognition task performance is mildly below the expected range for this task.',
      REDUCED: 'Face recognition task performance is notably below the expected range for this task.',
    };
    return { band, interpretation: templates[band] };
  },
};

// ---- top-level score() (replaces ResultModel; matches this app's
// onSubmit({score, raw}) contract used by every other task) ----
export const FaceRecognitionEngine = {
  score(trials, { sessionId } = {}) {
    const metrics = MetricsEngine.compute(trials);
    const { band, interpretation } = InterpretationEngine.interpret(metrics.faceRecognitionScore);
    return {
      sessionId,
      testName: 'Face Recognition Test',
      timestamp: new Date().toISOString(),
      score: Math.round(metrics.faceRecognitionScore),
      ...metrics,
      severity: band,
      interpretation,
      trialWisePerformance: trials.map((t, i) => ({
        trialIndex: i,
        difficulty: t.difficulty,
        hits: t.validation.hits,
        misses: t.validation.misses,
        falsePositives: t.validation.falsePositives,
        correctRejections: t.validation.correctRejections,
        targetOutcomes: t.validation.targetOutcomes,
      })),
    };
  },
};
