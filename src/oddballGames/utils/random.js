/**
 * Generic randomization helpers shared across Neuromorph trial generators
 * (Sequence Memory, Point & Click, Image Pairs, and future modules). Kept
 * dependency-free and side-effect-free (never mutates the input array).
 */

/**
 * Fisher-Yates shuffle. Returns a new array; does not mutate the input.
 * `randomSource` defaults to Math.random but accepts any () => [0,1)
 * generator — e.g. mulberry32() below — so a caller that needs a
 * reproducible/auditable ordering (Image Pairs card layout) can supply a
 * seeded source without this shared helper changing behavior for existing
 * callers that don't pass one.
 */
export function shuffle(array, randomSource = Math.random) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(randomSource() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Random integer in [min, max], inclusive. */
export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * mulberry32 — small, fast, deterministic PRNG (32-bit state). Given the
 * same seed it always produces the same sequence, which is what lets a
 * randomized trial layout (e.g. Image Pairs card positions) be recorded as
 * a `randomizationSeed` and reproduced/audited later. Not cryptographic —
 * it only needs to be reproducible, not unpredictable.
 */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function random() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Generates a fresh, non-reproduced-on-purpose 32-bit seed for a new session. */
export function generateSeed() {
  return Math.floor(Math.random() * 0xffffffff);
}
