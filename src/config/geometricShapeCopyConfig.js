// Geometric Shape Copying Test -- teammate's real project (geometry_game.zip),
// 2026-08-11 integration, part of the real Final 8: "Geometric Shape Copy".
// Reference figures ported verbatim from the teammate's ShapeGeneratorEngine
// (vector data -- vertices + component type -- never images, which is what
// lets the engine score a drawing mathematically). Every figure is an
// original NeuroTrack composition, not a reproduction of the Bender Visual
// Motor Gestalt Test or any other published figure set.
export const GEOMETRIC_FIGURES = [
  {
    id: 'easy-square', name: 'Square', difficulty: 'easy', timeLimitSec: 45, minStrokes: 1,
    symmetry: { axis: 'both' },
    components: [{ type: 'polygon', vertices: [[25, 25], [75, 25], [75, 75], [25, 75]] }],
  },
  {
    id: 'easy-triangle', name: 'Triangle', difficulty: 'easy', timeLimitSec: 45, minStrokes: 1,
    symmetry: { axis: 'vertical', x: 50 },
    components: [{ type: 'polygon', vertices: [[50, 15], [80, 80], [20, 80]] }],
  },
  {
    id: 'easy-pentagon', name: 'Pentagon', difficulty: 'easy', timeLimitSec: 45, minStrokes: 1,
    symmetry: { axis: 'vertical', x: 50 },
    components: [{ type: 'polygon', vertices: [[50, 15], [83.3, 39.2], [70.6, 78.3], [29.4, 78.3], [16.7, 39.2]] }],
  },
  {
    id: 'easy-quartered-circle', name: 'Quartered circle', difficulty: 'easy', timeLimitSec: 45, minStrokes: 3,
    symmetry: { axis: 'both' },
    components: [
      { type: 'circle', cx: 50, cy: 50, r: 35 },
      { type: 'line', points: [[15, 50], [85, 50]] },
      { type: 'line', points: [[50, 15], [50, 85]] },
    ],
  },
  {
    id: 'medium-overlap-squares', name: 'Overlapping squares', difficulty: 'medium', timeLimitSec: 60, minStrokes: 2,
    symmetry: { axis: 'diagonal' },
    components: [
      { type: 'polygon', vertices: [[20, 20], [60, 20], [60, 60], [20, 60]] },
      { type: 'polygon', vertices: [[40, 40], [80, 40], [80, 80], [40, 80]] },
    ],
  },
  {
    id: 'medium-house', name: 'House figure', difficulty: 'medium', timeLimitSec: 60, minStrokes: 1,
    symmetry: { axis: 'vertical', x: 45 },
    components: [{ type: 'polygon', vertices: [[20, 80], [70, 80], [70, 45], [45, 20], [20, 45]] }],
  },
  {
    id: 'medium-five-star', name: 'Five-point star', difficulty: 'medium', timeLimitSec: 60, minStrokes: 1,
    symmetry: { axis: 'vertical', x: 50 },
    components: [{ type: 'polygon', vertices: [[50, 12], [58.8, 37.9], [86.1, 38.3], [64.3, 54.6], [72.3, 80.7], [50, 65], [27.7, 80.7], [35.7, 54.6], [13.9, 38.3], [41.2, 37.9]] }],
  },
  {
    id: 'medium-nested-square-diamond', name: 'Nested square and diamond', difficulty: 'medium', timeLimitSec: 60, minStrokes: 2,
    symmetry: { axis: 'both' },
    components: [
      { type: 'polygon', vertices: [[15, 15], [85, 15], [85, 85], [15, 85]] },
      { type: 'polygon', vertices: [[50, 15], [85, 50], [50, 85], [15, 50]] },
    ],
  },
  {
    id: 'hard-triangular-pinwheel', name: 'Triangular pinwheel', difficulty: 'hard', timeLimitSec: 90, minStrokes: 3,
    symmetry: { axis: 'radial', order: 3 },
    components: [
      { type: 'polygon', vertices: [[50, 50], [50, 15], [70, 28]] },
      { type: 'polygon', vertices: [[50, 50], [80.31, 67.5], [59.05, 78.32]] },
      { type: 'polygon', vertices: [[50, 50], [19.69, 67.5], [20.95, 43.68]] },
    ],
  },
  {
    id: 'hard-hexagram-square', name: 'Hexagram with center square', difficulty: 'hard', timeLimitSec: 90, minStrokes: 3,
    symmetry: { axis: 'both' },
    components: [
      { type: 'polygon', vertices: [[50, 15], [80.3, 67.5], [19.7, 67.5]] },
      { type: 'polygon', vertices: [[50, 85], [19.7, 32.5], [80.3, 32.5]] },
      { type: 'polygon', vertices: [[46, 46], [54, 46], [54, 54], [46, 54]] },
    ],
  },
  {
    id: 'hard-four-blade-pinwheel', name: 'Four-blade pinwheel', difficulty: 'hard', timeLimitSec: 90, minStrokes: 4,
    symmetry: { axis: 'radial', order: 4 },
    components: [
      { type: 'polygon', vertices: [[50, 50], [50, 15], [72, 28]] },
      { type: 'polygon', vertices: [[50, 50], [85, 50], [72, 72]] },
      { type: 'polygon', vertices: [[50, 50], [50, 85], [28, 72]] },
      { type: 'polygon', vertices: [[50, 50], [15, 50], [28, 28]] },
    ],
  },
  {
    id: 'hard-compass-star', name: 'Eight-point compass star', difficulty: 'hard', timeLimitSec: 90, minStrokes: 3,
    symmetry: { axis: 'radial', order: 8 },
    components: [
      { type: 'polygon', vertices: [[50, 12], [56.9, 33.4], [76.9, 23.1], [66.6, 43.1], [88, 50], [66.6, 56.9], [76.9, 76.9], [56.9, 66.6], [50, 88], [43.1, 66.6], [23.1, 76.9], [33.4, 56.9], [12, 50], [33.4, 43.1], [23.1, 23.1], [43.1, 33.4]] },
      { type: 'line', points: [[76.9, 23.1], [23.1, 76.9]] },
      { type: 'line', points: [[23.1, 23.1], [76.9, 76.9]] },
    ],
  },
];

// TIME-BUDGET CALIBRATION (documented, not a fabrication -- same real
// figures/scoring as the teammate's own project, just fewer of them per
// session): the teammate's own default is 2 practice + 12 scored figures
// (4 easy/45s cap + 4 medium/60s cap + 4 hard/90s cap), which alone can run
// 6-13 minutes -- too much of the shared 20-minute Detection Assessment
// budget once combined with the other 7 tasks. Trimmed here to 1 practice +
// 6 scored (2 per tier), same figures, same scoring math, ~3-4 min typical.
// Flagged to the product owner -- revisit if clinical validation wants the
// full 12-figure protocol back.
export function buildPracticeSequence() {
  return [GEOMETRIC_FIGURES[0]];
}
export function buildAssessmentSequence() {
  const byDifficulty = (d) => GEOMETRIC_FIGURES.filter((f) => f.difficulty === d);
  return [...byDifficulty('easy').slice(0, 2), ...byDifficulty('medium').slice(0, 2), ...byDifficulty('hard').slice(0, 2)];
}

export const CANVAS_SIZE = 420;
