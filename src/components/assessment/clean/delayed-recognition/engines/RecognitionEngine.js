// RecognitionEngine
// -----------------------------------------------------------------------------
// Single responsibility: build one category's recognition grid by merging
// the retrieved targets with freshly-sampled distractors of the same item
// type, positions randomized. Items must be retrieved exactly as originally
// presented -- this engine never alters a target's id or its
// wasRecognizedAtEncoding flag, only where it's positioned in the grid.
import itemPools from '../data/itemPools.json' with { type: 'json' };
import { DISTRACTOR_COUNT_BY_TYPE } from '../config/scoringConfig.js';
import { shuffle } from './shuffle.js';

export const RecognitionEngine = {
  buildTrial(studySet) {
    const pool = itemPools[studySet.itemType];
    if (!pool) {
      throw new Error(`No distractor pool configured for item type "${studySet.itemType}" yet.`);
    }
    const targetIds = new Set(studySet.items.map((i) => i.id));
    const distractorCandidates = pool.filter((id) => !targetIds.has(id));
    const distractorCount = Math.min(
      DISTRACTOR_COUNT_BY_TYPE[studySet.itemType] ?? 3,
      distractorCandidates.length
    );
    const distractors = shuffle(distractorCandidates)
      .slice(0, distractorCount)
      .map((id) => ({ id, wasRecognizedAtEncoding: null }));

    const grid = [
      ...studySet.items.map((o) => ({ ...o, isTarget: true })),
      ...distractors.map((o) => ({ ...o, isTarget: false }))
    ];
    return shuffle(grid);
  }
};
