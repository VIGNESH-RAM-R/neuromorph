import { DEFAULT_LANGUAGE } from '../../config/i18nConfig.js';
import { t, format } from '../../i18n/strings/dashboard.js';

function monthLabelFor(dateStr) {
  const d = new Date(dateStr);
  return d.getUTCDate() <= 7 ? d.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' }) : '';
}

// GitHub-contribution-style calendar heatmap of Daily Set activity --
// dependency-free (CSS grid + divs, same "no chart library" convention as
// LineChart.jsx). Reads the {weeks: [[cell x7], ...]} shape
// ActivityHeatmapEngine.build() produces; a cell with hasData: false (a
// real gap in the log, e.g. today or before the patient started) renders
// as a distinct empty state rather than looking identical to "did nothing
// that day".
//
// 2026-08-26: full i18n pass (see src/i18n/strings/dashboard.js). Month
// labels (monthLabelFor) intentionally stay in en-US short form -- a
// three-letter month abbreviation above a tiny calendar column, same
// convention as raw ISO dates elsewhere in the app's charts.
//
// English pluralizes "day(s)" with a trailing "s"; the other 6 languages
// here don't mark plural on this phrase the same way, so {plural} is only
// ever non-empty for English -- see HomeSection.jsx's identical convention.
export default function ActivityHeatmap({ heatmap, language = DEFAULT_LANGUAGE }) {
  if (!heatmap || heatmap.weeks.length === 0) {
    return <div className="nmpa-chart-empty">{t(language, 'notEnoughHistoryActivity')}</div>;
  }
  const activePlural = language === 'en' && heatmap.activeDays !== 1 ? 's' : '';
  const trackedDays = heatmap.trackedDays || 0;
  const trackedPlural = language === 'en' && trackedDays !== 1 ? 's' : '';
  const yearSuffix = heatmap.calendarYear ? format(t(language, 'inYearSuffix'), { year: heatmap.calendarYear }) : '';

  return (
    <div className="nmpa-heatmap">
      <div className="nmpa-heatmap__grid">
          {heatmap.weeks.map((week, wi) => (
          <div key={wi} className="nmpa-heatmap__col">
            <span className="nmpa-heatmap__month-label">{monthLabelFor(week[0].date)}</span>
              {week.map((cell) => (
              <div
                key={cell.date}
                className={`nmpa-heatmap__cell ${cell.hasData ? `is-level-${cell.intensity}` : 'is-empty'}`}
                title={cell.hasData ? format(t(language, 'cellCompletedTooltip'), { date: cell.date, pct: cell.completionPct }) : format(t(language, 'cellNoActivityTooltip'), { date: cell.date })}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="nmpa-heatmap__footer">
        <span className="nmpa-muted nmpa-muted--sm">
          {format(t(language, 'heatmapSummary'), { active: heatmap.activeDays, tracked: trackedDays, plural: activePlural, yearSuffix })}
        </span>
        <span className="nmpa-heatmap__legend">
          <span className="nmpa-muted--sm">{t(language, 'legendLess')}</span>
          {[0, 1, 2, 3, 4].map((lvl) => (
            <span key={lvl} className={`nmpa-heatmap__cell nmpa-heatmap__cell--legend is-level-${lvl}`} />
          ))}
          <span className="nmpa-muted--sm">{t(language, 'legendMore')}</span>
        </span>
      </div>
    </div>
  );
}
