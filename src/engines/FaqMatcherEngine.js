import { MATCHER_CONFIG, STOPWORDS } from '../config/matcherConfig.js';

// Pure, framework-agnostic, Node-testable. No network, no browser API --
// just plain-text keyword matching against the FAQ config. This is
// intentionally simple (no embeddings, no ML model) so it works instantly,
// offline, for free, and never gives an unpredictable answer during a demo.
//
// Scoring is a lightweight TF-IDF-flavored overlap: a token that shows up
// in an entry's own canonical QUESTION counts more than one that only
// shows up in its keyword list, and a token that's common across many FAQ
// entries (like "assessment" or "module", which several entries mention)
// counts for less than a rare, distinctive one -- otherwise two entries
// sharing ordinary vocabulary can out-rank the entry a query actually
// means.
const QUESTION_WEIGHT = 2;
const KEYWORD_WEIGHT = 1;

export const FaqMatcherEngine = {
  // Lowercases, strips punctuation, splits on whitespace, and drops
  // stopwords/empty tokens. Never throws on empty/undefined input.
  normalize(text, stopwords = STOPWORDS) {
    if (!text || typeof text !== 'string') return [];
    return text
      .toLowerCase()
      .replace(/[^a-z0-9'\s]/g, ' ')
      .split(/\s+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0 && !stopwords.has(t));
  },

  // Precomputes each entry's weighted token map (question tokens weighted
  // higher than keyword tokens, then both down-weighted by how many other
  // entries also use that word), plus each entry's total weight for
  // score normalization.
  buildEntryIndex(entries, stopwords = STOPWORDS) {
    const raw = (entries || []).map((entry) => ({
      entry,
      questionTokens: new Set(this.normalize(entry.question, stopwords)),
      keywordTokens: new Set(this.normalize((entry.keywords || []).join(' '), stopwords)),
    }));

    // Document frequency: how many entries mention each token at all.
    const documentFrequency = new Map();
    for (const { questionTokens, keywordTokens } of raw) {
      const allTokens = new Set([...questionTokens, ...keywordTokens]);
      for (const t of allTokens) documentFrequency.set(t, (documentFrequency.get(t) || 0) + 1);
    }
    const entryCount = raw.length || 1;
    const idf = (t) => Math.log(1 + entryCount / (documentFrequency.get(t) || 1));

    return raw.map(({ entry, questionTokens, keywordTokens }) => {
      const weights = new Map();
      for (const t of questionTokens) weights.set(t, Math.max(weights.get(t) || 0, QUESTION_WEIGHT * idf(t)));
      for (const t of keywordTokens) weights.set(t, Math.max(weights.get(t) || 0, KEYWORD_WEIGHT * idf(t)));
      const totalWeight = [...weights.values()].reduce((a, b) => a + b, 0);
      return { entry, weights, totalWeight };
    });
  },

  // queryTokens: string[]. entryWeights: Map<token, weight>. totalWeight:
  // sum of all of entryWeights' values (passed in rather than recomputed,
  // since buildEntryIndex already has it).
  // Deliberately NOT clamped to a 0-1 ceiling: a short, highly-specific
  // query (e.g. typing an FAQ's exact question) can legitimately score
  // above what a 0-1 scale would allow once IDF down-weighting is
  // factored in, and clamping would collapse two different entries' scores
  // to the same ceiling value, destroying the exact ranking information
  // that decides which one wins. `confidenceThreshold` is tuned against
  // this unclamped scale, not a strict 0-1 probability.
  scoreEntry(queryTokens, entryWeights, totalWeight) {
    if (!queryTokens.length || !totalWeight) return 0;
    let matchedWeight = 0;
    for (const t of queryTokens) matchedWeight += entryWeights.get(t) || 0;
    const score = matchedWeight / Math.sqrt(queryTokens.length * totalWeight);
    return Math.round(score * 1000) / 1000;
  },

  // Ranks every FAQ entry against a raw user query. Returns queryTokens
  // (useful for debugging/logging), a full ranked list, the best match,
  // and whether that best match clears the confidence threshold.
  match(query, entries, config = MATCHER_CONFIG, stopwords = STOPWORDS) {
    const queryTokens = this.normalize(query, stopwords);
    const index = this.buildEntryIndex(entries, stopwords);

    const ranked = index
      .map(({ entry, weights, totalWeight }) => ({ entry, score: this.scoreEntry(queryTokens, weights, totalWeight) }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score);

    const best = ranked.length ? ranked[0] : null;
    const confident = !!best && best.score >= config.confidenceThreshold;

    return {
      queryTokens,
      ranked,
      best,
      confident,
      suggestions: ranked.slice(0, config.suggestionCount).map((r) => r.entry),
    };
  },
};
