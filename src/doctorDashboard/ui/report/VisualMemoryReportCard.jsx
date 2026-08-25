import SectionCard from '../shared/SectionCard.jsx';
import StatusBadge from '../shared/StatusBadge.jsx';
import ScoreBar from '../shared/ScoreBar.jsx';

export default function VisualMemoryReportCard({ visualMemory }) {
  return (
    <SectionCard
      title="Visual Memory Report"
      subtitle="Clinician-friendly subscores -- full trial-wise data retained in hidden analytics"
      actions={<StatusBadge band={visualMemory.band} />}
    >
      <div className="nmdd-subscore-list">
        {visualMemory.subscores.map((s) => (
          <ScoreBar key={s.key} label={s.label} score={s.score} band={s.band} />
        ))}
      </div>
      <p className="nmdd-card__footnote">{visualMemory.interpretation}</p>
    </SectionCard>
  );
}
