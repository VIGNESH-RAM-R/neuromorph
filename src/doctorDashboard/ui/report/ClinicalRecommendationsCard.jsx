import SectionCard from '../shared/SectionCard.jsx';
import { DEFAULT_LANGUAGE } from '../../config/i18nConfig.js';
import { t } from '../../i18n/strings/report.js';

// r.key is always one of RECOMMENDATION_TEXT's fixed keys (see
// recommendationRules.js / RecommendationEngine.js) -- a closed vocabulary,
// never free text -- so it maps 1:1 to a translation key below instead of
// rendering r.text (the raw English) directly.
const RECOMMENDATION_TEXT_KEY = {
  REPEAT_SIX_MONTHS: 'recommendationRepeatSixMonths',
  REPEAT_THREE_MONTHS: 'recommendationRepeatThreeMonths',
  FORMAL_NEUROPSYCH: 'recommendationFormalNeuropsych',
  NEUROLOGY_CONSULT: 'recommendationNeurologyConsult',
  LIFESTYLE: 'recommendationLifestyle',
  GATHER_COLLATERAL: 'recommendationGatherCollateral',
  CONTINUE_ROUTINE: 'recommendationContinueRoutine',
  CONSISTENCY_MONITORING: 'recommendationConsistencyMonitoring',
};

export default function ClinicalRecommendationsCard({ recommendations, language = DEFAULT_LANGUAGE }) {
  return (
    <SectionCard title={t(language, 'clinicalRecommendationsTitle')} subtitle={t(language, 'clinicalRecommendationsSubtitle')}>
      <ul className="nmdd-recommendation-list">
        {recommendations.map((r) => (
          <li key={r.key}>{RECOMMENDATION_TEXT_KEY[r.key] ? t(language, RECOMMENDATION_TEXT_KEY[r.key]) : r.text}</li>
        ))}
      </ul>
    </SectionCard>
  );
}
