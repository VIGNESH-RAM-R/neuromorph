import { useMemo, useState, useCallback } from 'react';
import { MOCK_PATIENTS } from '../data/mockPatients.js';
import { PatientListModel } from '../engines/PatientListModel.js';

// Orchestrates the triage/list screen: builds rows via PatientListModel,
// holds only UI-transient state (search text, sort mode, filter toggles),
// and hands the derived, filtered/sorted rows to the view. All actual
// banding/trend/risk logic lives in the engines, never here.
//
// `patients` defaults to the mock dataset so this hook (and anything that
// calls it directly) keeps working unchanged -- App.jsx normally passes the
// real+mock merged list from usePatientDirectory().
export function usePatientList(patients = MOCK_PATIENTS) {
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('riskFirst');
  const [bandFilter, setBandFilter] = useState(null);
  const [riskOnly, setRiskOnly] = useState(false);
  const [overdueOnly, setOverdueOnly] = useState(false);

  const allRows = useMemo(() => PatientListModel.buildList(patients), [patients]);

  const rows = useMemo(() => {
    const filtered = PatientListModel.filter(allRows, { query, band: bandFilter, riskOnly, overdueOnly });
    return PatientListModel.sort(filtered, sortBy);
  }, [allRows, query, bandFilter, riskOnly, overdueOnly, sortBy]);

  const counts = useMemo(() => ({
    total: allRows.length,
    flagged: allRows.filter((r) => r.riskFlagged).length,
    overdue: allRows.filter((r) => r.overdue).length,
  }), [allRows]);

  const resetFilters = useCallback(() => {
    setQuery('');
    setBandFilter(null);
    setRiskOnly(false);
    setOverdueOnly(false);
  }, []);

  return {
    rows,
    counts,
    query,
    setQuery,
    sortBy,
    setSortBy,
    bandFilter,
    setBandFilter,
    riskOnly,
    setRiskOnly,
    overdueOnly,
    setOverdueOnly,
    resetFilters,
  };
}
