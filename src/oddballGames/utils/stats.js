/**
 * Generic descriptive-statistics helpers shared across Neuromorph modules
 * (Visual Oddball, Sequence Memory, and future modules). All functions are
 * null-safe for empty input — they never return NaN.
 */

/** Robust median. Returns null for an empty array. */
export function median(values) {
  if (!values || values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/** Arithmetic mean. Returns null for an empty array. */
export function mean(values) {
  if (!values || values.length === 0) return null;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/** Sample standard deviation. Returns 0 for a single value, null for none. */
export function standardDeviation(values) {
  if (!values || values.length === 0) return null;
  if (values.length === 1) return 0;
  const m = mean(values);
  const variance = values.reduce((sum, v) => sum + (v - m) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

/** Rounds a numeric metric for display; passes through null/undefined unchanged. */
export function roundMetric(value, decimals = 0) {
  if (value === null || value === undefined || Number.isNaN(value)) return null;
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}
