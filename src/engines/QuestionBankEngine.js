import { accuracyScore } from './assessmentScoringUtils.js';
import { QUESTION_BANK, QB_LOBE_TAGS, QB_SELECTION_RULES } from '../config/questionBankConfig.js';

// Fisher-Yates shuffle with an injectable random source -- tests pass a
// deterministic fake instead of Math.random so selection RULES (right
// counts per tag, no duplicates) are verifiable without needing true
// randomness to be reproducible.
function shuffle(array, random) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export const QuestionBankEngine = {
  // "10 random questions from the QB" = 2 guaranteed per lobe tag x 4
  // lobes (8) + 2 more drawn from whatever's left across any lobe (10
  // total). The real 100-item bank has only the 4 lobe domains -- no
  // "general" bucket -- so the extra 2 are a wildcard top-up rather than a
  // 5th category, keeping every lobe represented while still varying which
  // lobe gets the "bonus" question week to week.
  selectQuestions(bank = QUESTION_BANK, random = Math.random, rules = QB_SELECTION_RULES) {
    const selected = [];
    for (const tag of QB_LOBE_TAGS) {
      const pool = bank.filter((q) => q.lobeTag === tag);
      selected.push(...shuffle(pool, random).slice(0, rules.perLobeCount));
    }
    const selectedIds = new Set(selected.map((q) => q.id));
    const remainingPool = bank.filter((q) => !selectedIds.has(q.id));
    selected.push(...shuffle(remainingPool, random).slice(0, rules.extraCount));
    return selected;
  },

  // responses: [{ question: {correctIndex}, selectedIndex }]
  score(responses = []) {
    if (responses.length === 0) return { score: 0, accuracy: 0, correctCount: 0 };
    const correctCount = responses.filter((r) => r.selectedIndex === r.question.correctIndex).length;
    const accuracy = accuracyScore(correctCount, responses.length);
    return { score: accuracy, accuracy, correctCount };
  },
};
