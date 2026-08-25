import SectionCard from '../shared/SectionCard.jsx';

const FIELD_LABELS = {
  memoryComplaints: 'Memory Complaints',
  orientation: 'Orientation',
  dailyActivities: 'Daily Activities',
  behaviour: 'Behaviour',
  functionalIndependence: 'Functional Independence',
};

export default function QuestionnaireSummaryCard({ questionnaire, caregiverConcordance }) {
  return (
    <SectionCard title="Questionnaire Summary" subtitle="Condensed from the full response set -- individual answers are not listed here">
      <div className="nmdd-questionnaire-grid">
        {Object.entries(FIELD_LABELS).map(([key, label]) => (
          <div key={key} className="nmdd-kv">
            <span className="nmdd-kv__label">{label}</span>
            <span className="nmdd-kv__value">{questionnaire?.[key] || '—'}</span>
          </div>
        ))}
        <div className="nmdd-kv">
          <span className="nmdd-kv__label">Caregiver Concern</span>
          <span className="nmdd-kv__value">{caregiverConcordance?.caregiverConcern || '—'}</span>
        </div>
      </div>
    </SectionCard>
  );
}
