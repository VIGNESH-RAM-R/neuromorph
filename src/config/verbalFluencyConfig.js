// Verbal Fluency, typed instead of spoken: name as many distinct items in
// a category as possible before time runs out. A rotating category (one
// picked per session, config-driven so adding more is a data change) plus
// a time limit and a target word count used to normalize the raw count
// into a 0-100 score.
export const VERBAL_FLUENCY_CATEGORIES = ['Animals', 'Fruits', 'Countries', 'Occupations'];

export const VERBAL_FLUENCY_CONFIG = {
  timeLimitSeconds: 60,
  minWordLength: 2,
  // Word count expected to map to a full 100 score -- a commonly-cited
  // healthy-range benchmark for a 60-second category fluency task. Zero
  // words is 0; linear in between; isolated in config so it can be tuned
  // against real normative data later without touching the engine.
  targetWordCount: 15,
};
