// Every scoring weight the Delayed Recognition Test uses, centralized so
// clinical validation can retune them without touching engine code. All
// values here are illustrative placeholders pending validation -- same
// discipline as every other NeuroMorph module.
export const SCORING_CONFIG = {
  retrievalSubWeights: { correctRejection: 0.7, speed: 0.3 },
  efficiencyWeights: { accuracy: 0.5, speed: 0.5 },
  cognitiveWeights: { retention: 0.35, encoding: 0.25, retrieval: 0.20, processingSpeed: 0.20 },
  interpretationThresholds: { excellent: 85, normal: 65, mildlyReduced: 45 }
};

export const RECOGNITION_MAX_SEC = 30;

// Distractor grid sizing per item type -- how many non-target items to mix
// in alongside the retrieved targets for that category's trial.
export const DISTRACTOR_COUNT_BY_TYPE = {
  // Was 4 — reported as too few given the object pool grew to 35 (see
  // visual-memory/data/object-pool.json); the recognition grid should
  // genuinely be full of objects the patient never saw, not just a handful
  // alongside the real targets. distractorCandidates (RecognitionEngine.js)
  // already excludes anything that was a target in THIS round, so raising
  // this just pulls more from everything else in the pool.
  object: 10,
  figure: 3,
  symbol: 3,
  face: 3
};

export const CORE_METRIC_KEYS = [
  'hitRate', 'missRate', 'falsePositiveRate', 'correctRejectionRate',
  'delayedRecognitionAccuracy', 'averageRecognitionTimeMs', 'reactionTimeVariability',
  'encodingPreservationScore', 'retrievalScore', 'delayedRetentionScore',
  'recognitionEfficiency', 'memoryDecayIndex'
];

export const RESEARCH_METRIC_KEYS = [
  'fastestRecognitionTimeMs', 'slowestRecognitionTimeMs', 'attentionConsistency',
  'processingSpeedScore', 'rawScore', 'normalizedScore', 'timeouts', 'incorrectSelections'
];

export const METRIC_LABELS = {
  hitRate: 'Hit rate',
  missRate: 'Miss rate',
  falsePositiveRate: 'False positive rate',
  correctRejectionRate: 'Correct rejection rate',
  delayedRecognitionAccuracy: 'Delayed recognition accuracy',
  averageRecognitionTimeMs: 'Average recognition time',
  reactionTimeVariability: 'Reaction time variability',
  encodingPreservationScore: 'Encoding preservation score',
  retrievalScore: 'Retrieval score',
  delayedRetentionScore: 'Delayed retention score',
  recognitionEfficiency: 'Recognition efficiency',
  memoryDecayIndex: 'Memory decay index (lower is better)',
  fastestRecognitionTimeMs: 'Fastest recognition time',
  slowestRecognitionTimeMs: 'Slowest recognition time',
  attentionConsistency: 'Attention consistency',
  processingSpeedScore: 'Processing speed score',
  rawScore: 'Raw score',
  normalizedScore: 'Normalized score',
  timeouts: 'Timeouts',
  incorrectSelections: 'Incorrect selections'
};
