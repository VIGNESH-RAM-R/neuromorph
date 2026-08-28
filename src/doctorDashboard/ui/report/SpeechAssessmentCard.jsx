import SectionCard from '../shared/SectionCard.jsx';
import StatusBadge from '../shared/StatusBadge.jsx';
import { DEFAULT_LANGUAGE } from '../../config/i18nConfig.js';
import { t } from '../../i18n/strings/report.js';

// speech metrics use their own 3-tier band system (Normal/Slightly
// Reduced/Reduced, or 'Not Measured') -- see speechInterpretOrNotMeasured()
// in ReportModel.js -- so this gets its own band->key map, separate from
// the general 4-tier one used elsewhere in this folder.
const SPEECH_BAND_INTERPRETATION_KEY = {
  Normal: 'speechBandInterpretationNormal',
  'Slightly Reduced': 'speechBandInterpretationSlightlyReduced',
  Reduced: 'speechBandInterpretationReduced',
  'Not Measured': 'measureNotMeasuredInterpretation',
};

export default function SpeechAssessmentCard({ speech, language = DEFAULT_LANGUAGE }) {
  return (
    <SectionCard title={t(language, 'speechAssessmentTitle')} actions={<StatusBadge band={speech.overallBand} language={language} />}>
      <div className="nmdd-speech-grid">
        {speech.metrics.map((m) => {
          const interpretation = m.band && SPEECH_BAND_INTERPRETATION_KEY[m.band]
            ? t(language, SPEECH_BAND_INTERPRETATION_KEY[m.band])
            : m.interpretation;
          return (
            <div key={m.key} className="nmdd-speech-metric">
              <div className="nmdd-speech-metric__header">
                <span>{m.label}</span>
                <StatusBadge band={m.band} size="sm" language={language} />
              </div>
              <p className="nmdd-muted">{interpretation}</p>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}
