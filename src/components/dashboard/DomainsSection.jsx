import DomainBreakdownChart from '../charts/DomainBreakdownChart.jsx';
import SectionIcon from '../common/SectionIcon.jsx';

// Split out of the old, over-bundled ProgressSection.jsx (2026-08-18) --
// same real DomainBreakdownChart and data, just its own top-level section
// instead of one card buried inside "My Progress".
//
// 2026-08-21: card entrance (nmpa-anim-fade-up) + DomainBreakdownChart's own
// per-row/bar-grow entrance (see that file) -- motion pass only, not i18n.
export default function DomainsSection({ self }) {
  if (!self) return null;
  const { domainBreakdown, pendingDomains } = self;

  return (
    <div className="nmpa-section">
      <section className="nmpa-card nmpa-anim-fade-up" style={{ '--nmpa-anim-delay': '0ms' }}>
        <div className="nmpa-section-icon-badge"><SectionIcon id="domains" /></div>
        <p className="nmpa-eyebrow">Domain Breakdown</p>
        <h2 className="nmpa-card__title">Score by cognitive domain</h2>
        <p className="nmpa-muted">How you're tracking across each domain the Detection Assessment measures.</p>
        <DomainBreakdownChart domains={domainBreakdown} pendingDomains={pendingDomains} />
      </section>
    </div>
  );
}
