import { useState, useCallback, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
  signOut,
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../config/firebaseConfig.js';
import { DoctorAuthEngine } from '../engines/DoctorAuthEngine.js';
import { FirestorePatientService } from '../services/FirestorePatientService.js';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const MOCK_DOCTOR = { uid: 'demo-doctor', name: 'Demo Doctor', email: 'demo@neuromorph.app' };

// Real authentication via Firebase Auth, same pattern as app_page's
// useAuth.js. The one thing that's different from a patient account: after
// signing in, this checks /doctors/{uid} (see FIREBASE_SETUP.md's security
// rules) -- being a valid Firebase account is not, by itself, enough to see
// patient data.
//
// FALLBACK: if no Firebase project is configured yet, this auto-"logs in"
// as a demo doctor with access granted, so the dashboard stays fully
// demoable (against the mock patients) before/without that setup.
export function useDoctorAuth() {
  const [view, setView] = useState('login'); // 'login' | 'signup'
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  // true | false | null (still checking, or not signed in yet)
  const [hasAccess, setHasAccess] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(isFirebaseConfigured);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setCurrentUser(MOCK_DOCTOR);
      setIsAuthenticated(true);
      setHasAccess(true);
      setIsCheckingSession(false);
      return undefined;
    }
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setCurrentUser(null);
        setIsAuthenticated(false);
        setHasAccess(null);
        setIsCheckingSession(false);
        return;
      }
      setCurrentUser({ uid: firebaseUser.uid, name: firebaseUser.displayName || 'Doctor', email: firebaseUser.email });
      setIsAuthenticated(true);
      try {
        const access = await FirestorePatientService.checkDoctorAccess(firebaseUser.uid);
        setHasAccess(access);
      } catch {
        setHasAccess(false);
      } finally {
        setIsCheckingSession(false);
      }
    });
    return unsubscribe;
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const result = DoctorAuthEngine.validateLogin({ email, password });
    setErrors(result.errors);
    if (!result.valid) return false;
    if (!isFirebaseConfigured) {
      setIsSubmitting(true);
      await wait(400);
      setIsSubmitting(false);
      return true;
    }
    setIsSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (err) {
      setErrors(DoctorAuthEngine.mapFirebaseError(err.code));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const signup = useCallback(async ({ name, email, password, confirmPassword }) => {
    const result = DoctorAuthEngine.validateSignup({ name, email, password, confirmPassword });
    setErrors(result.errors);
    if (!result.valid) return false;
    if (!isFirebaseConfigured) {
      setIsSubmitting(true);
      await wait(400);
      setIsSubmitting(false);
      return true;
    }
    setIsSubmitting(true);
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(credential.user, { displayName: name });
      return true;
    } catch (err) {
      setErrors(DoctorAuthEngine.mapFirebaseError(err.code));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const loginWithGoogle = useCallback(async () => {
    if (!isFirebaseConfigured) return false;
    setErrors({});
    setIsSubmitting(true);
    try {
      await signInWithPopup(auth, googleProvider);
      return true;
    } catch (err) {
      setErrors(DoctorAuthEngine.mapFirebaseError(err.code));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const logout = useCallback(async () => {
    if (isFirebaseConfigured) {
      await signOut(auth);
    } else {
      setIsAuthenticated(false);
      setCurrentUser(null);
      setHasAccess(null);
    }
    setView('login');
    setErrors({});
  }, []);

  return {
    view,
    setView,
    isAuthenticated,
    currentUser,
    hasAccess,
    errors,
    isSubmitting,
    isCheckingSession,
    login,
    signup,
    loginWithGoogle,
    logout,
  };
}
