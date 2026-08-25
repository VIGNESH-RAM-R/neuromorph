/**
 * Whack the Mole — configuration
 *
 * IMPORTANT: All values below are engineering / prototype parameters chosen
 * to produce a stable, controlled behavioural task. They are NOT clinically
 * validated thresholds, durations, or timing standards. They are
 * centralized here — nothing gameplay-relevant is hard-coded in components
 * — so the protocol can be tuned later during formal validation without
 * touching game logic or UI.
 *
 * Domain: Attention & Reaction Speed (primary), with secondary contribution
 * to sustained attention, target detection and response consistency.
 *
 * MODE 1 (the only mode implemented): Simple Reaction — one target hole
 * active at a time, no distractors, fixed/standardized timing. Section
 * below documents the (currently unbuilt) extension points for future
 * modes; the primary assessment must never silently use any of them.
 */

export const WHACK_MOLE_VERSION = 'whack-mole-v1.0';
export const WHACK_MOLE_PROTOCOL_VERSION = 'WHACK_MOLE_V1';
export const WHACK_MOLE_STORAGE_KEY = 'neuromorph_whack_mole_assessments';

/**
 * Difficulty levels (participant-selectable on the Welcome screen before
 * starting). Each level uses a FIXED (constant, not randomized) target
 * display window and inter-target interval, so the pacing a participant
 * feels within a single run is completely consistent — the only thing that
 * varies between one target and the next is *which hole* lights up
 * (spec section 12), never *when*. Difficulty does not change the grid,
 * scoring, or the overall 45s assessment length — only pacing.
 */
export const WHACK_MOLE_DIFFICULTY_LEVELS = {
  easy: {
    key: 'easy',
    label: 'Easy',
    description: 'Slower, steady pace — more time to respond to each target.',
    targetWindowMs: 2200,
    interTargetIntervalMs: 1100,
    initialDelayMs: 1000,
  },
  medium: {
    key: 'medium',
    label: 'Medium',
    description: 'Standard, steady pace.',
    targetWindowMs: 1700,
    interTargetIntervalMs: 800,
    initialDelayMs: 800,
  },
  hard: {
    key: 'hard',
    label: 'Hard',
    description: 'Faster, steady pace — less time to respond to each target.',
    targetWindowMs: 1200,
    interTargetIntervalMs: 500,
    initialDelayMs: 600,
  },
};

export const WHACK_MOLE_DEFAULT_DIFFICULTY = 'medium';

/** Standardized primary assessment protocol. Grid, duration, scoring and
 * feedback timing are fixed and not participant-selectable — only pacing
 * (via difficulty, applied through getWhackMoleConfig below) is. */
export const WHACK_MOLE_CONFIG = {
  gridRows: 3,
  gridColumns: 3,
  totalHoles: 9,
  targetMode: 'single', // MODE 1: Simple Reaction — exactly one active target at a time
  difficulty: WHACK_MOLE_DEFAULT_DIFFICULTY,

  // Overall assessment length. Named explicitly (not scattered through the
  // app) so it is trivial to change for development/testing.
  assessmentDurationMs: 45000,

  // Default (medium-difficulty) pacing, expressed as [min, max] ranges for
  // backward compatibility with any code reading these fields directly.
  // getWhackMoleConfig()/getWhackMolePracticeConfig() below collapse these
  // to a CONSTANT [x, x] value per selected difficulty level — see spec
  // section 21 ("controlled", not "chaotic randomness").
  targetWindowMsRange: [
    WHACK_MOLE_DIFFICULTY_LEVELS.medium.targetWindowMs,
    WHACK_MOLE_DIFFICULTY_LEVELS.medium.targetWindowMs,
  ],
  interTargetIntervalMsRange: [
    WHACK_MOLE_DIFFICULTY_LEVELS.medium.interTargetIntervalMs,
    WHACK_MOLE_DIFFICULTY_LEVELS.medium.interTargetIntervalMs,
  ],
  initialDelayMsRange: [
    WHACK_MOLE_DIFFICULTY_LEVELS.medium.initialDelayMs,
    WHACK_MOLE_DIFFICULTY_LEVELS.medium.initialDelayMs,
  ],

  // A tap on the same hole within this many ms *after* a hit is treated as
  // the same motor response (double-tap) and is neither scored as a hit
  // nor counted as a false response (spec section 20).
  postHitGraceMs: 400,

  hitAnimationMs: 260,
  missFadeMs: 200,
  countdownSeconds: 3,

  soundEnabled: false,
  hapticEnabled: false,
};

/**
 * Builds a full run config for a given difficulty level. The target window,
 * inter-target interval, and initial delay are all expressed as single-value
 * [x, x] ranges so the existing engine (which always draws a duration from a
 * range via randomDuration()) naturally produces a CONSTANT value — pacing
 * within a run is deterministic, never randomized, per participant report.
 */
export function getWhackMoleConfig(difficultyKey = WHACK_MOLE_DEFAULT_DIFFICULTY) {
  const level = WHACK_MOLE_DIFFICULTY_LEVELS[difficultyKey] || WHACK_MOLE_DIFFICULTY_LEVELS[WHACK_MOLE_DEFAULT_DIFFICULTY];
  return {
    ...WHACK_MOLE_CONFIG,
    difficulty: level.key,
    targetWindowMsRange: [level.targetWindowMs, level.targetWindowMs],
    interTargetIntervalMsRange: [level.interTargetIntervalMs, level.interTargetIntervalMs],
    initialDelayMsRange: [level.initialDelayMs, level.initialDelayMs],
  };
}

/** Practice round: short, fixed trial count (not time-boxed), never scored
 * or stored (spec section 9). Uses the same (constant, difficulty-matched)
 * pacing as the real assessment so the interaction feels identical. */
export function getWhackMolePracticeConfig(difficultyKey = WHACK_MOLE_DEFAULT_DIFFICULTY) {
  return {
    ...getWhackMoleConfig(difficultyKey),
    trialCount: 5,
  };
}

/** Back-compat default exports (medium difficulty) for any code that hasn't
 * been updated to pass an explicit difficulty. Prefer getWhackMoleConfig()/
 * getWhackMolePracticeConfig() in new code. */
export const WHACK_MOLE_PRACTICE_CONFIG = getWhackMolePracticeConfig(WHACK_MOLE_DEFAULT_DIFFICULTY);

/**
 * Future mode extension points (spec sections 23, 24, 58). None of these
 * are implemented — the primary assessment must never silently switch into
 * one of them. Kept here only so the intended architecture is documented.
 */
export const WHACK_MOLE_FUTURE_MODES = {
  TRAINING: { implemented: false, description: 'Adjustable speed/visibility, multiple difficulty levels, immediate feedback.' },
  DISTRACTOR: { implemented: false, description: 'Non-target objects appear alongside the mole; tapping only the mole should count (selective attention / inhibitory control).' },
  SPEED_CHALLENGE: { implemented: false, description: 'Faster, more game-like pacing; not used for standardized comparison.' },
  RESEARCH_CUSTOM_PROTOCOL: { implemented: false, description: 'Configurable protocol parameters for a specific research study.' },
};
