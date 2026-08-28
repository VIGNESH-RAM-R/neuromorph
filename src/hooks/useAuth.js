import { useState, useCallback, useEffect, useRef } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
  signOut,
} from 'firebase/auth';
import { auth, googleProvider, facebookProvider, isFirebaseConfigured } from '../config/firebaseConfig.js';
import { AuthEngine } from '../engines/AuthEngine.js';
import { UserProfileEngine } from '../engines/UserProfileEngine.js';
import { CognitiveScoreEngine } from '../engines/CognitiveScoreEngine.js';
import { DoctorDashboardExportEngine } from '../engines/DoctorDashboardExportEngine.js';
import { DailyTaskEngine } from '../engines/DailyTaskEngine.js';
import { MomentumScoreEngine } from '../engines/MomentumScoreEngine.js';
import { InviteCodeEngine } from '../engines/InviteCodeEngine.js';
import { FirestoreUserService } from '../services/FirestoreUserService.js';
import { FirestoreCaregiverService } from '../services/FirestoreCaregiverService.js';
import { FirestorePatientDirectoryService } from '../services/FirestorePatientDirectoryService.js';
import { MOCK_SELF } from '../data/mockSelf.js';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
// 2026-08-27 BUGFIX (found during the Detection Assessment date/time
// audit, VR: "correct date, time, month, year - all time tracking la
// irukanum, illana anga present panna mudiyathu"). This used to be
// `date.toISOString().slice(0, 10)`, which converts to UTC before reading
// the date -- WRONG for any patient not in the UTC timezone, which is
// almost every real user of an India-focused app (IST is UTC+5:30). A
// patient completing their weekly check-in between 12:00am-5:29am IST
// would have it silently recorded under the PREVIOUS calendar day (still
// "yesterday" in UTC at that hour), throwing off "last completed", the
// +7-day due date calculation, weekend detection, and streaks by a day --
// exactly around midnight, the one time a date bug is easiest to miss in
// testing and hardest for a patient to explain to their doctor. This now
// reads the LOCAL calendar date (the device's own timezone, i.e. the
// patient's actual "today"), which is what every caller here actually
// means by "today's date".
const toIsoDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 2026-08-27 ADDITION -- a short, human-shareable handle a caregiver can
// search for directly (VR request: "antha caregiver patient username potu
// request kudukanum"), generated automatically at signup/self-heal so no
// patient ever has to pick or type one just to be findable. Deterministic
// from name + uid (not random -- see FirestorePatientDirectoryService.js's
// own header on why this file stays a pure-ish, Firestore-import-free
// helper) -- collision only if two accounts share both the same
// name-prefix AND the same first 4 uid characters, astronomically
// unlikely for a Firebase Auth uid. Falls back to 'patient' if name is
// somehow empty rather than producing an unusable bare suffix.
function buildUsername(name, uid) {
  const base = (name || 'patient').toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 16) || 'patient';
  const suffix = (uid || '').replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toLowerCase();
  return `${base}${suffix}`;
}

// Real authentication via Firebase Auth (see FIREBASE_SETUP.md). Google and
// Facebook sign-in now go through Firebase's own signInWithPopup rather
// than this app's earlier custom Google Identity Services / Facebook SDK
// integration -- now that a real Firebase project exists, Firebase already
// holds the Google/Facebook app credentials (entered in its console), so
// duplicating them in this app's own .env is no longer needed. That
// earlier approach was the right call when there was no backend at all;
// this is the natural next step now that one exists.
//
// FALLBACK: if no Firebase project is configured yet (isFirebaseConfigured
// is false), every action below falls back to the original mock-data
// behavior, so the app stays fully demoable before/without that setup.
export function useAuth() {
  const [view, setView] = useState('login'); // 'login' | 'signup'
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  // True only while Firebase is checking for an already-signed-in session
  // on first load -- App.jsx uses this to avoid flashing the login screen
  // for a split second before a real, already-logged-in session resolves.
  const [isCheckingSession, setIsCheckingSession] = useState(isFirebaseConfigured);
  // 2026-08-21: bridges loginWithProvider()'s synchronous call (which knows
  // whether the Signup screen's required consent checkbox was checked) to
  // onAuthStateChanged's async listener (the thing that actually creates a
  // brand-new social-auth profile, a moment later, decoupled from the
  // click). A ref, not state, since this is read-once/write-once plumbing,
  // not something that should trigger a re-render. Cleared right after
  // being read so a later LOGIN-screen social sign-in (no consent checkbox
  // exists there) never accidentally inherits a stale prior value.
  const pendingConsentRef = useRef(null);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setIsCheckingSession(false);
      return undefined;
    }
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setCurrentUser(null);
        setIsAuthenticated(false);
        setIsCheckingSession(false);
        return;
      }
      try {
        let profile = await FirestoreUserService.getUserProfile(firebaseUser.uid);
        if (!profile) {
          // First time this uid has ever completed sign-in with no prior
          // signup() call (e.g. their very first Google/Facebook sign-in) --
          // create a real, empty (never fabricated) record now.
          // privacyConsentAcceptedAt: only set if loginWithProvider() was
          // just called with consentGiven:true (the Signup screen's gated
          // social buttons do this) -- a brand-new social sign-in
          // initiated from the LOGIN screen instead (no consent checkbox
          // exists there) honestly gets null, same as if this ref were
          // never touched. See PrivacyPolicyScreen.jsx's own note on this
          // known, disclosed gap.
          const consentGiven = pendingConsentRef.current === true;
          pendingConsentRef.current = null;
          const username = buildUsername(firebaseUser.displayName || 'there', firebaseUser.uid);
          profile = UserProfileEngine.buildNewProfileDoc({
            name: firebaseUser.displayName || 'there',
            email: firebaseUser.email,
            authProvider: firebaseUser.providerData?.[0]?.providerId || 'password',
            privacyConsentAcceptedAt: consentGiven ? new Date().toISOString() : null,
          });
          profile = { ...profile, username, usernameLower: username.toLowerCase() };
          await FirestoreUserService.createUserProfile(firebaseUser.uid, profile);
          // 2026-08-27: mirror the search-safe subset into /patientDirectory
          // (see FirestorePatientDirectoryService.js) -- non-fatal if this
          // fails, same posture as the doctor nameLower self-heal below;
          // the account itself must never be blocked by this.
          FirestorePatientDirectoryService.upsertEntry(firebaseUser.uid, {
            username, usernameLower: username.toLowerCase(), name: firebaseUser.displayName || 'there',
          }).catch((err) => console.error('Could not write patient directory entry:', err));
        } else if (!profile.username) {
          // 2026-08-27 self-heal -- same "backfill on next login, never a
          // hard error" pattern as useDoctorAuth.js's nameLower backfill,
          // for any account created before patient search existed.
          const username = buildUsername(profile.name, firebaseUser.uid);
          const usernameLower = username.toLowerCase();
          FirestoreUserService.updateUserProfile(firebaseUser.uid, { username, usernameLower })
            .catch((err) => console.error('Could not backfill username:', err));
          FirestorePatientDirectoryService.upsertEntry(firebaseUser.uid, { username, usernameLower, name: profile.name })
            .catch((err) => console.error('Could not write patient directory entry:', err));
          profile = { ...profile, username, usernameLower };
        }
        setCurrentUser({ ...profile, uid: firebaseUser.uid });
        setIsAuthenticated(true);
      } finally {
        setIsCheckingSession(false);
      }
    });
    return unsubscribe;
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const result = AuthEngine.validateLogin({ email, password });
    setErrors(result.errors);
    if (!result.valid) return false;

    if (!isFirebaseConfigured) {
      setIsSubmitting(true);
      await wait(500);
      setCurrentUser(MOCK_SELF);
      setIsAuthenticated(true);
      setIsSubmitting(false);
      return true;
    }

    setIsSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged above picks up currentUser/isAuthenticated.
      return true;
    } catch (err) {
      setErrors(AuthEngine.mapFirebaseError(err.code));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  // consentGiven: whether the Signup screen's required "I agree to the
  // Privacy Policy" checkbox was checked -- SignupScreen.jsx disables this
  // form's submit button until it is, so a caller reaching this point with
  // consentGiven:false shouldn't normally happen, but this doesn't
  // re-derive/trust that -- it only records what it's explicitly told.
  const signup = useCallback(async ({ name, email, password, confirmPassword, consentGiven = false }) => {
    const result = AuthEngine.validateSignup({ name, email, password, confirmPassword });
    setErrors(result.errors);
    if (!result.valid) return false;

    if (!isFirebaseConfigured) {
      setIsSubmitting(true);
      await wait(500);
      setCurrentUser({ ...MOCK_SELF, name, onboardingComplete: false });
      setIsAuthenticated(true);
      setIsSubmitting(false);
      return true;
    }

    setIsSubmitting(true);
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(credential.user, { displayName: name });
      const username = buildUsername(name, credential.user.uid);
      const usernameLower = username.toLowerCase();
      const profile = {
        ...UserProfileEngine.buildNewProfileDoc({
          name,
          email,
          authProvider: 'password',
          privacyConsentAcceptedAt: consentGiven ? new Date().toISOString() : null,
        }),
        username,
        usernameLower,
      };
      await FirestoreUserService.createUserProfile(credential.user.uid, profile);
      // 2026-08-27: mirror into /patientDirectory (see
      // FirestorePatientDirectoryService.js) -- non-fatal, same posture as
      // the onAuthStateChanged path above.
      FirestorePatientDirectoryService.upsertEntry(credential.user.uid, { username, usernameLower, name })
        .catch((err) => console.error('Could not write patient directory entry:', err));
      // onAuthStateChanged fires too, but it would read this profile back
      // from Firestore a beat later -- setting it directly here avoids a
      // flash of "profile not found yet" between signup and that listener.
      setCurrentUser({ ...profile, uid: credential.user.uid });
      setIsAuthenticated(true);
      return true;
    } catch (err) {
      setErrors(AuthEngine.mapFirebaseError(err.code));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  // Real Google/Facebook sign-in via Firebase's own popup flow. `isNewSignup`
  // (true from the Signup screen, false from Login) only matters the very
  // first time a given uid is ever seen -- onAuthStateChanged's
  // buildNewProfileDoc() call above already defaults onboardingComplete to
  // false for a brand-new profile either way, so this mainly documents
  // intent rather than branching logic today.
  // consentGiven (2026-08-21): the Signup screen passes true here (its
  // social buttons are disabled until the consent checkbox is checked --
  // see SignupScreen.jsx); the Login screen passes nothing/false, since it
  // has no consent checkbox (this only matters the moment a NEW profile
  // gets created for a uid Firestore has never seen -- an existing user
  // logging back in via Google/Facebook is unaffected either way).
  const loginWithProvider = useCallback(async (provider, consentGiven = false) => {
    if (!isFirebaseConfigured) return false;
    setErrors({});
    setIsSubmitting(true);
    pendingConsentRef.current = consentGiven;
    try {
      const authProvider = provider === 'facebook' ? facebookProvider : googleProvider;
      await signInWithPopup(auth, authProvider);
      return true;
    } catch (err) {
      // A cancelled/failed popup never reaches onAuthStateChanged's
      // profile-creation branch, so nothing would normally clear this --
      // reset it here so a cancelled Signup-screen attempt can't leak
      // consentGiven:true into some later, unrelated sign-in.
      pendingConsentRef.current = null;
      setErrors(AuthEngine.mapFirebaseError(err.code));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const logout = useCallback(async () => {
    if (isFirebaseConfigured) {
      await signOut(auth);
    }
    setIsAuthenticated(false);
    setCurrentUser(null);
    setView('login');
    setErrors({});
  }, []);

  // Takes the FULL completed session (not just its score) because this is
  // also the one place that keeps the Doctor Dashboard bridge promise --
  // DoctorDashboardExportEngine turns the same session into the exact
  // record /patients/{uid}/sessions/{date} expects (see
  // DoctorDashboardExportEngine.js and FIREBASE_SETUP.md's security
  // rules). Patches currentUser immediately so the UI never waits on a
  // round trip, and -- when Firebase is configured -- persists both real
  // writes (the patient's own profile, and the doctor-readable bridge
  // record) for real.
  const recordCompletedAssessment = useCallback((session, now = new Date()) => {
    const cognitiveScore = CognitiveScoreEngine.compute(session);
    setCurrentUser((prev) => {
      if (!prev) return prev;
      const updated = UserProfileEngine.applyAssessmentCompletion(prev, cognitiveScore.score, now);
      if (isFirebaseConfigured && prev.uid) {
        FirestoreUserService.updateUserProfile(prev.uid, {
          weeklyAssessment: updated.weeklyAssessment,
          weeklyCognitiveScoreHistory: updated.weeklyCognitiveScoreHistory,
        });
        const date = toIsoDate(now);
        const sessionRecord = DoctorDashboardExportEngine.buildSessionRecord(session, cognitiveScore, date);
        if (sessionRecord) {
          FirestoreUserService.writePatientSession(prev.uid, date, sessionRecord);
          FirestoreUserService.writePatientProfile(prev.uid, { patientId: prev.uid, name: prev.name, age: prev.age ?? null });
        }
      }
      return updated;
    });
  }, []);

  // Marks one Daily Set item complete for today (Facial Expressivity,
  // Speech, Memory, Reaction, or Attention). Patches currentUser
  // immediately so the Home/Games checklist and today's Momentum Score
  // update without a round trip, and -- when Firebase is configured --
  // persists the same update for real.
  //
  // 2026-08-19: NOW does write a Doctor-Dashboard bridge record, but only
  // the moment the full 5-item Daily Set becomes complete for the day (not
  // on every single task tick) -- one real number per day, matching the
  // spec ("the doctor get updated about their score of the day"). This
  // writes to a SEPARATE path (/patients/{uid}/dailyMomentum/{date}) from
  // the weekly Detection Assessment bridge
  // (/patients/{uid}/sessions/{date}) -- the two remain distinct signals on
  // the Doctor Dashboard side (daily engagement vs. weekly clinical score),
  // exactly as MomentumScoreEngine's own header comment already
  // distinguishes them.
  const recordCompletedDailyTask = useCallback((taskId, score, now = new Date()) => {
    setCurrentUser((prev) => {
      if (!prev) return prev;
      const updated = UserProfileEngine.applyDailyTaskCompletion(prev, taskId, score, now);
      if (isFirebaseConfigured && prev.uid) {
        FirestoreUserService.updateUserProfile(prev.uid, {
          today: updated.today,
          dailyHistory: updated.dailyHistory,
        });
        if (DailyTaskEngine.isFullyComplete(updated.today?.completion)) {
          const momentum = MomentumScoreEngine.scoreForDay(updated.today);
          const dailyMomentumRecord = DoctorDashboardExportEngine.buildDailyMomentumRecord(momentum, updated.today.date);
          if (dailyMomentumRecord) {
            FirestoreUserService.writePatientDailyMomentum(prev.uid, updated.today.date, dailyMomentumRecord);
          }
        }
      }
      return updated;
    });
  }, []);

  const completeOnboarding = useCallback((profile) => {
    setCurrentUser((prev) => {
      if (!prev) return prev;
      const updated = UserProfileEngine.applyOnboardingProfile(prev, profile);
      if (isFirebaseConfigured && prev.uid) {
        FirestoreUserService.updateUserProfile(prev.uid, profile);
        // Age is only known from this point on -- keep the doctor-facing
        // identity record current as soon as it's available, rather than
        // waiting for a first completed assessment to create it.
        FirestoreUserService.writePatientProfile(prev.uid, { patientId: prev.uid, name: updated.name, age: updated.age ?? null });
      }
      return updated;
    });
  }, []);

  // Generates a fresh invite code the patient can share with a caregiver
  // (see InviteCodeEngine.js / FirestoreCaregiverService.js). Stored both
  // as its own /inviteCodes/{code} lookup document (what caregiver signup
  // actually reads) and mirrored onto the patient's own profile purely so
  // their own screen can keep showing "your current code" without a second
  // round trip. Mock-mode returns a real generated code too (just never
  // persisted anywhere) so the UI is demoable without Firebase configured.
  const generateCaregiverInviteCode = useCallback(async () => {
    const code = InviteCodeEngine.generate();
    if (isFirebaseConfigured && currentUser?.uid) {
      await FirestoreCaregiverService.createInviteCode(code, currentUser.uid, currentUser.name);
      await FirestoreUserService.updateUserProfile(currentUser.uid, { caregiverInviteCode: code });
    }
    setCurrentUser((prev) => (prev ? { ...prev, caregiverInviteCode: code } : prev));
    return code;
  }, [currentUser]);

  return {
    view,
    setView,
    isAuthenticated,
    currentUser,
    errors,
    isSubmitting,
    isCheckingSession,
    login,
    signup,
    loginWithProvider,
    logout,
    recordCompletedAssessment,
    recordCompletedDailyTask,
    completeOnboarding,
    generateCaregiverInviteCode,
  };
}
