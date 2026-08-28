import SectionCard from '../shared/SectionCard.jsx';
import EmptyState from '../shared/EmptyState.jsx';
import { DEFAULT_LANGUAGE } from '../../config/i18nConfig.js';
import { t } from '../../i18n/strings/report.js';

// 2026-08-19: real daily engagement signal, separate from the weekly
// Detection Assessment above (see ReportModel.js's own comment on
// `dailyMomentum`). Shown as its own small card near the top of the report
// so a clinician can see "how did this patient's daily engagement go
// recently" at a glance, distinct from the clinical weekly score. Renders
// an honest empty state (never a fabricated 0/100) when the patient hasn't
// completed a full Daily Set since this feature shipped.
export default function DailyMomentumCard({ dailyMomentum, language = DEFAULT_LANGUAGE }) {
  if (!dailyMomentum || typeof dailyMomentum.score !== 'number') {
    return (
      <SectionCard title={t(language, 'dailyMomentumTitle')} subtitle={t(language, 'dailyMomentumSubtitle')}>
        <EmptyState title={t(language, 'dailyMomentumEmptyTitle')} message={t(language, 'dailyMomentumEmptyMessage')} />
      </SectionCard>
    );
  }
  return (
    <SectionCard title={t(language, 'dailyMomentumTitle')} subtitle={t(language, 'dailyMomentumSubtitle')}>
      <div className="nmdd-overview__grid">
        <div><span className="nmdd-kv__label">{t(language, 'labelMostRecentScore')}</span><span className="nmdd-kv__value">{dailyMomentum.score}/100</span></div>
        <div><span className="nmdd-kv__label">{t(language, 'labelDate')}</span><span className="nmdd-kv__value">{dailyMomentum.date}</span></div>
        <div><span className="nmdd-kv__label">{t(language, 'labelDailySetCompletion')}</span><span className="nmdd-kv__value">{typeof dailyMomentum.completionPct === 'number' ? `${dailyMomentum.completionPct}%` : '—'}</span></div>
        <div><span className="nmdd-kv__label">{t(language, 'labelPerformanceAverage')}</span><span className="nmdd-kv__value">{typeof dailyMomentum.performanceAvg === 'number' ? dailyMomentum.performanceAvg : '—'}</span></div>
      </div>
    </SectionCard>
  );
}
