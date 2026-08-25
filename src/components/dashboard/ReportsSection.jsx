// Split out of the old, over-bundled ProgressSection.jsx (2026-08-18) --
// the "Download Monthly Report" action gets its own top-level section
// instead of one button buried at the top of "My Progress".
//
// 2026-08-21: card entrance (nmpa-anim-fade-up) -- a single, static card
// with a button doesn't invite anything beyond that (no big number, no
// progress-toward-a-goal), per OVERNIGHT_PLAN.md's restraint guidance.
import SectionIcon from '../common/SectionIcon.jsx';
import CareTeamSection from './CareTeamSection.jsx';

export default function ReportsSection({ self, onDownloadReport, currentUser }) {
  if (!self) return null;

  return (
    <div className="nmpa-section">
      <section className="nmpa-card nmpa-anim-fade-up" style={{ '--nmpa-anim-delay': '0ms' }}>
        <div className="nmpa-section-icon-badge"><SectionIcon id="reports" /></div>
        <h2 className="nmpa-card__title">Reports</h2>
        <p className="nmpa-muted">
          Generate a printable summary of your latest cognitive score, domain breakdown, and recent trend -- the
          same kind of report your doctor can review.
        </p>
        <button type="button" className="nmpa-button nmpa-button--primary" onClick={onDownloadReport}>
          Download Monthly Report (PDF)
        </button>
        <p className="nmpa-muted nmpa-muted--sm" style={{ marginTop: 10 }}>
          Your browser's "Save as PDF" option turns this into an actual file -- the same working approach used on
          the Doctor Dashboard, no separate PDF library required.
        </p>
      </section>

      <CareTeamSection patientId={currentUser?.uid} patientName={currentUser?.name} />
    </div>
  );
}
