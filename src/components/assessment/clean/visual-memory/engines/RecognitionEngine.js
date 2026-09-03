// RecognitionEngine
// -----------------------------------------------------------------------------
// Single responsibility: merge a trial's targets and distractors into one
// shuffled recognition grid, tagging each item isTarget so ValidationEngine
// can score selections against it.
import { shuffle } from './shuffle.js';

export const RecognitionEngine = {
  buildGrid(targets, distractors) {
    const grid = [
      ...targets.map((o) => ({ ...o, isTarget: true })),
      ...distractors.map((o) => ({ ...o, isTarget: false }))
    ];
    return shuffle(grid);
  }
};
