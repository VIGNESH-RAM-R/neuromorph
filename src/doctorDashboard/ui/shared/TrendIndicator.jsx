import { DEFAULT_LANGUAGE } from '../../config/i18nConfig.js';
import { t } from '../../i18n/strings/patients.js';

const TREND_META = {
  improving: { symbol: '↑', labelKey: 'trendImproving', cls: 'nmdd-trend--up' },
  declining: { symbol: '↓', labelKey: 'trendDeclining', cls: 'nmdd-trend--down' },
  stable: { symbol: '→', labelKey: 'trendStable', cls: 'nmdd-trend--flat' },
  volatile: { symbol: '↕', labelKey: 'trendVolatile', cls: 'nmdd-trend--volatile' },
  'insufficient-data': { symbol: '–', labelKey: 'trendInsufficientData', cls: 'nmdd-trend--neutral' },
};

// Same display-only-translation precedent as StatusBadge.jsx: the `trend`
// prop values (improving/declining/stable/volatile/insufficient-data) stay
// untouched English identifiers (TrendAnalysisEngine.js output, used for
// CSS-class matching); only the on-screen label changes per language.
export default function TrendIndicator({ trend, delta, showDelta = true, language = DEFAULT_LANGUAGE }) {
  const meta = TREND_META[trend] || TREND_META['insufficient-data'];
  const label = t(language, meta.labelKey);
  return (
    <span className={`nmdd-trend ${meta.cls}`} title={label}>
      <span aria-hidden="true">{meta.symbol}</span>
      <span className="nmdd-trend__label">{label}</span>
      {showDelta && typeof delta === 'number' && (
        <span className="nmdd-trend__delta">({delta > 0 ? '+' : ''}{delta})</span>
      )}
    </span>
  );
}
