export function average(values) {
  const valid = (values || []).filter((v) => typeof v === 'number' && !Number.isNaN(v));
  if (valid.length === 0) return undefined;
  return Math.round((valid.reduce((a, b) => a + b, 0) / valid.length) * 10) / 10;
}

export function round1(n) {
  if (typeof n !== 'number' || Number.isNaN(n)) return n;
  return Math.round(n * 10) / 10;
}
