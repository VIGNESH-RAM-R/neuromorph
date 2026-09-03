// ShapeGeneratorEngine
// -----------------------------------------------------------------------------
// Single responsibility: define and provide the original geometric reference
// figures used by the Geometric Shape Copying Test.
//
// Figures are stored as VECTOR data (vertices + component types: polygon,
// line, circle) in a normalized 0-100 local coordinate space -- never as
// images. That is what allows GeometryAnalysisEngine to compare a
// participant's drawing mathematically instead of visually.
//
// COPYRIGHT NOTE: every figure below is an original NeuroTrack composition.
// None reproduce the Bender Visual Motor Gestalt Test cards or any other
// published/copyrighted figure set. They are inspired by the same cognitive
// principles (progressive complexity, overlap, rotation, symmetry) using
// entirely original shapes and layouts.

const FIGURES = [
  // ---------------- EASY: single primitive figures ----------------
  {
    id: 'easy-square', name: 'Square', difficulty: 'easy', timeLimitSec: 45, minStrokes: 1,
    symmetry: { axis: 'both' },
    components: [
      { type: 'polygon', vertices: [[25, 25], [75, 25], [75, 75], [25, 75]] }
    ]
  },
  {
    id: 'easy-triangle', name: 'Triangle', difficulty: 'easy', timeLimitSec: 45, minStrokes: 1,
    symmetry: { axis: 'vertical', x: 50 },
    components: [
      { type: 'polygon', vertices: [[50, 15], [80, 80], [20, 80]] }
    ]
  },
  {
    id: 'easy-pentagon', name: 'Pentagon', difficulty: 'easy', timeLimitSec: 45, minStrokes: 1,
    symmetry: { axis: 'vertical', x: 50 },
    components: [
      { type: 'polygon', vertices: [[50, 15], [83.3, 39.2], [70.6, 78.3], [29.4, 78.3], [16.7, 39.2]] }
    ]
  },
  {
    id: 'easy-quartered-circle', name: 'Quartered circle', difficulty: 'easy', timeLimitSec: 45, minStrokes: 3,
    symmetry: { axis: 'both' },
    components: [
      { type: 'circle', cx: 50, cy: 50, r: 35 },
      { type: 'line', points: [[15, 50], [85, 50]] },
      { type: 'line', points: [[50, 15], [50, 85]] }
    ]
  },

  // ---------------- MEDIUM: compound figures ----------------
  {
    id: 'medium-overlap-squares', name: 'Overlapping squares', difficulty: 'medium', timeLimitSec: 60, minStrokes: 2,
    symmetry: { axis: 'diagonal' },
    components: [
      { type: 'polygon', vertices: [[20, 20], [60, 20], [60, 60], [20, 60]] },
      { type: 'polygon', vertices: [[40, 40], [80, 40], [80, 80], [40, 80]] }
    ]
  },
  {
    id: 'medium-house', name: 'House figure', difficulty: 'medium', timeLimitSec: 60, minStrokes: 1,
    symmetry: { axis: 'vertical', x: 45 },
    components: [
      { type: 'polygon', vertices: [[20, 80], [70, 80], [70, 45], [45, 20], [20, 45]] }
    ]
  },
  {
    id: 'medium-five-star', name: 'Five-point star', difficulty: 'medium', timeLimitSec: 60, minStrokes: 1,
    symmetry: { axis: 'vertical', x: 50 },
    components: [
      { type: 'polygon', vertices: [[50, 12], [58.8, 37.9], [86.1, 38.3], [64.3, 54.6], [72.3, 80.7], [50, 65], [27.7, 80.7], [35.7, 54.6], [13.9, 38.3], [41.2, 37.9]] }
    ]
  },
  {
    id: 'medium-nested-square-diamond', name: 'Nested square and diamond', difficulty: 'medium', timeLimitSec: 60, minStrokes: 2,
    symmetry: { axis: 'both' },
    components: [
      { type: 'polygon', vertices: [[15, 15], [85, 15], [85, 85], [15, 85]] },
      { type: 'polygon', vertices: [[50, 15], [85, 50], [50, 85], [15, 50]] }
    ]
  },

  // ---------------- HARD: complex abstract figures ----------------
  {
    id: 'hard-triangular-pinwheel', name: 'Triangular pinwheel', difficulty: 'hard', timeLimitSec: 90, minStrokes: 3,
    symmetry: { axis: 'radial', order: 3 },
    components: [
      { type: 'polygon', vertices: [[50, 50], [50, 15], [70, 28]] },
      { type: 'polygon', vertices: [[50, 50], [80.31, 67.5], [59.05, 78.32]] },
      { type: 'polygon', vertices: [[50, 50], [19.69, 67.5], [20.95, 43.68]] }
    ]
  },
  {
    id: 'hard-hexagram-square', name: 'Hexagram with center square', difficulty: 'hard', timeLimitSec: 90, minStrokes: 3,
    symmetry: { axis: 'both' },
    components: [
      { type: 'polygon', vertices: [[50, 15], [80.3, 67.5], [19.7, 67.5]] },
      { type: 'polygon', vertices: [[50, 85], [19.7, 32.5], [80.3, 32.5]] },
      { type: 'polygon', vertices: [[46, 46], [54, 46], [54, 54], [46, 54]] }
    ]
  },
  {
    id: 'hard-four-blade-pinwheel', name: 'Four-blade pinwheel', difficulty: 'hard', timeLimitSec: 90, minStrokes: 4,
    symmetry: { axis: 'radial', order: 4 },
    components: [
      { type: 'polygon', vertices: [[50, 50], [50, 15], [72, 28]] },
      { type: 'polygon', vertices: [[50, 50], [85, 50], [72, 72]] },
      { type: 'polygon', vertices: [[50, 50], [50, 85], [28, 72]] },
      { type: 'polygon', vertices: [[50, 50], [15, 50], [28, 28]] }
    ]
  },
  {
    // Was an 8-point compass star: one 16-vertex polygon plus two diagonal
    // lines through the center — genuinely harder to trace by hand than
    // this tier's other three figures (each 3-4 simple triangles), reported
    // as too difficult even for someone with no motor difficulty at all. A
    // five-point star is a single clean 10-vertex outline, no separate
    // components to place relative to each other, and something almost
    // everyone has already drawn before — still meaningfully harder than
    // the easy/medium figures (10 vertices, sharp alternating angles,
    // 5-way radial symmetry), just not needlessly so.
    id: 'hard-five-point-star', name: 'Five-point star', difficulty: 'hard', timeLimitSec: 90, minStrokes: 1,
    symmetry: { axis: 'radial', order: 5 },
    components: [
      { type: 'polygon', vertices: [[50, 13], [58.8, 37.9], [85.2, 38.6], [64.3, 54.6], [71.8, 79.9], [50, 65], [28.2, 79.9], [35.7, 54.6], [14.8, 38.6], [41.2, 37.9]] }
    ]
  }
];

export const ShapeGeneratorEngine = {
  getAllFigures() {
    return FIGURES;
  },
  getFiguresByDifficulty(difficulty) {
    return FIGURES.filter((f) => f.difficulty === difficulty);
  },
  getFigureById(id) {
    return FIGURES.find((f) => f.id === id);
  },
  // Default scored sequence: 4 easy, 4 medium, 4 hard, ascending difficulty.
  buildAssessmentSequence() {
    return [
      ...this.getFiguresByDifficulty('easy'),
      ...this.getFiguresByDifficulty('medium'),
      ...this.getFiguresByDifficulty('hard')
    ];
  },
  // Two unscored practice figures -- reuse the two simplest easy figures so the
  // participant learns the interface on the lowest-complexity stimuli.
  buildPracticeSequence() {
    return [FIGURES[0], FIGURES[1]];
  }
};
