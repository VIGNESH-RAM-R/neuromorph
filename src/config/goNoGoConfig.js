// Go/No-Go -- teammate's richer version (2026-08-11 integration). A rapid
// sequence of stimuli, mostly GO (respond) with occasional NO-GO (withhold)
// trials mixed in, so a prepotent "just respond" habit builds up -- that's
// what makes NO-GO trials a real test of response inhibition rather than a
// coin flip. Practice uses an easier GO/NO-GO ratio and ordering than the
// scored run, per protocol.
export const GO_NO_GO_CONFIG = {
  PRACTICE_TRIAL_COUNT: 20,
  PRACTICE_NOGO_COUNT: 4, // 16 GO / 4 NO-GO, no forced repeats -- keep practice predictable
  PRACTICE_MAX_RUN_LENGTH: 4,

  SCORED_TRIAL_COUNT: 20,
  SCORED_NOGO_COUNT: 7, // 13 GO / 7 NO-GO -- deliberately harder ratio than practice
  SCORED_MAX_RUN_LENGTH: 4,
  // NO-GO trials are normally spaced apart, but the scored deck randomly
  // allows 1-2 back-to-back NO-GO pairs per session (never forced, never
  // more than 2 in a row) so participants can't learn "it never repeats".
  SCORED_ALLOW_REPEAT_NOGO: true,

  STIMULUS_DISPLAY_MS: 1000,
  RESPONSE_WINDOW_MS: 1500,
  ITI_MIN_MS: 800,
  ITI_MAX_MS: 1200,

  // 2026-08-23 (VR feedback: "in the trails let's give sometime for them to
  // understand the game"). Practice was previously running at the exact
  // same fast pace as the scored run (unscored trials give no measurement
  // reason to rush someone still learning the GO/NO-GO rule). Practice now
  // gets a slower stimulus + a longer response window; SCORED_* timing
  // above is untouched so inhibition-measurement validity doesn't change.
  PRACTICE_STIMULUS_DISPLAY_MS: 1600,
  PRACTICE_RESPONSE_WINDOW_MS: 2600,
};
