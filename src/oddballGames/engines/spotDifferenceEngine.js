/**
 * Pure, framework-free logic for Spot the Difference. Holds no timers and
 * touches no DOM/React — every function is a plain (state, input) -> state
 * transformation, so difference hit-testing and completion detection can be
 * unit-tested independently of the UI (mirrors engines/imagePairsEngine.js).
 * hooks/useSpotDifferenceEngine.js is the thin React wrapper that owns
 * per-round/per-level timing.
 *
 * Unlike the timed CPT-style modules elsewhere in NeuroMorph, this task is
 * deliberately untimed and has no penalty for a wrong tap — timing is only
 * recorded for the session summary (time spent per level), never used to
 * gate or score gameplay itself, matching the source prototype exactly.
 */

/**
 * Finds the first difference whose tolerance circle contains (x, y), in the
 * same natural-image pixel coordinate space as round.diffs (i.e. after the
 * caller has already scaled a click/tap position from on-screen pixels to
 * the image's natural width/height — see spotDifferenceConfig.js). Returns
 * -1 if no difference was tapped. Ported verbatim from the source
 * prototype's handleClick().
 *
 * The two pictures in a round are independently drawn scenes, not one
 * photo with a single edit — the same real-world feature can land at a
 * slightly different pixel position in each picture. `onB` says which
 * picture the tap happened on: when true, each difference's own `bx`/`by`
 * (its coordinate on the right/modified picture) is used instead of `x`/`y`
 * (its coordinate on the left/base picture), falling back to `x`/`y` for
 * any difference that doesn't carry a separate bx/by. Reusing the left
 * picture's coordinate for taps on the right picture (the previous
 * behavior) is what caused correct taps on the right picture to be
 * misjudged as misses.
 */
export function hitTestDifference(diffs, x, y, onB = false) {
  for (let i = 0; i < diffs.length; i += 1) {
    const d = diffs[i];
    const dx = onB && d.bx !== undefined ? d.bx : d.x;
    const dy = onB && d.by !== undefined ? d.by : d.y;
    const dist = Math.hypot(dx - x, dy - y);
    if (dist <= d.r) return i;
  }
  return -1;
}

/** Initial state for one round (one picture pair) within a level. */
export function createRoundState() {
  return {
    found: [], // indices into round.diffs, in the order they were found
    wrongTaps: 0,
    startedAt: null,
  };
}

/** Marks a round as started (records the timestamp used later for timeMs). */
export function startRound(timestamp) {
  return { ...createRoundState(), startedAt: timestamp };
}

/**
 * Applies one tap against the current round. Returns
 * `{ state, result, diffIndex }` — never mutates the input state.
 * result: 'HIT' (a new difference found) | 'ALREADY_FOUND' (tapped a
 * difference already found — a no-op, matching the prototype) | 'MISS'
 * (tapped empty space). `onB` — see hitTestDifference() above.
 */
export function applyTap(roundState, round, x, y, onB = false) {
  const diffIndex = hitTestDifference(round.diffs, x, y, onB);

  if (diffIndex === -1) {
    return {
      state: { ...roundState, wrongTaps: roundState.wrongTaps + 1 },
      result: 'MISS',
      diffIndex: -1,
    };
  }
  if (roundState.found.includes(diffIndex)) {
    return { state: roundState, result: 'ALREADY_FOUND', diffIndex };
  }
  return {
    state: { ...roundState, found: [...roundState.found, diffIndex] },
    result: 'HIT',
    diffIndex,
  };
}

export function isRoundComplete(roundState, round) {
  return roundState.found.length === round.diffs.length;
}

/** A level is complete once every one of its rounds (pictures) is complete. */
export function isLevelComplete(roundStates, level) {
  return level.rounds.every((round, i) => {
    const rs = roundStates[i];
    return Boolean(rs) && isRoundComplete(rs, round);
  });
}
