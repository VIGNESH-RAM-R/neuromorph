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

// 2026-08-27: tiny Levenshtein distance helper for the typo-tolerant
// search fallback above -- no new dependency for one small function.
// Iterative single-row DP (not recursive), fine for the short strings
// (doctor names/IDs) this ever runs against.
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

// A typo'd search term is usually short relative to a full doctor name
// ("dr sarah reyes") -- comparing it against the whole name would always
// score a large distance even for a perfect match on the first word. This
// slides the term across the name and keeps the best (smallest) distance
// against any equal-length window, so "sarra" still scores close against
// "...sarah..." wherever it appears in the full name.
function closestSubstringDistance(term, fullText) {
  if (fullText.length <= term.length) return levenshtein(term, fullText);
  let best = Infinity;
  for (let start = 0; start <= fullText.length - term.length; start += 1) {
    const window = fullText.slice(start, start + term.length);
    best = Math.min(best, levenshtein(term, window));
    if (best === 0) break;
  }
  return best;
}

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
      const exact = snap.docs.map((d) => this._toResult(d));
      // 2026-08-27: even an ID-shaped query can be a typo (one wrong
      // character in "NMD-XXXXXX") -- fall through to the same
      // name-similarity fallback as a plain name search below rather
      // than just returning empty.
      return exact.length ? exact : this._fuzzyFallback(raw.toLowerCase());
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
    const exact = snap.docs.map((d) => this._toResult(d));
    if (exact.length) return exact;

    // 2026-08-27 ADDITION (VR: "if not exist na - give me no search found,
    // illa some typo mistakes iruntha - give similar profiles"). Firestore
    // only supports prefix range queries, so a genuine typo (transposed
    // letter, one character off) never matches startAt/endAt. When the
    // exact prefix search comes back empty, fall back to a broader fetch
    // + client-side similarity scoring so a near-miss spelling still
    // surfaces the doctor the person almost certainly meant, instead of a
    // dead end. Every result from this path is tagged `fuzzy: true` so the
    // UI can label them "Similar profiles" rather than pretending they're
    // an exact match.
    return this._fuzzyFallback(term);
  },

  // Fetches a bounded page of approved doctors (cheap even as the roster
  // grows into the hundreds -- one indexed query, capped at 150) and scores
  // each by Levenshtein distance against the search term, on both the full
  // name and the doctor ID. Only returns doctors within a distance close
  // enough to plausibly be the same typo'd word, closest first, capped at 5
  // -- this is a "did you mean" list, not a second search box.
  async _fuzzyFallback(term) {
    if (!term || term.length < 2) return [];
    const q = query(
      collection(db, 'doctors'),
      where('accessApproved', '==', true),
      orderBy('nameLower'),
      limit(150),
    );
    const snap = await getDocs(q);
    const maxDistance = term.length <= 4 ? 1 : 2;
    const scored = snap.docs
      .map((d) => {
        const data = d.data();
        const nameLower = data.nameLower || (data.name || '').toLowerCase();
        const idLower = (data.doctorId || '').toLowerCase();
        const nameDistance = closestSubstringDistance(term, nameLower);
        const idDistance = idLower ? levenshtein(term, idLower) : Infinity;
        return { doc: d, distance: Math.min(nameDistance, idDistance) };
      })
      .filter((entry) => entry.distance <= maxDistance)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5);
    return scored.map((entry) => ({ ...this._toResult(entry.doc), fuzzy: true }));
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
