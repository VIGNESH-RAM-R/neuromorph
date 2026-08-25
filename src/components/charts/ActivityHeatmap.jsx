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
export default function ActivityHeatmap({ heatmap }) {
  if (!heatmap || heatmap.weeks.length === 0) {
    return <div className="nmpa-chart-empty">Not enough history yet to show activity.</div>;
  }
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
                title={cell.hasData ? `${cell.date}: ${cell.completionPct}% of Daily Set completed` : `${cell.date}: no activity recorded`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="nmpa-heatmap__footer">
        <span className="nmpa-muted nmpa-muted--sm">
          {heatmap.activeDays} active day{heatmap.activeDays === 1 ? '' : 's'} of {heatmap.trackedDays || 0} tracked day{heatmap.trackedDays === 1 ? '' : 's'}{heatmap.calendarYear ? ` in ${heatmap.calendarYear}` : ''}
        </span>
        <span className="nmpa-heatmap__legend">
          <span className="nmpa-muted--sm">Less</span>
          {[0, 1, 2, 3, 4].map((lvl) => (
            <span key={lvl} className={`nmpa-heatmap__cell nmpa-heatmap__cell--legend is-level-${lvl}`} />
          ))}
          <span className="nmpa-muted--sm">More</span>
        </span>
      </div>
    </div>
  );
}
