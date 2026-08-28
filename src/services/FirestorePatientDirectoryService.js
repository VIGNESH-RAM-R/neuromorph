import {
  doc, getDoc, setDoc, collection, query, where, orderBy, startAt, endAt, limit, getDocs,
} from 'firebase/firestore';
import { db } from '../config/firebaseConfig.js';

// ============================================================================
// BROWSER-ONLY. 2026-08-27 ADDITION -- the caregiver-facing counterpart to
// FirestoreDoctorService.js's doctor search (VR request: "antha caregiver
// patient username potu request kudukanum" -- a caregiver should be able to
// search for a patient by USERNAME and send a connection request directly,
// instead of only through the existing patient-generated invite code).
//
// WHY A SEPARATE COLLECTION, NOT /users/{uid}: /users/{uid} holds a
// patient's full private record -- daily/weekly assessment history,
// onboarding answers -- and its Firestore rule deliberately only ever
// allows the owner themselves to read it (see firestore.rules). Making any
// part of that collection query-able by other accounts, even filtered to
// "just return matches," is not something Firestore security rules can do
// safely at the field level: a rule that allowed a `list` query against
// /users based on a username match would hand back the ENTIRE matching
// document, health history included, to whoever ran the query.
//
// /patientDirectory/{uid} is a deliberately narrow, separate collection --
// ONLY { username, usernameLower, name } ever lives here, nothing else,
// same "public-safe subset in its own collection" pattern this app already
// uses for /patients/{uid} (the doctor-bridge identity record) and
// /doctors/{uid} (professional search fields). Written by the patient's own
// client only (useAuth.js, at signup and as a login self-heal for older
// accounts); readable by any authenticated user for search, same scope as
// doctor search.
// ============================================================================
function directoryDocRef(uid) {
  return doc(db, 'patientDirectory', uid);
}

const PREFIX_RANGE_CEILING = '';

// Same tiny Levenshtein helper as FirestoreDoctorService.js's typo-tolerant
// fallback -- kept duplicated rather than shared, on purpose: these two
// services intentionally never import from each other (see that file's own
// "BROWSER-ONLY... one seam" convention -- each Firestore-facing service
// stays a single, self-contained file).
function levenshtein(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prevRow = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    const currRow = [i];
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      currRow[j] = Math.min(currRow[j - 1] + 1, prevRow[j] + 1, prevRow[j - 1] + cost);
    }
    prevRow = currRow;
  }
  return prevRow[b.length];
}

export const FirestorePatientDirectoryService = {
  // Called once at signup, and again as a login self-heal for any patient
  // account that existed before this feature -- see useAuth.js. merge:true
  // so a re-run (e.g. the self-heal firing again before its own write has
  // round-tripped) never clobbers a since-changed username.
  async upsertEntry(uid, { username, usernameLower, name }) {
    await setDoc(directoryDocRef(uid), { username, usernameLower, name }, { merge: true });
  },

  async getEntry(uid) {
    const snap = await getDoc(directoryDocRef(uid));
    return snap.exists() ? snap.data() : null;
  },

  // Exact-username lookup first (this is the common case -- a caregiver
  // was TOLD the patient's exact username), then the same typo-tolerant
  // fallback FirestoreDoctorService.searchDoctors uses, so a small spelling
  // slip still surfaces the right person instead of a dead end (VR: "illa
  // some typo mistakes iruntha - give similar profiles").
  async searchPatients(searchTerm) {
    const raw = (searchTerm || '').trim();
    if (!raw) return [];
    const term = raw.toLowerCase().replace(/^@/, '');

    const exactQ = query(
      collection(db, 'patientDirectory'),
      where('usernameLower', '==', term),
      limit(5),
    );
    const exactSnap = await getDocs(exactQ);
    if (!exactSnap.empty) {
      return exactSnap.docs.map((d) => this._toResult(d));
    }

    // Firestore has no native fuzzy search -- try a prefix range first
    // (cheap, indexed), and only fall all the way to the full
    // similarity-scored fetch if even that comes back empty.
    const prefixQ = query(
      collection(db, 'patientDirectory'),
      orderBy('usernameLower'),
      startAt(term),
      endAt(term + PREFIX_RANGE_CEILING),
      limit(10),
    );
    const prefixSnap = await getDocs(prefixQ);
    if (!prefixSnap.empty) {
      return prefixSnap.docs.map((d) => this._toResult(d));
    }

    if (term.length < 2) return [];
    const broadQ = query(collection(db, 'patientDirectory'), orderBy('usernameLower'), limit(150));
    const broadSnap = await getDocs(broadQ);
    const maxDistance = term.length <= 4 ? 1 : 2;
    const scored = broadSnap.docs
      .map((d) => ({ doc: d, distance: levenshtein(term, (d.data().usernameLower || '')) }))
      .filter((entry) => entry.distance <= maxDistance)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5);
    return scored.map((entry) => ({ ...this._toResult(entry.doc), fuzzy: true }));
  },

  _toResult(d) {
    const data = d.data();
    return { uid: d.id, name: data.name || 'Unnamed patient', username: data.username || null };
  },
};
