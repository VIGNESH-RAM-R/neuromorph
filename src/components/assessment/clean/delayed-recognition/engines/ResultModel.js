// ResultModel
// -----------------------------------------------------------------------------
// Single responsibility: assemble the final standardized result object. The
// only file that calls InterpretationEngine.
//
// Base schema (unchanged from the standardized fields):
//   testName, sessionId, testVersion, domains, completionTime, accuracy,
//   errors, completed, averageReactionTime, fastestReactionTime,
//   slowestReactionTime, rawScore, normalizedScore, cognitiveScore,
//   interpretation, severity, clickHistory, metrics
//
// Additive metadata (consistent with the design-freeze pattern established
// in Visual Memory Test -- nothing removed or renamed):
//   assessmentVersion, assessmentDateTime, categoryBreakdown,
//   trialWisePerformance, completionStatus, assessmentDurationMs,
//   deviceInfo, browserInfo, retrievedSourceModules
import { InterpretationEngine } from './InterpretationEngine.js';

const ASSESSMENT_VERSION = '1.0.0';
const clamp = (v) => Math.max(0, Math.min(100, v));

function buildCategoryBreakdown(trialResults) {
  const breakdown = {};
  trialResults.forEach((t) => {
    breakdown[t.itemType] = {
      sourceModule: t.sourceModule,
      hitRate: clamp((t.hits / t.totalTargets) * 100),
      recognitionTimeMs: t.reactionTimeMs,
      timedOut: t.timedOut
    };
  });
  return breakdown;
}

function buildTrialWisePerformance(trialResults) {
  return trialResults.map((t, i) => ({
    trialNumber: i + 1,
    itemType: t.itemType,
    sourceModule: t.sourceModule,
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

export function buildResultModel({ sessionId, testVersion, trialResults, metrics, clickHistory, assessmentStartTime, completionStatus = 'completed' }) {
  const { severity, interpretation } = InterpretationEngine.interpret(metrics.cognitiveScore);
  const totalErrors = metrics.incorrectSelections + trialResults.reduce((s, t) => s + t.misses, 0);
  const retrievedSourceModules = [...new Set(trialResults.map((t) => t.sourceModule))];

  return {
    testName: 'Delayed Recognition Memory Test',
    sessionId,
    testVersion,
    domains: ['Delayed Episodic Memory', 'Recognition Memory', 'Memory Consolidation', 'Retrieval Ability', 'Memory Retention', 'Attention', 'Processing Speed', 'Hippocampal Function'],
    completionTime: trialResults.reduce((s, t) => s + t.reactionTimeMs, 0),
    accuracy: metrics.delayedRecognitionAccuracy,
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
    categoryBreakdown: buildCategoryBreakdown(trialResults),
    trialWisePerformance: buildTrialWisePerformance(trialResults),
    completionStatus,
    assessmentDurationMs: assessmentStartTime ? Date.now() - assessmentStartTime : null,
    deviceInfo: safeDeviceInfo(),
    browserInfo: safeBrowserInfo(),
    retrievedSourceModules
  };
}
