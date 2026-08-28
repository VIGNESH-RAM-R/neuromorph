import ClinicalInsights from '../charts/ClinicalInsights.jsx';
import SectionIcon from '../common/SectionIcon.jsx';
import { DEFAULT_LANGUAGE } from '../../config/i18nConfig.js';
import { t } from '../../i18n/strings/dashboard.js';

// Split out of the old, over-bundled ProgressSection.jsx (2026-08-18) --
// same real ClinicalInsights engine output, just its own top-level section.
//
// 2026-08-21: card entrance (nmpa-anim-fade-up) + per-insight-item stagger
// inside ClinicalInsights.jsx itself (see that file).
//
// 2026-08-26: full i18n pass (see src/i18n/strings/dashboard.js).
export default function InsightsSection({ self, language = DEFAULT_LANGUAGE }) {
  if (!self) return null;
  const { clinicalInsights } = self;

  return (
    <div className="nmpa-section">
      <section className="nmpa-card nmpa-anim-fade-up" style={{ '--nmpa-anim-delay': '0ms' }}>
        <div className="nmpa-section-icon-badge"><SectionIcon id="insights" /></div>
        <p className="nmpa-eyebrow">{t(language, 'clinicalInsightsEyebrow')}</p>
        <h2 className="nmpa-card__title">{t(language, 'whatsChangedTitle')}</h2>
        <ClinicalInsights insights={clinicalInsights} language={language} />
      </section>
    </div>
  );
}
