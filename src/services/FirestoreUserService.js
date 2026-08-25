import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebaseConfig.js';

// ============================================================================
// BROWSER-ONLY. The one place this app actually talks to Firestore -- every
// other engine stays pure/Node-testable; this file is the deliberate seam,
// same pattern as FaceTrackingService.js in face_module. useAuth.js is the
// only caller.
//
// PRIVACY: only the fields this app actually collects live here (name,
// email, daily/weekly assessment history) -- see the Firestore Security
// Rules in FIREBASE_SETUP.md for who can read/write what.
//
// 2026-08-18: createdAt/updatedAt added on every real write, using
// Firestore's own serverTimestamp() rather than the client's new Date() --
// serverTimestamp() is filled in by Firestore's servers at write time, so
// it's correct even if a patient's device clock is wrong, in a different
// timezone, or offline-then-synced. This is deliberately done here at the
// write seam, not inside UserProfileEngine.js, since that engine stays a
// pure function with no Firestore import (see its own header comment) --
// the date/day/time VALUES used for the actual app content (streaks,
// "today", assessment due dates) already come from real new Date() calls
// throughout the engines; these two fields are purely a real, queryable
// "when was this account/record touched" audit trail, not app-facing data.
// ============================================================================
function userDocRef(uid) {
  return doc(db, 'users', uid);
}

function patientSessionDocRef(uid, date) {
  return doc(db, 'patients', uid, 'sessions', date);
}

function patientDailyMomentumDocRef(uid, date) {
  return doc(db, 'patients', uid, 'dailyMomentum', date);
}

export const FirestoreUserService = {
  async getUserProfile(uid) {
    const snap = await getDoc(userDocRef(uid));
    return snap.exists() ? snap.data() : null;
  },

  async createUserProfile(uid, profileDoc) {
    const withTimestamps = { ...profileDoc, createdAt: serverTimestamp(), updatedAt: serverTimestamp() };
    await setDoc(userDocRef(uid), withTimestamps);
    return profileDoc;
  },

  async updateUserProfile(uid, partialUpdate) {
    await updateDoc(userDocRef(uid), { ...partialUpdate, updatedAt: serverTimestamp() });
  },

  // Writes the bridged session record (see DoctorDashboardExportEngine.js)
  // into /patients/{uid}/sessions/{date} -- the collection the Doctor
  // Dashboard's Firestore rules grant doctor accounts read access to.
  // `date` (YYYY-MM-DD) is the real calendar day the assessment was
  // completed on; `recordedAt` is the precise real server timestamp the
  // write actually happened -- day-level and exact-time both stored, on
  // purpose, since a doctor reviewing trends cares about the day, but an
  // audit trail cares about the exact moment.
  async writePatientSession(uid, date, sessionRecord) {
    await setDoc(patientSessionDocRef(uid, date), { ...sessionRecord, recordedAt: serverTimestamp() });
  },

  // Writes the daily Daily Set / Momentum Score bridge record (see
  // DoctorDashboardExportEngine.buildDailyMomentumRecord) into
  // /patients/{uid}/dailyMomentum/{date} -- a separate subcollection from
  // /sessions (weekly Detection Assessment), so a doctor can distinguish
  // "daily engagement signal" from "weekly clinical score" the same way the
  // patient-side app already does. Same recordedAt precision pattern as
  // writePatientSession.
  async writePatientDailyMomentum(uid, date, dailyMomentumRecord) {
    await setDoc(patientDailyMomentumDocRef(uid, date), { ...dailyMomentumRecord, recordedAt: serverTimestamp() });
  },

  // Upserts the doctor-facing identity fields (name/age -- never the
  // user's private daily history, which stays in /users/{uid} only
  // doctors can't read). merge:true so this never clobbers fields another
  // write already set.
  async writePatientProfile(uid, profileFields) {
    await setDoc(doc(db, 'patients', uid), { ...profileFields, updatedAt: serverTimestamp() }, { merge: true });
  },
};
