import {
  doc, getDoc, setDoc, updateDoc, deleteDoc, collection, query, where, limit, orderBy, getDocs, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebaseConfig.js';

// ============================================================================
// BROWSER-ONLY. The caregiver counterpart to FirestoreUserService.js/
// FirestoreDoctorService.js -- same seam pattern, same createdAt/updatedAt
// serverTimestamp() convention. useCaregiverAuth.js is the only caller.
//
// Also owns the /inviteCodes/{code} collection -- the patient <-> caregiver
// pairing mechanism (see InviteCodeEngine.js for the pure code-generation
// logic). A code document is intentionally tiny and NOT queryable by
// listing (firestore.rules grants `get` by exact id only, never `list`), so
// a code can't be enumerated or guessed by scanning -- only looked up if
// you already have the exact code a patient shared with you.
// ============================================================================
function caregiverDocRef(uid) {
  return doc(db, 'caregivers', uid);
}

function inviteCodeDocRef(code) {
  return doc(db, 'inviteCodes', code);
}

export const FirestoreCaregiverService = {
  async getCaregiverProfile(uid) {
    const snap = await getDoc(caregiverDocRef(uid));
    return snap.exists() ? snap.data() : null;
  },

  async createCaregiverProfile(uid, profileDoc) {
    const withTimestamps = { ...profileDoc, createdAt: serverTimestamp(), updatedAt: serverTimestamp() };
    await setDoc(caregiverDocRef(uid), withTimestamps);
    return profileDoc;
  },

  async updateCaregiverProfile(uid, partialUpdate) {
    await updateDoc(caregiverDocRef(uid), { ...partialUpdate, updatedAt: serverTimestamp() });
  },

  // Called from the PATIENT's own account (see useAuth.js) when they
  // generate a code to share with a caregiver. `code` is already
  // real/unique-enough from InviteCodeEngine.generate() -- this just
  // persists it. Overwrites any previous code for this patient the moment
  // a new one is generated (setDoc on a NEW code doc, old one left orphaned
  // but harmless/unreadable-by-list -- acceptable for this scope; a real
  // "revoke old code" cleanup step would delete the prior doc too, a
  // reasonable future follow-up, not done here).
  async createInviteCode(code, patientUid, patientName) {
    await setDoc(inviteCodeDocRef(code), { patientUid, patientName: patientName || null, createdAt: serverTimestamp() });
  },

  // Returns { patientUid, patientName } or undefined if the code doesn't
  // exist -- never throws on a not-found code, since "the caregiver typed
  // it wrong" is an expected, normal case, not an error condition.
  async resolveInviteCode(code) {
    const snap = await getDoc(inviteCodeDocRef(code));
    return snap.exists() ? snap.data() : undefined;
  },

  async deleteInviteCode(code) {
    await deleteDoc(inviteCodeDocRef(code));
  },

  // 2026-08-23 ADDITION: lets a DOCTOR account (never the patient, never
  // another caregiver) look up the one real caregiver linked to a given
  // patient, so the Doctor Dashboard can show that caregiver's actual
  // daily check-in answers (see doctorDashboard/ui/report/
  // CaregiverResponsesPanel.jsx) instead of only the condensed
  // one-line summary QuestionnaireSummaryCard/CaregiverConcordancePanel
  // already showed. Requires the matching firestore.rules read grant
  // (an approved doctor with an ACCEPTED careRelationship to this exact
  // patient may read a /caregivers/{uid} doc whose linkedPatientUid
  // matches) -- without that rule deployed, this throws
  // `permission-denied`, which callers must surface honestly, same
  // convention as FirestorePatientService.addDoctorNote.
  //
  // A patient could in principle have more than one caregiver account
  // linked via separate invite codes; this returns the first one found
  // (limit 1) since the UI only has room to show one "linked caregiver"
  // today -- a real, disclosed simplification, not a hidden data loss (all
  // linked caregivers still exist in Firestore, just not all surfaced yet).
  async getCaregiverForPatient(patientId) {
    if (!patientId) return null;
    const q = query(collection(db, 'caregivers'), where('linkedPatientUid', '==', patientId), limit(1));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { uid: d.id, ...d.data() };
  },

  // 2026-08-24 ADDITION -- the read the weekly deep check-in's unlock
  // trigger depends on (see CaregiverWeeklyUnlockEngine.js /
  // useCaregiverAuth.js). A completed Detection Assessment session is
  // written to /patients/{uid}/sessions/{date} with the calendar date the
  // assessment was completed on AS the document id (see
  // FirestoreUserService.writePatientSession) -- so the single most
  // recent session, by its own recordedAt server timestamp, tells us both
  // "has this patient completed an assessment yet" and "which date does
  // it correspond to" (the doc's own `.id`) in one read.
  //
  // Requires an ACCEPTED careRelationship between this caregiver and the
  // patient -- enforced in firestore.rules (isAcceptedCaregiverFor), not
  // just here. A caregiver who isn't yet accepted gets a real
  // `permission-denied`, surfaced honestly by the caller rather than
  // treated as "no assessment yet".
  async getLatestAssessmentDateForPatient(patientId) {
    if (!patientId) return null;
    const q = query(collection(db, 'patients', patientId, 'sessions'), orderBy('recordedAt', 'desc'), limit(1));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return snap.docs[0].id;
  },
};
