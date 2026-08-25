import { useState } from 'react';
import ThemeToggle from '../layout/ThemeToggle.jsx';
import LanguageSelector from '../layout/LanguageSelector.jsx';
import { DEFAULT_LANGUAGE } from '../../config/i18nConfig.js';
import { t as tCommon } from '../../i18n/strings/common.js';
import { t as tAuth } from '../../i18n/strings/auth.js';

// Doctor sign-in / sign-up. Deliberately plain and clinical (matches the
// rest of this dashboard's design language) rather than the consumer-app
// styling app_page uses -- this is a professional tool, not a patient-facing
// screen. Real auth via useDoctorAuth (Firebase Auth); falls back to an
// instant demo login when Firebase isn't configured (see useDoctorAuth.js).
//
// i18n (2026-08-22): all static copy on this screen now goes through
// auth.js/common.js, all 7 languages. `doctorAuth.errors` (from
// DoctorAuthEngine.js's validation/Firebase-error mapping) is left in
// English on purpose, matching app_page's own AuthEngine.js precedent
// (see that file's header comment) -- form-validation/backend-error
// message translation is a separate, not-yet-done piece of scope in both
// apps, not something to invent differently here.
export default function DoctorLoginScreen({ doctorAuth, theme, onToggleTheme, language = DEFAULT_LANGUAGE, onChangeLanguage }) {
  const isSignup = doctorAuth.view === 'signup';
  const [fields, setFields] = useState({ name: '', email: '', password: '', confirmPassword: '' });

  const setField = (key) => (e) => setFields((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSignup) {
      await doctorAuth.signup(fields);
    } else {
      await doctorAuth.login(fields);
    }
  };

  return (
    <div className="nmdd-auth">
      <div className="nmdd-auth__card nmdd-card">
        <div className="nmdd-auth__header">
          <div className="nmdd-auth__logo" aria-hidden="true">N</div>
          <h1 className="nmdd-auth__title">NEUROMORPH {tCommon(language, 'brandSubtitle')}</h1>
          <p className="nmdd-auth__subtitle">
            {isSignup ? tAuth(language, 'signupSubtitle') : tAuth(language, 'signInSubtitle')}
          </p>
        </div>

        <form className="nmdd-auth__form" onSubmit={handleSubmit} autoComplete="off">
          {isSignup && (
            <div className="nmdd-auth__field">
              <label htmlFor="doctor-name">{tAuth(language, 'fullNameLabel')}</label>
              <input id="doctor-name" className="nmdd-input" type="text" value={fields.name} onChange={setField('name')} autoComplete="name" />
              {doctorAuth.errors.name && <span className="nmdd-auth__error">{doctorAuth.errors.name}</span>}
            </div>
          )}

          <div className="nmdd-auth__field">
            <label htmlFor="doctor-email">{tAuth(language, 'emailLabel')}</label>
            <input id="doctor-email" className="nmdd-input" type="email" value={fields.email} onChange={setField('email')} autoComplete="new-password" />
            {doctorAuth.errors.email && <span className="nmdd-auth__error">{doctorAuth.errors.email}</span>}
          </div>

          <div className="nmdd-auth__field">
            <label htmlFor="doctor-password">{tAuth(language, 'passwordLabel')}</label>
            <input id="doctor-password" className="nmdd-input" type="password" value={fields.password} onChange={setField('password')} autoComplete="new-password" />
            {doctorAuth.errors.password && <span className="nmdd-auth__error">{doctorAuth.errors.password}</span>}
          </div>

          {isSignup && (
            <div className="nmdd-auth__field">
              <label htmlFor="doctor-confirm-password">{tAuth(language, 'confirmPasswordLabel')}</label>
              <input id="doctor-confirm-password" className="nmdd-input" type="password" value={fields.confirmPassword} onChange={setField('confirmPassword')} autoComplete="new-password" />
              {doctorAuth.errors.confirmPassword && <span className="nmdd-auth__error">{doctorAuth.errors.confirmPassword}</span>}
            </div>
          )}

          <button type="submit" className="nmdd-button nmdd-button--primary nmdd-auth__submit" disabled={doctorAuth.isSubmitting}>
            {doctorAuth.isSubmitting ? tAuth(language, 'pleaseWait') : isSignup ? tAuth(language, 'createAccountBtn') : tAuth(language, 'signInBtn')}
          </button>
        </form>

        <div className="nmdd-auth__divider">{tAuth(language, 'orDivider')}</div>

        <button
          type="button"
          className="nmdd-auth__google-btn"
          onClick={doctorAuth.loginWithGoogle}
          disabled={doctorAuth.isSubmitting}
        >
          <span className="nmdd-auth__google-glyph" aria-hidden="true">G</span>
          {tAuth(language, 'continueWithGoogle')}
        </button>

        <p className="nmdd-auth__switch">
          {isSignup ? tAuth(language, 'alreadyHaveAccount') : tAuth(language, 'newHere')}
          <button type="button" className="nmdd-link" onClick={() => doctorAuth.setView(isSignup ? 'login' : 'signup')}>
            {isSignup ? tAuth(language, 'signInLink') : tAuth(language, 'createAccountLink')}
          </button>
        </p>

        <p className="nmdd-auth__footnote">
          {tAuth(language, 'authFootnote')}
        </p>

        <div className="nmdd-auth__theme-row">
          <LanguageSelector language={language} onChangeLanguage={onChangeLanguage} />
          <ThemeToggle theme={theme} onToggle={onToggleTheme} language={language} />
        </div>
      </div>
    </div>
  );
}
