import SectionCard from '../shared/SectionCard.jsx';
import TrendIndicator from '../shared/TrendIndicator.jsx';

// Surfaces the statistics-based, explainable longitudinal analysis from
// TrendIntelligenceEngine: a multi-session slope fit per domain (catches
// gradual decline no single step shows) plus a rising-inconsistency check
// that is independent of the mean score entirely. Distinct from
// LongitudinalProgressSection above it, which shows the raw session-over-
// session deltas TrendAnalysisEngine already computed -- this panel is
// specifically the "what does the FULL history, statistically, actually
// say" layer on top of that.
const ALERT_CLASS = {
  declining: 'nmdd-alert--danger',
  volatile: 'nmdd-alert--warn',
  improving: 'nmdd-alert--info',
  stable: 'nmdd-alert--info',
  'insufficient-data': 'nmdd-alert--info',
};

export default function TrendIntelligencePanel({ trendIntelligence }) {
  if (!trendIntelligence) return null;

  const { overallTrajectory, overallDrift, overallVariability, domainsToWatch, narrativeSummary, evaluable } = trendIntelligence;

  return (
    <SectionCard
      title="Trend Intelligence"
      subtitle="Statistics-based longitudinal analysis across all sessions on record -- not a diagnosis, a flag for closer review."
    >
      <div className="nmdd-trendintel">
        <div className="nmdd-trendintel__headline">
          <span className="nmdd-subheading">Overall Trajectory</span>
          <TrendIndicator trend={overallTrajectory} delta={overallDrift?.weeklyRate} showDelta={overallDrift?.evaluable} />
        </div>

        <div className={`nmdd-alert ${ALERT_CLASS[overallTrajectory] || 'nmdd-alert--info'}`}>
          <p>{narrativeSummary}</p>
        </div>

        {evaluable && (
          <div className="nmdd-trendintel__stats">
            <div className="nmdd-kv">
              <span className="nmdd-kv__label">Weekly Rate (Overall)</span>
              <span>{overallDrift?.evaluable ? `${overallDrift.weeklyRate > 0 ? '+' : ''}${overallDrift.weeklyRate} pts/week` : '--'}</span>
            </div>
            <div className="nmdd-kv">
              <span className="nmdd-kv__label">Consistency (earlier vs. recent)</span>
              <span>
                {overallVariability?.evaluable
                  ? `${overallVariability.earlierCv}% → ${overallVariability.laterCv}% variation${overallVariability.flagged ? ' (rising)' : ''}`
                  : '--'}
              </span>
            </div>
            <div className="nmdd-kv">
              <span className="nmdd-kv__label">Sessions Analyzed</span>
              <span>{overallDrift?.n ?? 0}</span>
            </div>
          </div>
        )}

        {domainsToWatch.length > 0 && (
          <div className="nmdd-trendintel__domains">
            <h3 className="nmdd-subheading">Domains to Watch</h3>
            <ul className="nmdd-tasklist">
              {domainsToWatch.map((d) => (
                <li key={d.key}>
                  <span className="nmdd-tag nmdd-tag--warn">{d.label}</span>{' '}
                  declining about {Math.abs(d.weeklyRate)} points/week, a statistically real trend across {d.n} sessions.
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </SectionCard>
  );
}
