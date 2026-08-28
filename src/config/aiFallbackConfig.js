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
  // 2026-08-28 BUGFIX (VR: "even hi, hello kuda solla maatran", "'I tried
  // extending my knowledge' ne solran" -- that phrase is NETWORK_ERROR_MESSAGE
  // below, paraphrased). This was 12000ms -- SHORTER than
  // functions/index.js's own internal Gemini-call timeout (was 15000ms,
  // now 25000ms), which meant the browser was giving up and showing the
  // "couldn't connect" message several seconds BEFORE the server's own
  // timeout even fired, on any request slowed down even a little by
  // Google Search grounding (enabled server-side for every Morphy call).
  // Raised to 28000ms so the client always waits at least as long as the
  // server is willing to try, with margin -- see functions/index.js's
  // matching 2026-08-28 comment for the full chain (client 28000 > server
  // internal 25000 > Cloud Function's own onRequest timeoutSeconds, 40).
  timeoutMs: 28000,
};
