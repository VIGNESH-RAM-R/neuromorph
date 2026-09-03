// ObjectGenerationEngine
// -----------------------------------------------------------------------------
// Single responsibility: given a difficulty level, select the target objects
// and distractor objects for one trial from the object pool.
//
// The pool and hard-tier similarity groupings (cup/mug, pen/pencil, fork/spoon,
// apple/pear) come from data/object-pool.json, not a hardcoded array, so the
// illustration set can be expanded or swapped without touching this file --
// see assets README for the add/replace workflow.
//
// Hard-tier trials preferentially draw each target's visually-similar pair
// partner as a distractor before falling back to random fill. That's what
// makes hard trials genuinely harder to discriminate rather than just larger.
import objectPoolData from '../data/object-pool.json' with { type: 'json' };
import { DIFFICULTY_CONFIG } from '../config/difficultyConfig.js';
import { shuffle } from './shuffle.js';

export const ObjectGenerationEngine = {
  getPool() {
    return objectPoolData.objects;
  },
  // targetsOverride/optionsOverride let a specific round ask for a
  // different object count than this difficulty's own default (see
  // trialModes.js's targetsSequence/optionsSequence) — used to give a
  // smooth per-round progression (e.g. 4,5,6,7,8 targets across 5 rounds)
  // without needing a difficulty tier per distinct count.
  generateTrial(difficulty, targetsOverride, optionsOverride) {
    const cfg = DIFFICULTY_CONFIG[difficulty];
    if (!cfg) throw new Error(`Unknown difficulty: ${difficulty}`);
    const targetCount = targetsOverride ?? cfg.targets;
    const optionCount = optionsOverride ?? cfg.options;
    const pool = shuffle(objectPoolData.objects);
    const targets = pool.slice(0, targetCount);
    const remaining = pool.slice(targetCount);
    const distractorCount = Math.max(0, optionCount - targetCount);

    let distractors;
    if (difficulty === 'hard') {
      const pairPartners = remaining.filter(
        (o) => o.pairGroup && targets.some((t) => t.pairGroup === o.pairGroup)
      );
      const rest = remaining.filter((o) => !pairPartners.includes(o));
      distractors = shuffle(pairPartners.concat(rest)).slice(0, distractorCount);
    } else {
      distractors = shuffle(remaining).slice(0, distractorCount);
    }

    return { targets: shuffle(targets), distractors: shuffle(distractors) };
  }
};
