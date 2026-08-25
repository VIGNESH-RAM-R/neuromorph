import SectionCard from '../shared/SectionCard.jsx';
import StatusBadge from '../shared/StatusBadge.jsx';

export default function SpeechAssessmentCard({ speech }) {
  return (
    <SectionCard title="Speech Assessment" actions={<StatusBadge band={speech.overallBand} />}>
      <div className="nmdd-speech-grid">
        {speech.metrics.map((m) => (
          <div key={m.key} className="nmdd-speech-metric">
            <div className="nmdd-speech-metric__header">
              <span>{m.label}</span>
              <StatusBadge band={m.band} size="sm" />
            </div>
            <p className="nmdd-muted">{m.interpretation}</p>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
