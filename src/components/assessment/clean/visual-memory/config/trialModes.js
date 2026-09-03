// Protocol configuration. The hook and ObjectGenerationEngine operate on
// protocol.scoredSequence.length rather than a hardcoded trial count, so
// switching modes requires no engine changes -- just a different protocol.
export const TRIAL_MODES = {
  demo: {
    label: 'Demo mode',
    description: '1 practice trial, 3 scored trials (easy, medium, hard).',
    practiceTrials: 1,
    scoredSequence: ['easy', 'medium', 'hard']
  },
  standardClinical: {
    // Was 15 scored trials (5 easy/medium/hard each) — reported as too many
    // for the weekly assessment; trimmed to 5. targetsSequence/
    // optionsSequence (see ObjectGenerationEngine.generateTrial) then give
    // each of those 5 rounds its own object count — a 4,5,5,6,7 progression
    // (was 4,5,6,7,8 — 8 was reported as too many, 7 is the new ceiling)
    // instead of the tier's own fixed count — while scoredSequence itself
    // stays as the difficulty tier used for viewing time and the scoring
    // weight/breakdown, unchanged.
    label: 'Standard clinical mode',
    description: '2 practice trials, 5 scored trials (4 to 7 objects).',
    practiceTrials: 2,
    scoredSequence: ['easy', 'easy', 'medium', 'medium', 'hard'],
    targetsSequence: [4, 5, 5, 6, 7],
    optionsSequence: [6, 7, 7, 8, 9]
  },
  // Research mode ships with no fixed sequence -- a research protocol object
  // ({ practiceTrials, scoredSequence }) is supplied by the caller at
  // useVisualMemoryTest({ protocol }) instead of selected by key.
  research: {
    label: 'Research mode',
    description: 'Custom protocol supplied at runtime.',
    practiceTrials: 0,
    scoredSequence: null
  }
};
