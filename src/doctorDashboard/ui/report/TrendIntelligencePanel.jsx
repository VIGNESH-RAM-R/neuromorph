import SectionCard from '../shared/SectionCard.jsx';
import TrendIndicator from '../shared/TrendIndicator.jsx';
import { DEFAULT_LANGUAGE } from '../../config/i18nConfig.js';
import { t, format } from '../../i18n/strings/report.js';

// Surfaces the statistics-based, explainable longitudinal analysis from
// TrendIntelligenceEngine: a multi-session slope fit per domain (catches
// gradual decline no single step shows) plus a rising-inconsistency check
// that is independent of the mean score entirely. Distinct from
// LongitudinalProgressSection above it, which shows the raw session-over-
// session deltas TrendAnalysisEngine already computed -- this panel is
// specifically the "what does the FULL history, statistically, actually
// say" layer on top of that.
//
// 2026-08-26 scope note: `narrativeSummary` (TrendIntelligenceEngine.js) is
// explicitly documented there as "reused verbatim by ... Morphy's 'explain
// my trend' backend action, so a doctor and a patient never get two
// different stories about the same data" -- restructuring it into a
// translation key here would risk that other consumer. Left English for
// now; this panel's chrome (title/labels/domain-to-watch sentence) is fully
// translated below.
const ALERT_CLASS = {
  declining: 'nmdd-alert--danger',
  volatile: 'nmdd-alert--warn',
  improving: 'nmdd-alert--info',
  stable: 'nmdd-alert--info',
  'insufficient-data': 'nmdd-alert--info',
};

export default function TrendIntelligencePanel({ trendIntelligence, language = DEFAULT_LANGUAGE }) {
  if (!trendIntelligence) return null;

  const { overallTrajectory, overallDrift, overallVariability, domainsToWatch, narrativeSummary, evaluable } = trendIntelligence;

  return (
    <SectionCard
      title={t(language, 'trendIntelligenceTitle')}
      subtitle={t(language, 'trendIntelligenceSubtitle')}
    >
      <div className="nmdd-trendintel">
        <div className="nmdd-trendintel__headline">
          <span className="nmdd-subheading">{t(language, 'overallTrajectoryLabel')}</span>
          <TrendIndicator trend={overallTrajectory} delta={overallDrift?.weeklyRate} showDelta={overallDrift?.evaluable} language={language} />
        </div>

        <div className={`nmdd-alert ${ALERT_CLASS[overallTrajectory] || 'nmdd-alert--info'}`}>
          <p>{narrativeSummary}</p>
        </div>

        {evaluable && (
          <div className="nmdd-trendintel__stats">
            <div className="nmdd-kv">
              <span className="nmdd-kv__label">{t(language, 'weeklyRateOverallLabel')}</span>
              <span>{overallDrift?.evaluable ? format(t(language, 'weeklyRateValue'), { sign: overallDrift.weeklyRate > 0 ? '+' : '', rate: overallDrift.weeklyRate }) : '--'}</span>
            </div>
            <div className="nmdd-kv">
              <span className="nmdd-kv__label">{t(language, 'consistencyLabel')}</span>
              <span>
                {overallVariability?.evaluable
                  ? `${format(t(language, 'consistencyValue'), { earlier: overallVariability.earlierCv, later: overallVariability.laterCv })}${overallVariability.flagged ? ` ${t(language, 'risingTag')}` : ''}`
                  : '--'}
              </span>
            </div>
            <div className="nmdd-kv">
              <span className="nmdd-kv__label">{t(language, 'sessionsAnalyzedLabel')}</span>
              <span>{overallDrift?.n ?? 0}</span>
            </div>
          </div>
        )}

        {domainsToWatch.length > 0 && (
          <div className="nmdd-trendintel__domains">
            <h3 className="nmdd-subheading">{t(language, 'domainsToWatchHeading')}</h3>
            <ul className="nmdd-tasklist">
              {domainsToWatch.map((d) => (
                <li key={d.key}>
                  <span className="nmdd-tag nmdd-tag--warn">{d.label}</span>{' '}
                  {format(t(language, 'domainDecliningSentence'), { rate: Math.abs(d.weeklyRate), n: d.n })}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </SectionCard>
  );
}
