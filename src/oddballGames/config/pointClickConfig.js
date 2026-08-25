export const POINT_CLICK_VERSION = 'point-click-v1.0';

/**
 * Simple vector-style shape identities. Kept intentionally plain (flat
 * fills, no photographic or gamified art) so the task measures visual
 * search / target detection rather than image-recognition difficulty.
 */
export const STIMULUS_SHAPES = [
  { id: 'circle', label: 'Circle' },
  { id: 'square', label: 'Square' },
  { id: 'triangle', label: 'Triangle' },
  { id: 'star', label: 'Star' },
  { id: 'diamond', label: 'Diamond' },
  { id: 'cloud', label: 'Cloud' },
  { id: 'leaf', label: 'Leaf' },
  { id: 'heart', label: 'Heart' },
];

export const STIMULUS_COLORS = [
  { id: 'red', label: 'Red', hex: '#DC2626' },
  { id: 'blue', label: 'Blue', hex: '#2563EB' },
  { id: 'green', label: 'Green', hex: '#16A34A' },
  { id: 'yellow', label: 'Yellow', hex: '#EAB308' },
  { id: 'orange', label: 'Orange', hex: '#F97316' },
  { id: 'purple', label: 'Purple', hex: '#7C5CBF' },
];

/**
 * Difficulty progression across the 20 scored trials (spec: trials 1-4 at 5
 * objects, 5-8 at 7, 9-12 at 9, 13-16 at 11, 17-20 at 11 with high visual
 * similarity between target and distractors — a conjunction-search block).
 * `trials` values must sum to POINT_CLICK_CONFIG.scoredTrials.
 */
export const DIFFICULTY_LEVELS = [
  { level: 1, trials: 4, objectCount: 5, similarity: 'low' },
  { level: 2, trials: 4, objectCount: 7, similarity: 'low' },
  { level: 3, trials: 4, objectCount: 9, similarity: 'medium' },
  { level: 4, trials: 4, objectCount: 11, similarity: 'medium' },
  { level: 5, trials: 4, objectCount: 11, similarity: 'high' },
];

export const POINT_CLICK_CONFIG = {
  practiceTrials: 3,
  scoredTrials: 20,
  responseWindowMs: 3000, // "miss" cutoff
  targetDisplayMs: 1400, // how long the "TARGET: ..." instruction shows before the board
  transitionMs: 300, // brief blank pause between target display and board appearing
  feedbackMs: 350, // brief subtle feedback shown after a response, before the ITI
  interTrialIntervalMs: 750,
  noTargetProbability: 0.15, // proportion of scored trials with no target present
  minNoTargetSpacing: 2, // minimum trials between two no-target trials
  boardGridCols: 4,
  boardGridRows: 4,
  minTouchTargetPx: 48,
};

export const POINT_CLICK_STORAGE_KEY = 'neuromorph_point_click_assessments';
