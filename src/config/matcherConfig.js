// Config for FaqMatcherEngine -- centralized so matching behavior tunes
// without touching the engine itself.
export const MATCHER_CONFIG = {
  // Below this confidence, FaqMatcherEngine's best match is treated as
  // "not confident enough" and ConversationEngine falls back (see
  // AiFallbackService) rather than risk giving a wrong answer.
  //
  // 2026-08-18: raised from 0.34 to 1.1, now that a real Gemini backend is
  // live. At 0.34, loosely-related real questions (e.g. "my dad forgets
  // things sometimes is that normal", "can you explain how memory works in
  // the brain") were confidently intercepted by an unrelated or overly
  // shallow canned FAQ line instead of getting a real, detailed answer --
  // it didn't feel like a real AI. Calibrated with a diagnostic script
  // against this app's actual FAQ pool: every patient FAQ entry's own exact
  // question scores >= 1.51, every doctor FAQ entry's own exact question
  // scores >= 1.75 (and the 4 realistic clinician phrasings this app's own
  // test suite requires to stay confident score as low as 1.31), while
  // loosely-related/conversational phrasing topped out around 0.97 in
  // testing. 1.1 sits cleanly between those two clusters: near-exact FAQ
  // phrasing still answers instantly and for free; genuinely conversational
  // questions now go to Gemini for a real, detailed answer instead of a
  // one-line canned response. This scale is NOT 0-1 -- see scoreEntry()'s
  // comment for why it isn't clamped.
  confidenceThreshold: 1.1,
  // How many suggestions to offer when nothing was confident enough.
  suggestionCount: 3,
};

// Common English filler words stripped before matching, so they don't
// dilute the signal from the words that actually carry meaning.
export const STOPWORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'do', 'does', 'did', 'i', 'me', 'my', 'you', 'your', 'it', 'its',
  'this', 'that', 'these', 'those', 'to', 'of', 'in', 'on', 'for',
  'with', 'about', 'and', 'or', 'so', 'if', 'can', 'could', 'will',
  'would', 'should', 'what', 'when', 'where', 'how', 'why', 'am',
  'have', 'has', 'had', 'not', 'no', "don't", 'dont', "i'm", 'im',
]);
