import { useState } from 'react';
import { AuthEngine } from '../../engines/AuthEngine.js';
import AuthBrandPanel from '../auth/AuthBrandPanel.jsx';
import AuthTextField from '../auth/AuthTextField.jsx';
import PasswordField from '../auth/PasswordField.jsx';
import SocialAuthRow from '../auth/SocialAuthRow.jsx';
import AuthDivider from '../auth/AuthDivider.jsx';
import ThemeToggle from '../common/ThemeToggle.jsx';
import { MailIcon, UserIcon } from '../icons/FormIcons.jsx';
import PrivacyPolicyScreen from '../auth/PrivacyPolicyScreen.jsx';

// 2026-08-18: same language-switcher fix as DoctorLoginScreen.jsx -- see
// that file's header comment for the full story.
export default function DoctorSignupScreen({ onSignup, onSwitchToLogin, onSocialAuth, onBackToRoleGate, errors, isSubmitting, theme, onToggleTheme, language, onChangeLanguage }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  // 2026-08-25 ADDITION -- optional at signup (see useDoctorAuth.js's
  // signup() comment): if the doctor already has their organization's
  // platform access key, entering it here approves the account immediately;
  // if left blank or wrong, signup still succeeds and DoctorAccessPendingScreen.jsx
  // offers the same redemption form again afterward.
  const [accessKey, setAccessKey] = useState('');
  const [touched, setTouched] = useState({});
  // 2026-08-21: required consent -- see useDoctorAuth.js's consentGiven
  // plumbing. English-only here, same as the rest of this screen -- the
  // Doctor portal hasn't been ported to the 7-language i18n system yet
  // (see PROGRESS.md / task #12), so this doesn't force-translate just
  // this one piece.
  const [consentGiven, setConsentGiven] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

  if (showPrivacyPolicy) {
    return <PrivacyPolicyScreen onBack={() => setShowPrivacyPolicy(false)} />;
  }

  const anyTouched = Object.values(touched).some(Boolean);
  const liveErrors = anyTouched
    ? AuthEngine.validateSignup({ name, email, password, confirmPassword }).errors
    : {};
  const shownErrors = { ...liveErrors, ...errors };

  function handleBlur(field) {
    setTouched((t) => ({ ...t, [field]: true }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true, confirmPassword: true });
    if (!consentGiven) return;
    onSignup({ name, email, password, confirmPassword, accessKey, consentGiven });
  }

  return (
    <div className="nmpa-auth">
      <div className="nmpa-auth__theme-toggle-slot">
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>

      {/* 2026-08-25 (VR, repeated request): coverImage removed -- same
          "keep the signup brand panel identical to login's" fix as
          SignupScreen.jsx. */}
      <AuthBrandPanel
        language={language}
        onChangeLanguage={onChangeLanguage}
        roleBadge="Doctor Portal"
        subledeOverride="Create your clinician account -- a short professional questionnaire and the clinical assistant come next."
      />

      <div className="nmpa-auth__panel nmpa-auth__panel--form">
        <div className="nmpa-auth__card">
          <button type="button" className="nmpa-link nmpa-auth__back-link" onClick={onBackToRoleGate}>&larr; Not a doctor?</button>
          <h1 className="nmpa-auth__heading">Create a clinician account</h1>
          <p className="nmpa-auth__lede">A few professional questions come right after -- helps us tailor what you see.</p>

          <SocialAuthRow
            mode="up"
            isSubmitting={isSubmitting || !consentGiven}
            onGoogleClick={() => consentGiven && onSocialAuth('google', consentGiven)}
            onFacebookClick={() => consentGiven && onSocialAuth('facebook', consentGiven)}
          />
          <AuthDivider label="or sign up with email" />

          <form onSubmit={handleSubmit} className="nmpa-form" noValidate>
            <AuthTextField
              icon={<UserIcon />}
              label="Full name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => handleBlur('name')}
              autoComplete="name"
              autoFocus
              error={shownErrors.name}
            />

            <AuthTextField
              icon={<MailIcon />}
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => handleBlur('email')}
              autoComplete="email"
              error={shownErrors.email}
            />

            <PasswordField
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => handleBlur('password')}
              autoComplete="new-password"
              error={shownErrors.password}
            />

            <PasswordField
              label="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => handleBlur('confirmPassword')}
              autoComplete="new-password"
              error={shownErrors.confirmPassword}
            />

            <AuthTextField
              label="Access key (optional -- ask your administrator)"
              type="text"
              value={accessKey}
              onChange={(e) => setAccessKey(e.target.value)}
              autoComplete="off"
              error={shownErrors.accessKey}
            />

            <label className="nmpa-consent-checkbox">
              <input
                type="checkbox"
                checked={consentGiven}
                onChange={(e) => setConsentGiven(e.target.checked)}
              />
              <span>
                I have read and agree to the{' '}
                <button type="button" className="nmpa-link" onClick={() => setShowPrivacyPolicy(true)}>Privacy Policy</button>
              </span>
            </label>

            <button type="submit" className="nmpa-button nmpa-button--primary nmpa-button--block" disabled={isSubmitting || !consentGiven}>
              {isSubmitting ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="nmpa-auth__switch">
            Already have an account?{' '}
            <button type="button" className="nmpa-link" onClick={onSwitchToLogin}>Log in</button>
          </p>
        </div>
      </div>
    </div>
  );
}
