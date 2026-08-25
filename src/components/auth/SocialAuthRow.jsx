import GoogleSignInButton from './GoogleSignInButton.jsx';
import FacebookLoginButton from './FacebookLoginButton.jsx';

// mode 'in' -> "Continue with Google" / "Continue with Facebook" (Login screen)
// mode 'up' -> "Sign up with Google" / "Sign up with Facebook" (Signup screen)
// googleLabel/facebookLabel let a caller override with translated copy
// (2026-08-17 -- see authStrings.js) without this component needing to know
// about languages itself; falls back to the original English default.
export default function SocialAuthRow({ onGoogleClick, onFacebookClick, isSubmitting, mode = 'in', googleLabel, facebookLabel }) {
  const verb = mode === 'up' ? 'Sign up' : 'Continue';
  return (
    <div className="nmpa-social-row">
      <GoogleSignInButton onClick={onGoogleClick} isSubmitting={isSubmitting} label={googleLabel || `${verb} with Google`} />
      <FacebookLoginButton onClick={onFacebookClick} isSubmitting={isSubmitting} label={facebookLabel || `${verb} with Facebook`} />
    </div>
  );
}
