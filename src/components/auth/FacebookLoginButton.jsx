import { isFirebaseConfigured } from '../../config/firebaseConfig.js';
import { FacebookGlyph } from '../icons/BrandIcons.jsx';

// Triggers Firebase's own real Facebook sign-in popup -- Firebase already
// holds the Facebook App ID/Secret (entered in its console per
// FIREBASE_SETUP.md), so this button needs nothing else.
export default function FacebookLoginButton({ onClick, isSubmitting, label = 'Continue with Facebook' }) {
  if (!isFirebaseConfigured) {
    return (
      <button type="button" className="nmpa-social-button nmpa-social-button--unconfigured" disabled title="Firebase isn't configured yet -- see FIREBASE_SETUP.md">
        <span className="nmpa-social-button__glyph nmpa-social-button__glyph--facebook"><FacebookGlyph /></span>
        {label} <span className="nmpa-social-button__hint">(setup needed)</span>
      </button>
    );
  }

  return (
    <button type="button" className="nmpa-social-button nmpa-social-button--facebook" onClick={onClick} disabled={isSubmitting}>
      <span className="nmpa-social-button__glyph nmpa-social-button__glyph--facebook"><FacebookGlyph /></span>
      {label}
    </button>
  );
}
