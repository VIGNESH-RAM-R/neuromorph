import LineChart from '../charts/LineChart.jsx';
import DomainsSection from './DomainsSection.jsx';
import ActivitySection from './ActivitySection.jsx';
import { DEFAULT_LANGUAGE } from '../../config/i18nConfig.js';
import { t, format } from '../../i18n/strings/dashboard.js';

// My Progress is the single place for score trends, cognitive-domain
// results, and Daily Set activity. Insights and reports remain separate
// destinations because they are actions rather than progress views.
//
// 2026-08-26: full i18n pass (see src/i18n/strings/dashboard.js).
export default function ProgressSection({ self, language = DEFAULT_LANGUAGE }) {
  if (!self) return null;
  const { weeklyCognitiveScoreHistory, monthlyCognitiveScoreHistory, momentumHistory, streak, longestStreak } = self;

  // 2026-08-23 (VR request, "premium/professional"): bento treatment
  // matching the Figma "Dashboard - Progress" frame -- weekly and monthly
  // trend cards side by side instead of a flat stack, momentum stays
  // full-width since it's the longest series. All copy/props unchanged.
  return (
    <div className="nmpa-section">
      <section className="nmpa-card nmpa-anim-fade-up" style={{ '--nmpa-anim-delay': '0ms' }}>
        <h2 className="nmpa-card__title">{t(language, 'myProgressTitle')}</h2>
        <p className="nmpa-muted">{t(language, 'myProgressSubtitle')}</p>
      </section>

      <div className="nmpa-progress__row">
        <section className="nmpa-card nmpa-anim-fade-up" style={{ '--nmpa-anim-delay': '60ms' }}>
          <h3 className="nmpa-card__title">{t(language, 'weeklyCognitiveScoreTitle')}</h3>
          <LineChart series={weeklyCognitiveScoreHistory} label={t(language, 'weeklyCognitiveScoreChartLabel')} language={language} />
        </section>

        <section className="nmpa-card nmpa-anim-fade-up" style={{ '--nmpa-anim-delay': '120ms' }}>
          <h3 className="nmpa-card__title">{t(language, 'monthlyTrendTitle')}</h3>
          <LineChart series={monthlyCognitiveScoreHistory} label={t(language, 'monthlyTrendChartLabel')} language={language} />
        </section>
      </div>

      <section className="nmpa-card nmpa-anim-fade-up" style={{ '--nmpa-anim-delay': '180ms' }}>
        <h3 className="nmpa-card__title">{format(t(language, 'dailyMomentumTitle'), { days: momentumHistory.length })}</h3>
        <LineChart series={momentumHistory} label={t(language, 'dailyMomentumChartLabel')} language={language} />
        <p className="nmpa-muted">{format(t(language, 'streakCaption'), { streak, longestStreak })}</p>
      </section>
      <DomainsSection self={self} language={language} />
      <ActivitySection self={self} language={language} />
    </div>
  );
}
