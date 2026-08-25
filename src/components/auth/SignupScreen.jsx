import { useState } from 'react';
import { AuthEngine } from '../../engines/AuthEngine.js';
import AuthBrandPanel from './AuthBrandPanel.jsx';
import AuthTextField from './AuthTextField.jsx';
import PasswordField from './PasswordField.jsx';
import SocialAuthRow from './SocialAuthRow.jsx';
import AuthDivider from './AuthDivider.jsx';
import ThemeToggle from '../common/ThemeToggle.jsx';
import { MailIcon, UserIcon } from '../icons/FormIcons.jsx';
import { authString } from '../../i18n/authStrings.js';
import PrivacyPolicyScreen from './PrivacyPolicyScreen.jsx';

export default function SignupScreen({ onSignup, onSwitchToLogin, onSocialAuth, errors, isSubmitting, theme, onToggleTheme, language, onChangeLanguage }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [touched, setTouched] = useState({});
  // 2026-08-21: required consent -- see useAuth.js's consentGiven plumbing.
  // Gates BOTH the password-submit button and the two social-auth buttons
  // below, since a social sign-in from this screen creates a real profile
  // (with privacyConsentAcceptedAt) just as directly as the email form does.
  const [consentGiven, setConsentGiven] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const t = (key) => authString(language, key);

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
    onSignup({ name, email, password, confirmPassword, consentGiven });
  }

  return (
    <div className="nmpa-auth">
      <div className="nmpa-auth__theme-toggle-slot">
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>

      {/* 2026-08-25 (VR, repeated request): "when i wanna create a new
          account - let the previous page be there" -- coverImage removed so
          the signup screen's brand panel is the exact same animated
          split-band panel the login screen shows, not a different cover-
          image layout that only appears on signup. */}
      <AuthBrandPanel language={language} onChangeLanguage={onChangeLanguage} subledeKey="subledeSignup" />

      <div className="nmpa-auth__panel nmpa-auth__panel--form">
        <div className="nmpa-auth__card">
          <h1 className="nmpa-auth__heading">{t('createYourAccount')}</h1>
          <p className="nmpa-auth__lede">{t('signupLede')}</p>

          <SocialAuthRow
            mode="up"
            isSubmitting={isSubmitting || !consentGiven}
            onGoogleClick={() => consentGiven && onSocialAuth('google', consentGiven)}
            onFacebookClick={() => consentGiven && onSocialAuth('facebook', consentGiven)}
            googleLabel={t('continueWithGoogle')}
            facebookLabel={t('continueWithFacebook')}
          />
          <AuthDivider label={t('orSignUpWithEmail')} />

          <form onSubmit={handleSubmit} className="nmpa-form" noValidate>
            <AuthTextField
              icon={<UserIcon />}
              label={t('fullName')}
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
              label={t('emailAddress')}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => handleBlur('email')}
              autoComplete="email"
              error={shownErrors.email}
            />

            <PasswordField
              label={t('password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => handleBlur('password')}
              autoComplete="new-password"
              error={shownErrors.password}
            />

            <PasswordField
              label={t('confirmPassword')}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => handleBlur('confirmPassword')}
              autoComplete="new-password"
              error={shownErrors.confirmPassword}
            />

            <label className="nmpa-consent-checkbox">
              <input
                type="checkbox"
                checked={consentGiven}
                onChange={(e) => setConsentGiven(e.target.checked)}
              />
              <span>
                {t('consentPrefix')}{' '}
                <button type="button" className="nmpa-link" onClick={() => setShowPrivacyPolicy(true)}>
                  {t('consentLinkText')}
                </button>
              </span>
            </label>

            <button type="submit" className="nmpa-button nmpa-button--primary nmpa-button--block" disabled={isSubmitting || !consentGiven}>
              {isSubmitting ? t('creatingAccount') : t('createAccount')}
            </button>
          </form>

          <p className="nmpa-auth__switch">
            {t('alreadyHaveAccount')}{' '}
            <button type="button" className="nmpa-link" onClick={onSwitchToLogin}>{t('logInLink')}</button>
          </p>
        </div>
      </div>
    </div>
  );
}
