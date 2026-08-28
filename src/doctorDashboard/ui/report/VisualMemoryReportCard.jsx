import SectionCard from '../shared/SectionCard.jsx';
import StatusBadge from '../shared/StatusBadge.jsx';
import ScoreBar from '../shared/ScoreBar.jsx';
import { DEFAULT_LANGUAGE } from '../../config/i18nConfig.js';
import { t } from '../../i18n/strings/report.js';

// visualMemory.interpretation is always exactly
// BAND_INTERPRETATION_TEMPLATES[band] (real bands) or the fixed
// "not yet measured" sentence (band === 'Not Measured') -- see
// interpretOrNotMeasured() in ReportModel.js. Same 1:1 band->key precedent
// as DomainCard.jsx / LobeCard.jsx.
const BAND_INTERPRETATION_KEY = {
  Excellent: 'bandInterpretationExcellent',
  Normal: 'bandInterpretationNormal',
  'Mildly Reduced': 'bandInterpretationMildlyReduced',
  Reduced: 'bandInterpretationReduced',
  'Not Measured': 'measureNotMeasuredInterpretation',
};

export default function VisualMemoryReportCard({ visualMemory, language = DEFAULT_LANGUAGE }) {
  const interpretation = visualMemory.band && BAND_INTERPRETATION_KEY[visualMemory.band]
    ? t(language, BAND_INTERPRETATION_KEY[visualMemory.band])
    : visualMemory.interpretation;
  return (
    <SectionCard
      title={t(language, 'visualMemoryTitle')}
      subtitle={t(language, 'visualMemorySubtitle')}
      actions={<StatusBadge band={visualMemory.band} language={language} />}
    >
      <div className="nmdd-subscore-list">
        {visualMemory.subscores.map((s) => (
          <ScoreBar key={s.key} label={s.label} score={s.score} band={s.band} />
        ))}
      </div>
      <p className="nmdd-card__footnote">{interpretation}</p>
    </SectionCard>
  );
}
