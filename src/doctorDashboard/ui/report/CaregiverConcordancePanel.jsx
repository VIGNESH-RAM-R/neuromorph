import SectionCard from '../shared/SectionCard.jsx';

export default function CaregiverConcordancePanel({ caregiverConcordance }) {
  if (!caregiverConcordance?.evaluated) return null;
  return (
    <SectionCard title="Self-Report vs. Caregiver-Report">
      <div className={`nmdd-alert ${caregiverConcordance.discordant ? 'nmdd-alert--warn' : 'nmdd-alert--info'}`}>
        <p><strong>Caregiver-reported concern:</strong> {caregiverConcordance.caregiverConcern}</p>
        <p><strong>Task-based performance band:</strong> {caregiverConcordance.overallBand}</p>
        <p>{caregiverConcordance.note}</p>
      </div>
    </SectionCard>
  );
}
