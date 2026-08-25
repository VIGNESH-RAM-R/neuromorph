import { usePatientList } from '../../hooks/usePatientList.js';
import FilterSortBar from './FilterSortBar.jsx';
import TriageTable from './TriageTable.jsx';
import SectionCard from '../shared/SectionCard.jsx';
import { DEFAULT_LANGUAGE } from '../../config/i18nConfig.js';
import { t, format } from '../../i18n/strings/patients.js';

export default function PatientListScreen({ onOpenPatient, patients, language = DEFAULT_LANGUAGE }) {
  const list = usePatientList(patients);

  return (
    <SectionCard
      title={t(language, 'listTitle')}
      subtitle={format(t(language, 'listSubtitle'), {
        total: list.counts.total,
        flagged: list.counts.flagged,
        overdue: list.counts.overdue,
      })}
    >
      <FilterSortBar
        query={list.query}
        setQuery={list.setQuery}
        sortBy={list.sortBy}
        setSortBy={list.setSortBy}
        riskOnly={list.riskOnly}
        setRiskOnly={list.setRiskOnly}
        overdueOnly={list.overdueOnly}
        setOverdueOnly={list.setOverdueOnly}
        counts={list.counts}
        language={language}
      />
      <TriageTable rows={list.rows} onOpen={onOpenPatient} language={language} />
    </SectionCard>
  );
}
