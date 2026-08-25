// FacialExpressivityEngine
// -----------------------------------------------------------------------------
// Ported near-verbatim from face_module's BaselineNormalizationEngine +
// ExpressivityMetricsEngine + ResponseLatencyEngine + BlinkRateEngine +
// SymmetryEngine + SessionAssemblyEngine + InterpretationEngine, combined
// into one file (same convention as this app's other multi-part engines).
// No scoring math changed.
import { EXPRESSIVITY_CHANNELS, EXPRESSIVITY_SCORING_CONFIG, CHANNEL_GROUPS, PAIRED_CHANNELS, BLINK_CHANNELS } from '../config/facialExpressivityConfig.js';

export function average(values) {
  const valid = (values || []).filter((v) => typeof v === 'number' && !Number.isNaN(v));
  if (valid.length === 0) return 0;
  return valid.reduce((a, b) => a + b, 0) / valid.length;
}
function clamp01(v) { return Math.max(0, Math.min(1, v)); }

// ---- BaselineNormalizationEngine: each participant's OWN resting baseline ----
export const BaselineNormalizationEngine = {
  computeBaseline(baselineFrames, channels) {
    const baseline = {};
    for (const channel of Object.keys(channels)) {
      const values = (baselineFrames || []).map((f) => f.blendshapes?.[channel]).filter((v) => typeof v === 'number');
      baseline[channel] = values.length ? average(values) : 0;
    }
    return baseline;
  },
};

// ---- ExpressivityMetricsEngine ----
export const ExpressivityMetricsEngine = {
  scorePrompt(promptFrames, baseline, config = EXPRESSIVITY_SCORING_CONFIG) {
    const weights = config.channelWeights;
    let weightedSum = 0, weightTotal = 0;
    const perChannelPeak = {};
    for (const [channel, weight] of Object.entries(weights)) {
      const values = (promptFrames || []).map((f) => f.blendshapes?.[channel]).filter((v) => typeof v === 'number');
      const base = baseline[channel] ?? 0;
      const peakDeviation = values.length ? Math.max(...values.map((v) => Math.abs(v - base))) : 0;
      perChannelPeak[channel] = Math.round(peakDeviation * 1000) / 1000;
      weightedSum += clamp01(peakDeviation) * weight;
      weightTotal += weight;
    }
    const score = weightTotal ? Math.round((weightedSum / weightTotal) * 1000) / 10 : 0;
    return { score, perChannelPeak };
  },

  scoreSession(promptResults, config = EXPRESSIVITY_SCORING_CONFIG) {
    const stimulusResults = promptResults.filter((p) => p.type === 'stimulus');
    const baselineResults = promptResults.filter((p) => p.type === 'baseline');

    const averageResponseExpressivity = stimulusResults.length
      ? Math.round((stimulusResults.reduce((s, p) => s + p.expressivity.score, 0) / stimulusResults.length) * 10) / 10 : 0;
    const baselineExpressivity = baselineResults.length
      ? Math.round((baselineResults.reduce((s, p) => s + p.expressivity.score, 0) / baselineResults.length) * 10) / 10 : 0;

    const latencies = stimulusResults.map((p) => p.latencyMs).filter((v) => typeof v === 'number');
    const averageResponseLatencyMs = latencies.length ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) : null;

    const overallExpressivityScore = Math.max(0, Math.min(100,
      Math.round((averageResponseExpressivity - baselineExpressivity * 0.2) * 10) / 10
    ));

    const perChannelAverages = {};
    for (const channel of Object.keys(config.channelWeights)) {
      const vals = stimulusResults.map((p) => p.expressivity.perChannelPeak?.[channel]).filter((v) => typeof v === 'number');
      perChannelAverages[channel] = vals.length ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 1000) / 1000 : 0;
    }

    const totalChannelCount = Object.keys(config.channelWeights).length;
    const engagedChannelCount = Object.values(perChannelAverages).filter((v) => v >= config.reactionThreshold).length;
    const expressionDiversityScore = totalChannelCount ? Math.round((engagedChannelCount / totalChannelCount) * 1000) / 10 : 0;

    return {
      overallExpressivityScore, averageResponseExpressivity, baselineExpressivity, averageResponseLatencyMs,
      expressionDiversityScore, engagedChannelCount, totalChannelCount,
      perPromptExpressivity: promptResults.map((p) => ({ promptId: p.promptId, type: p.type, score: p.expressivity.score, latencyMs: p.latencyMs })),
      perChannelAverages, responseLatencies: latencies,
      rawScore: averageResponseExpressivity, normalizedScore: overallExpressivityScore,
    };
  },
};

// ---- ResponseLatencyEngine ----
export const ResponseLatencyEngine = {
  detectLatency(promptFrames, baseline, config = EXPRESSIVITY_SCORING_CONFIG) {
    const weights = config.channelWeights;
    const threshold = config.reactionThreshold;
    const sorted = [...(promptFrames || [])].sort((a, b) => a.timestampMs - b.timestampMs);
    for (const frame of sorted) {
      for (const channel of Object.keys(weights)) {
        const base = baseline[channel] ?? 0;
        const value = frame.blendshapes?.[channel];
        if (typeof value === 'number' && Math.abs(value - base) >= threshold) return frame.timestampMs;
      }
    }
    return null;
  },
};

// ---- BlinkRateEngine ----
const DEFAULT_BLINK_THRESHOLD = 0.5;
const DEFAULT_BLINK_DEBOUNCE_MS = 250;
export const BlinkRateEngine = {
  detectBlinks(frames, threshold = DEFAULT_BLINK_THRESHOLD, debounceMs = DEFAULT_BLINK_DEBOUNCE_MS) {
    const sorted = [...(frames || [])].sort((a, b) => a.timestampMs - b.timestampMs);
    const blinkTimestamps = [];
    let wasBelowThreshold = true;
    let lastBlinkAt = -Infinity;
    for (const f of sorted) {
      const left = f.blendshapes?.[BLINK_CHANNELS.left];
      const right = f.blendshapes?.[BLINK_CHANNELS.right];
      if (typeof left !== 'number' && typeof right !== 'number') continue;
      const l = typeof left === 'number' ? left : right;
      const r = typeof right === 'number' ? right : left;
      const combined = (l + r) / 2;
      const isAboveThreshold = combined >= threshold;
      if (isAboveThreshold && wasBelowThreshold && (f.timestampMs - lastBlinkAt) >= debounceMs) {
        blinkTimestamps.push(f.timestampMs);
        lastBlinkAt = f.timestampMs;
      }
      wasBelowThreshold = !isAboveThreshold;
    }
    return blinkTimestamps;
  },

  blinkRateFromWindows(windows, threshold = DEFAULT_BLINK_THRESHOLD, debounceMs = DEFAULT_BLINK_DEBOUNCE_MS) {
    let blinkCount = 0;
    const perWindowBlinkCounts = [];
    for (const w of windows || []) {
      const detected = this.detectBlinks(w.frames, threshold, debounceMs);
      perWindowBlinkCounts.push(detected.length);
      blinkCount += detected.length;
    }
    const totalDurationMs = (windows || []).reduce((sum, w) => sum + (w.durationMs || 0), 0);
    const blinkRatePerMinute = totalDurationMs > 0 ? Math.round((blinkCount / totalDurationMs) * 60000 * 10) / 10 : null;
    return { blinkCount, blinkRatePerMinute, perWindowBlinkCounts };
  },
};

// ---- SymmetryEngine ----
export const SymmetryEngine = {
  computePairSymmetry(perChannelAverages, pairedChannels) {
    const pairs = [];
    for (const [left, right] of pairedChannels || []) {
      const l = perChannelAverages?.[left];
      const r = perChannelAverages?.[right];
      if (typeof l !== 'number' || typeof r !== 'number') continue;
      const denom = Math.max(l, r, 0.01);
      const symmetryIndex = Math.max(0, Math.round((1 - Math.abs(l - r) / denom) * 1000) / 10);
      pairs.push({ left, right, leftValue: l, rightValue: r, symmetryIndex });
    }
    return pairs;
  },
  computeOverallSymmetry(perChannelAverages, pairedChannels) {
    const pairs = this.computePairSymmetry(perChannelAverages, pairedChannels);
    const overallSymmetryScore = pairs.length ? Math.round(average(pairs.map((p) => p.symmetryIndex)) * 10) / 10 : null;
    return { overallSymmetryScore, pairs };
  },
};

// ---- InterpretationEngine ----
export const InterpretationEngine = {
  interpret(overallExpressivityScore, thresholds = EXPRESSIVITY_SCORING_CONFIG.interpretationThresholds) {
    let band;
    if (overallExpressivityScore >= thresholds.excellent) band = 'EXCELLENT';
    else if (overallExpressivityScore >= thresholds.normal) band = 'NORMAL';
    else if (overallExpressivityScore >= thresholds.mildlyReduced) band = 'MILDLY_REDUCED';
    else band = 'REDUCED';
    const templates = {
      EXCELLENT: 'Facial expressivity in response to prompts was within the excellent range for this task.',
      NORMAL: 'Facial expressivity in response to prompts was within the normal range for this task.',
      MILDLY_REDUCED: 'Facial expressivity in response to prompts was mildly reduced relative to the expected range for this task.',
      REDUCED: 'Facial expressivity in response to prompts was notably reduced relative to the expected range for this task.',
    };
    const caveat = 'Facial expressivity varies widely between individuals due to personality, cultural background, mood, fatigue, and camera or lighting conditions. A lower score on this task alone does not indicate any medical condition and should never be interpreted in isolation.';
    return { band, interpretation: templates[band], caveat };
  },
};

// ---- SessionAssemblyEngine: orchestrates the pure pipeline across a session ----
export const SessionAssemblyEngine = {
  assemble(framesByPromptId, promptSequence, config = EXPRESSIVITY_SCORING_CONFIG, channels = EXPRESSIVITY_CHANNELS, options = {}) {
    const { calibrationFrames = [], calibrationDurationMs = 0, channelGroups = CHANNEL_GROUPS, pairedChannels = PAIRED_CHANNELS } = options;

    const baselineFrames = promptSequence.filter((p) => p.type === 'baseline').flatMap((p) => framesByPromptId[p.id] || []);
    const baseline = BaselineNormalizationEngine.computeBaseline(baselineFrames, channels);

    const promptResults = promptSequence.map((p) => {
      const frames = framesByPromptId[p.id] || [];
      const expressivity = ExpressivityMetricsEngine.scorePrompt(frames, baseline, config);
      const latencyMs = p.type === 'stimulus' ? ResponseLatencyEngine.detectLatency(frames, baseline, config) : null;
      return { promptId: p.id, type: p.type, stimulusCategory: p.stimulusCategory || null, expressivity, latencyMs, frameCount: frames.length };
    });

    const sessionMetrics = ExpressivityMetricsEngine.scoreSession(promptResults, config);

    const groupedValues = {};
    for (const [channel, group] of Object.entries(channelGroups)) {
      if (!(channel in sessionMetrics.perChannelAverages)) continue;
      groupedValues[group] = groupedValues[group] || [];
      groupedValues[group].push(sessionMetrics.perChannelAverages[channel]);
    }
    const expressivityByRegion = {};
    for (const [group, values] of Object.entries(groupedValues)) {
      expressivityByRegion[group] = Math.round(average(values) * 1000) / 10;
    }

    const { overallSymmetryScore, pairs: symmetryPairs } = SymmetryEngine.computeOverallSymmetry(sessionMetrics.perChannelAverages, pairedChannels);

    const blinkWindows = [
      { frames: calibrationFrames, durationMs: calibrationDurationMs },
      ...promptSequence.map((p) => ({ frames: framesByPromptId[p.id] || [], durationMs: p.durationMs || 0 })),
    ];
    const { blinkCount, blinkRatePerMinute } = BlinkRateEngine.blinkRateFromWindows(blinkWindows, config.blinkThreshold, config.blinkDebounceMs);

    return {
      baseline, promptResults,
      sessionMetrics: { ...sessionMetrics, expressivityByRegion, overallSymmetryScore, symmetryPairs, blinkCount, blinkRatePerMinute },
    };
  },
};

// ---- top-level score() -- replaces ResultModel, adapted for this app's
// daily-task onSubmit({score, raw}) contract instead of a standalone module ----
export const FacialExpressivityEngine = {
  score({ sessionId, framesByPromptId, promptSequence, startedAt, completedAt, completed, calibrationFrames, calibrationDurationMs, cameraConsentGivenAt }) {
    const { baseline, promptResults, sessionMetrics } = SessionAssemblyEngine.assemble(
      framesByPromptId, promptSequence, EXPRESSIVITY_SCORING_CONFIG, EXPRESSIVITY_CHANNELS,
      { calibrationFrames, calibrationDurationMs }
    );
    const { band, interpretation, caveat } = InterpretationEngine.interpret(sessionMetrics.overallExpressivityScore);
    const completionTimeMs = completedAt && startedAt ? completedAt - startedAt : null;

    return {
      testName: 'Facial Expressivity Test',
      sessionId,
      domains: ['Facial Expressivity', 'Affective Responsiveness'],
      completionTime: completionTimeMs,
      completed: !!completed,
      score: sessionMetrics.overallExpressivityScore, // 0-100, feeds MomentumScoreEngine's performanceScores
      averageReactionTime: sessionMetrics.averageResponseLatencyMs,
      rawScore: sessionMetrics.rawScore,
      normalizedScore: sessionMetrics.normalizedScore,
      interpretation,
      severity: band,
      interpretationCaveat: caveat,
      metrics: sessionMetrics,
      baseline,
      promptResults,
      assessmentDateTime: new Date(startedAt || Date.now()).toISOString(),
      assessmentDurationMs: completionTimeMs,
      cameraConsentGivenAt: cameraConsentGivenAt || null,
      // Research-only, never rendered prominently -- numeric coefficients
      // only, never raw video/images (see FaceTrackingService).
      hiddenAnalytics: { framesByPromptId },
    };
  },
};
