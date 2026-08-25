import SectionCard from '../shared/SectionCard.jsx';
import EmptyState from '../shared/EmptyState.jsx';

// 2026-08-19: real daily engagement signal, separate from the weekly
// Detection Assessment above (see ReportModel.js's own comment on
// `dailyMomentum`). Shown as its own small card near the top of the report
// so a clinician can see "how did this patient's daily engagement go
// recently" at a glance, distinct from the clinical weekly score. Renders
// an honest empty state (never a fabricated 0/100) when the patient hasn't
// completed a full Daily Set since this feature shipped.
export default function DailyMomentumCard({ dailyMomentum }) {
  if (!dailyMomentum || typeof dailyMomentum.score !== 'number') {
    return (
      <SectionCard title="Daily Momentum" subtitle="Patient app's daily engagement check-in -- separate from the weekly Detection Assessment">
        <EmptyState title="No daily check-in data yet" message="This patient hasn't completed a full Daily Set (Face, Speech, Memory, Reaction, Attention) since this feature shipped." />
      </SectionCard>
    );
  }
  return (
    <SectionCard title="Daily Momentum" subtitle="Patient app's daily engagement check-in -- separate from the weekly Detection Assessment">
      <div className="nmdd-overview__grid">
        <div><span className="nmdd-kv__label">Most Recent Score</span><span className="nmdd-kv__value">{dailyMomentum.score}/100</span></div>
        <div><span className="nmdd-kv__label">Date</span><span className="nmdd-kv__value">{dailyMomentum.date}</span></div>
        <div><span className="nmdd-kv__label">Daily Set Completion</span><span className="nmdd-kv__value">{typeof dailyMomentum.completionPct === 'number' ? `${dailyMomentum.completionPct}%` : '—'}</span></div>
        <div><span className="nmdd-kv__label">Performance Average</span><span className="nmdd-kv__value">{typeof dailyMomentum.performanceAvg === 'number' ? dailyMomentum.performanceAvg : '—'}</span></div>
      </div>
    </SectionCard>
  );
}
