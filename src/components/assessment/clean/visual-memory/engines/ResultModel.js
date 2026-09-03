// ResultModel
// -----------------------------------------------------------------------------
// Single responsibility: assemble the final standardized result object. The
// only file that calls InterpretationEngine -- nothing upstream of this
// should know about severity bands.
//
// Base schema (unchanged from the original standardized fields):
//   testName, sessionId, testVersion, domains, completionTime, accuracy,
//   errors, completed, averageReactionTime, fastestReactionTime,
//   slowestReactionTime, rawScore, normalizedScore, cognitiveScore,
//   interpretation, severity, clickHistory, metrics
//
// Additive metadata (design-freeze revision, nothing removed/renamed):
//   assessmentVersion, assessmentDateTime, difficultyBreakdown,
//   trialWisePerformance, completionStatus, assessmentDurationMs,
//   deviceInfo, browserInfo, trialMode
import { InterpretationEngine } from './InterpretationEngine.js';

const ASSESSMENT_VERSION = '1.0.0';
const clamp = (v) => Math.max(0, Math.min(100, v));

function buildDifficultyBreakdown(trialResults) {
  const breakdown = {};
  ['easy', 'medium', 'hard'].forEach((difficulty) => {
    const trials = trialResults.filter((t) => t.difficulty === difficulty);
    if (!trials.length) { breakdown[difficulty] = null; return; }
    let hits = 0, targets = 0, times = 0;
    trials.forEach((t) => { hits += t.hits; targets += t.totalTargets; times += t.reactionTimeMs; });
    breakdown[difficulty] = {
      trials: trials.length,
      hitRate: clamp((hits / targets) * 100),
      avgRecognitionTimeMs: Math.round(times / trials.length)
    };
  });
  return breakdown;
}

function buildTrialWisePerformance(trialResults) {
  return trialResults.map((t, i) => ({
    trialNumber: i + 1,
    difficulty: t.difficulty,
    recognitionTimeMs: t.reactionTimeMs,
    hitRate: clamp((t.hits / t.totalTargets) * 100),
    misses: t.misses,
    falsePositives: t.falsePositives,
    timedOut: t.timedOut
  }));
}

function safeDeviceInfo() {
  if (typeof navigator === 'undefined') return {};
  try {
    return {
      platform: navigator.platform || 'unknown',
      screenWidth: typeof window !== 'undefined' && window.screen ? window.screen.width : null,
      screenHeight: typeof window !== 'undefined' && window.screen ? window.screen.height : null
    };
  } catch { return {}; }
}

function safeBrowserInfo() {
  if (typeof navigator === 'undefined') return {};
  try { return { userAgent: navigator.userAgent || 'unknown' }; } catch { return {}; }
}

export function buildResultModel({ sessionId, testVersion, trialResults, metrics, clickHistory, assessmentStartTime, trialMode, completionStatus = 'completed' }) {
  const { severity, interpretation } = InterpretationEngine.interpret(metrics.cognitiveScore);
  const totalErrors = metrics.incorrectSelections + trialResults.reduce((s, t) => s + t.misses, 0);

  return {
    testName: 'Visual Memory Test',
    sessionId,
    testVersion,
    domains: ['Visual Memory', 'Episodic Memory', 'Recognition Memory', 'Encoding', 'Retrieval', 'Attention', 'Memory Retention', 'Processing Speed'],
    completionTime: trialResults.reduce((s, t) => s + t.reactionTimeMs, 0),
    accuracy: metrics.overallRecognitionAccuracy,
    errors: totalErrors,
    completed: completionStatus === 'completed',
    averageReactionTime: metrics.averageRecognitionTimeMs,
    fastestReactionTime: metrics.fastestRecognitionTimeMs,
    slowestReactionTime: metrics.slowestRecognitionTimeMs,
    rawScore: metrics.rawScore,
    normalizedScore: metrics.normalizedScore,
    cognitiveScore: metrics.cognitiveScore,
    interpretation,
    severity,
    clickHistory,
    metrics,

    assessmentVersion: ASSESSMENT_VERSION,
    assessmentDateTime: new Date().toISOString(),
    difficultyBreakdown: buildDifficultyBreakdown(trialResults),
    trialWisePerformance: buildTrialWisePerformance(trialResults),
    completionStatus,
    assessmentDurationMs: assessmentStartTime ? Date.now() - assessmentStartTime : null,
    deviceInfo: safeDeviceInfo(),
    browserInfo: safeBrowserInfo(),
    trialMode
  };
}
