import SectionCard from '../shared/SectionCard.jsx';
import StatusBadge from '../shared/StatusBadge.jsx';
import TrendIndicator from '../shared/TrendIndicator.jsx';
import { DEFAULT_LANGUAGE } from '../../config/i18nConfig.js';
import { t, format } from '../../i18n/strings/report.js';
import { t as tPatients } from '../../i18n/strings/patients.js';

// overallCognitive.band is always one of the 4 real bands here (never 'Not
// Measured' -- InterpretationEngine.interpret() is called directly on
// latestSession.overallRawScore in ReportModel.js, and bandFromScore()
// falls back to 'Reduced' rather than 'Not Measured' for a non-number).
const BAND_INTERPRETATION_KEY = {
  Excellent: 'bandInterpretationExcellent',
  Normal: 'bandInterpretationNormal',
  'Mildly Reduced': 'bandInterpretationMildlyReduced',
  Reduced: 'bandInterpretationReduced',
};

// Same BAND_LABEL_KEY precedent as StatusBadge.jsx -- used here to localize
// the band NAMES quoted inline inside the risk-reason sentence below
// (e.g. "moved from Normal to Reduced"), not to render a badge.
const BAND_LABEL_KEY = {
  Excellent: 'bandExcellent',
  Normal: 'bandNormal',
  'Mildly Reduced': 'bandMildlyReduced',
  Reduced: 'bandReduced',
  'Slightly Reduced': 'bandSlightlyReduced',
  'Not Measured': 'bandNotMeasured',
};

// riskAlert.reasonEntries -- { key, values } pairs -- come from
// RiskAlertEngine.js (2026-08-26: added alongside the raw English `reasons`
// specifically so this banner can render a translated sentence instead of
// the hardcoded English one). `domain` values are raw domainScoresRaw keys,
// same data-value precedent as elsewhere in this folder -- left untouched.
// `previousBand`/`latestBand` are translated below via BAND_LABEL_KEY since
// they appear as prose inside the sentence, not as a badge.
function renderReason(entry, language) {
  const values = { ...entry.values };
  if (entry.key === 'riskReasonBandDowngraded') {
    values.previousBand = BAND_LABEL_KEY[values.previousBand] ? tPatients(language, BAND_LABEL_KEY[values.previousBand]) : values.previousBand;
    values.latestBand = BAND_LABEL_KEY[values.latestBand] ? tPatients(language, BAND_LABEL_KEY[values.latestBand]) : values.latestBand;
  }
  return format(t(language, entry.key), values);
}

export default function OverallCognitiveSummaryCard({ report, language = DEFAULT_LANGUAGE }) {
  const { overallCognitive, trend, riskAlert } = report;
  const interpretation = overallCognitive.band && BAND_INTERPRETATION_KEY[overallCognitive.band]
    ? t(language, BAND_INTERPRETATION_KEY[overallCognitive.band])
    : overallCognitive.interpretation;
  const reasonEntries = riskAlert.reasonEntries || [];
  return (
    <SectionCard className="nmdd-summary-card">
      <div className="nmdd-summary-card__main">
        <div className="nmdd-summary-card__score">{overallCognitive.score ?? '—'}</div>
        <div className="nmdd-summary-card__meta">
          <StatusBadge band={overallCognitive.band} size="lg" language={language} />
          <TrendIndicator trend={trend.overall.trend} delta={trend.overall.delta} language={language} />
        </div>
      </div>
      <p className="nmdd-summary-card__interpretation">{interpretation}</p>
      {riskAlert.flagged && (
        <div className="nmdd-alert nmdd-alert--danger">
          <strong>{t(language, 'clinicianAttentionFlagged')}</strong>
          <ul>
            {reasonEntries.length > 0
              ? reasonEntries.map((entry, i) => <li key={i}>{renderReason(entry, language)}</li>)
              : riskAlert.reasons.map((r) => <li key={r}>{r}</li>)}
          </ul>
        </div>
      )}
    </SectionCard>
  );
}
