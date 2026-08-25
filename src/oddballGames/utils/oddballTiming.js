/**
 * Timing helpers for the Visual Oddball Assessment.
 *
 * Reaction time must always be derived from performance.now() timestamps
 * captured at stimulus onset and at the moment of a valid response —
 * never from setTimeout completion, animation events, or Date.now().
 *
 * hiResNow/randomDuration now live in the shared ../utils/timing.js
 * (used by other Neuromorph modules too); re-exported here so existing
 * imports in this module keep working unchanged.
 */
export { hiResNow, randomDuration } from './timing.js';

/** Formats milliseconds remaining as M:SS for the on-screen timer. Never negative. */
export function formatTimeRemaining(ms) {
  const safeMs = Math.max(0, Math.round(ms));
  const totalSeconds = Math.ceil(safeMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}
