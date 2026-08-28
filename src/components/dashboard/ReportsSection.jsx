// Split out of the old, over-bundled ProgressSection.jsx (2026-08-18) --
// the "Download Monthly Report" action gets its own top-level section
// instead of one button buried at the top of "My Progress".
//
// 2026-08-21: card entrance (nmpa-anim-fade-up) -- a single, static card
// with a button doesn't invite anything beyond that (no big number, no
// progress-toward-a-goal), per OVERNIGHT_PLAN.md's restraint guidance.
//
// 2026-08-26: full i18n pass (see src/i18n/strings/dashboard.js).
import SectionIcon from '../common/SectionIcon.jsx';
import CareTeamSection from './CareTeamSection.jsx';
import { DEFAULT_LANGUAGE } from '../../config/i18nConfig.js';
import { t } from '../../i18n/strings/dashboard.js';

export default function ReportsSection({ self, onDownloadReport, currentUser, language = DEFAULT_LANGUAGE }) {
  if (!self) return null;

  return (
    <div className="nmpa-section">
      {/* 2026-08-27 (VR): doctor search moved to the TOP of Reports --
          "i need that at top" -- so a patient/caregiver sees "find your
          doctor" before the download-report action, not after it. */}
      <CareTeamSection patientId={currentUser?.uid} patientName={currentUser?.name} language={language} />

      <section className="nmpa-card nmpa-anim-fade-up" style={{ '--nmpa-anim-delay': '90ms' }}>
        <div className="nmpa-section-icon-badge"><SectionIcon id="reports" /></div>
        <h2 className="nmpa-card__title">{t(language, 'reportsTitle')}</h2>
        <p className="nmpa-muted">
          {t(language, 'reportsDescription')}
        </p>
        <button type="button" className="nmpa-button nmpa-button--primary" onClick={onDownloadReport}>
          {t(language, 'downloadReportButton')}
        </button>
        <p className="nmpa-muted nmpa-muted--sm" style={{ marginTop: 10 }}>
          {t(language, 'saveAsPdfCaption')}
        </p>
      </section>
    </div>
  );
}
