import {
  STROOP_COLORS,
  STROOP_CONGRUENT_RATIO,
  STROOP_MIN_VALID_RT,
} from '../config/stroopConfig.js';

// Teammate's richer Stroop implementation (2026-08-11 integration),
// adapted into this app's engine/config/component convention -- trial
// generation and scoring are pure here (Node-testable, no DOM), presentation
// lives entirely in StroopTask.jsx. Reference ranges used to normalize
// sub-scores are drawn from published Stroop norms: healthy adults average
// ~640-880ms on congruent trials and show a ~85-115ms congruent/incongruent
// interference effect (Stroop, 1935; MacLeod, 1991 replications). RT
// distributions are right-skewed, so median (not mean) is used for central
// tendency per standard practice.

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function mean(arr) {
  if (!arr.length) return 0;
  return arr.reduce((s, x) => s + x, 0) / arr.length;
}
function median(arr) {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}
function stddev(arr) {
  if (arr.length < 2) return 0;
  const m = mean(arr);
  const v = arr.reduce((s, x) => s + (x - m) * (x - m), 0) / (arr.length - 1);
  return Math.sqrt(v);
}
function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}
function round1(v) {
  return Math.round(v * 10) / 10;
}
// Anticipatory-response filter: RTs under the configured floor are excluded
// from timing statistics (they cannot reflect genuine stimulus processing).
function validRTs(records) {
  return records.filter((r) => r.reactionTime >= STROOP_MIN_VALID_RT).map((r) => r.reactionTime);
}

// One randomized Stroop trial: picks an ink color, then decides congruent
// (word names the same color) vs. incongruent by STROOP_CONGRUENT_RATIO.
// buttonOrder is shuffled per-trial so the correct answer's screen position
// isn't learnable.
export function generateStroopTrial(id) {
  const congruent = Math.random() < STROOP_CONGRUENT_RATIO;
  const ink = STROOP_COLORS[Math.floor(Math.random() * STROOP_COLORS.length)];
  let word;
  if (congruent) {
    word = ink.label;
  } else {
    const others = STROOP_COLORS.filter((c) => c.id !== ink.id);
    word = others[Math.floor(Math.random() * others.length)].label;
  }
  return {
    id,
    word: word.toUpperCase(),
    inkId: ink.id,
    inkHex: ink.hex,
    trialType: congruent ? 'congruent' : 'incongruent',
    buttonOrder: shuffle(STROOP_COLORS.map((c) => c.id)),
  };
}

export function buildStroopTrialSet(count) {
  return Array.from({ length: count }, (_, i) => generateStroopTrial(i + 1));
}

export const StroopEngine = {
  // responses: [{ trialNumber, word, inkColor, trialType, selectedAnswer,
  //   correctAnswer, reactionTime, correct, timeout }]
  // Returns a full clinical result model, including `.score` (alias for
  // cognitiveScore) so the call site can use the same
  // `onSubmit({ score: raw.score, raw })` pattern every other task uses.
  score(responses = []) {
    const total = responses.length;
    if (total === 0) {
      return { score: 0, accuracy: 0, cognitiveScore: 0, interpretation: 'No responses recorded.', severity: 'Severe', metrics: {} };
    }

    const timeouts = responses.filter((r) => r.timeout).length;
    const correct = responses.filter((r) => r.correct && !r.timeout);
    const correctResponses = correct.length;
    const incorrectResponses = total - correctResponses;
    const overallAccuracy = round1((correctResponses / total) * 100);

    const congruent = responses.filter((r) => r.trialType === 'congruent');
    const incongruent = responses.filter((r) => r.trialType === 'incongruent');
    const congruentAccuracy = round1(
      (congruent.filter((r) => r.correct && !r.timeout).length / (congruent.length || 1)) * 100
    );
    const incongruentAccuracy = round1(
      (incongruent.filter((r) => r.correct && !r.timeout).length / (incongruent.length || 1)) * 100
    );

    const correctRTs = validRTs(correct);
    const congruentRTs = validRTs(congruent.filter((r) => r.correct && !r.timeout));
    const incongruentRTs = validRTs(incongruent.filter((r) => r.correct && !r.timeout));

    const averageReactionTime = Math.round(median(correctRTs));
    const fastestReactionTime = correctRTs.length ? Math.round(Math.min(...correctRTs)) : 0;
    const slowestReactionTime = correctRTs.length ? Math.round(Math.max(...correctRTs)) : 0;
    const reactionTimeVariability = Math.round(stddev(correctRTs));
    const congruentReactionTime = Math.round(median(congruentRTs));
    const incongruentReactionTime = Math.round(median(incongruentRTs));
    const stroopInterferenceEffect = Math.round(incongruentReactionTime - congruentReactionTime);

    const rtAfterError = [];
    const rtAfterCorrect = [];
    for (let i = 1; i < responses.length; i++) {
      const prev = responses[i - 1];
      const cur = responses[i];
      if (cur.correct && !cur.timeout && cur.reactionTime >= STROOP_MIN_VALID_RT) {
        if (!prev.correct) rtAfterError.push(cur.reactionTime);
        else rtAfterCorrect.push(cur.reactionTime);
      }
    }
    const hasErrorData = rtAfterError.length > 0 && rtAfterCorrect.length > 0;
    const postErrorSlowing = hasErrorData ? Math.round(mean(rtAfterError) - mean(rtAfterCorrect)) : 0;

    const interferenceComponent = clamp(100 - (stroopInterferenceEffect - 100) / 5, 0, 100);
    const responseInhibitionScore = Math.round(0.35 * incongruentAccuracy + 0.65 * interferenceComponent);

    const consistencyComponent = clamp(100 - (reactionTimeVariability - 100) / 5, 0, 100);
    const selectiveAttentionScore = Math.round(0.6 * overallAccuracy + 0.4 * consistencyComponent);

    const processingSpeedScore = Math.round(clamp(100 - (averageReactionTime - 650) / 15, 0, 100));

    // A participant who makes zero errors cannot be penalized for lacking a
    // post-error recovery response -- absence of errors defaults to full
    // marks rather than an undefined/negative artifact.
    const flexComponent = hasErrorData ? clamp(100 - Math.abs(postErrorSlowing - 50) / 5, 0, 100) : 100;
    const mentalFlexibilityScore = Math.round(0.6 * flexComponent + 0.4 * consistencyComponent);

    const executiveFunctionScore = Math.round(
      0.3 * responseInhibitionScore +
        0.25 * selectiveAttentionScore +
        0.2 * mentalFlexibilityScore +
        0.15 * processingSpeedScore +
        0.1 * overallAccuracy
    );

    const rawScore = correctResponses;
    const normalizedScore = Math.round(0.7 * overallAccuracy + 0.3 * processingSpeedScore);
    const cognitiveScore = Math.round(
      0.45 * executiveFunctionScore + 0.25 * normalizedScore + 0.15 * selectiveAttentionScore + 0.15 * mentalFlexibilityScore
    );

    let interpretation;
    let severity;
    if (cognitiveScore >= 85) {
      interpretation = 'Within normal limits';
      severity = 'Normal';
    } else if (cognitiveScore >= 70) {
      interpretation = 'Mild cognitive concern -- monitor';
      severity = 'Mild';
    } else if (cognitiveScore >= 50) {
      interpretation = 'Moderate cognitive concern -- clinical follow-up recommended';
      severity = 'Moderate';
    } else {
      interpretation = 'Significant cognitive concern -- comprehensive evaluation recommended';
      severity = 'Severe';
    }

    return {
      score: cognitiveScore, // alias so the standard onSubmit({score, raw}) call site works unchanged
      accuracy: overallAccuracy,
      cognitiveScore,
      interpretation,
      severity,
      averageReactionTime,
      fastestReactionTime,
      slowestReactionTime,
      metrics: {
        correctResponses,
        incorrectResponses,
        congruentAccuracy,
        incongruentAccuracy,
        congruentReactionTime,
        incongruentReactionTime,
        stroopInterferenceEffect,
        responseInhibitionScore,
        selectiveAttentionScore,
        executiveFunctionScore,
        mentalFlexibilityScore,
        processingSpeedScore,
        reactionTimeVariability,
        timeouts,
        postErrorSlowing,
        rawScore,
        normalizedScore,
      },
    };
  },
};
