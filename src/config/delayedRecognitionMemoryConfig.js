// Delayed Recognition Memory Test -- teammate's real project
// (delayed_recognition_test.zip), 2026-08-11 integration, part of the real
// Final 8: "Delayed Recognition Memory". This task presents NO new study
// material of its own -- it retrieves items another task (Visual Memory
// Test, earlier in the battery) already showed the participant, via the
// shared StudyItemRegistry bridge, and tests recognition after a real delay
// filled by the intervening tasks. Config ported verbatim from the
// teammate's own scoringConfig.js + itemPools.json.
export const SCORING_CONFIG = {
  retrievalSubWeights: { correctRejection: 0.7, speed: 0.3 },
  efficiencyWeights: { accuracy: 0.5, speed: 0.5 },
  cognitiveWeights: { retention: 0.35, encoding: 0.25, retrieval: 0.20, processingSpeed: 0.20 },
  interpretationThresholds: { excellent: 85, normal: 65, mildlyReduced: 45 },
};

export const RECOGNITION_MAX_SEC = 30;

export const DISTRACTOR_COUNT_BY_TYPE = { object: 4, figure: 3, symbol: 3, face: 3 };

export const ITEM_POOLS = {
  object: ['apple', 'backpack', 'book', 'bottle', 'chair', 'clock', 'cup', 'fork', 'glasses', 'key', 'lamp', 'mug', 'pear', 'pen', 'pencil', 'phone', 'scissors', 'spoon', 'umbrella', 'wallet'],
  figure: ['circle', 'square', 'triangle', 'pentagon', 'diamond', 'hexagon', 'star', 'plus', 'oval', 'trapezoid'],
  symbol: ['arrow', 'check', 'wave', 'burst', 'spiral', 'xmark'],
  // Added 2026-08-14 with the Face Recognition Test integration -- this was
  // a real gap, not a new feature: DISTRACTOR_COUNT_BY_TYPE.face already
  // existed below (the teammate anticipated this), but no `face` pool did,
  // so once Face Recognition started registering itemType: 'face' items,
  // RecognitionEngine.buildTrial would have thrown "No distractor pool
  // configured for item type 'face' yet." at runtime. face01-face20 mirror
  // the ids in faceRecognitionConfig.js's FACE_POOL.
  face: ['face01', 'face02', 'face03', 'face04', 'face05', 'face06', 'face07', 'face08', 'face09', 'face10', 'face11', 'face12', 'face13', 'face14', 'face15', 'face16', 'face17', 'face18', 'face19', 'face20'],
};

// Dev/demo fallback ONLY -- used if StudyItemRegistry is empty (e.g. this
// task somehow ran before Visual Memory Test in a given session). In the
// real, intended flow (registry order: ... visualMemory -> delayedRecognitionMemory)
// this never fires; Visual Memory Test always registers real items first.
export const MOCK_SESSION_LOG = [
  {
    sourceModule: 'Visual Memory Test',
    itemType: 'object',
    presentedAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    items: [
      { id: 'apple', wasRecognizedAtEncoding: true },
      { id: 'key', wasRecognizedAtEncoding: true },
      { id: 'cup', wasRecognizedAtEncoding: false },
      { id: 'umbrella', wasRecognizedAtEncoding: true },
      { id: 'chair', wasRecognizedAtEncoding: false },
      { id: 'clock', wasRecognizedAtEncoding: true },
    ],
  },
];

export const ITEM_ASSET_PATH = (itemType, id) => `/assets/${itemType}s/${id}.svg`;
