// Shared, config-driven, non-diagnostic performance banding.
// Used across every summary in the dashboard so the vocabulary is identical
// everywhere a doctor reads it. Bands describe TASK PERFORMANCE ONLY.
export const BANDS = ['Excellent', 'Normal', 'Mildly Reduced', 'Reduced'];

export const BAND_RANK = { Excellent: 3, Normal: 2, 'Mildly Reduced': 1, Reduced: 0 };

export const DEFAULT_BAND_THRESHOLDS = {
  excellent: 85,
  normal: 70,
  mildlyReduced: 50,
};

export function bandFromScore(score, thresholds = DEFAULT_BAND_THRESHOLDS) {
  if (typeof score !== 'number' || Number.isNaN(score)) return 'Reduced';
  if (score >= thresholds.excellent) return 'Excellent';
  if (score >= thresholds.normal) return 'Normal';
  if (score >= thresholds.mildlyReduced) return 'Mildly Reduced';
  return 'Reduced';
}

export const BAND_INTERPRETATION_TEMPLATES = {
  Excellent: 'Performance is within the excellent range relative to expected task performance.',
  Normal: 'Performance is within the normal range relative to expected task performance.',
  'Mildly Reduced': 'Performance is mildly below the expected range for this task and may benefit from monitoring.',
  Reduced: 'Performance is notably below the expected range for this task and may warrant closer clinical follow-up.',
};

// Speech Assessment uses its own 3-tier vocabulary per the platform spec
// (Normal / Slightly Reduced / Reduced) instead of the general 4-tier band
// set, so it gets its own threshold table rather than overloading bandFromScore.
export const SPEECH_BAND_THRESHOLDS = { normal: 70, slightlyReduced: 50 };

export function speechBandFromScore(score, thresholds = SPEECH_BAND_THRESHOLDS) {
  if (typeof score !== 'number' || Number.isNaN(score)) return 'Reduced';
  if (score >= thresholds.normal) return 'Normal';
  if (score >= thresholds.slightlyReduced) return 'Slightly Reduced';
  return 'Reduced';
}

export const SPEECH_BAND_INTERPRETATION_TEMPLATES = {
  Normal: 'Speech performance on this metric is within the normal range.',
  'Slightly Reduced': 'Speech performance on this metric is slightly below the expected range.',
  Reduced: 'Speech performance on this metric is notably below the expected range.',
};

export const NON_DIAGNOSTIC_DISCLAIMER =
  'NEUROMORPH is an early cognitive screening tool. Bands describe observed task performance only and do not constitute a diagnosis of dementia or any other condition. Clinical correlation and, where indicated, formal neuropsychological or neurological evaluation is recommended.';
