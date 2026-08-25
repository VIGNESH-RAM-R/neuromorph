// Per the NEUROMORPH master prompt's Mode 1 (Cognitive Assessment Mode)
// rules: no hints, no scoring/content help while a formal assessment is
// actively running, so a result reflects the day accurately rather than
// coached performance. Only genuinely unrelated help (technical trouble,
// account/login issues, basic greetings, privacy questions) stays
// answerable mid-assessment; everything else gets a calm, honest deferral
// instead of a real answer.
export const ASSESSMENT_MODE_SAFE_CATEGORIES = ['troubleshooting', 'account', 'general', 'privacy'];

export const ASSESSMENT_MODE_GREETING =
  "You're in the middle of your assessment right now, so I'll keep things brief. Hints and detailed explanations are paused until you finish, so your result reflects today accurately -- I can still help with something broken or a login issue if you need it.";

export const ASSESSMENT_MODE_DEFERRAL =
  "I'll explain that in full once you finish this assessment -- hints and detailed help are paused during an active session so your result stays accurate. If something's actually broken (not working, stuck, error), tell me and I can still help with that right now.";

export const ASSESSMENT_COMPLETE_OFFER =
  "Nice work finishing your check-in. Want me to explain anything about what you just did, or would you like to try Brain Training Mode -- same kinds of tasks, but with hints, coins, and streaks turned on?";
