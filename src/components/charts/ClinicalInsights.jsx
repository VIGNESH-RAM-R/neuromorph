import { DEFAULT_LANGUAGE } from '../../config/i18nConfig.js';
import { t, format } from '../../i18n/strings/dashboard.js';

// The English `band` values below stay untouched -- same precedent as
// DomainBreakdownChart.jsx and StatusBadge.jsx (Doctor Dashboard). Only
// the on-screen label/interpretation sentence is translated.
const BAND_LABEL_KEY = {
  Excellent: 'insightBandExcellent',
  Normal: 'insightBandNormal',
  'Mildly Reduced': 'insightBandMildlyReduced',
  Reduced: 'insightBandReduced',
};
const BAND_INTERPRETATION_KEY = {
  Excellent: 'bandInterpretationExcellent',
  Normal: 'bandInterpretationNormal',
  'Mildly Reduced': 'bandInterpretationMildlyReduced',
  Reduced: 'bandInterpretationReduced',
};

// 2026-08-26: renders each DomainInsightEngine.insights() item from its
// structured textKey/label/pct/band fields (see that file's comment) via
// t()/format() instead of the engine's pre-composed English `text` --
// same "engine returns structured data, UI translates it" split as
// RiskAlertEngine.reasonEntries on the Doctor Dashboard. Falls back to the
// raw `text` if an item somehow has no textKey (defensive, shouldn't happen).
function renderItemText(item, language) {
  if (item.textKey === 'insightDeclineText') {
    return format(t(language, 'insightDeclineText'), {
      label: item.label,
      pct: item.pct,
      interpretation: t(language, BAND_INTERPRETATION_KEY[item.band]),
    });
  }
  if (item.textKey === 'insightImproveText') {
    return format(t(language, 'insightImproveText'), { label: item.label, pct: item.pct });
  }
  if (item.textKey === 'insightBandText') {
    return format(t(language, 'insightBandText'), {
      label: item.label,
      bandLabel: t(language, BAND_LABEL_KEY[item.band]),
      interpretation: t(language, BAND_INTERPRETATION_KEY[item.band]),
    });
  }
  return item.text;
}

// Plain-language, non-diagnostic callouts derived from DomainInsightEngine
// -- notable declines/improvements and low-band domains. Always non-empty:
// even with nothing to flag, it says so explicitly rather than rendering
// blank (a blank card reads as broken, not as "everything's fine").
//
// 2026-08-21: each flagged item fades/rises in with a slight stagger (same
// nmpa-anim-fade-up pattern as everywhere else), including the "all clear"
// state -- it's still a real piece of content appearing, not a static label.
//
// 2026-08-26: full i18n pass (see src/i18n/strings/dashboard.js and
// DomainInsightEngine.js's insights() restructuring comment).
export default function ClinicalInsights({ insights, language = DEFAULT_LANGUAGE }) {
  const items = insights?.items || [];
  return (
    <div className="nmpa-insights">
      {items.length === 0 ? (
        <div className="nmpa-alert nmpa-alert--info nmpa-anim-fade-up" style={{ '--nmpa-anim-delay': '0ms' }}>
          <span>{t(language, 'noNotableChanges')}</span>
        </div>
      ) : (
        items.map((item, i) => (
          <div key={i} className={`nmpa-alert nmpa-alert--${item.level} nmpa-anim-fade-up`} style={{ '--nmpa-anim-delay': `${i * 70}ms` }}>
            <span>{renderItemText(item, language)}</span>
          </div>
        ))
      )}
      <p className="nmpa-muted nmpa-muted--sm nmpa-insights__disclaimer">{insights?.disclaimer ? t(language, 'nonDiagnosticDisclaimer') : ''}</p>
    </div>
  );
}
