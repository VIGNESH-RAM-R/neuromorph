/**
 * Sequence Memory — configuration
 *
 * IMPORTANT: All values below are engineering / prototype parameters chosen
 * to produce a stable, controlled behavioural task. They are NOT clinically
 * validated thresholds, trial counts, or timing standards. They are
 * centralized here so the protocol can be tuned later during formal
 * validation without touching game logic or UI components.
 */

export const SEQUENCE_MEMORY_VERSION = 'sequence-memory-v1.1';

export const SEQUENCE_STIMULI = ['red', 'blue', 'green', 'yellow'];

/**
 * Visual 4x4 board layout (16 tile positions, each mapped back to one of
 * the 4 logical SEQUENCE_STIMULI colors above — every color appears 4
 * times). This is purely a presentation-layer mapping: any tile of the
 * correct color is a valid tap for that color, so the underlying game
 * logic (sequence generation, timing, scoring in useSequenceEngine /
 * sequenceGenerator / sequenceScoring) is completely unaffected — those
 * still only ever deal with the 4 logical colors, never tile position.
 * Same arrangement reused for the decorative previews on the Welcome and
 * How-To-Play screens, so the whole module shows one consistent grid.
 */
export const SEQUENCE_BOARD_LAYOUT = [
  'red', 'green', 'blue', 'yellow',
  'blue', 'yellow', 'red', 'green',
  'green', 'red', 'yellow', 'blue',
  'red', 'blue', 'green', 'yellow',
];

export const STIMULUS_LABELS = {
  red: 'Red',
  blue: 'Blue',
  green: 'Green',
  yellow: 'Yellow',
};

export const SEQUENCE_TIMING = {
  stimulusDuration: 800, // how long each color is highlighted during WATCH
  interStimulusInterval: 400, // gap between stimuli during WATCH
  postSequenceDelay: 700, // pause after the last stimulus, before REMEMBER
  rememberDuration: 600, // REMEMBER phase length before REPEAT is enabled
  trialCompleteDelay: 700, // brief pause between trials
};

/** Sequence length progresses across levels; memory load is the only
 * manipulated variable — button positions, colors, and timing stay fixed.
 * One trial per level, lengths 3-6 (max length capped at 6, down from 8 —
 * 8 was too difficult for typical participants). */
export const SEQUENCE_LEVELS = [
  { sequenceLength: 3, trials: 1 },
  { sequenceLength: 4, trials: 1 },
  { sequenceLength: 5, trials: 1 },
  { sequenceLength: 6, trials: 1 },
];

/** Practice sequence lengths — short, separate from assessment trials/metrics. */
export const PRACTICE_SEQUENCE_LENGTHS = [2, 3, 3];

export const SEQUENCE_STORAGE_KEY = 'neuromorph_sequence_assessments';
