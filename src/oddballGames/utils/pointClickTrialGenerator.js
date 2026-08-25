import { STIMULUS_SHAPES, STIMULUS_COLORS, DIFFICULTY_LEVELS, POINT_CLICK_CONFIG } from '../config/pointClickConfig.js';
import { shuffle } from './random.js';

/** All shape x color identity combinations (e.g. "red circle", "blue star"). */
export function buildObjectPool(shapes = STIMULUS_SHAPES, colors = STIMULUS_COLORS) {
  const pool = [];
  shapes.forEach((shape) => {
    colors.forEach((color) => {
      pool.push({
        id: `${color.id}-${shape.id}`,
        shapeId: shape.id,
        colorId: color.id,
        shapeLabel: shape.label,
        colorLabel: color.label,
        label: `${color.label} ${shape.label}`,
      });
    });
  });
  return pool;
}

/**
 * A 4x4 grid of board "safe zones" (well within POINT_CLICK_CONFIG's
 * boardGridCols/Rows) used for object placement. Each zone is tagged with a
 * quadrant (0=top-left, 1=top-right, 2=bottom-left, 3=bottom-right) so
 * target position can be balanced across the assessment rather than
 * clustering in one area of the board.
 */
export function buildZones(cols = POINT_CLICK_CONFIG.boardGridCols, rows = POINT_CLICK_CONFIG.boardGridRows) {
  const zones = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const quadrant = (r < rows / 2 ? 0 : 2) + (c < cols / 2 ? 0 : 1);
      zones.push({ row: r, col: c, quadrant });
    }
  }
  return zones;
}

/** Converts a zone to a percentage-based board position, with mild jitter to avoid a robotic grid look. */
function zoneToPosition(zone, cols, rows, jitterPercent = 3.5) {
  const cellWidth = 100 / cols;
  const cellHeight = 100 / rows;
  const baseLeft = zone.col * cellWidth + cellWidth / 2;
  const baseTop = zone.row * cellHeight + cellHeight / 2;
  const jitterX = (Math.random() * 2 - 1) * jitterPercent;
  const jitterY = (Math.random() * 2 - 1) * jitterPercent;
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  return {
    leftPct: clamp(baseLeft + jitterX, cellWidth * 0.22, 100 - cellWidth * 0.22),
    topPct: clamp(baseTop + jitterY, cellHeight * 0.22, 100 - cellHeight * 0.22),
  };
}

/**
 * Picks distractor identities for a trial. `similarity` controls how close
 * distractors are to the target's identity:
 *  - 'low': distractors differ from the target in both shape and color
 *    (feature search — the target visually "pops out").
 *  - 'medium': mostly different, with at most one same-shape and one
 *    same-color distractor mixed in.
 *  - 'high': distractors are drawn preferentially from same-shape or
 *    same-color pools (conjunction search — requires serial scanning).
 * Distractors never exactly duplicate the target's shape+color identity.
 */
function pickDistractorIdentities(count, targetIdentity, pool, similarity) {
  const others = pool.filter((o) => o.id !== targetIdentity.id);
  const sameShape = others.filter((o) => o.shapeId === targetIdentity.shapeId);
  const sameColor = others.filter((o) => o.colorId === targetIdentity.colorId);
  const fullyDifferent = others.filter((o) => o.shapeId !== targetIdentity.shapeId && o.colorId !== targetIdentity.colorId);

  let ordered;
  if (similarity === 'high') {
    ordered = [...shuffle(sameShape), ...shuffle(sameColor), ...shuffle(fullyDifferent)];
  } else if (similarity === 'medium') {
    ordered = [...shuffle(sameShape).slice(0, 1), ...shuffle(sameColor).slice(0, 1), ...shuffle(fullyDifferent)];
  } else {
    ordered = shuffle(fullyDifferent.length ? fullyDifferent : others);
  }

  const chosen = [];
  const seen = new Set();
  for (const candidate of ordered) {
    if (chosen.length >= count) break;
    if (seen.has(candidate.id)) continue;
    seen.add(candidate.id);
    chosen.push(candidate);
  }
  if (chosen.length < count) {
    for (const candidate of shuffle(others)) {
      if (chosen.length >= count) break;
      if (seen.has(candidate.id)) continue;
      seen.add(candidate.id);
      chosen.push(candidate);
    }
  }
  return chosen.slice(0, count);
}

function buildTrialSpec({ trialNumber, difficultyLevel, targetIdentity, targetPresent, quadrant, zones, pool, cols, rows }) {
  const objectCount = difficultyLevel.objectCount;
  const quadrantZones = zones.filter((z) => z.quadrant === quadrant);
  const otherZones = zones.filter((z) => z.quadrant !== quadrant);

  let targetZone = null;
  let chosenZones;
  if (targetPresent) {
    targetZone = quadrantZones[Math.floor(Math.random() * quadrantZones.length)];
    chosenZones = [targetZone, ...shuffle(otherZones).slice(0, objectCount - 1)];
  } else {
    chosenZones = shuffle(zones).slice(0, objectCount);
  }

  const distractorIdentities = pickDistractorIdentities(
    targetPresent ? objectCount - 1 : objectCount,
    targetIdentity,
    pool,
    difficultyLevel.similarity
  );

  const objects = [];
  if (targetPresent) {
    const pos = zoneToPosition(targetZone, cols, rows);
    objects.push({
      id: `t-${trialNumber}-${targetIdentity.id}`,
      shapeId: targetIdentity.shapeId,
      colorId: targetIdentity.colorId,
      leftPct: pos.leftPct,
      topPct: pos.topPct,
      isTarget: true,
    });
  }

  const zonesForDistractors = targetPresent ? chosenZones.filter((z) => z !== targetZone) : chosenZones;
  distractorIdentities.forEach((identity, idx) => {
    const zone = zonesForDistractors[idx];
    const pos = zoneToPosition(zone, cols, rows);
    objects.push({
      id: `d-${trialNumber}-${idx}-${identity.id}`,
      shapeId: identity.shapeId,
      colorId: identity.colorId,
      leftPct: pos.leftPct,
      topPct: pos.topPct,
      isTarget: false,
    });
  });

  return {
    trialNumber,
    difficultyLevel: difficultyLevel.level,
    objectCount,
    targetPresent,
    targetLabel: targetIdentity.label,
    targetShapeId: targetIdentity.shapeId,
    targetColorId: targetIdentity.colorId,
    targetObjectId: targetPresent ? objects[0].id : null,
    objects: shuffle(objects),
  };
}

function expandDifficultySchedule(levels) {
  const schedule = [];
  levels.forEach((level) => {
    for (let i = 0; i < level.trials; i++) schedule.push(level);
  });
  return schedule;
}

/** Evenly distributes target quadrants across `n` trials, then shuffles the order. */
function buildBalancedQuadrantPlan(n, quadrantCount = 4) {
  const blocks = [];
  while (blocks.length < n) {
    for (let q = 0; q < quadrantCount; q++) blocks.push(q);
  }
  return shuffle(blocks.slice(0, n));
}

function respectsSpacing(seq, minSpacing) {
  let sinceLast = Infinity;
  for (const flag of seq) {
    if (flag) {
      if (sinceLast < minSpacing) return false;
      sinceLast = 0;
    } else {
      sinceLast += 1;
    }
  }
  return true;
}

/** A boolean "no target" plan with ~`probability` of trials flagged, spaced apart. */
function buildNoTargetPlan(n, probability, minSpacing) {
  const noTargetCount = Math.max(0, Math.round(n * probability));
  const base = [...Array(noTargetCount).fill(true), ...Array(n - noTargetCount).fill(false)];
  for (let attempt = 0; attempt < 200; attempt++) {
    const candidate = shuffle(base);
    if (respectsSpacing(candidate, minSpacing)) return candidate;
  }
  return base;
}

/** A target-identity plan of length `n` with no two consecutive trials sharing the same identity. */
function buildIdentityPlan(n, pool) {
  const plan = [];
  let previous = null;
  for (let i = 0; i < n; i++) {
    const candidates = pool.filter((o) => !previous || o.id !== previous.id);
    const pick = candidates[Math.floor(Math.random() * candidates.length)];
    plan.push(pick);
    previous = pick;
  }
  return plan;
}

/** Builds the full 20-trial (by default) scored assessment sequence. */
export function generateAssessmentTrials(config = POINT_CLICK_CONFIG, difficultyLevels = DIFFICULTY_LEVELS) {
  const pool = buildObjectPool();
  const zones = buildZones(config.boardGridCols, config.boardGridRows);
  const schedule = expandDifficultySchedule(difficultyLevels);
  const n = schedule.length;

  const quadrantPlan = buildBalancedQuadrantPlan(n);
  const noTargetPlan = buildNoTargetPlan(n, config.noTargetProbability, config.minNoTargetSpacing);
  const identityPlan = buildIdentityPlan(n, pool);

  return schedule.map((difficultyLevel, i) =>
    buildTrialSpec({
      trialNumber: i + 1,
      difficultyLevel,
      targetIdentity: identityPlan[i],
      targetPresent: !noTargetPlan[i],
      quadrant: quadrantPlan[i],
      zones,
      pool,
      cols: config.boardGridCols,
      rows: config.boardGridRows,
    })
  );
}

/** Builds practice trials — always target-present, low difficulty, unscored. */
export function generatePracticeTrials(count = POINT_CLICK_CONFIG.practiceTrials, config = POINT_CLICK_CONFIG) {
  const pool = buildObjectPool();
  const zones = buildZones(config.boardGridCols, config.boardGridRows);
  const practiceLevel = { level: 0, objectCount: 5, similarity: 'low' };
  const identityPlan = buildIdentityPlan(count, pool);
  const quadrants = [0, 1, 2, 3];

  return identityPlan.map((targetIdentity, i) =>
    buildTrialSpec({
      trialNumber: i + 1,
      difficultyLevel: practiceLevel,
      targetIdentity,
      targetPresent: true,
      quadrant: quadrants[i % quadrants.length],
      zones,
      pool,
      cols: config.boardGridCols,
      rows: config.boardGridRows,
    })
  );
}
