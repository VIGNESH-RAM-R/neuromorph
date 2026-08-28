import SectionCard from '../shared/SectionCard.jsx';
import { DEFAULT_LANGUAGE } from '../../config/i18nConfig.js';
import { t } from '../../i18n/strings/report.js';
import { t as tPatients } from '../../i18n/strings/patients.js';

// Same BAND_LABEL_KEY precedent as StatusBadge.jsx -- overallBand is shown
// here as inline prose (not a badge), so it's localized the same way.
const BAND_LABEL_KEY = {
  Excellent: 'bandExcellent',
  Normal: 'bandNormal',
  'Mildly Reduced': 'bandMildlyReduced',
  Reduced: 'bandReduced',
  'Slightly Reduced': 'bandSlightlyReduced',
  'Not Measured': 'bandNotMeasured',
};

// caregiverConcern is always one of CaregiverConcordanceEngine's 3 fixed
// values (Low/Moderate/High) -- closed vocabulary, safe to localize by key.
const CONCERN_LABEL_KEY = { Low: 'concernLow', Moderate: 'concernModerate', High: 'concernHigh' };

export default function CaregiverConcordancePanel({ caregiverConcordance, language = DEFAULT_LANGUAGE }) {
  if (!caregiverConcordance?.evaluated) return null;
  const bandLabel = BAND_LABEL_KEY[caregiverConcordance.overallBand]
    ? tPatients(language, BAND_LABEL_KEY[caregiverConcordance.overallBand])
    : caregiverConcordance.overallBand;
  const concernLabel = CONCERN_LABEL_KEY[caregiverConcordance.caregiverConcern]
    ? t(language, CONCERN_LABEL_KEY[caregiverConcordance.caregiverConcern])
    : caregiverConcordance.caregiverConcern;
  const note = t(language, caregiverConcordance.discordant ? 'concordanceNoteDiscordant' : 'concordanceNoteConsistent');
  return (
    <SectionCard title={t(language, 'selfVsCaregiverTitle')}>
      <div className={`nmdd-alert ${caregiverConcordance.discordant ? 'nmdd-alert--warn' : 'nmdd-alert--info'}`}>
        <p><strong>{t(language, 'caregiverReportedConcernLabel')}</strong> {concernLabel}</p>
        <p><strong>{t(language, 'taskBasedPerformanceBandLabel')}</strong> {bandLabel}</p>
        <p>{note}</p>
      </div>
    </SectionCard>
  );
}
