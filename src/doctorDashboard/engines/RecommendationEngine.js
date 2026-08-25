import { RECOMMENDATION_RULES, RECOMMENDATION_TEXT } from '../config/recommendationRules.js';

// Rule-based, closed-vocabulary recommendation generator. `gives` values are
// keys into RECOMMENDATION_TEXT -- the engine can never emit free text, a
// medication name, or a diagnostic label, because nothing outside that
// lookup table can reach the UI.
export const RecommendationEngine = {
  recommend(context) {
    const idsSeen = new Set();
    const recommendations = [];
    for (const rule of RECOMMENDATION_RULES) {
      if (rule.when(context)) {
        for (const key of rule.gives) {
          if (!idsSeen.has(key)) {
            idsSeen.add(key);
            recommendations.push({ key, text: RECOMMENDATION_TEXT[key], triggeredBy: rule.id });
          }
        }
      }
    }
    if (recommendations.length === 0) {
      recommendations.push({ key: 'CONTINUE_ROUTINE', text: RECOMMENDATION_TEXT.CONTINUE_ROUTINE, triggeredBy: 'default' });
    }
    return recommendations;
  },
};
