import StatusBadge from '../shared/StatusBadge.jsx';
import { DEFAULT_LANGUAGE } from '../../config/i18nConfig.js';
import { t } from '../../i18n/strings/report.js';

// lobe.label / lobe.primaryFunctions / lobe.contributingTasks are data from
// lobarConfig.js (report-model output, same precedent as DomainCard.jsx's
// domain.label) -- they stay as-is. lobe.explanation, however, is always
// exactly BAND_INTERPRETATION_TEMPLATES[band] (see InterpretationEngine.js),
// a 1:1 function of `band`, so it's safe -- and necessary for real i18n
// coverage -- to translate it via this local band->key map instead of
// rendering the raw English sentence.
const BAND_INTERPRETATION_KEY = {
  Excellent: 'bandInterpretationExcellent',
  Normal: 'bandInterpretationNormal',
  'Mildly Reduced': 'bandInterpretationMildlyReduced',
  Reduced: 'bandInterpretationReduced',
};

export default function LobeCard({ lobe, language = DEFAULT_LANGUAGE }) {
  const explanation = lobe.band && BAND_INTERPRETATION_KEY[lobe.band]
    ? t(language, BAND_INTERPRETATION_KEY[lobe.band])
    : lobe.explanation;
  return (
    <div className="nmdd-lobecard">
      <div className="nmdd-lobecard__header">
        <h3 className="nmdd-lobecard__title">{lobe.label}</h3>
        <StatusBadge band={lobe.band} size="sm" language={language} />
      </div>
      <div className="nmdd-lobecard__score">{lobe.score ?? '—'}</div>
      <div className="nmdd-lobecard__section">
        <span className="nmdd-kv__label">{t(language, 'primaryFunctionsLabel')}</span>
        <ul className="nmdd-taglist">
          {lobe.primaryFunctions.map((f) => <li key={f} className="nmdd-tag nmdd-tag--muted">{f}</li>)}
        </ul>
      </div>
      <div className="nmdd-lobecard__section">
        <span className="nmdd-kv__label">{t(language, 'contributingTasksLabel')}</span>
        {lobe.contributingTasks.length > 0 ? (
          <ul className="nmdd-tasklist">
            {lobe.contributingTasks.map((task) => <li key={task}>{task}</li>)}
          </ul>
        ) : (
          <p className="nmdd-muted">{t(language, 'lobeNoTasksAdministered')}</p>
        )}
      </div>
      <p className="nmdd-lobecard__explanation">{explanation}</p>
    </div>
  );
}
