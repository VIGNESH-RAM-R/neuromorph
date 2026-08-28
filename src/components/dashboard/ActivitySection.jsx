import ActivityHeatmap from '../charts/ActivityHeatmap.jsx';
import SectionIcon from '../common/SectionIcon.jsx';
import { DEFAULT_LANGUAGE } from '../../config/i18nConfig.js';
import { t, format } from '../../i18n/strings/dashboard.js';

// Split out of the old, over-bundled ProgressSection.jsx (2026-08-18) --
// same real ActivityHeatmap and data, just its own top-level section.
//
// 2026-08-21: card entrance (nmpa-anim-fade-up) -- deliberately NOT a
// per-cell heatmap animation (84 cells staggering in would fight the
// "restraint fitting Samsung Health's actual feel" guidance in
// OVERNIGHT_PLAN.md, not honor it).
//
// 2026-08-26: full i18n pass (see src/i18n/strings/dashboard.js).
export default function ActivitySection({ self, language = DEFAULT_LANGUAGE }) {
  if (!self) return null;
  const { activityCalendar, activityHeatmap, streak, longestStreak } = self;
  const calendar = activityCalendar || activityHeatmap;
  const year = calendar?.calendarYear || new Date().getFullYear();
  const hasActivity = calendar?.activeDays > 0;

  return (
    <div className="nmpa-section nmpa-activity-page">
      <section className="nmpa-card nmpa-activity-overview nmpa-anim-fade-up" style={{ '--nmpa-anim-delay': '0ms' }}>
        <div className="nmpa-activity-overview__intro">
          <div className="nmpa-section-icon-badge"><SectionIcon id="activity" /></div>
          <div><p className="nmpa-eyebrow">{t(language, 'activityEyebrow')}</p><h2 className="nmpa-card__title">{format(t(language, 'yourConsistencyCalendar'), { year })}</h2><p className="nmpa-muted">{t(language, 'consistencyCalendarSubtitle')}</p></div>
        </div>
        <div className="nmpa-activity-stats">
          <div><span>{t(language, 'activeDaysLabel')}</span><strong>{calendar?.activeDays ?? 0}</strong><small>{t(language, 'thisYearLabel')}</small></div>
          <div><span>{t(language, 'currentStreakLabel')}</span><strong>{streak ?? 0}</strong><small>{t(language, 'consecutiveDaysLabel')}</small></div>
          <div><span>{t(language, 'bestStreakLabel')}</span><strong>{longestStreak ?? 0}</strong><small>{t(language, 'personalBestLabel')}</small></div>
          <div><span>{t(language, 'averageCompletionLabel')}</span><strong>{calendar?.trackedDays ? `${calendar.averageCompletionPct}%` : '—'}</strong><small>{t(language, 'recordedDaysLabel')}</small></div>
        </div>
      </section>

      <section className="nmpa-card nmpa-activity-calendar nmpa-anim-fade-up" style={{ '--nmpa-anim-delay': '60ms' }}>
        <div className="nmpa-section__header"><div><h3 className="nmpa-card__title">{t(language, 'dailySetActivityTitle')}</h3><p className="nmpa-muted nmpa-muted--sm">{t(language, 'dailySetActivitySubtitle')}</p></div></div>
        <ActivityHeatmap heatmap={calendar} language={language} />
      </section>
      <section className="nmpa-card nmpa-activity-next nmpa-anim-fade-up" style={{ '--nmpa-anim-delay': '120ms' }}>
        <div><p className="nmpa-eyebrow">{t(language, 'nextStepEyebrow')}</p><h3>{hasActivity ? t(language, 'keepConsistencyTitle') : t(language, 'startBuildingTitle')}</h3><p className="nmpa-muted">{hasActivity ? t(language, 'keepConsistencyBody') : t(language, 'startBuildingBody')}</p></div>
        <span className="nmpa-tag nmpa-tag--info">{t(language, 'dailySetTag')}</span>
      </section>
    </div>
  );
}
