import { DEFAULT_LANGUAGE } from '../../config/i18nConfig.js';
import { t, format } from '../../i18n/strings/patients.js';

export default function FilterSortBar({
  query, setQuery, sortBy, setSortBy, riskOnly, setRiskOnly, overdueOnly, setOverdueOnly, counts,
  language = DEFAULT_LANGUAGE,
}) {
  return (
    <div className="nmdd-filterbar">
      <input
        type="search"
        className="nmdd-input"
        placeholder={t(language, 'searchPlaceholder')}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label={t(language, 'searchAriaLabel')}
      />
      <select className="nmdd-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)} aria-label={t(language, 'sortAriaLabel')}>
        <option value="riskFirst">{t(language, 'sortRiskFirst')}</option>
        <option value="recent">{t(language, 'sortRecent')}</option>
        <option value="overdue">{t(language, 'sortOverdue')}</option>
        <option value="name">{t(language, 'sortName')}</option>
      </select>
      <label className="nmdd-checkbox">
        <input type="checkbox" checked={riskOnly} onChange={(e) => setRiskOnly(e.target.checked)} />
        {format(t(language, 'flaggedOnly'), { count: counts.flagged })}
      </label>
      <label className="nmdd-checkbox">
        <input type="checkbox" checked={overdueOnly} onChange={(e) => setOverdueOnly(e.target.checked)} />
        {format(t(language, 'overdueOnly'), { count: counts.overdue })}
      </label>
    </div>
  );
}
