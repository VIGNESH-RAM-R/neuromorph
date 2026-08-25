// Pure, mock validation for the login/signup forms -- no real backend in
// this delivery (see README). Kept as a real engine, not inline component
// logic, so it's independently testable and has exactly one place the
// validation rules live.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

// Firebase throws error codes like "auth/invalid-credential" -- this maps
// the ones users can actually hit in this app's forms to the same plain,
// non-technical wording validateLogin/validateSignup already use, so a
// real backend error looks no different from a validation error.
const FIREBASE_ERROR_MESSAGES = {
  'auth/invalid-credential': { password: 'That email or password is incorrect.' },
  'auth/wrong-password': { password: 'That email or password is incorrect.' },
  'auth/user-not-found': { email: 'No account found with that email.' },
  'auth/too-many-requests': { password: 'Too many attempts -- please wait a moment and try again.' },
  'auth/email-already-in-use': { email: 'An account with that email already exists -- try logging in instead.' },
  'auth/weak-password': { password: 'Password must be at least 8 characters.' },
  'auth/invalid-email': { email: 'Enter a valid email address.' },
  'auth/network-request-failed': { email: 'Network error -- check your connection and try again.' },
  'auth/popup-closed-by-user': { email: 'Sign-in was closed before finishing -- try again.' },
};
const DEFAULT_FIREBASE_ERROR = { email: 'Something went wrong -- please try again.' };

export const AuthEngine = {
  mapFirebaseError(code) {
    return FIREBASE_ERROR_MESSAGES[code] || DEFAULT_FIREBASE_ERROR;
  },

  validateLogin({ email, password }) {
    const errors = {};
    if (!email || !EMAIL_PATTERN.test(email)) errors.email = 'Enter a valid email address.';
    if (!password) errors.password = 'Enter your password.';
    return { valid: Object.keys(errors).length === 0, errors };
  },

  validateSignup({ name, email, password, confirmPassword }) {
    const errors = {};
    if (!name || name.trim().length < 2) errors.name = 'Enter your full name.';
    if (!email || !EMAIL_PATTERN.test(email)) errors.email = 'Enter a valid email address.';
    if (!password || password.length < MIN_PASSWORD_LENGTH) errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
    if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match.';
    return { valid: Object.keys(errors).length === 0, errors };
  },
};
