// Digital adaptation of the classic Embedded Figures Test: a simple target
// shape is visually broken up by crossing "clutter" lines inside a larger
// composite figure, and the patient picks which of 4 simple shapes is
// actually traceable inside it. Multiple-choice (not freeform tracing), so
// scoring is always an exact match -- consistent with how Cube Copy and the
// naming tasks avoid penalizing motor precision instead of the actual
// visual-perception skill being tested.
//
// `complexFigureId` selects which fixed clutter composition to render (see
// EmbeddedFigureIcon.jsx); each one is drawn to genuinely contain its
// `correctShapeId`'s outline, so the ground truth here matches what's
// actually on screen, not just what the data claims.
export const EMBEDDED_FIGURE_ROUNDS = [
  { id: 'r1', complexFigureId: 'clutterA', correctShapeId: 'triangle', choiceOrder: ['square', 'triangle', 'star', 'cross'] },
  { id: 'r2', complexFigureId: 'clutterB', correctShapeId: 'square', choiceOrder: ['cross', 'star', 'square', 'triangle'] },
  { id: 'r3', complexFigureId: 'clutterC', correctShapeId: 'star', choiceOrder: ['triangle', 'square', 'cross', 'star'] },
];
