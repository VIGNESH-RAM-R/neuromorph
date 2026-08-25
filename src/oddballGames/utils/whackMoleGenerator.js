/**
 * Target-position randomization for Whack the Mole (spec section 12).
 *
 * Rule (documented, controlled — not "chaotic randomness"): a position is
 * drawn uniformly at random from 1..totalHoles, then re-drawn if it exactly
 * matches the immediately preceding position. This avoids the same hole
 * flashing twice in a row (confusing, and easy to mistake for the mole
 * simply staying visible) while otherwise leaving the sequence fully
 * random and unpredictable — no fixed rotation, no fixed pattern.
 *
 * `randomSource` defaults to Math.random but accepts any () => [0,1)
 * generator, so the sequence can be made reproducible for testing.
 */
export function pickPosition(totalHoles, excludePosition = null, randomSource = Math.random) {
  if (totalHoles <= 1) return 1;
  let candidate;
  let attempts = 0;
  do {
    candidate = Math.floor(randomSource() * totalHoles) + 1;
    attempts += 1;
  } while (attempts < 25 && excludePosition != null && candidate === excludePosition);
  return candidate;
}
