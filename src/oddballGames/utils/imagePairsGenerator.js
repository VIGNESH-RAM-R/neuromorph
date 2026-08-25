import { shuffle, mulberry32, generateSeed } from './random.js';

/**
 * Builds a shuffled 16-card deck (8 unique stimuli, each duplicated once)
 * from a stimulus list. Position is assigned by final shuffled index, and
 * the seed used is returned alongside the deck so the exact layout is
 * reproducible/auditable later (spec sections 16, 52, 71).
 *
 * `seed` defaults to a fresh session seed; pass an explicit seed to
 * reproduce a prior layout (e.g. in tests).
 */
export function buildDeck(stimuli, seed = generateSeed()) {
  if (!Array.isArray(stimuli) || stimuli.length === 0) {
    throw new Error('buildDeck: stimuli must be a non-empty array');
  }
  const uniqueIds = new Set(stimuli.map((s) => s.stimulusId));
  if (uniqueIds.size !== stimuli.length) {
    throw new Error('buildDeck: stimuli must have unique stimulusId values');
  }

  const doubled = stimuli.flatMap((s) => [s, s]);
  const rng = mulberry32(seed);
  const shuffled = shuffle(doubled, rng);

  const cards = shuffled.map((stimulus, index) => ({
    cardId: `card_${index + 1}`,
    stimulusId: stimulus.stimulusId,
    iconId: stimulus.iconId,
    label: stimulus.label,
    position: index,
  }));

  return { cards, seed, totalPairs: stimuli.length, totalCards: cards.length };
}
