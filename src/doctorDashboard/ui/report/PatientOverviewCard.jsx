import SectionCard from '../shared/SectionCard.jsx';

function formatDuration(ms) {
  if (typeof ms !== 'number') return '—';
  const minutes = Math.round(ms / 60000);
  return `${minutes} min`;
}

export default function PatientOverviewCard({ report }) {
  const { patient, session, adherence } = report;
  return (
    <SectionCard title="Patient Overview" className="nmdd-overview">
      <div className="nmdd-overview__grid">
        <div><span className="nmdd-kv__label">Name</span><span className="nmdd-kv__value">{patient.name}</span></div>
        <div><span className="nmdd-kv__label">Age</span><span className="nmdd-kv__value">{patient.age}</span></div>
        <div><span className="nmdd-kv__label">Gender</span><span className="nmdd-kv__value">{patient.gender}</span></div>
        <div><span className="nmdd-kv__label">Patient ID</span><span className="nmdd-kv__value">{patient.patientId}</span></div>
        <div><span className="nmdd-kv__label">Assessment Date</span><span className="nmdd-kv__value">{session.date}</span></div>
        <div><span className="nmdd-kv__label">Duration</span><span className="nmdd-kv__value">{formatDuration(session.durationMs)}</span></div>
        <div><span className="nmdd-kv__label">Status</span><span className="nmdd-kv__value">{session.status}</span></div>
        <div><span className="nmdd-kv__label">Previous Assessments</span><span className="nmdd-kv__value">{session.sessionCount - 1}</span></div>
        <div>
          <span className="nmdd-kv__label">Adherence</span>
          <span className="nmdd-kv__value">
            {adherence.overdue ? `Overdue (${adherence.daysSinceLast} days since last)` : `This week's cognitive test: Completed · next due ${adherence.nextDueDate}`}
          </span>
        </div>
      </div>
      {patient.riskFactors?.length > 0 && (
        <div className="nmdd-overview__risks">
          <span className="nmdd-kv__label">Risk Factors</span>
          <ul className="nmdd-taglist">
            {patient.riskFactors.map((rf) => (
              <li key={rf} className="nmdd-tag">{rf}</li>
            ))}
          </ul>
        </div>
      )}
    </SectionCard>
  );
}
