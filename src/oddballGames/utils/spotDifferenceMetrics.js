import { SPOT_DIFFERENCE_LEVELS, SPOT_DIFFERENCE_TOTAL_LEVELS } from '../config/spotDifferenceConfig.js';

/** Renders a filled/unfilled star string, e.g. starString(2, 3) -> "★★☆". */
export function starString(filled, total = 3) {
  let s = '';
  for (let i = 0; i < total; i += 1) s += i < filled ? '★' : '☆';
  return s;
}

/**
 * Summarizes one completed (or abandoned) level's play — every round
 * (picture pair) belonging to it — into the per-level record stored inside
 * a session's summary. `roundStates` is the array of engine round states
 * (see engines/spotDifferenceEngine.js) in round order; `timeMs` is the
 * elapsed wall-clock time spent on the level (first round start to last
 * round completion/exit).
 */
export function summarizeLevel(level, roundStates, timeMs) {
  const safeRoundStates = Array.isArray(roundStates) ? roundStates : [];
  const totalDiffs = level.rounds.reduce((sum, r) => sum + r.diffs.length, 0);
  const foundDiffs = safeRoundStates.reduce((sum, rs) => sum + (rs?.found?.length || 0), 0);
  const wrongTaps = safeRoundStates.reduce((sum, rs) => sum + (rs?.wrongTaps || 0), 0);
  const totalTaps = foundDiffs + wrongTaps;

  return {
    levelId: level.id,
    label: level.label,
    stars: level.stars,
    totalDiffs,
    foundDiffs,
    wrongTaps,
    accuracy: totalTaps ? (foundDiffs / totalTaps) * 100 : null,
    timeMs: typeof timeMs === 'number' && Number.isFinite(timeMs) ? Math.round(timeMs) : null,
    completed: foundDiffs === totalDiffs,
  };
}

/**
 * Aggregates every level played during a session into the assessment-level
 * summary saved to history. `perLevel` lists every level attempted this
 * session, in play order — a session does not have to touch every level to
 * be saved (see the Level Select screen's "Finish & View Results"), so
 * `levelsAttempted` can be less than `totalLevels`.
 *
 * All division-by-zero / empty-set cases resolve to null, never NaN.
 */
export function summarizeSession(perLevel) {
  const safe = Array.isArray(perLevel) ? perLevel : [];

  const levelsCompleted = safe.filter((l) => l.completed).length;
  const totalDifferencesFound = safe.reduce((sum, l) => sum + l.foundDiffs, 0);
  const totalDifferencesAvailable = safe.reduce((sum, l) => sum + l.totalDiffs, 0);
  const totalWrongTaps = safe.reduce((sum, l) => sum + l.wrongTaps, 0);
  const totalTaps = totalDifferencesFound + totalWrongTaps;
  const totalTimeMs = safe.reduce((sum, l) => sum + (l.timeMs || 0), 0);
  const starsEarned = safe.filter((l) => l.completed).reduce((sum, l) => sum + l.stars, 0);
  const maxStars = SPOT_DIFFERENCE_LEVELS.reduce((sum, l) => sum + l.stars, 0);

  return {
    levelsAttempted: safe.length,
    levelsCompleted,
    totalLevels: SPOT_DIFFERENCE_TOTAL_LEVELS,
    allLevelsCompleted: levelsCompleted === SPOT_DIFFERENCE_TOTAL_LEVELS,
    totalDifferencesFound,
    totalDifferencesAvailable,
    accuracy: totalTaps ? (totalDifferencesFound / totalTaps) * 100 : null,
    totalWrongTaps,
    totalTimeMs,
    starsEarned,
    maxStars,
    perLevel: safe,
  };
}
