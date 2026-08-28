import { useState } from 'react';
import { AuthEngine } from '../../engines/AuthEngine.js';
import { InviteCodeEngine } from '../../engines/InviteCodeEngine.js';
import AuthBrandPanel from '../auth/AuthBrandPanel.jsx';
import AuthTextField from '../auth/AuthTextField.jsx';
import PasswordField from '../auth/PasswordField.jsx';
import SocialAuthRow from '../auth/SocialAuthRow.jsx';
import AuthDivider from '../auth/AuthDivider.jsx';
import ThemeToggle from '../common/ThemeToggle.jsx';
import { MailIcon, UserIcon } from '../icons/FormIcons.jsx';
import PrivacyPolicyScreen from '../auth/PrivacyPolicyScreen.jsx';

// The caregiver counterpart to SignupScreen.jsx/DoctorSignupScreen.jsx. The
// invite code field is OPTIONAL here on purpose -- a caregiver who doesn't
// have it handy yet (or got it wrong) can still create an account and link
// afterward from a dedicated retry screen (see useCaregiverAuth.js's
// linkToPatient / App.jsx's "not linked yet" gate).
export default function CaregiverSignupScreen({ onSignup, onSwitchToLogin, onSocialAuth, onBackToRoleGate, errors, isSubmitting, theme, onToggleTheme, language, onChangeLanguage }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [touched, setTouched] = useState({});
  // 2026-08-21: required consent -- see useCaregiverAuth.js's consentGiven
  // plumbing. English-only, matching this screen's existing convention
  // (not yet ported to the 7-language i18n system -- see task #12).
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
    onSignup({ name, email, password, confirmPassword, inviteCode: inviteCode.trim() || undefined, consentGiven });
  }

  return (
    <div className="nmpa-auth">
      <div className="nmpa-auth__theme-toggle-slot">
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>

      {/* 2026-08-25 (VR, repeated request): coverImage removed -- same
          "keep the signup brand panel identical to login's" fix as
          SignupScreen.jsx / DoctorSignupScreen.jsx. */}
      <AuthBrandPanel
        language={language}
        onChangeLanguage={onChangeLanguage}
        roleBadge="Caregiver"
        subledeOverride="Create your caregiver account -- a short daily check-in and the caregiver assistant come next."
        instructionsTitle="How it works"
        trustItems={[
          'A 15-question deep check-in the same day your patient completes their assessment',
          "A quick 2-question daily check-in the rest of the week -- takes under a minute",
          "See your linked patient's progress and trends",
          "Send doctor connection requests on their behalf",
          'Morphy for Caregivers answers caregiving questions any time',
          "Private by design -- only what you and their care team need",
        ]}
      />

      <div className="nmpa-auth__panel nmpa-auth__panel--form">
        <div className="nmpa-auth__card">
          <button type="button" className="nmpa-link nmpa-auth__back-link" onClick={onBackToRoleGate}>&larr; Not a caregiver?</button>
          <h1 className="nmpa-auth__heading">Create a caregiver account</h1>
          <p className="nmpa-auth__lede">Have an invite code from the patient? Enter it below -- or skip it and link up later.</p>

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
              icon={<UserIcon />}
              label="Patient's invite code (optional)"
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(InviteCodeEngine.normalize(e.target.value))}
              onBlur={() => handleBlur('inviteCode')}
              autoComplete="off"
              error={shownErrors.inviteCode}
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
