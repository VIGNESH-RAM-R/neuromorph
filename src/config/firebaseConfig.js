import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

// Firebase's web config is designed to be public (it's shipped in every
// browser bundle by design) -- the values below are safe to read from
// VITE_ env vars and expose client-side. Real security comes from
// Firestore Security Rules (server-enforced), not from hiding this object.
// See FIREBASE_SETUP.md for exactly where each value comes from.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

// Only initialize once -- Vite's dev server HMR can otherwise try to call
// initializeApp() a second time and Firebase throws on a duplicate app.
const app = isFirebaseConfigured
  ? getApps().length
    ? getApps()[0]
    : initializeApp(firebaseConfig)
  : null;

export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();

// 2026-08-21: Firebase App Check -- guards askMorphy (the Cloud Function
// that proxies Gemini) against being called directly by something that
// isn't this real app, which is a real cost/abuse risk once the function
// URL is public. See DEPLOYMENT_READINESS.md item 3 and
// APPCHECK_SETUP.md for the full rollout story.
//
// Deliberately safe-by-default: this ONLY initializes if
// VITE_FIREBASE_APPCHECK_SITE_KEY is actually set, so the app keeps
// working exactly as before for anyone (including this sandbox's own
// tests, and any dev environment) who hasn't provisioned a real
// reCAPTCHA v3 site key yet. A missing key is not an error here -- it's
// "App Check isn't turned on yet," same graceful-degradation philosophy
// as isFirebaseConfigured above. `isTokenAutoRefreshEnabled: true` so a
// long chat session doesn't need a manual re-verify partway through.
const APPCHECK_SITE_KEY = import.meta.env.VITE_FIREBASE_APPCHECK_SITE_KEY || '';
let appCheckInstance = null;
if (app && APPCHECK_SITE_KEY) {
  try {
    appCheckInstance = initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(APPCHECK_SITE_KEY),
      isTokenAutoRefreshEnabled: true,
    });
  } catch {
    // Same posture as the service-worker registration in main.jsx --
    // App Check is a security hardening layer, not a requirement to
    // function; a failed init here should never block the app itself.
  }
}
// Exported (nullable -- null whenever App Check isn't configured/enabled)
// so AiFallbackService.js can attach a real App Check token to its
// askMorphy calls. Firestore/Auth calls get this automatically from the
// Firebase SDK itself; a plain fetch() to an HTTP Cloud Function (which is
// what askMorphy is) does not, so that seam has to do it manually -- see
// AiFallbackService.js's own comment.
export const appCheck = appCheckInstance;
