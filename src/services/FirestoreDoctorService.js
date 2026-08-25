import {
  doc, getDoc, setDoc, updateDoc, collection, query, where, orderBy, startAt, endAt, limit, getDocs, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebaseConfig.js';

function accessKeyDocRef(key) {
  return doc(db, 'doctorAccessKeys', key);
}

// ============================================================================
// BROWSER-ONLY. The doctor counterpart to FirestoreUserService.js -- same
// "one seam, pure engines everywhere else" convention. useDoctorAuth.js is
// the only caller.
//
// Kept as a SEPARATE Firestore collection (/doctors/{uid}, not /users/{uid})
// so a doctor record and a patient record never collide even though (see
// useDoctorAuth.js's 2026-08-18 header comment) they share the same
// underlying Firebase Authentication user pool.
//
// 2026-08-18: createdAt/updatedAt added via serverTimestamp() -- same
// reasoning as FirestoreUserService.js's header comment (server-side clock,
// not the device's).
// ============================================================================
function doctorDocRef(uid) {
  return doc(db, 'doctors', uid);
}

// Prefix-range upper bound used by searchDoctorsByName below -- a plain
// escape sequence (not a pasted glyph) for the highest Unicode private-use
// codepoint, the standard Firestore idiom for "every string starting with
// this prefix".
const PREFIX_RANGE_CEILING = '';

export const FirestoreDoctorService = {
  async getDoctorProfile(uid) {
    const snap = await getDoc(doctorDocRef(uid));
    return snap.exists() ? snap.data() : null;
  },

  async createDoctorProfile(uid, profileDoc) {
    const withTimestamps = { ...profileDoc, createdAt: serverTimestamp(), updatedAt: serverTimestamp() };
    await setDoc(doctorDocRef(uid), withTimestamps);
    return profileDoc;
  },

  async updateDoctorProfile(uid, partialUpdate) {
    await updateDoc(doctorDocRef(uid), { ...partialUpdate, updatedAt: serverTimestamp() });
  },

  // 2026-08-23 ADDITION: patient/caregiver-facing doctor search (see
  // CARE_CONNECTION_PROMPT.md / FirestoreCareRelationshipService.js).
  // Firestore has no native full-text search, so name matching is a
  // prefix search on `nameLower` (written alongside `name` at signup/
  // self-heal time in useDoctorAuth.js) -- `orderBy + startAt(term) +
  // endAt(term + ceiling)` is the standard Firestore idiom for "every doc
  // whose field starts with this string" (endAt(term) alone would only
  // match a doc equal to term).
  //
  // 2026-08-23 WIDENED: also accepts the doctor's own human-readable ID
  // (the "NMD-XXXXXX" shown on their own dashboard, see useDoctorAuth.js)
  // for an exact match -- someone who already has a doctor's ID (e.g.
  // given verbally, or off a prescription/letterhead) shouldn't have to
  // guess a spelling instead. A query is treated as an ID lookup only when
  // it actually matches the "NMD-" + 6 hex-ish chars shape; anything else
  // falls through to the name-prefix search so a normal name search never
  // silently returns zero results just because it happened to start with
  // similar letters.
  //
  // Only accessApproved doctors are searchable either way (accessApproved
  // is the same field firestore.rules' isApprovedDoctor() checks, so a
  // doctor that loses approval also silently drops out of search results).
  async searchDoctors(searchTerm) {
    const raw = (searchTerm || '').trim();
    if (!raw) return [];

    const idMatch = /^NMD-[A-Z0-9]{4,8}$/i.test(raw);
    if (idMatch) {
      const q = query(collection(db, 'doctors'), where('doctorId', '==', raw.toUpperCase()), where('accessApproved', '==', true), limit(1));
      const snap = await getDocs(q);
      return snap.docs.map((d) => this._toResult(d));
    }

    const term = raw.toLowerCase();
    const q = query(
      collection(db, 'doctors'),
      where('accessApproved', '==', true),
      orderBy('nameLower'),
      startAt(term),
      endAt(term + PREFIX_RANGE_CEILING),
      limit(20),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => this._toResult(d));
  },

  // 2026-08-25 ADDITION -- the real platform-wide access gate replacing the
  // "every doctor signup is auto-approved" placeholder (see useDoctorAuth.js's
  // ACCESS-APPROVAL SCOPE NOTE, now retired). A /doctorAccessKeys/{key} doc
  // is a REUSABLE org-wide key (not single-use/per-doctor) -- e.g. one key
  // shared with a hospital's clinicians -- not a per-account invite. It is
  // NOT client-creatable (see firestore.rules: `get` only, no `create`) --
  // an admin must seed at least one via the Firebase console directly.
  // `get` (not `list`) so keys can never be enumerated, same convention as
  // /inviteCodes above -- a key is only usable if you already have the exact
  // string an admin shared with you.
  async resolveAccessKey(key) {
    if (!key) return null;
    const snap = await getDoc(accessKeyDocRef(key));
    if (!snap.exists()) return null;
    const data = snap.data();
    return data?.active === false ? null : data; // active defaults true if the field is simply absent
  },

  _toResult(d) {
    const data = d.data();
    return {
      uid: d.id,
      name: data.name || 'Unnamed doctor',
      doctorId: data.doctorId || null,
      specialty: data.professionalProfile?.specialty || null,
      licenseRegion: data.professionalProfile?.licenseRegion || null,
    };
  },
};
