import { FaqMatcherEngine } from './FaqMatcherEngine.js';
import { MATCHER_CONFIG, STOPWORDS } from '../config/matcherConfig.js';

// Social messages must always feel immediate and dependable. They are not
// knowledge requests, so routing a simple "hello" through a cloud model
// creates an unnecessary failure point when the AI service is unavailable.
const SMALL_TALK = [
  {
    pattern: /^(?:hi|hello|hey|hii+|hello there|hey there)(?:\s+(?:bro|morphy|there|again))?[!.?]*$/i,
    answer: "Hello! I'm Morphy. I can help you use NEUROMORPH, understand your assessments, or find the right next step. What would you like to know?",
  },
  {
    pattern: /^(?:thanks|thank you|thx)(?:\s+(?:morphy|bro))?[!.?]*$/i,
    answer: "You're welcome. I'm here whenever you need help with NEUROMORPH.",
  },
  {
    pattern: /^(?:bye|goodbye|see you)(?:\s+(?:morphy|bro))?[!.?]*$/i,
    answer: "Take care. Come back whenever you'd like a hand with NEUROMORPH.",
  },
];

// Pure orchestration: given a raw user message and a pool of matchable
// entries (FAQ_ENTRIES and/or BACKEND_ACTION_INTENTS -- anything shaped
// like { question, keywords, ...} ), decides whether Morphy can answer
// confidently, needs to call a backend action, or needs to fall back to
// the live AI. This engine never touches the network or a mock backend
// itself -- it only decides WHAT to do; the hook carries that out (same
// pure-engine/browser-or-service split used by every other NEUROMORPH
// module).
//
// An entry in the pool is either:
//   - a FAQ entry: has a static `answer` string.
//   - a backend-action intent: has an `action` string (e.g. 'GET_PROGRESS')
//     instead of an `answer` -- the caller is responsible for executing it
//     (see BackendActionEngine) and is never expected to have a canned
//     answer for these, since they depend on live, per-user data.
export const ConversationEngine = {
  getSmallTalkResponse(query) {
    const text = (query || '').trim();
    const match = SMALL_TALK.find(({ pattern }) => pattern.test(text));
    return match ? match.answer : null;
  },

  getResponse(query, entries, config = MATCHER_CONFIG, stopwords = STOPWORDS) {
    const trimmed = (query || '').trim();
    if (!trimmed) {
      return { source: 'empty', text: null, matchedEntry: null, suggestions: [], needsFallback: false };
    }

    const { best, confident, suggestions } = FaqMatcherEngine.match(trimmed, entries, config, stopwords);

    if (confident && best.entry.action) {
      return { source: 'action', text: null, action: best.entry.action, matchedEntry: best.entry, suggestions: [], needsFallback: false };
    }

    if (confident) {
      return { source: 'faq', text: best.entry.answer, matchedEntry: best.entry, suggestions: [], needsFallback: false };
    }

    // Not confident enough to answer outright -- surface the closest
    // guesses (if any) as suggestions, and signal that a fallback (live AI
    // or a logged "I don't know yet") is appropriate.
    return { source: 'no_match', text: null, matchedEntry: null, suggestions, needsFallback: true };
  },
};
