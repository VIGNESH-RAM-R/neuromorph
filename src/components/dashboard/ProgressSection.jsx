import LineChart from '../charts/LineChart.jsx';
import DomainsSection from './DomainsSection.jsx';
import ActivitySection from './ActivitySection.jsx';

// My Progress is the single place for score trends, cognitive-domain
// results, and Daily Set activity. Insights and reports remain separate
// destinations because they are actions rather than progress views.
export default function ProgressSection({ self }) {
  if (!self) return null;
  const { weeklyCognitiveScoreHistory, monthlyCognitiveScoreHistory, momentumHistory, streak, longestStreak } = self;

  // 2026-08-23 (VR request, "premium/professional"): bento treatment
  // matching the Figma "Dashboard - Progress" frame -- weekly and monthly
  // trend cards side by side instead of a flat stack, momentum stays
  // full-width since it's the longest series. All copy/props unchanged.
  return (
    <div className="nmpa-section">
      <section className="nmpa-card nmpa-anim-fade-up" style={{ '--nmpa-anim-delay': '0ms' }}>
        <h2 className="nmpa-card__title">My Progress</h2>
        <p className="nmpa-muted">Your cognitive score trend over time, weekly and monthly.</p>
      </section>

      <div className="nmpa-progress__row">
        <section className="nmpa-card nmpa-anim-fade-up" style={{ '--nmpa-anim-delay': '60ms' }}>
          <h3 className="nmpa-card__title">Weekly Cognitive Score</h3>
          <LineChart series={weeklyCognitiveScoreHistory} label="Weekly cognitive score over time" />
        </section>

        <section className="nmpa-card nmpa-anim-fade-up" style={{ '--nmpa-anim-delay': '120ms' }}>
          <h3 className="nmpa-card__title">Monthly Trend</h3>
          <LineChart series={monthlyCognitiveScoreHistory} label="Monthly cognitive score trend" />
        </section>
      </div>

      <section className="nmpa-card nmpa-anim-fade-up" style={{ '--nmpa-anim-delay': '180ms' }}>
        <h3 className="nmpa-card__title">Daily Momentum Score (last {momentumHistory.length} days)</h3>
        <LineChart series={momentumHistory} label="Daily Momentum Score over time" />
        <p className="nmpa-muted">Current streak: {streak} days · Longest streak: {longestStreak} days.</p>
      </section>
      <DomainsSection self={self} />
      <ActivitySection self={self} />
    </div>
  );
}
