import { useEffect, useMemo, useState, useCallback } from 'react';
import { MOCK_PATIENTS } from '../data/mockPatients.js';
import { FirestorePatientService } from '../services/FirestorePatientService.js';
import { isFirebaseConfigured } from '../config/firebaseConfig.js';

// Top-level data source for the whole dashboard: fetches real patients from
// Firestore once (per signed-in session) and merges them with the existing
// mock/demo patients, rather than replacing them -- MOCK_PATIENTS stays a
// reliable, always-populated demo/fallback dataset even on a fresh Firebase
// project with zero real patients yet. Real patients are listed first
// (isRealPatient: true) since that's what a doctor actually came here for.
export function usePatientDirectory(canLoad, doctorUid) {
  const [realPatients, setRealPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    if (!isFirebaseConfigured || !canLoad || !doctorUid) return;
    setIsLoading(true);
    setError(null);
    try {
      const records = await FirestorePatientService.listPatientRecords(doctorUid);
      setRealPatients(records);
    } catch (err) {
      setError(err?.message || 'Could not load real patients from Firestore.');
    } finally {
      setIsLoading(false);
    }
  }, [canLoad, doctorUid]);

  useEffect(() => {
    reload();
  }, [reload]);

  const patients = useMemo(() => [...realPatients, ...MOCK_PATIENTS], [realPatients]);

  return { patients, isLoadingRealPatients: isLoading, realPatientsError: error, realPatientCount: realPatients.length, reload };
}
