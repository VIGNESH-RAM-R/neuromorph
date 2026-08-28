// Config for MorphyCompanion.jsx / MorphyCompanionEngine.js -- the event ->
// animation/phrase mapping lives here as plain data (not scattered
// conditionals in the component), matching this codebase's established
// "engines decide off config, components render" discipline (see
// momentumConfig.js/assessmentModeConfig.js for the same pattern).
//
// Each entry's `animation` value must match a `.nmpa-morphy-companion--*`
// modifier class defined in theme.css, and `phraseKey` must exist in
// src/i18n/strings/morphyCompanion.js for all 7 languages (enforced by
// scripts/check-translations.mjs).
//
// Priority order (top to bottom) when more than one event could fire in
// the same update -- e.g. finishing the Daily Set's last task ALSO
// happens to cross a streak milestone. Only one reaction plays per event
// cycle; MorphyCompanionEngine.decideEvent walks this list top to bottom
// and returns the first one whose condition is newly true.
export const MORPHY_COMPANION_EVENTS = [
  { id: 'milestone', animation: 'celebrate', phraseKey: 'milestoneReached', durationMs: 2600 },
  { id: 'dailySetComplete', animation: 'wellDone', phraseKey: 'dailySetComplete', durationMs: 2200 },
  { id: 'momentumImprovement', animation: 'pulse', phraseKey: 'momentumImprovement', durationMs: 2000 },
  { id: 'weeklyDue', animation: 'nudge', phraseKey: 'weeklyDue', durationMs: 1800 },
];

// How many Momentum Score points of day-over-day improvement counts as
// "notably improves" -- deliberately not tiny (so a 1-2 point wobble
// doesn't celebrate every day, which would cheapen the reaction) and not
// huge (so a genuine good day still gets acknowledged). Points are on the
// same 0-100 scale as MomentumScoreEngine.scoreForDay's `score`.
export const MOMENTUM_IMPROVEMENT_THRESHOLD = 8;

// Idle-loop and tap-reaction timing, kept here (not hardcoded in the
// component) so a designer/PM can retune the "feel" without touching JS.
// Actual pixel sizing/position lives in theme.css tokens, per this app's
// "no hardcoded pixels in components" rule -- these are behavioral
// durations, a different kind of config.
export const MORPHY_COMPANION_TIMING = {
  routeTransitionMs: 900,
  tapReactionMs: 1100,
  speechBubbleMs: 2800,
};
