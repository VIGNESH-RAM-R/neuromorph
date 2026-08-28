import { useState } from 'react';
import { AuthEngine } from '../../engines/AuthEngine.js';
import AuthBrandPanel from '../auth/AuthBrandPanel.jsx';
import AuthTextField from '../auth/AuthTextField.jsx';
import PasswordField from '../auth/PasswordField.jsx';
import SocialAuthRow from '../auth/SocialAuthRow.jsx';
import AuthDivider from '../auth/AuthDivider.jsx';
import ThemeToggle from '../common/ThemeToggle.jsx';
import { MailIcon } from '../icons/FormIcons.jsx';
import { t } from '../../i18n/strings/doctorAuth.js';

// 2026-08-17: the doctor counterpart to LoginScreen.jsx -- same theme
// (AuthBrandPanel's animated backdrop, same Google/Facebook/email form),
// distinguished only by a "Doctor Portal" badge and doctor-flavored brand
// copy (AuthBrandPanel's subledeOverride/roleBadge props).
// 2026-08-18: the brand panel (tagline, trust list, specialities, language
// switcher, About link) is now real-language-aware, same `language`/
// `onChangeLanguage` wiring as the patient screens (App.jsx passes the
// same shared useLanguage() state) -- it was previously hardcoded to
// `language="en"` with no onChangeLanguage handler at all, which meant
// clicking a language in the dropdown threw (calling an undefined
// function) instead of switching.
// 2026-08-27: the FORM itself (heading, field labels, buttons, trust list)
// is now translated too (src/i18n/strings/doctorAuth.js), across all 7
// languages -- previously stayed English-only on purpose ("a separate,
// larger translation task... not a bug"); that task is this.
export default function DoctorLoginScreen({ onLogin, onSwitchToSignup, onSocialAuth, onBackToRoleGate, errors, isSubmitting, theme, onToggleTheme, language = 'en', onChangeLanguage }) {
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
        roleBadge={t(language, 'roleBadge')}
        subledeOverride={t(language, 'loginSublede')}
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
          <h1 className="nmpa-auth__heading">{t(language, 'loginHeading')}</h1>
          <p className="nmpa-auth__lede">{t(language, 'loginLede')}</p>

          <SocialAuthRow
            mode="in"
            isSubmitting={isSubmitting}
            onGoogleClick={() => onSocialAuth('google')}
            onFacebookClick={() => onSocialAuth('facebook')}
          />
          <AuthDivider label={t(language, 'loginDivider')} />

          <form onSubmit={handleSubmit} className="nmpa-form" noValidate autoComplete="off">
            <AuthTextField
              icon={<MailIcon />}
              label={t(language, 'emailLabel')}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => handleBlur('email')}
              autoComplete="new-password"
              autoFocus
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

            <button type="submit" className="nmpa-button nmpa-button--primary nmpa-button--block" disabled={isSubmitting}>
              {isSubmitting ? t(language, 'loggingInButton') : t(language, 'logInButton')}
            </button>
          </form>

          <p className="nmpa-auth__switch">
            {t(language, 'newHereText')}{' '}
            <button type="button" className="nmpa-link" onClick={onSwitchToSignup}>{t(language, 'createAccountLink')}</button>
          </p>

          <p className="nmpa-muted nmpa-muted--sm nmpa-auth__footnote">
            {t(language, 'footnote')}
          </p>
        </div>
      </div>
    </div>
  );
}
