import { useState } from 'react';
import { AuthEngine } from '../../engines/AuthEngine.js';
import AuthBrandPanel from './AuthBrandPanel.jsx';
import AuthTextField from './AuthTextField.jsx';
import PasswordField from './PasswordField.jsx';
import SocialAuthRow from './SocialAuthRow.jsx';
import AuthDivider from './AuthDivider.jsx';
import ThemeToggle from '../common/ThemeToggle.jsx';
import { MailIcon } from '../icons/FormIcons.jsx';
import { authString } from '../../i18n/authStrings.js';

export default function LoginScreen({ onLogin, onSwitchToSignup, onSocialAuth, onBackToRoleGate, errors, isSubmitting, theme, onToggleTheme, language, onChangeLanguage }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState({});
  const t = (key) => authString(language, key);

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

      <AuthBrandPanel language={language} onChangeLanguage={onChangeLanguage} subledeKey="subledeLogin" />

      <div className="nmpa-auth__panel nmpa-auth__panel--form">
        <div className="nmpa-auth__card">
          {onBackToRoleGate && (
            <button type="button" className="nmpa-link nmpa-auth__back-link" onClick={onBackToRoleGate}>&larr; {t('backLink')}</button>
          )}
          <h1 className="nmpa-auth__heading">{t('welcomeBack')}</h1>
          <p className="nmpa-auth__lede">{t('loginLede')}</p>

          <SocialAuthRow
            mode="in"
            isSubmitting={isSubmitting}
            onGoogleClick={() => onSocialAuth('google')}
            onFacebookClick={() => onSocialAuth('facebook')}
            googleLabel={t('continueWithGoogle')}
            facebookLabel={t('continueWithFacebook')}
          />
          <AuthDivider label={t('orLogInWithEmail')} />

          <form onSubmit={handleSubmit} className="nmpa-form" noValidate autoComplete="off">
            <AuthTextField
              icon={<MailIcon />}
              label={t('emailAddress')}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => handleBlur('email')}
              autoComplete="new-password"
              autoFocus
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

            <button type="submit" className="nmpa-button nmpa-button--primary nmpa-button--block" disabled={isSubmitting}>
              {isSubmitting ? t('loggingIn') : t('logIn')}
            </button>
          </form>

          <p className="nmpa-auth__switch">
            {t('newHere')}{' '}
            <button type="button" className="nmpa-link" onClick={onSwitchToSignup}>{t('createAnAccount')}</button>
          </p>
        </div>
      </div>
    </div>
  );
}
