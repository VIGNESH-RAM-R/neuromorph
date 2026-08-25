// Digital Part-A-style Trail Making: 13 numbered circles scattered on a
// fixed grid (not randomized -- keeps the task reproducible/testable, same
// difficulty every time it's administered). Correct order is always 1..13;
// scattering the positions (not left-to-right) is what makes the task
// actually test visual scanning + sequencing rather than just reading.
export const TRAIL_NODE_COUNT = 13;

// Positions as {x, y} percentages within the task canvas.
export const TRAIL_NODES = [
  { number: 1, x: 12, y: 20 },
  { number: 2, x: 45, y: 10 },
  { number: 3, x: 78, y: 22 },
  { number: 4, x: 30, y: 35 },
  { number: 5, x: 60, y: 40 },
  { number: 6, x: 88, y: 45 },
  { number: 7, x: 15, y: 55 },
  { number: 8, x: 48, y: 58 },
  { number: 9, x: 75, y: 62 },
  { number: 10, x: 22, y: 75 },
  { number: 11, x: 55, y: 80 },
  { number: 12, x: 82, y: 85 },
  { number: 13, x: 40, y: 92 },
];

export const TRAIL_MAKING_TIMING = {
  targetMs: 15000, // full speed credit at/under 15s for all 13 nodes
  maxMs: 60000,
};
