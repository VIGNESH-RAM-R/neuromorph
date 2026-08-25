import { SEQUENCE_STIMULI, SEQUENCE_LEVELS } from '../config/sequenceConfig.js';

/**
 * Generates a random sequence of the requested length. Avoids pathological
 * repetition (e.g. the same color four times in a row) by rejecting a
 * candidate that would create a run of three identical stimuli in a row,
 * while still allowing natural incidental repeats.
 *
 * `randomSource` defaults to Math.random but can be swapped for a seeded
 * generator later if reproducibility is needed for research purposes.
 */
export function generateSequence(length, stimuli = SEQUENCE_STIMULI, randomSource = Math.random) {
  const sequence = [];
  for (let i = 0; i < length; i++) {
    let candidate;
    let attempts = 0;
    do {
      candidate = stimuli[Math.floor(randomSource() * stimuli.length)];
      attempts += 1;
    } while (
      attempts < 25 &&
      sequence.length >= 2 &&
      sequence[sequence.length - 1] === candidate &&
      sequence[sequence.length - 2] === candidate
    );
    sequence.push(candidate);
  }
  return sequence;
}

/**
 * Generates a sequence that does not exactly duplicate one already used
 * earlier in the same session (each trial should present a different
 * sequence, per protocol). Falls back to the plain generator after a bounded
 * number of attempts so trial generation always terminates.
 */
export function generateUniqueSequence(length, usedSequences, stimuli = SEQUENCE_STIMULI, randomSource = Math.random) {
  const usedKeys = new Set((usedSequences || []).map((s) => s.join(',')));
  let candidate;
  let attempts = 0;
  do {
    candidate = generateSequence(length, stimuli, randomSource);
    attempts += 1;
  } while (attempts < 30 && usedKeys.has(candidate.join(',')));
  return candidate;
}

/**
 * Expands a levels configuration (sequence length + trial count per level)
 * into a flat, numbered list of trial specs for the assessment engine.
 */
export function buildTrialSpecs(levels = SEQUENCE_LEVELS) {
  const specs = [];
  levels.forEach((level, levelIndex) => {
    for (let t = 0; t < level.trials; t++) {
      specs.push({ level: levelIndex + 1, sequenceLength: level.sequenceLength });
    }
  });
  return specs.map((spec, i) => ({ ...spec, trialNumber: i + 1 }));
}

/** Builds trial specs for the practice round from a flat list of lengths. */
export function buildPracticeSpecs(lengths) {
  return lengths.map((sequenceLength, i) => ({
    level: 0,
    sequenceLength,
    trialNumber: i + 1,
  }));
}
