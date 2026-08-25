import ActivityHeatmap from '../charts/ActivityHeatmap.jsx';
import SectionIcon from '../common/SectionIcon.jsx';

// Split out of the old, over-bundled ProgressSection.jsx (2026-08-18) --
// same real ActivityHeatmap and data, just its own top-level section.
//
// 2026-08-21: card entrance (nmpa-anim-fade-up) -- deliberately NOT a
// per-cell heatmap animation (84 cells staggering in would fight the
// "restraint fitting Samsung Health's actual feel" guidance in
// OVERNIGHT_PLAN.md, not honor it).
export default function ActivitySection({ self }) {
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
          <div><p className="nmpa-eyebrow">Activity</p><h2 className="nmpa-card__title">Your {year} consistency calendar</h2><p className="nmpa-muted">A full view of daily-set activity through December. Future and unrecorded days stay unfilled.</p></div>
        </div>
        <div className="nmpa-activity-stats">
          <div><span>Active days</span><strong>{calendar?.activeDays ?? 0}</strong><small>This year</small></div>
          <div><span>Current streak</span><strong>{streak ?? 0}</strong><small>Consecutive days</small></div>
          <div><span>Best streak</span><strong>{longestStreak ?? 0}</strong><small>Personal best</small></div>
          <div><span>Average completion</span><strong>{calendar?.trackedDays ? `${calendar.averageCompletionPct}%` : '—'}</strong><small>Recorded days</small></div>
        </div>
      </section>

      <section className="nmpa-card nmpa-activity-calendar nmpa-anim-fade-up" style={{ '--nmpa-anim-delay': '60ms' }}>
        <div className="nmpa-section__header"><div><h3 className="nmpa-card__title">Daily Set activity</h3><p className="nmpa-muted nmpa-muted--sm">Each square represents one day. Brighter squares mean more of the Daily Set was completed.</p></div></div>
        <ActivityHeatmap heatmap={calendar} />
      </section>
      <section className="nmpa-card nmpa-activity-next nmpa-anim-fade-up" style={{ '--nmpa-anim-delay': '120ms' }}>
        <div><p className="nmpa-eyebrow">Next step</p><h3>{hasActivity ? 'Keep your consistency going' : 'Start building your activity history'}</h3><p className="nmpa-muted">{hasActivity ? 'Complete today’s Daily Set to add another activity point to your calendar and support your current streak.' : 'Complete part of today’s Daily Set to begin filling your calendar. Every completed activity is recorded here.'}</p></div>
        <span className="nmpa-tag nmpa-tag--info">Daily Set</span>
      </section>
    </div>
  );
}
