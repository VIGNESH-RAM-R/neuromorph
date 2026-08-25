export function average(values) {
  const valid = (values || []).filter((v) => typeof v === 'number' && !Number.isNaN(v));
  if (valid.length === 0) return undefined;
  return Math.round((valid.reduce((a, b) => a + b, 0) / valid.length) * 10) / 10;
}

export function round1(n) {
  if (typeof n !== 'number' || Number.isNaN(n)) return n;
  return Math.round(n * 10) / 10;
}

export function stdDev(values) {
  const valid = (values || []).filter((v) => typeof v === 'number' && !Number.isNaN(v));
  if (valid.length < 2) return undefined;
  const mean = average(valid);
  const variance = valid.reduce((sum, v) => sum + (v - mean) ** 2, 0) / (valid.length - 1);
  return Math.sqrt(variance);
}

// Coefficient of variation: standard deviation as a fraction of the mean.
// Unitless, so it can compare variability across domains with very different
// score ranges. Guards the near-zero-mean case (would blow up to a huge,
// meaningless ratio) by returning undefined instead of Infinity/NaN.
export function coefficientOfVariation(values) {
  const valid = (values || []).filter((v) => typeof v === 'number' && !Number.isNaN(v));
  if (valid.length < 2) return undefined;
  const mean = average(valid);
  if (!mean || Math.abs(mean) < 1) return undefined;
  const sd = stdDev(valid);
  if (sd === undefined) return undefined;
  return sd / mean;
}

// Ordinary least-squares fit over points [{x, y}]. Returns the slope
// (units of y per unit of x), plus the standard error of that slope so
// callers can judge whether it's a real signal or could plausibly be noise
// -- this is what lets DriftEngine tell "one bad day" apart from "a real
// multi-week decline" without any ML model, just the same regression a
// spreadsheet's trendline would compute.
export function linearRegression(points) {
  const valid = (points || []).filter((p) => typeof p.x === 'number' && typeof p.y === 'number');
  const n = valid.length;
  if (n < 2) return { slope: undefined, intercept: undefined, slopeStdError: undefined, n };

  const meanX = average(valid.map((p) => p.x));
  const meanY = average(valid.map((p) => p.y));

  let sxx = 0;
  let sxy = 0;
  for (const p of valid) {
    sxx += (p.x - meanX) ** 2;
    sxy += (p.x - meanX) * (p.y - meanY);
  }
  if (sxx === 0) return { slope: undefined, intercept: undefined, slopeStdError: undefined, n };

  const slope = sxy / sxx;
  const intercept = meanY - slope * meanX;

  let slopeStdError;
  if (n > 2) {
    let ssResidual = 0;
    for (const p of valid) {
      const predicted = intercept + slope * p.x;
      ssResidual += (p.y - predicted) ** 2;
    }
    const residualVariance = ssResidual / (n - 2);
    slopeStdError = Math.sqrt(residualVariance / sxx);
  }

  return { slope, intercept, slopeStdError, n };
}

// Pearson correlation coefficient between two equal-length, index-aligned
// series. Returns undefined (never NaN/Infinity) when either series has no
// variance -- a flat line has no "direction" to correlate with anything.
// This is the one piece of statistics CoherenceEngine is built on: it says
// nothing about literal neural wiring, only whether two domains' session-by-
// session score movements track each other, as an honest, explainable proxy
// for "moving together" vs "moving independently".
export function pearsonCorrelation(xs, ys) {
  if (!Array.isArray(xs) || !Array.isArray(ys) || xs.length !== ys.length || xs.length < 2) return undefined;
  const meanX = average(xs);
  const meanY = average(ys);
  if (meanX === undefined || meanY === undefined) return undefined;

  let sxy = 0;
  let sxx = 0;
  let syy = 0;
  for (let i = 0; i < xs.length; i++) {
    const dx = xs[i] - meanX;
    const dy = ys[i] - meanY;
    sxy += dx * dy;
    sxx += dx * dx;
    syy += dy * dy;
  }
  if (sxx === 0 || syy === 0) return undefined;
  return sxy / Math.sqrt(sxx * syy);
}
