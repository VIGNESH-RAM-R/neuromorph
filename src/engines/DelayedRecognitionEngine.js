import { clampScore } from './assessmentScoringUtils.js';
import { STUDY_WORDS } from '../config/wordListConfig.js';

// Scores a recognition run: for each word shown (mix of previously-studied
// words and new distractors), the user marks "seen before" or "new".
// Score rewards hits (correctly recognizing a studied word) and penalizes
// false alarms (marking a new word as familiar) equally -- a discrimination
// measure, not just a raw hit count, since a person who marks everything
// "seen" would otherwise score perfectly on hits alone.
export const DelayedRecognitionEngine = {
  // responses: [{ word, isStudyWord, markedAsSeen }]
  score(responses = [], studyWordCount = STUDY_WORDS.length) {
    let hits = 0;
    let falseAlarms = 0;
    let misses = 0;
    let correctRejections = 0;

    for (const r of responses) {
      if (r.isStudyWord) {
        if (r.markedAsSeen) hits++; else misses++;
      } else {
        if (r.markedAsSeen) falseAlarms++; else correctRejections++;
      }
    }

    const score = clampScore(((hits - falseAlarms) / studyWordCount) * 100);
    return { score, hits, falseAlarms, misses, correctRejections };
  },
};
