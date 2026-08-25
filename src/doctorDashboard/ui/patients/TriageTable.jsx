import TriageRow from './TriageRow.jsx';
import EmptyState from '../shared/EmptyState.jsx';
import { DEFAULT_LANGUAGE } from '../../config/i18nConfig.js';
import { t } from '../../i18n/strings/patients.js';

export default function TriageTable({ rows, onOpen, language = DEFAULT_LANGUAGE }) {
  if (rows.length === 0) {
    return <EmptyState title={t(language, 'emptyTitle')} message={t(language, 'emptyMessage')} />;
  }
  return (
    <table className="nmdd-table">
      <thead>
        <tr>
          <th>{t(language, 'tableHeaderPatient')}</th>
          <th>{t(language, 'tableHeaderBand')}</th>
          <th>{t(language, 'tableHeaderScore')}</th>
          <th>{t(language, 'tableHeaderTrend')}</th>
          <th>{t(language, 'tableHeaderLastAssessment')}</th>
          <th>{t(language, 'tableHeaderAdherence')}</th>
          <th>{t(language, 'tableHeaderFlags')}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <TriageRow key={row.patientId} row={row} onOpen={onOpen} language={language} />
        ))}
      </tbody>
    </table>
  );
}
