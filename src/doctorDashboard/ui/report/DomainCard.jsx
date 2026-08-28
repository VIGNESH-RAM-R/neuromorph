import StatusBadge from '../shared/StatusBadge.jsx';
import { DEFAULT_LANGUAGE } from '../../config/i18nConfig.js';
import { t } from '../../i18n/strings/report.js';

// 2026-08-26: now forwards `language` to StatusBadge -- previously this
// never passed language down at all, so the band badge silently rendered
// in English on the report screen no matter what language a doctor had
// selected (StatusBadge defaults to DEFAULT_LANGUAGE when the prop is
// missing). domain.label stays as-is (data from the report model, same
// precedent as LobeCard.jsx's lobe.label). domain.interpretation, however,
// is always exactly BAND_INTERPRETATION_TEMPLATES[domain.band] (see
// InterpretationEngine.js) -- a 1:1 function of `band` -- so it's translated
// below via the same band->key lookup used in LobeCard.jsx, instead of
// rendering the raw English sentence.
const BAND_INTERPRETATION_KEY = {
  Excellent: 'bandInterpretationExcellent',
  Normal: 'bandInterpretationNormal',
  'Mildly Reduced': 'bandInterpretationMildlyReduced',
  Reduced: 'bandInterpretationReduced',
};

export default function DomainCard({ domain, language = DEFAULT_LANGUAGE }) {
  const interpretation = domain.band && BAND_INTERPRETATION_KEY[domain.band]
    ? t(language, BAND_INTERPRETATION_KEY[domain.band])
    : domain.interpretation;
  return (
    <div className="nmdd-domaincard">
      <div className="nmdd-domaincard__header">
        <span className="nmdd-domaincard__label">{domain.label}</span>
        <StatusBadge band={domain.band} size="sm" language={language} />
      </div>
      <div className="nmdd-domaincard__score">{domain.score ?? '—'}</div>
      <p className="nmdd-domaincard__interpretation">{interpretation}</p>
    </div>
  );
}
