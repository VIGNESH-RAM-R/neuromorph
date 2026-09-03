// SceneEngine
// -----------------------------------------------------------------------------
// Single responsibility: determine the on-screen arrangement of a trial's
// target objects for the observation screen. Deliberately separate from
// ObjectGenerationEngine so future spatial-layout work (fixed grid positions,
// adaptive placement) doesn't touch object-selection logic at all.
import { shuffle } from './shuffle.js';

export const SceneEngine = {
  arrange(targets) {
    return shuffle(targets);
  }
};
