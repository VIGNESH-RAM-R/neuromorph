// MatrixReasoningEngine
// -----------------------------------------------------------------------------
// Ported near-verbatim from the teammate's matrices_game/script.js (the pure,
// already-Node-testable half of that file -- generateItem/cellSVG/etc). Only
// change: exported as ES module functions instead of a `module.exports`
// branch, to match every other engine in this app. The DOM/session-driving
// half of the original file is NOT ported here -- that logic now lives in
// MatrixReasoningTask.jsx as normal React state, same split every other task
// in this app already uses (engine = pure logic, component = timing/render).
import { MATRIX_SHAPES, MATRIX_PALETTE, MATRIX_SIZE_RADIUS, MATRIX_ROTATIONS } from '../config/matrixReasoningConfig.js';

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function pickN(arr, n) { return shuffle(arr).slice(0, n); }

function polygonPoints(cx, cy, r, sides, rotationDeg) {
  const pts = [];
  const rot = ((rotationDeg - 90) * Math.PI) / 180;
  for (let i = 0; i < sides; i++) {
    const angle = rot + (i * 2 * Math.PI) / sides;
    pts.push((cx + r * Math.cos(angle)).toFixed(1) + ',' + (cy + r * Math.sin(angle)).toFixed(1));
  }
  return pts.join(' ');
}

function starPoints(cx, cy, outerR, innerR, rotationDeg) {
  const pts = [];
  const rot = ((rotationDeg - 90) * Math.PI) / 180;
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = rot + (i * Math.PI) / 5;
    pts.push((cx + r * Math.cos(angle)).toFixed(1) + ',' + (cy + r * Math.sin(angle)).toFixed(1));
  }
  return pts.join(' ');
}

// Returns a plain description (shape/color/rotation/radius/cx/cy) rather
// than an HTML string like the original -- MatrixReasoningTask.jsx renders
// this as real SVG elements (React, not innerHTML).
export function shapeDescriptor(shape, color, rotation, radius, cx, cy) {
  switch (shape) {
    case 'circle': return { kind: 'circle', cx, cy, r: radius, fill: color };
    case 'square': return { kind: 'polygon', points: polygonPoints(cx, cy, radius, 4, rotation + 45), fill: color };
    case 'triangle': return { kind: 'polygon', points: polygonPoints(cx, cy, radius, 3, rotation), fill: color };
    case 'hexagon': return { kind: 'polygon', points: polygonPoints(cx, cy, radius, 6, rotation), fill: color };
    case 'star': return { kind: 'polygon', points: starPoints(cx, cy, radius, radius * 0.45, rotation), fill: color };
    default: return null;
  }
}

// cellShapes(attrs) -> array of shapeDescriptor()s for one grid/option cell
// (1-3 copies of the same shape depending on attrs.count).
export function cellShapes(attrs) {
  if (!attrs) return [];
  const count = attrs.count || 1;
  let radius = MATRIX_SIZE_RADIUS[attrs.size || 'medium'];
  if (count > 1) radius = radius * (count === 2 ? 0.85 : 0.7);
  const positions = count === 1 ? [50] : count === 2 ? [32, 68] : [20, 50, 80];
  return positions.map((x) => shapeDescriptor(attrs.shape, attrs.color, attrs.rotation || 0, radius, x, 50));
}

function attrsKey(a) { return [a.shape, a.color, a.rotation, a.size, a.count].join('|'); }

export function generateItem(difficulty) {
  const ruleCount = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3;
  const allRules = ['rotation', 'color', 'size', 'count', 'shape'];
  const activeRules = pickN(allRules, ruleCount);

  let shapePool = MATRIX_SHAPES.slice();
  if (activeRules.indexOf('rotation') !== -1) {
    shapePool = shapePool.filter((s) => s !== 'circle');
  }

  const baseShape = pick(shapePool);
  const baseColor = pick(MATRIX_PALETTE);

  const shapeList = activeRules.indexOf('shape') !== -1 ? pickN(shapePool, 3) : [baseShape, baseShape, baseShape];
  const colorList = activeRules.indexOf('color') !== -1 ? pickN(MATRIX_PALETTE, 3) : [baseColor, baseColor, baseColor];
  const rotationList = activeRules.indexOf('rotation') !== -1 ? [0, 45, 90] : [0, 0, 0];
  const sizeList = activeRules.indexOf('size') !== -1 ? ['small', 'medium', 'large'] : ['medium', 'medium', 'medium'];
  const countList = activeRules.indexOf('count') !== -1 ? [1, 2, 3] : [1, 1, 1];

  function cellAttrs(r, c) {
    return { shape: shapeList[c], color: colorList[c], rotation: rotationList[c], size: sizeList[r], count: countList[r] };
  }

  const grid = [];
  for (let r = 0; r < 3; r++) {
    const row = [];
    for (let c = 0; c < 3; c++) row.push(r === 2 && c === 2 ? null : cellAttrs(r, c));
    grid.push(row);
  }

  const correct = cellAttrs(2, 2);

  const pool = [];
  activeRules.forEach((rule) => {
    [0, 1].forEach((altIdx) => {
      const wrong = { ...correct };
      if (rule === 'shape') wrong.shape = shapeList[altIdx];
      if (rule === 'color') wrong.color = colorList[altIdx];
      if (rule === 'rotation') wrong.rotation = rotationList[altIdx];
      if (rule === 'size') wrong.size = sizeList[altIdx];
      if (rule === 'count') wrong.count = countList[altIdx];
      wrong._errorType = 'wrong_' + rule;
      pool.push(wrong);
    });
  });
  pool.push({
    shape: pick(MATRIX_SHAPES), color: pick(MATRIX_PALETTE), rotation: pick(MATRIX_ROTATIONS),
    size: pick(['small', 'medium', 'large']), count: pick([1, 2, 3]), _errorType: 'random_choice',
  });

  const seen = { [attrsKey(correct)]: true };
  const distractors = [];
  shuffle(pool).forEach((d) => {
    const k = attrsKey(d);
    if (!seen[k] && distractors.length < 3) { seen[k] = true; distractors.push(d); }
  });
  let guard = 0;
  while (distractors.length < 3 && guard < 50) {
    guard++;
    const d = {
      shape: pick(MATRIX_SHAPES), color: pick(MATRIX_PALETTE), rotation: pick(MATRIX_ROTATIONS),
      size: pick(['small', 'medium', 'large']), count: pick([1, 2, 3]), _errorType: 'random_choice',
    };
    const k = attrsKey(d);
    if (!seen[k]) { seen[k] = true; distractors.push(d); }
  }

  const correctOption = { ...correct, _isCorrect: true, _errorType: null };
  const options = shuffle([correctOption, ...distractors.map((d) => ({ ...d, _isCorrect: false }))]);

  return { grid, options, activeRules, difficulty };
}

// score(scoredResults): scoredResults = [{ correct, responseTimeMs, errorType, difficulty }]
// (practice item already excluded by the caller). Mirrors the teammate's own
// buildResultJSON() shape exactly, plus a top-level `score` (0-100) field so
// the shell's onSubmit({score, raw}) contract is satisfied.
export const MatrixReasoningEngine = {
  generateItem,
  cellShapes,
  score(scoredResults, { sessionId, patientId = 'demo_patient' } = {}) {
    const raw_score = scoredResults.filter((r) => r.correct).length;
    const max_score = scoredResults.length;
    const accuracy = max_score ? raw_score / max_score : 0;
    const response_times = scoredResults.map((r) => r.responseTimeMs);
    const error_types = scoredResults.map((r) => (r.correct ? null : r.errorType));
    const items_skipped = scoredResults.filter((r) => r.errorType === 'no_response').length;
    const items_attempted = max_score - items_skipped;
    const item_difficulties = scoredResults.map((r) => r.difficulty);
    return {
      game_id: 'matrix_reasoning',
      lobe: 'parietal',
      session_id: sessionId,
      patient_id: patientId,
      timestamp: new Date().toISOString(),
      difficulty_level: 'mixed',
      raw_score,
      max_score,
      accuracy: Number(accuracy.toFixed(2)),
      score: Math.round(accuracy * 100),
      response_times,
      error_types,
      items_attempted,
      items_skipped,
      item_difficulties,
    };
  },
};
