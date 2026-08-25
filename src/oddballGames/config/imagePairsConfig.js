/**
 * Image Pairs — configuration
 *
 * IMPORTANT: All values below are engineering / prototype parameters chosen
 * to produce a stable, controlled behavioural task. They are NOT clinically
 * validated thresholds, trial counts, or timing standards. They are
 * centralized here so the protocol can be tuned later during formal
 * validation without touching game logic or UI components.
 *
 * Domain: Visual Memory (recognition memory, spatial memory, short-term
 * visual memory, associative memory groundwork, attention, processing
 * efficiency). Standard mode is identical-image matching — see section
 * below for the (currently unused) associative-mode extension point.
 */

export const IMAGE_PAIRS_VERSION = 'image-pairs-v1.0';

/** Recorded on every saved assessment so the exact protocol can be
 * identified later even if IMAGE_PAIRS_CONFIG values change over time. */
export const IMAGE_PAIRS_PROTOCOL_VERSION = 'IMAGE_PAIRS_V1';

/** Recorded alongside protocol version; changes only if the stimulus set
 * (the actual images/icons used) is revised. */
export const IMAGE_PAIRS_STIMULUS_VERSION = 'STIMULUS_SET_V1';

export const IMAGE_PAIRS_STORAGE_KEY = 'neuromorph_image_pairs_assessments';

/**
 * Standard clinical protocol. Fixed — not participant-selectable. 16 cards
 * / 8 pairs / 4x4 grid / 90s max, identical-image matching, no hints, no
 * retries, no adaptive difficulty (see spec sections 5, 12, 19).
 */
export const IMAGE_PAIRS_CONFIG = {
  gridCols: 4,
  gridRows: 4,
  totalCards: 16,
  totalPairs: 8,
  maxDurationMs: 90000, // 90-second maximum duration
  flipAnimationMs: 300, // card flip animation (250-350ms per spec)
  correctRevealMs: 550, // brief pause showing a confirmed match before it locks
  incorrectRevealMs: 950, // brief pause showing a mismatch before flipping back
  countdownSeconds: 3,
};

/** Practice round: short, untimed, uses a stimulus set disjoint from the
 * scored assessment so practice exposure cannot give the participant a
 * head start on the actual stimuli being measured. Never scored/stored. */
export const IMAGE_PAIRS_PRACTICE_CONFIG = {
  gridCols: 2,
  gridRows: 3,
  totalCards: 6,
  totalPairs: 3,
  maxDurationMs: null, // untimed — practice measures interface understanding, not speed
  flipAnimationMs: 300,
  correctRevealMs: 550,
  incorrectRevealMs: 950,
};

/**
 * Controlled stimulus library — MODE A (identical image matching, the
 * standard assessment mode). Familiar, culturally-neutral everyday objects
 * only; no text, no religious/culturally-specific symbols, no obscure
 * items (spec sections 17-18). Rendered locally as flat vector icons
 * (ImagePairsIcon.jsx) rather than photographic/external images, so the
 * stimulus set is fully controlled and never dependent on network access.
 */
export const IMAGE_PAIRS_STIMULI = [
  { stimulusId: 'IMG_001', iconId: 'cup', label: 'Cup', category: 'household', difficulty: 'easy', visualComplexity: 'low', version: '1.0' },
  { stimulusId: 'IMG_002', iconId: 'key', label: 'Key', category: 'household', difficulty: 'easy', visualComplexity: 'low', version: '1.0' },
  { stimulusId: 'IMG_003', iconId: 'clock', label: 'Clock', category: 'household', difficulty: 'easy', visualComplexity: 'medium', version: '1.0' },
  { stimulusId: 'IMG_004', iconId: 'book', label: 'Book', category: 'everyday', difficulty: 'easy', visualComplexity: 'low', version: '1.0' },
  { stimulusId: 'IMG_005', iconId: 'umbrella', label: 'Umbrella', category: 'everyday', difficulty: 'easy', visualComplexity: 'low', version: '1.0' },
  { stimulusId: 'IMG_006', iconId: 'tree', label: 'Tree', category: 'nature', difficulty: 'easy', visualComplexity: 'medium', version: '1.0' },
  { stimulusId: 'IMG_007', iconId: 'sun', label: 'Sun', category: 'nature', difficulty: 'easy', visualComplexity: 'low', version: '1.0' },
  { stimulusId: 'IMG_008', iconId: 'bird', label: 'Bird', category: 'nature', difficulty: 'easy', visualComplexity: 'medium', version: '1.0' },
];

/** Practice-only stimuli — deliberately different objects from the scored
 * set above (spec section 10 / 33: practice must not leak assessment
 * stimuli or contribute to practice-effect contamination of scored data). */
export const IMAGE_PAIRS_PRACTICE_STIMULI = [
  { stimulusId: 'PRACTICE_001', iconId: 'apple', label: 'Apple', category: 'food', difficulty: 'easy', visualComplexity: 'low', version: '1.0' },
  { stimulusId: 'PRACTICE_002', iconId: 'bicycle', label: 'Bicycle', category: 'transport', difficulty: 'easy', visualComplexity: 'medium', version: '1.0' },
  { stimulusId: 'PRACTICE_003', iconId: 'cloud', label: 'Cloud', category: 'nature', difficulty: 'easy', visualComplexity: 'low', version: '1.0' },
];

/**
 * MODE B — associative image matching (e.g. Key <-> Lock). Not implemented
 * in the current prototype. Kept as a documented extension point only: an
 * associative mode must never be scored together with the standard
 * identical-matching protocol above, and should be clearly labeled as a
 * separate "Research / Advanced Mode" if built (spec section 6).
 */
export const IMAGE_PAIRS_ASSOCIATIVE_MODE_PLANNED = false;
