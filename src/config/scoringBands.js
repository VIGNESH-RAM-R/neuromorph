// Mirrored byte-for-byte from the Doctor Dashboard's scoringBands.js, same
// reasoning as lobarConfig.js/lobarTaskRegistryConfig.js being kept in sync
// across the two apps: a Cognitive Score computed here and a band computed
// over there must always mean the same thing to a doctor reading both.
//
// Shared, config-driven, non-diagnostic performance banding.
// Bands describe TASK/SESSION PERFORMANCE ONLY.
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

export const NON_DIAGNOSTIC_DISCLAIMER =
  'NEUROMORPH is an early cognitive screening tool. Bands describe observed task performance only and do not constitute a diagnosis of dementia or any other condition. Clinical correlation and, where indicated, formal neuropsychological or neurological evaluation is recommended.';
