import { useEffect, useState } from 'react';
import { FirestoreCaregiverService } from '../../services/FirestoreCaregiverService.js';

// 2026-08-25 ADDITION -- pulled out of CaregiverResponsesPanel.jsx so the
// same caregiver-lookup-by-patient read can also feed PrintableReport.jsx
// (VR: "visit the patients and the caregiver responses in the same pdf").
// Same access note as that panel: FirestoreCaregiverService.
// getCaregiverForPatient requires the signed-in doctor to have an ACCEPTED
// careRelationship with this exact patient (enforced in firestore.rules) --
// a doctor who isn't accepted yet gets a real permission-denied, surfaced
// via `error`, not silently swallowed.
export function useCaregiverResponses(patientId) {
  const [state, setState] = useState({ status: 'loading', caregiver: null, error: null });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!patientId) return;
      setState({ status: 'loading', caregiver: null, error: null });
      try {
        const caregiver = await FirestoreCaregiverService.getCaregiverForPatient(patientId);
        if (cancelled) return;
        setState({ status: 'ready', caregiver, error: null });
      } catch (err) {
        if (cancelled) return;
        const message = err?.code === 'permission-denied'
          ? 'Caregiver responses are unavailable: this account is not yet linked to this patient, or the relevant Firestore security rule has not been deployed.'
          : (err?.message || 'Could not load caregiver responses.');
        setState({ status: 'error', caregiver: null, error: message });
      }
    }
    load();
    return () => { cancelled = true; };
  }, [patientId]);

  return state;
}
