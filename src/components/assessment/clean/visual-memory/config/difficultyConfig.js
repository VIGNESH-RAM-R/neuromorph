// Per-difficulty tuning: how many target objects are shown, how many total
// recognition options appear afterward, and how long the observation screen
// stays up. Kept separate from trial COUNT (see trialModes.js) so "how hard
// is one trial" and "how many trials" can be changed independently.
// Option counts trimmed (targets too, for hard) — hard's original 16-option
// recognition grid was reported as overwhelming to scan, not appropriately
// "hard." Every viewSec (and RECOGNITION_MAX_SEC below) is untouched —
// this is only about how many things are on screen at once, not how long
// there is to look at them.
export const DIFFICULTY_CONFIG = {
  easy:   { targets: 4, options: 6,  viewSec: 15 },
  medium: { targets: 5, options: 8,  viewSec: 12 },
  hard:   { targets: 6, options: 10, viewSec: 10 }
};

export const DELAY_SEC = 10;
export const RECOGNITION_MAX_SEC = 30;
