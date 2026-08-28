import DomainBreakdownChart from '../charts/DomainBreakdownChart.jsx';
import SectionIcon from '../common/SectionIcon.jsx';
import { DEFAULT_LANGUAGE } from '../../config/i18nConfig.js';
import { t } from '../../i18n/strings/dashboard.js';

// Split out of the old, over-bundled ProgressSection.jsx (2026-08-18) --
// same real DomainBreakdownChart and data, just its own top-level section
// instead of one card buried inside "My Progress".
//
// 2026-08-21: card entrance (nmpa-anim-fade-up) + DomainBreakdownChart's own
// per-row/bar-grow entrance (see that file) -- motion pass only, not i18n.
//
// 2026-08-26: full i18n pass (see src/i18n/strings/dashboard.js). Domain
// names/descriptions (DOMAIN_LABELS/DOMAIN_SHORT_DESCRIPTIONS from
// domainInsightConfig.js) stay English -- same "don't translate task/domain
// proper names" scope decision already applied on the Doctor Dashboard.
export default function DomainsSection({ self, language = DEFAULT_LANGUAGE }) {
  if (!self) return null;
  const { domainBreakdown, pendingDomains } = self;

  return (
    <div className="nmpa-section">
      <section className="nmpa-card nmpa-anim-fade-up" style={{ '--nmpa-anim-delay': '0ms' }}>
        <div className="nmpa-section-icon-badge"><SectionIcon id="domains" /></div>
        <p className="nmpa-eyebrow">{t(language, 'domainBreakdownEyebrow')}</p>
        <h2 className="nmpa-card__title">{t(language, 'scoreByDomainTitle')}</h2>
        <p className="nmpa-muted">{t(language, 'domainBreakdownSubtitle')}</p>
        <DomainBreakdownChart domains={domainBreakdown} pendingDomains={pendingDomains} language={language} />
      </section>
    </div>
  );
}
