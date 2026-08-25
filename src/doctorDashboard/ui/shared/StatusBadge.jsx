import { DEFAULT_LANGUAGE } from '../../config/i18nConfig.js';
import { t } from '../../i18n/strings/patients.js';

const BAND_CLASS = {
  Excellent: 'nmdd-badge--excellent',
  Normal: 'nmdd-badge--normal',
  'Mildly Reduced': 'nmdd-badge--mild',
  Reduced: 'nmdd-badge--reduced',
  'Slightly Reduced': 'nmdd-badge--mild',
  'Not Measured': 'nmdd-badge--neutral',
};

// The English `band` values above (Excellent/Normal/etc., from
// scoringBands.js) stay untouched -- they're what BAND_CLASS keys off, and
// what the rest of the codebase (Doctor_Dashboard's engines, app_page's
// scoringBands.js) compares against. Only the ON-SCREEN label is
// translated, via this local map, same precedent as app_page's
// AssessmentComplete.jsx BAND_LABEL_KEY (see PROGRESS.md, 2026-08-20 04:34
// entry).
const BAND_LABEL_KEY = {
  Excellent: 'bandExcellent',
  Normal: 'bandNormal',
  'Mildly Reduced': 'bandMildlyReduced',
  Reduced: 'bandReduced',
  'Slightly Reduced': 'bandSlightlyReduced',
  'Not Measured': 'bandNotMeasured',
};

export default function StatusBadge({ band, size = 'md', language = DEFAULT_LANGUAGE }) {
  const cls = BAND_CLASS[band] || 'nmdd-badge--neutral';
  const label = band && BAND_LABEL_KEY[band] ? t(language, BAND_LABEL_KEY[band]) : t(language, 'bandNoData');
  return (
    <span className={`nmdd-badge ${cls} nmdd-badge--${size}`}>
      {label}
    </span>
  );
}
