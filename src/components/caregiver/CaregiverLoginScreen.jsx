import { useState } from 'react';
import { AuthEngine } from '../../engines/AuthEngine.js';
import AuthBrandPanel from '../auth/AuthBrandPanel.jsx';
import AuthTextField from '../auth/AuthTextField.jsx';
import PasswordField from '../auth/PasswordField.jsx';
import SocialAuthRow from '../auth/SocialAuthRow.jsx';
import AuthDivider from '../auth/AuthDivider.jsx';
import ThemeToggle from '../common/ThemeToggle.jsx';
import { MailIcon } from '../icons/FormIcons.jsx';

// The caregiver counterpart to LoginScreen.jsx/DoctorLoginScreen.jsx --
// same theme (AuthBrandPanel's animated backdrop, same Google/Facebook/
// email form), distinguished only by a "Caregiver" badge and caregiver-
// flavored copy.
export default function CaregiverLoginScreen({ onLogin, onSwitchToSignup, onSocialAuth, onBackToRoleGate, errors, isSubmitting, theme, onToggleTheme, language, onChangeLanguage }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState({});

  const liveErrors = touched.email || touched.password
    ? AuthEngine.validateLogin({ email, password }).errors
    : {};
  const shownErrors = { ...liveErrors, ...errors };

  function handleBlur(field) {
    setTouched((t) => ({ ...t, [field]: true }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setTouched({ email: true, password: true });
    onLogin({ email, password });
  }

  return (
    <div className="nmpa-auth">
      <div className="nmpa-auth__theme-toggle-slot">
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>

      <AuthBrandPanel
        language={language}
        onChangeLanguage={onChangeLanguage}
        roleBadge="Caregiver"
        subledeOverride="Check in on how they're doing day to day, and get support from the caregiver assistant."
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
          <h1 className="nmpa-auth__heading">Welcome back</h1>
          <p className="nmpa-auth__lede">Sign in to continue supporting the person you care for.</p>

          <SocialAuthRow
            mode="in"
            isSubmitting={isSubmitting}
            onGoogleClick={() => onSocialAuth('google')}
            onFacebookClick={() => onSocialAuth('facebook')}
          />
          <AuthDivider label="or log in with email" />

          <form onSubmit={handleSubmit} className="nmpa-form" noValidate autoComplete="off">
            <AuthTextField
              icon={<MailIcon />}
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => handleBlur('email')}
              autoComplete="new-password"
              autoFocus
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

            <button type="submit" className="nmpa-button nmpa-button--primary nmpa-button--block" disabled={isSubmitting}>
              {isSubmitting ? 'Logging in…' : 'Log In'}
            </button>
          </form>

          <p className="nmpa-auth__switch">
            New here?{' '}
            <button type="button" className="nmpa-link" onClick={onSwitchToSignup}>Create a caregiver account</button>
          </p>
        </div>
      </div>
    </div>
  );
}
