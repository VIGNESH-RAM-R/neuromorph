// Facial Expressivity Test -- teammate's real project (face_module folder,
// already connected), part of the Daily Set's 2 mandatory items (alongside
// Speech). Ported verbatim from face_module/src/config/expressivityConfig.js
// + promptConfig.js -- no weights or thresholds changed.
//
// Which of MediaPipe FaceLandmarker's 52 standard blendshape channels count
// toward "expressivity," and how heavily -- 30 channels across six facial
// regions (brows, eyes, cheeks, nose, mouth, jaw). eyeBlinkLeft/eyeBlinkRight
// are intentionally NOT weighted here -- blinking is tracked separately (a
// blink is a reflex, not an expression) via BLINK_CHANNELS below.
export const EXPRESSIVITY_CHANNELS = {
  browInnerUp: 0.8, browOuterUpLeft: 0.6, browOuterUpRight: 0.6, browDownLeft: 0.5, browDownRight: 0.5,
  eyeWideLeft: 0.5, eyeWideRight: 0.5, eyeSquintLeft: 0.4, eyeSquintRight: 0.4,
  cheekSquintLeft: 0.4, cheekSquintRight: 0.4, cheekPuff: 0.3,
  noseSneerLeft: 0.4, noseSneerRight: 0.4,
  mouthSmileLeft: 1.0, mouthSmileRight: 1.0, mouthFrownLeft: 0.6, mouthFrownRight: 0.6,
  mouthPucker: 0.4, mouthStretchLeft: 0.4, mouthStretchRight: 0.4,
  mouthUpperUpLeft: 0.5, mouthUpperUpRight: 0.5, mouthLowerDownLeft: 0.5, mouthLowerDownRight: 0.5,
  mouthDimpleLeft: 0.3, mouthDimpleRight: 0.3,
  jawOpen: 0.7, jawLeft: 0.2, jawRight: 0.2,
};

export const CHANNEL_GROUPS = {
  browInnerUp: 'brow', browOuterUpLeft: 'brow', browOuterUpRight: 'brow', browDownLeft: 'brow', browDownRight: 'brow',
  eyeWideLeft: 'eye', eyeWideRight: 'eye', eyeSquintLeft: 'eye', eyeSquintRight: 'eye',
  cheekSquintLeft: 'cheek', cheekSquintRight: 'cheek', cheekPuff: 'cheek',
  noseSneerLeft: 'nose', noseSneerRight: 'nose',
  mouthSmileLeft: 'mouth', mouthSmileRight: 'mouth', mouthFrownLeft: 'mouth', mouthFrownRight: 'mouth',
  mouthPucker: 'mouth', mouthStretchLeft: 'mouth', mouthStretchRight: 'mouth',
  mouthUpperUpLeft: 'mouth', mouthUpperUpRight: 'mouth', mouthLowerDownLeft: 'mouth', mouthLowerDownRight: 'mouth',
  mouthDimpleLeft: 'mouth', mouthDimpleRight: 'mouth',
  jawOpen: 'jaw', jawLeft: 'jaw', jawRight: 'jaw',
};

export const CHANNEL_GROUP_LABELS = { brow: 'Brows', eye: 'Eyes', cheek: 'Cheeks', nose: 'Nose', mouth: 'Mouth', jaw: 'Jaw' };

export const PAIRED_CHANNELS = [
  ['browOuterUpLeft', 'browOuterUpRight'], ['browDownLeft', 'browDownRight'],
  ['eyeWideLeft', 'eyeWideRight'], ['eyeSquintLeft', 'eyeSquintRight'],
  ['cheekSquintLeft', 'cheekSquintRight'], ['noseSneerLeft', 'noseSneerRight'],
  ['mouthSmileLeft', 'mouthSmileRight'], ['mouthFrownLeft', 'mouthFrownRight'],
  ['mouthStretchLeft', 'mouthStretchRight'], ['mouthUpperUpLeft', 'mouthUpperUpRight'],
  ['mouthLowerDownLeft', 'mouthLowerDownRight'], ['mouthDimpleLeft', 'mouthDimpleRight'],
];

export const BLINK_CHANNELS = { left: 'eyeBlinkLeft', right: 'eyeBlinkRight' };

export const EXPRESSIVITY_SCORING_CONFIG = {
  channelWeights: EXPRESSIVITY_CHANNELS,
  reactionThreshold: 0.12,
  interpretationThresholds: { excellent: 70, normal: 45, mildlyReduced: 25 },
  blinkThreshold: 0.5,
  blinkDebounceMs: 250,
};

// Session prompt sequence -- fixed-duration windows; 'baseline' vs 'stimulus'
// lets the engine normalize each response against the participant's own
// resting facial movement rather than a fixed population reference.
export const PROMPT_SEQUENCE = [
  { id: 'baseline1', type: 'baseline', durationMs: 8000, prompt: 'Please relax your face and look at the screen.' },
  { id: 'positive1', type: 'stimulus', stimulusCategory: 'positive', durationMs: 8000, prompt: 'Look at this picture for a moment.', mediaHint: 'cheerful-scene' },
  { id: 'verbal1', type: 'stimulus', stimulusCategory: 'verbal', durationMs: 8000, prompt: 'Please read this sentence aloud: "The sun was warm on a quiet afternoon."' },
  { id: 'surprise1', type: 'stimulus', stimulusCategory: 'surprise', durationMs: 8000, prompt: 'Here is a small surprise -- take a look.', mediaHint: 'mild-surprise-scene' },
  { id: 'baseline2', type: 'baseline', durationMs: 8000, prompt: 'Please relax your face again for a moment.' },
];

export const CALIBRATION_DURATION_MS = 4000;
export const FRAME_INTERVAL_MS = 150; // ~6-7 samples/sec

export const CORE_METRIC_KEYS = [
  'overallExpressivityScore', 'averageResponseExpressivity', 'baselineExpressivity',
  'averageResponseLatencyMs', 'expressionDiversityScore', 'overallSymmetryScore', 'blinkRatePerMinute',
];

export const METRIC_LABELS = {
  overallExpressivityScore: 'Overall Expressivity Score',
  averageResponseExpressivity: 'Average Response Expressivity',
  baselineExpressivity: 'Baseline (Resting) Expressivity',
  averageResponseLatencyMs: 'Average Response Latency',
  expressionDiversityScore: 'Expression Diversity',
  overallSymmetryScore: 'Facial Symmetry',
  blinkRatePerMinute: 'Blink Rate',
};

export const METRIC_UNITS = { averageResponseLatencyMs: 'ms', blinkRatePerMinute: '/min' };

export const METRIC_DESCRIPTIONS = {
  overallExpressivityScore: 'How much the face moved in response to prompts, adjusted for how much it moved even while resting.',
  averageResponseExpressivity: 'The raw average amount of facial movement measured during the stimulus prompts, before adjusting for baseline movement.',
  baselineExpressivity: "How much the face moved during the resting/neutral prompts -- this person's own reference point, not a population average.",
  averageResponseLatencyMs: 'How quickly, on average, a facial reaction was first detected after a stimulus prompt appeared.',
  expressionDiversityScore: 'The share of tracked facial-movement channels (brows, eyes, cheeks, nose, mouth, jaw) that showed a clear reaction at least once -- range of expression, not just strength.',
  overallSymmetryScore: 'How closely the left and right sides of the face matched in how much they moved. Descriptive only, not a clinical measure.',
  blinkRatePerMinute: 'An estimated blink rate across the session, from eye-closure detection.',
};
