import { useState, useCallback, useEffect, useRef } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
  signOut,
} from 'firebase/auth';
import { AuthEngine } from '../engines/AuthEngine.js';
import { MOCK_DOCTOR } from '../data/mockDoctor.js';
import { auth, googleProvider, facebookProvider, isFirebaseConfigured } from '../config/firebaseConfig.js';
import { FirestoreDoctorService } from '../services/FirestoreDoctorService.js';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// 2026-08-17: the doctor counterpart to useAuth.js -- separate hook (not a
// role flag bolted onto useAuth) since a doctor record and a patient record
// are genuinely different shapes (see mockDoctor.js), same reasoning
// Doctor_Dashboard already used for its own useDoctorAuth.js/
// DoctorAuthEngine.js.
//
// 2026-08-18 UPDATE -- real Firebase accounts. Wired to the same
// signInWithEmailAndPassword / signInWithPopup / Firestore pattern
// useAuth.js already uses for patients, now that a real Firebase project
// exists (mirrors that same FALLBACK rule too: everything below falls back
// to the original mock behavior when isFirebaseConfigured is false).
//
// REAL LIMITATION (disclosed, not hidden): patients and doctors are stored
// as SEPARATE Firestore documents (/users/{uid} vs /doctors/{uid}), but
// both roles authenticate against the SAME underlying Firebase Auth user
// pool -- Firebase's JS SDK doesn't cleanly support two independent,
// concurrently-signed-in sessions in one browser tab without a second named
// Auth instance (real added complexity this build doesn't need yet). In
// practice this only matters if literally the same email+password is used
// to sign up as both a patient and a doctor -- an edge case, not the normal
// "pick a role, then log in" flow this app's role-gate screen enforces.
//
// ACCESS-APPROVAL SCOPE NOTE (2026-08-25 REDESIGN -- real gate, not a
// placeholder anymore): a freshly created doctor account now starts
// accessApproved: false, same as it structurally always should have. What
// flips it to true is a real platform-wide access key (see
// FirestoreDoctorService.resolveAccessKey / DoctorAccessPendingScreen.jsx's
// redemption form) -- entered either at signup time (optional field) or
// later from the pending screen via redeemAccessKey below. This replaces
// the previous "every signup is auto-approved" placeholder and its
// self-heal-to-true bug fix entirely; an ALREADY-approved account (from
// before this redesign, or from a successful key redemption) is never
// retroactively un-approved by anything here -- this only ever adds a real
// gate for accounts that were never actually approved.
export function useDoctorAuth() {
  const [view, setView] = useState('login'); // 'login' | 'signup'
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentDoctor, setCurrentDoctor] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(isFirebaseConfigured);
  // 2026-08-21: same consent-plumbing pattern as useAuth.js -- see that
  // file's comment on the equivalent ref.
  const pendingConsentRef = useRef(null);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setIsCheckingSession(false);
      return undefined;
    }
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setCurrentDoctor(null);
        setIsAuthenticated(false);
        setIsCheckingSession(false);
        return;
      }
      try {
        let profile = await FirestoreDoctorService.getDoctorProfile(firebaseUser.uid);
        if (!profile) {
          // No /doctors/{uid} record yet for this uid -- either their very
          // first Google/Facebook sign-in, or (see the shared-auth-pool
          // note above) a uid that only ever signed up as a patient. Either
          // way, create a real, honest, never-fabricated doctor record now.
          const consentGiven = pendingConsentRef.current === true;
          pendingConsentRef.current = null;
          profile = {
            name: firebaseUser.displayName || 'there',
            nameLower: (firebaseUser.displayName || 'there').toLowerCase(),
            email: firebaseUser.email,
            role: 'doctor',
            doctorId: `NMD-${firebaseUser.uid.slice(0, 6).toUpperCase()}`,
            onboardingComplete: false,
            professionalProfile: null,
            accessApproved: false, // see ACCESS-APPROVAL SCOPE NOTE above -- real gate now
            authProvider: firebaseUser.providerData?.[0]?.providerId || 'password',
            privacyConsentAcceptedAt: consentGiven ? new Date().toISOString() : null,
          };
          await FirestoreDoctorService.createDoctorProfile(firebaseUser.uid, profile);
        } else {
          const patch = {};
          // 2026-08-23: backfill nameLower on any doctor account created
          // before patient-facing doctor search existed (see
          // FirestoreDoctorService.searchDoctorsByName) -- without this,
          // an older doctor account would just never show up in search
          // results, a silent gap rather than a real error.
          if (!profile.nameLower && profile.name) {
            patch.nameLower = profile.name.toLowerCase();
          }
          if (Object.keys(patch).length > 0) {
            await FirestoreDoctorService.updateDoctorProfile(firebaseUser.uid, patch);
            profile = { ...profile, ...patch };
          }
        }
        setCurrentDoctor({ ...profile, uid: firebaseUser.uid });
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
      setCurrentDoctor(MOCK_DOCTOR);
      setIsAuthenticated(true);
      setIsSubmitting(false);
      return true;
    }

    setIsSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (err) {
      setErrors(AuthEngine.mapFirebaseError(err.code));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  // `accessKey` is optional at signup time -- entered here it approves the
  // account immediately (no round trip to the pending screen); omitted or
  // wrong, signup still succeeds (never blocks account creation) and the
  // account lands on DoctorAccessPendingScreen.jsx, where redeemAccessKey
  // below can be retried any time. Never surfaced as a hard error at
  // signup for that reason -- same "don't block account creation over an
  // optional secondary field" pattern useCaregiverAuth.js's invite code
  // already uses.
  const signup = useCallback(async ({ name, email, password, confirmPassword, accessKey, consentGiven = false }) => {
    const result = AuthEngine.validateSignup({ name, email, password, confirmPassword });
    setErrors(result.errors);
    if (!result.valid) return false;

    if (!isFirebaseConfigured) {
      setIsSubmitting(true);
      await wait(500);
      setCurrentDoctor({
        ...MOCK_DOCTOR,
        name,
        email,
        onboardingComplete: false,
        professionalProfile: null,
        accessApproved: false,
      });
      setIsAuthenticated(true);
      setIsSubmitting(false);
      return true;
    }

    setIsSubmitting(true);
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(credential.user, { displayName: name });

      let accessApproved = false;
      if (accessKey) {
        try {
          const resolved = await FirestoreDoctorService.resolveAccessKey(accessKey.trim());
          accessApproved = Boolean(resolved);
        } catch (keyErr) {
          console.error('Could not validate access key at signup (non-fatal):', keyErr);
        }
      }

      const profile = {
        name,
        nameLower: name.toLowerCase(),
        email,
        role: 'doctor',
        doctorId: `NMD-${credential.user.uid.slice(0, 6).toUpperCase()}`,
        onboardingComplete: false,
        professionalProfile: null,
        accessApproved, // see ACCESS-APPROVAL SCOPE NOTE above -- real gate now
        authProvider: 'password',
        privacyConsentAcceptedAt: consentGiven ? new Date().toISOString() : null,
      };
      await FirestoreDoctorService.createDoctorProfile(credential.user.uid, profile);
      setCurrentDoctor({ ...profile, uid: credential.user.uid });
      setIsAuthenticated(true);
      return true;
    } catch (err) {
      setErrors(AuthEngine.mapFirebaseError(err.code));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  // 2026-08-25 ADDITION -- the retry path shown from DoctorAccessPendingScreen.jsx
  // for a doctor who signed up without a key, or whose key didn't resolve.
  // Same "resolve, then persist + reflect in local state" shape as
  // useCaregiverAuth.js's linkToPatient.
  const redeemAccessKey = useCallback(async (rawKey) => {
    const key = (rawKey || '').trim();
    if (!key) {
      setErrors({ accessKey: 'Enter the access key your administrator shared with you.' });
      return false;
    }
    setIsSubmitting(true);
    setErrors({});
    try {
      const resolved = await FirestoreDoctorService.resolveAccessKey(key);
      if (!resolved) {
        setErrors({ accessKey: "That key wasn't recognized -- double check it with your administrator." });
        return false;
      }
      setCurrentDoctor((prev) => {
        if (!prev) return prev;
        const updated = { ...prev, accessApproved: true };
        if (isFirebaseConfigured && prev.uid) {
          FirestoreDoctorService.updateDoctorProfile(prev.uid, { accessApproved: true });
        }
        return updated;
      });
      return true;
    } catch (err) {
      setErrors({ accessKey: 'Could not verify that key right now. Please try again.' });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

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
    setCurrentDoctor(null);
    setView('login');
    setErrors({});
  }, []);

  const completeOnboarding = useCallback((professionalProfile) => {
    setCurrentDoctor((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, professionalProfile, onboardingComplete: true };
      if (isFirebaseConfigured && prev.uid) {
        FirestoreDoctorService.updateDoctorProfile(prev.uid, { professionalProfile, onboardingComplete: true });
      }
      return updated;
    });
  }, []);

  return {
    view,
    setView,
    isAuthenticated,
    currentDoctor,
    errors,
    isSubmitting,
    isCheckingSession,
    login,
    signup,
    loginWithProvider,
    logout,
    completeOnboarding,
    redeemAccessKey,
  };
}
