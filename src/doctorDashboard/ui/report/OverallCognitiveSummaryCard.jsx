import SectionCard from '../shared/SectionCard.jsx';
import StatusBadge from '../shared/StatusBadge.jsx';
import TrendIndicator from '../shared/TrendIndicator.jsx';

export default function OverallCognitiveSummaryCard({ report }) {
  const { overallCognitive, trend, riskAlert } = report;
  return (
    <SectionCard className="nmdd-summary-card">
      <div className="nmdd-summary-card__main">
        <div className="nmdd-summary-card__score">{overallCognitive.score ?? '—'}</div>
        <div className="nmdd-summary-card__meta">
          <StatusBadge band={overallCognitive.band} size="lg" />
          <TrendIndicator trend={trend.overall.trend} delta={trend.overall.delta} />
        </div>
      </div>
      <p className="nmdd-summary-card__interpretation">{overallCognitive.interpretation}</p>
      {riskAlert.flagged && (
        <div className="nmdd-alert nmdd-alert--danger">
          <strong>Clinician attention flagged.</strong>
          <ul>
            {riskAlert.reasons.map((r) => <li key={r}>{r}</li>)}
          </ul>
        </div>
      )}
    </SectionCard>
  );
}
