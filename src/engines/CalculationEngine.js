import { accuracyScore } from './assessmentScoringUtils.js';

// Untimed, exact-match accuracy -- rounds both the submitted answer and the
// expected answer to 2 decimal places before comparing, so "7.45" and
// "7.450" both count correct without needing string-matching tricks.
export const CalculationEngine = {
  // responses: [{ problem: {id, answer}, submittedAnswer: number|string }]
  score(responses = []) {
    if (responses.length === 0) return { score: 0, accuracy: 0, correctCount: 0 };

    const correctCount = responses.filter((r) => {
      const submitted = typeof r.submittedAnswer === 'string' ? parseFloat(r.submittedAnswer) : r.submittedAnswer;
      if (typeof submitted !== 'number' || Number.isNaN(submitted)) return false;
      return Math.round(submitted * 100) === Math.round(r.problem.answer * 100);
    }).length;

    const accuracy = accuracyScore(correctCount, responses.length);
    return { score: accuracy, accuracy, correctCount };
  },
};
