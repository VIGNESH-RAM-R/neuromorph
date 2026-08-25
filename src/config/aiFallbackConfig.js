// Config for the LLM fallback path (the "hybrid" half of Morphy: FAQ first,
// live AI second, for both the patient and doctor chats -- see
// AiFallbackService.js's caller-supplied systemPrompt). Dormant by default --
// no API key is embedded anywhere in this codebase, on purpose, because a
// key shipped in client-side code is not actually secret.
//
// 2026-08-18: a real, deployable proxy now exists at functions/index.js
// (a Firebase Cloud Function called `askMorphy` that calls the Gemini API
// server-side, keeping the key out of the browser bundle). It is NOT
// deployed yet -- `enabled` stays false and `endpoint` stays empty until
// someone actually runs the deploy steps in GEMINI_SETUP.md and pastes the
// resulting URL in below.
export const AI_FALLBACK_CONFIG = {
  // 2026-08-18: deployed for real -- askMorphy is live on Firebase Cloud
  // Functions (project neuromorph-624c0, Blaze plan, GEMINI_API_KEY stored
  // as a secret). See GEMINI_SETUP.md for how this was set up.
  enabled: true,
  endpoint: 'https://us-central1-neuromorph-624c0.cloudfunctions.net/askMorphy',
  timeoutMs: 12000,
};
