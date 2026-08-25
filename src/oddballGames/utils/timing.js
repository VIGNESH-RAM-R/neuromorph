/**
 * Timing helpers shared across Neuromorph's timed behavioural tasks.
 * Stimulus-onset / response timestamps must always come from hiResNow()
 * (performance.now()) — never Date.now() — for millisecond-level accuracy.
 */

/** High-resolution timestamp, in milliseconds, monotonic within the session. */
export function hiResNow() {
  return performance.now();
}

/** Random integer duration in [minMs, maxMs], inclusive. */
export function randomDuration(minMs, maxMs) {
  if (maxMs <= minMs) return minMs;
  return Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
}
