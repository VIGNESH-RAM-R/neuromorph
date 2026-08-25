import { clampScore } from './assessmentScoringUtils.js';
import { VERBAL_FLUENCY_CONFIG } from '../config/verbalFluencyConfig.js';

// Counts valid, distinct words from a typed fluency run. Deliberately does
// NOT check words against a fixed category dictionary -- a hardcoded word
// list would inevitably reject valid answers a human judge would accept,
// which is worse than the honest, simple heuristic used here: trimmed,
// case-insensitive, deduplicated, and at least `minWordLength` characters.
export const VerbalFluencyEngine = {
  // rawWords: array of strings, in the order typed.
  score(rawWords = [], config = VERBAL_FLUENCY_CONFIG) {
    const seen = new Set();
    const validWords = [];
    for (const w of rawWords) {
      const cleaned = (w || '').trim().toLowerCase();
      if (cleaned.length < config.minWordLength) continue;
      if (seen.has(cleaned)) continue;
      seen.add(cleaned);
      validWords.push(cleaned);
    }

    const wordCount = validWords.length;
    const score = config.targetWordCount > 0
      ? clampScore((wordCount / config.targetWordCount) * 100)
      : 0;

    return { score, wordCount, validWords };
  },
};
