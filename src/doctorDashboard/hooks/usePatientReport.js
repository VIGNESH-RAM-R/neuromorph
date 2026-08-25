import { useCallback, useMemo, useState } from 'react';
import { MOCK_PATIENTS } from '../data/mockPatients.js';
import { ReportModel } from '../engines/ReportModel.js';
import { FirestorePatientService } from '../services/FirestorePatientService.js';

function findPatient(patients, patientId) {
  return patients.find((p) => p.patientId === patientId);
}

// Orchestrates the single-patient report screen (the 30-60 second read).
// Owns: which patient is selected, the clinician notes, and the print/export
// trigger. Everything else is ReportModel.build() output, recomputed
// whenever notes change so a newly-added note is reflected immediately
// without a page reload.
//
// `patients` defaults to the mock dataset (see usePatientList.js) -- App.jsx
// normally passes the real+mock merged list from usePatientDirectory().
// `currentUser` is the signed-in doctor (see useDoctorAuth.js), used to
// attribute real notes to a real author (`authorUid`/`authorName`).
//
// 2026-08-20: real (Firestore-sourced) patients now persist notes for real
// (see FirestorePatientService.addDoctorNote/listDoctorNotes and
// app_page/firestore.rules' new doctorNotes rule) -- but that write can
// still fail (rule not deployed yet on this project, network error, etc.),
// so this hook exposes `isSavingNote`/`noteError` and never pretends a
// failed save succeeded. Mock/demo patients (isRealPatient falsy) keep the
// original in-memory-only behavior, since there is no backend for them.
export function usePatientReport(initialPatientId, patients = MOCK_PATIENTS, currentUser = null) {
  const [patientId, setPatientId] = useState(initialPatientId || null);
  const [notesVersion, setNotesVersion] = useState(0); // bump to force report rebuild after a note edit
  const [isPrinting, setIsPrinting] = useState(false);
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [noteError, setNoteError] = useState(null);

  const patient = useMemo(() => (patientId ? findPatient(patients, patientId) : undefined), [patients, patientId]);

  const report = useMemo(() => {
    if (!patient) return null;
    return ReportModel.build(patient);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patient, notesVersion]);

  const addClinicalNote = useCallback(async (text) => {
    if (!patient || !text || !text.trim()) return;
    const trimmed = text.trim();
    setNoteError(null);

    if (patient.isRealPatient) {
      setIsSavingNote(true);
      try {
        const savedNote = await FirestorePatientService.addDoctorNote(
          patient.patientId,
          trimmed,
          currentUser?.uid,
          currentUser?.name,
        );
        patient.notes = patient.notes || [];
        patient.notes.push(savedNote);
        setNotesVersion((v) => v + 1);
      } catch (err) {
        // Honest failure, never a fake success: the note is NOT added to
        // patient.notes/report.clinicalNotes when this happens.
        setNoteError(
          err?.code === 'permission-denied'
            ? 'Could not save this note: the Firestore security rules for doctor notes have not been deployed to this project yet.'
            : (err?.message || 'Could not save this note. Please try again.'),
        );
      } finally {
        setIsSavingNote(false);
      }
      return;
    }

    // Mock/demo patients: unchanged from before this integration -- no
    // backend exists for them, so this stays in-memory only.
    patient.notes = patient.notes || [];
    patient.notes.push({
      id: `n${Date.now()}`,
      author: currentUser?.name || 'Attending Clinician',
      timestamp: new Date().toISOString(),
      text: trimmed,
    });
    setNotesVersion((v) => v + 1);
  }, [patient, currentUser]);

  const selectPatient = useCallback((id) => {
    setPatientId(id);
    setNoteError(null);
  }, []);

  const exportPdf = useCallback(() => {
    // Sandbox-realistic PDF export: a print-optimized stylesheet renders a
    // clean, paginated clinical report, and the browser's native
    // "Save as PDF" print destination produces the file. See README for
    // the documented jsPDF/pdf-lib server-side path for a production build.
    setIsPrinting(true);
    requestAnimationFrame(() => {
      window.print();
      setIsPrinting(false);
    });
  }, []);

  return {
    patientId,
    patient,
    report,
    selectPatient,
    addClinicalNote,
    isSavingNote,
    noteError,
    exportPdf,
    isPrinting,
  };
}
