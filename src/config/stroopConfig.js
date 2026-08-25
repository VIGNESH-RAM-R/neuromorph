// Classic Stroop interference paradigm -- teammate's richer, clinically
// documented version (2026-08-11 integration). A color word is shown
// rendered in an ink color; the correct response is always the INK color,
// never the word text. 75% of trials are incongruent (word/ink mismatch,
// where interference actually shows up) by design -- see CONGRUENT_RATIO.
export const STROOP_COLORS = [
  { id: 'red', label: 'Red', hex: '#c0392b' },
  { id: 'blue', label: 'Blue', hex: '#2f5aa8' },
  { id: 'green', label: 'Green', hex: '#1f8a5f' },
  { id: 'yellow', label: 'Yellow', hex: '#b8791a' },
];

export const STROOP_PRACTICE_COUNT = 10;
export const STROOP_SCORED_TRIAL_COUNT = 15;
export const STROOP_CONGRUENT_RATIO = 0.25; // 25% congruent / 75% incongruent, per protocol
export const STROOP_TRIAL_TIMEOUT_MS = 5000;
// 2026-08-23 (VR feedback: "in the trails let's give sometime for them to
// understand the game"). Practice trials are UNSCORED -- there's no
// validity reason to rush someone still learning "always answer the ink
// color, not the word" under the same 5s clock as scored trials. Practice
// now gets a longer response window; scored timing (above) is untouched.
export const STROOP_PRACTICE_TRIAL_TIMEOUT_MS = 9000;
// Anticipatory-response floor: reaction times under this are excluded from
// timing statistics (they cannot reflect genuine stimulus processing).
export const STROOP_MIN_VALID_RT = 200;
