import { collection, doc, getDoc, getDocs, addDoc, query, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebaseConfig.js';
import { FirestoreCareRelationshipService } from '../../services/FirestoreCareRelationshipService.js';

// ============================================================================
// BROWSER-ONLY. The one place this app talks to Firestore -- same seam
// pattern as app_page/src/services/FirestoreUserService.js. Every engine
// (ReportModel, PatientListModel, ...) stays pure and never imports this.
//
// MOSTLY READ-ONLY BY DESIGN: the deployed Firestore security rules (see
// app_page/firestore.rules) let a doctor account READ any document under
// /patients/**, but never WRITE the patient's own top-level profile,
// sessions, or dailyMomentum -- only the patient's own app_page account can
// write those. The ONE exception, added 2026-08-20: an approved doctor CAN
// now create (never update/delete someone else's) documents under
// /patients/{patientId}/doctorNotes/** -- see addDoctorNote/listDoctorNotes
// below. That write path only works once the NEW rule documented at the top
// of app_page/firestore.rules is actually deployed to the live Firebase
// project (this sandbox cannot do that -- see PROGRESS.md). Until it is,
// addDoctorNote will fail with a `permission-denied` error, which callers
// (usePatientReport.js) must surface honestly, not swallow.
// ============================================================================

function patientSessionsCollectionRef(patientId) {
  return collection(db, 'patients', patientId, 'sessions');
}

function patientDailyMomentumCollectionRef(patientId) {
  return collection(db, 'patients', patientId, 'dailyMomentum');
}

function patientDoctorNotesCollectionRef(patientId) {
  return collection(db, 'patients', patientId, 'doctorNotes');
}

function doctorDocRef(uid) {
  return doc(db, 'doctors', uid);
}

export const FirestorePatientService = {
  // True only if a /doctors/{uid} document exists AND its accessApproved
  // field is true.
  //
  // 2026-08-18 CORRECTION: this used to check doc existence only, written
  // when the only way a /doctors/{uid} doc could exist at all was a
  // deliberate manual add in the Firebase console's Data tab -- existence
  // WAS the approval at the time. That's no longer true: app_page's real
  // doctor signup (see app_page/src/hooks/useDoctorAuth.js) now creates a
  // /doctors/{uid} doc automatically for every real signup, with
  // accessApproved defaulted to true there (a disclosed placeholder --
  // no real admin-review backend exists yet either). Checking existence
  // alone here would have silently made THIS app's access gate a no-op the
  // moment that app_page change shipped, without anyone deciding that on
  // purpose. Checking the actual field keeps one real, consistent access
  // rule shared by both apps -- flip accessApproved to false on a specific
  // doctor's document (in either app, same document) and they lose access
  // to both, not just one.
  async checkDoctorAccess(uid) {
    const snap = await getDoc(doctorDocRef(uid));
    return snap.exists() && snap.data()?.accessApproved === true;
  },

  // One real patient record, shaped exactly like an entry in
  // data/mockPatients.js so ReportModel.build() and PatientListModel need
  // no changes: { patientId, name, age, gender, riskFactors, notes,
  // sessions: [oldest -> newest] }.
  async getPatientRecord(patientId) {
    const profileSnap = await getDoc(doc(db, 'patients', patientId));
    if (!profileSnap.exists()) return undefined;
    const profile = profileSnap.data();

    const sessionsSnap = await getDocs(query(patientSessionsCollectionRef(patientId), orderBy('date', 'asc')));
    const sessions = sessionsSnap.docs.map((d) => d.data());

    // 2026-08-19: the daily Daily Set / Momentum Score bridge (separate
    // subcollection from /sessions above -- see app_page's
    // FirestoreUserService.writePatientDailyMomentum). Only the single most
    // recent entry is fetched (orderBy date desc, limit 1) -- the Doctor
    // Dashboard only ever needs to show "today's" (or most recent) daily
    // signal, never a full daily history. A patient with none yet (hasn't
    // completed a full Daily Set since this feature shipped) simply gets
    // undefined here -- honestly absent, not a fabricated 0.
    const dailyMomentumSnap = await getDocs(query(patientDailyMomentumCollectionRef(patientId), orderBy('date', 'desc'), limit(1)));
    const dailyMomentum = dailyMomentumSnap.docs[0]?.data();

    // 2026-08-20: doctor notes are now real (see addDoctorNote/
    // listDoctorNotes below), but they depend on a security rule that may
    // not be deployed on any given Firebase project yet -- fetched in its
    // own try/catch, separate from the reads above, so a doctor still sees
    // the rest of a real patient's report even if notes specifically are
    // denied. `notesError` is surfaced honestly to the UI instead of
    // silently returning an empty (and therefore misleadingly "no notes
    // yet") list.
    let notes = [];
    let notesError = null;
    try {
      notes = await this.listDoctorNotes(patientId);
    } catch (err) {
      notesError = err?.code === 'permission-denied'
        ? 'Clinical notes are unavailable: the Firestore security rules update for doctor notes has not been deployed to this project yet.'
        : (err?.message || 'Could not load clinical notes.');
    }

    return {
      patientId,
      name: profile.name || 'Unnamed patient',
      // app_page only collects age today -- gender/riskFactors aren't
      // captured anywhere upstream yet, so these stay honestly empty
      // rather than fabricated (ReportModel already handles that).
      age: profile.age ?? undefined,
      gender: profile.gender ?? undefined,
      riskFactors: profile.riskFactors || [],
      notes,
      notesError,
      sessions,
      dailyMomentum,
      isRealPatient: true,
    };
  },

  // Doctor-authored clinical note, written to
  // /patients/{patientId}/doctorNotes/{noteId} (auto-generated id -- unlike
  // /sessions and /dailyMomentum, a note has no natural date-shaped key
  // since a clinician can add more than one on the same day). Requires the
  // NEW security rule (see app_page/firestore.rules' 2026-08-20 addition)
  // to be deployed; throws (with Firestore's own `permission-denied` code)
  // otherwise, same as any other denied write -- deliberately not caught
  // here so the caller decides how to surface it.
  //
  // Returns the note in the same { id, author, timestamp, text } shape
  // listDoctorNotes()/mock patients use, so callers can optimistically
  // append it to `patient.notes` without a second round-trip. `timestamp`
  // is a real client-side Date for immediate display only -- serverTimestamp()
  // isn't readable until the write round-trips; the persisted document's
  // `createdAt` is the authoritative server time, used by listDoctorNotes()
  // on the next real fetch.
  async addDoctorNote(patientId, noteText, authorUid, authorName) {
    const text = (noteText || '').trim();
    if (!text) throw new Error('Note text is required.');
    const resolvedAuthorName = authorName || 'Attending Clinician';
    const docRef = await addDoc(patientDoctorNotesCollectionRef(patientId), {
      text,
      authorUid: authorUid || null,
      authorName: resolvedAuthorName,
      createdAt: serverTimestamp(),
    });
    return { id: docRef.id, author: resolvedAuthorName, timestamp: new Date().toISOString(), text };
  },

  // Every doctor note for one patient, oldest first (matches how
  // /sessions is ordered, and how mock-patient `notes` arrays already
  // read in the UI). Mapped from the raw { text, authorUid, authorName,
  // createdAt } document shape into the { id, author, timestamp, text }
  // shape ClinicalObservationsPanel.jsx already renders.
  async listDoctorNotes(patientId) {
    const snap = await getDocs(query(patientDoctorNotesCollectionRef(patientId), orderBy('createdAt', 'asc')));
    return snap.docs.map((d) => {
      const data = d.data();
      // A just-written note's createdAt can still be a pending local write
      // (serverTimestamp() not yet resolved) if read back within the same
      // session before the round-trip completes -- falls back to "now"
      // display-only in that narrow window rather than crashing on
      // `.toDate()` of a null value.
      const timestamp = data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString();
      return { id: d.id, author: data.authorName || 'Attending Clinician', timestamp, text: data.text || '' };
    });
  },

  // 2026-08-23 CHANGE: every real patient THIS doctor is actually linked
  // to -- not every patient in the system. This used to be an unfiltered
  // read of the whole /patients collection, safe only because
  // firestore.rules happened to let any approved doctor read any patient
  // -- a real, disclosed gap (see CARE_CONNECTION_PROMPT.md and
  // PROGRESS.md). Now it reads the doctor's accepted /careRelationships
  // docs first and only fetches those specific patient records.
  // firestore.rules' /patients/{uid} read rule has been tightened to
  // match (require an accepted relationship, not just "any approved
  // doctor") -- see that file's 2026-08-23 entry -- so this filtering
  // isn't just a client-side nicety, the backend enforces it too.
  async listPatientRecords(doctorUid) {
    if (!doctorUid) return [];
    const patientIds = await FirestoreCareRelationshipService.listAcceptedPatientIdsForDoctor(doctorUid);
    const records = await Promise.all(patientIds.map((id) => this.getPatientRecord(id)));
    return records.filter(Boolean);
  },
};
