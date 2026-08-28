import SectionCard from '../shared/SectionCard.jsx';
import { DEFAULT_LANGUAGE } from '../../config/i18nConfig.js';
import { t } from '../../i18n/strings/report.js';

const FIELD_LABEL_KEY = {
  memoryComplaints: 'fieldMemoryComplaints',
  orientation: 'fieldOrientation',
  dailyActivities: 'fieldDailyActivities',
  behaviour: 'fieldBehaviour',
  functionalIndependence: 'fieldFunctionalIndependence',
};

export default function QuestionnaireSummaryCard({ questionnaire, caregiverConcordance, language = DEFAULT_LANGUAGE }) {
  return (
    <SectionCard title={t(language, 'questionnaireSummaryTitle')} subtitle={t(language, 'questionnaireSummarySubtitle')}>
      <div className="nmdd-questionnaire-grid">
        {Object.entries(FIELD_LABEL_KEY).map(([key, labelKey]) => (
          <div key={key} className="nmdd-kv">
            <span className="nmdd-kv__label">{t(language, labelKey)}</span>
            <span className="nmdd-kv__value">{questionnaire?.[key] || '—'}</span>
          </div>
        ))}
        <div className="nmdd-kv">
          <span className="nmdd-kv__label">{t(language, 'fieldCaregiverConcern')}</span>
          <span className="nmdd-kv__value">{caregiverConcordance?.caregiverConcern || '—'}</span>
        </div>
      </div>
    </SectionCard>
  );
}
