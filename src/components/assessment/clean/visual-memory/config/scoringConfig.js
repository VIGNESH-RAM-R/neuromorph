// Every scoring weight NEUROMORPH's Visual Memory Test uses, centralized so
// clinical validation can retune them without touching engine code. All
// values here are illustrative placeholders pending validation.
export const SCORING_CONFIG = {
  difficultyWeights: { easy: 1, medium: 1.15, hard: 1.3 },
  visualMemoryWeights: { encoding: 0.4, retrieval: 0.3, retention: 0.3 },
  retrievalSubWeights: { correctRejection: 0.7, speed: 0.3 },
  cognitiveWeights: { visualMemory: 0.35, encoding: 0.25, retrieval: 0.20, processingSpeed: 0.20 },
  interpretationThresholds: { excellent: 85, normal: 65, mildlyReduced: 45 }
};

// Which metrics the completion report renders (Core Clinical) versus which
// are computed and stored but not shown (Research). Both groups always exist
// on the returned metrics object -- this only controls the UI's card list.
export const CORE_METRIC_KEYS = [
  'hitRate', 'missRate', 'falsePositiveRate', 'correctRejectionRate',
  'overallRecognitionAccuracy', 'averageRecognitionTimeMs', 'reactionTimeVariability',
  'encodingScore', 'retrievalScore', 'memoryRetentionScore', 'visualMemoryScore'
];

export const RESEARCH_METRIC_KEYS = [
  'fastestRecognitionTimeMs', 'slowestRecognitionTimeMs', 'processingSpeedScore',
  'rawScore', 'normalizedScore', 'attentionConsistency', 'timeouts', 'incorrectSelections'
];

export const METRIC_LABELS = {
  hitRate: 'Hit rate',
  missRate: 'Miss rate',
  falsePositiveRate: 'False positive rate',
  correctRejectionRate: 'Correct rejection rate',
  overallRecognitionAccuracy: 'Recognition accuracy',
  averageRecognitionTimeMs: 'Average recognition time',
  reactionTimeVariability: 'Reaction time variability',
  encodingScore: 'Encoding score',
  retrievalScore: 'Retrieval score',
  memoryRetentionScore: 'Memory retention score',
  visualMemoryScore: 'Visual memory score',
  fastestRecognitionTimeMs: 'Fastest recognition time',
  slowestRecognitionTimeMs: 'Slowest recognition time',
  processingSpeedScore: 'Processing speed score',
  rawScore: 'Raw score',
  normalizedScore: 'Normalized score',
  attentionConsistency: 'Attention consistency',
  timeouts: 'Timeouts',
  incorrectSelections: 'Incorrect selections'
};
