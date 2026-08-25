import { clampScore } from './assessmentScoringUtils.js';
import { STUDY_WORDS } from '../config/wordListConfig.js';

const POINTS_LOST_PER_INTRUSION = 10;

// Scores free recall against the studied list: correctly recalled words
// (case-insensitive, deduped) count up toward 100 proportional to the list
// size; intrusions (typed words that were never on the list) cost points,
// since confidently "recalling" something that wasn't there is itself a
// meaningful signal, not a neutral non-event.
export const WordListRecallEngine = {
  score(typedWords = [], studyWords = STUDY_WORDS) {
    const studySet = new Set(studyWords.map((w) => w.toLowerCase()));
    const seen = new Set();
    let correctCount = 0;
    let intrusions = 0;

    for (const raw of typedWords) {
      const cleaned = (raw || '').trim().toLowerCase();
      if (!cleaned || seen.has(cleaned)) continue;
      seen.add(cleaned);
      if (studySet.has(cleaned)) correctCount++;
      else intrusions++;
    }

    const baseScore = clampScore((correctCount / studyWords.length) * 100);
    const score = clampScore(baseScore - intrusions * POINTS_LOST_PER_INTRUSION);

    return { score, correctCount, intrusions, totalStudyWords: studyWords.length };
  },
};
