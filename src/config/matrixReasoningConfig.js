// Matrix Reasoning (Raven's-style) -- teammate's real vanilla-JS project
// (matrices_game.zip), ported into app_page's config/engine/component trio.
// Parietal-lobe visuospatial/abstract reasoning: a 3x3 grid of procedurally
// generated shapes with the bottom-right cell missing; pick the option that
// completes the pattern. No copyrighted test images are used anywhere --
// every stimulus is generated from these primitives.
export const MATRIX_SHAPES = ['circle', 'square', 'triangle', 'star', 'hexagon'];
export const MATRIX_PALETTE = ['#2563eb', '#f59e0b', '#0d9488', '#7c3aed', '#64748b'];
export const MATRIX_SIZE_RADIUS = { small: 13, medium: 19, large: 25 };
export const MATRIX_ROTATIONS = [0, 45, 90];

// Session plan: 1 unscored practice item, then 6 scored items ascending in
// difficulty -- unchanged from the teammate's own design (README documents
// this as a ~60-110s typical session, which already fits our time budget).
export const MATRIX_SESSION_PLAN = ['practice', 'easy', 'easy', 'medium', 'medium', 'hard', 'hard'];
export const MATRIX_PRACTICE_TIME_LIMIT_SEC = 60;
export const MATRIX_SCORED_TIME_LIMIT_SEC = 25;
