import { isFirebaseConfigured } from '../../config/firebaseConfig.js';

// Triggers Firebase's own real Google sign-in popup -- Firebase already
// holds the Google OAuth setup (configured in its console per
// FIREBASE_SETUP.md), so this button needs nothing else. Honestly shows a
// disabled "setup needed" state if no Firebase project is configured yet,
// same pattern used throughout this app rather than pretending to work.
export default function GoogleSignInButton({ onClick, isSubmitting, label = 'Continue with Google' }) {
  if (!isFirebaseConfigured) {
    return (
      <button type="button" className="nmpa-social-button nmpa-social-button--unconfigured" disabled title="Firebase isn't configured yet -- see FIREBASE_SETUP.md">
        <span className="nmpa-social-button__glyph nmpa-social-button__glyph--google" aria-hidden="true">G</span>
        {label} <span className="nmpa-social-button__hint">(setup needed)</span>
      </button>
    );
  }

  return (
    <button type="button" className="nmpa-social-button" onClick={onClick} disabled={isSubmitting}>
      <span className="nmpa-social-button__glyph nmpa-social-button__glyph--google" aria-hidden="true">G</span>
      {label}
    </button>
  );
}
