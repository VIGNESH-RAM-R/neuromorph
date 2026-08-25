// Visual Memory Test -- teammate's real project (visual_memory.zip),
// 2026-08-11 integration, part of the real Final 8: "Visual Memory". Object
// pool + difficulty tuning ported verbatim from the teammate's own
// data/object-pool.json + config/difficultyConfig.js. SVG illustrations
// copied into public/assets/objects/ (same 20 filenames, unmodified).
export const OBJECT_POOL = {
  objects: [
    { id: 'apple', name: 'Apple', pairGroup: 'fruit' },
    { id: 'pear', name: 'Pear', pairGroup: 'fruit' },
    { id: 'cup', name: 'Cup', pairGroup: 'drinkware' },
    { id: 'mug', name: 'Mug', pairGroup: 'drinkware' },
    { id: 'pen', name: 'Pen', pairGroup: 'writing' },
    { id: 'pencil', name: 'Pencil', pairGroup: 'writing' },
    { id: 'fork', name: 'Fork', pairGroup: 'cutlery' },
    { id: 'spoon', name: 'Spoon', pairGroup: 'cutlery' },
    { id: 'book', name: 'Book', pairGroup: null },
    { id: 'key', name: 'Key', pairGroup: null },
    { id: 'umbrella', name: 'Umbrella', pairGroup: null },
    { id: 'chair', name: 'Chair', pairGroup: null },
    { id: 'clock', name: 'Clock', pairGroup: null },
    { id: 'bottle', name: 'Bottle', pairGroup: null },
    { id: 'scissors', name: 'Scissors', pairGroup: null },
    { id: 'wallet', name: 'Wallet', pairGroup: null },
    { id: 'lamp', name: 'Lamp', pairGroup: null },
    { id: 'phone', name: 'Phone', pairGroup: null },
    { id: 'glasses', name: 'Glasses', pairGroup: null },
    { id: 'backpack', name: 'Backpack', pairGroup: null },
  ],
};

export const DIFFICULTY_CONFIG = {
  easy: { targets: 5, options: 8, viewSec: 15 },
  medium: { targets: 6, options: 12, viewSec: 12 },
  hard: { targets: 9, options: 16, viewSec: 10 },
};

export const DELAY_SEC = 10;
export const RECOGNITION_MAX_SEC = 30;

// 'demo' protocol used here (1 practice + 3 scored: easy/medium/hard) rather
// than the teammate's own 'standardClinical' (2 practice + 15 scored) --
// time-budget calibration for the shared 20-minute assessment, same reason
// Geometric Shape Copy's scored sequence was trimmed. Same real objects,
// scoring, and difficulty tuning either way.
export const PROTOCOL = { practiceTrials: 1, scoredSequence: ['easy', 'medium', 'hard'] };

export const OBJECT_ASSET_PATH = (id) => `/assets/objects/${id}.svg`;
