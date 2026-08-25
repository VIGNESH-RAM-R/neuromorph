// Three matching rounds, each showing the same target ("standard") against
// a different fixed ordering of the four cube variants -- repetition with
// varied choice order, not randomized at runtime, keeps this reproducible.
export const CUBE_COPY_ROUNDS = [
  { correctVariant: 'standard', choiceOrder: ['noTopEdge', 'standard', 'mirrored', 'squashed'] },
  { correctVariant: 'standard', choiceOrder: ['squashed', 'mirrored', 'noTopEdge', 'standard'] },
  { correctVariant: 'standard', choiceOrder: ['standard', 'squashed', 'mirrored', 'noTopEdge'] },
];
