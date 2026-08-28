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
import { t } from '../../i18n/strings/doctorAuth.js';

// 2026-08-18: same language-switcher fix as DoctorLoginScreen.jsx -- see
// that file's header comment for the full story.
// 2026-08-27: form copy now translated too (src/i18n/strings/doctorAuth.js),
// same file/pass as DoctorLoginScreen.jsx's 2026-08-27 note -- see there.
export default function DoctorSignupScreen({ onSignup, onSwitchToLogin, onSocialAuth, onBackToRoleGate, errors, isSubmitting, theme, onToggleTheme, language = 'en', onChangeLanguage }) {
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
  // plumbing. Now translated along with the rest of this screen (2026-08-27,
  // see the header comment above).
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
        roleBadge={t(language, 'roleBadge')}
        subledeOverride={t(language, 'signupSublede')}
        instructionsTitle={t(language, 'instructionsTitle')}
        trustItems={[
          t(language, 'trustItem1'),
          t(language, 'trustItem2'),
          t(language, 'trustItem3'),
          t(language, 'trustItem4'),
          t(language, 'trustItem5'),
          t(language, 'trustItem6'),
        ]}
      />

      <div className="nmpa-auth__panel nmpa-auth__panel--form">
        <div className="nmpa-auth__card">
          <button type="button" className="nmpa-link nmpa-auth__back-link" onClick={onBackToRoleGate}>{t(language, 'backLink')}</button>
          <h1 className="nmpa-auth__heading">{t(language, 'signupHeading')}</h1>
          <p className="nmpa-auth__lede">{t(language, 'signupLede')}</p>

          <SocialAuthRow
            mode="up"
            isSubmitting={isSubmitting || !consentGiven}
            onGoogleClick={() => consentGiven && onSocialAuth('google', consentGiven)}
            onFacebookClick={() => consentGiven && onSocialAuth('facebook', consentGiven)}
          />
          <AuthDivider label={t(language, 'signupDivider')} />

          <form onSubmit={handleSubmit} className="nmpa-form" noValidate>
            <AuthTextField
              icon={<UserIcon />}
              label={t(language, 'fullNameLabel')}
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
              label={t(language, 'emailLabel')}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => handleBlur('email')}
              autoComplete="email"
              error={shownErrors.email}
            />

            <PasswordField
              label={t(language, 'passwordLabel')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => handleBlur('password')}
              autoComplete="new-password"
              error={shownErrors.password}
            />

            <PasswordField
              label={t(language, 'confirmPasswordLabel')}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => handleBlur('confirmPassword')}
              autoComplete="new-password"
              error={shownErrors.confirmPassword}
            />

            <AuthTextField
              label={t(language, 'accessKeyLabel')}
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
                {t(language, 'consentPrefix')}{' '}
                <button type="button" className="nmpa-link" onClick={() => setShowPrivacyPolicy(true)}>{t(language, 'privacyPolicyLink')}</button>
              </span>
            </label>

            <button type="submit" className="nmpa-button nmpa-button--primary nmpa-button--block" disabled={isSubmitting || !consentGiven}>
              {isSubmitting ? t(language, 'creatingAccountButton') : t(language, 'createAccountButton')}
            </button>
          </form>

          <p className="nmpa-auth__switch">
            {t(language, 'haveAccountText')}{' '}
            <button type="button" className="nmpa-link" onClick={onSwitchToLogin}>{t(language, 'logInLink')}</button>
          </p>
        </div>
      </div>
    </div>
  );
}
