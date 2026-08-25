import { DEFAULT_LANGUAGE } from '../../config/i18nConfig.js';
import { t as tCommon } from '../../i18n/strings/common.js';
import { t as tAuth } from '../../i18n/strings/auth.js';

// Shown when a doctor account is real and signed in, but has no
// /patients/** read access yet (no /doctors/{uid} document exists for
// them -- see app_page/FIREBASE_SETUP.md security rules). No self-service
// way to grant this exists yet, so this screen tells the signed-in person
// exactly what to hand an administrator rather than showing a dead end.
//
// i18n (2026-08-22): all 7 languages via auth.js/common.js. The literal
// "doctors" collection name in step 3 is a real Firestore identifier, not
// prose -- kept untranslated between accessPendingStep3Pre/Post, same
// reasoning as any other technical config value left in English elsewhere
// in this project.
export default function AccessPendingScreen({ currentUser, onLogout, language = DEFAULT_LANGUAGE }) {
  return (
    <div className="nmdd-auth">
      <div className="nmdd-auth__card nmdd-card">
        <div className="nmdd-access-pending__icon" aria-hidden="true">!</div>
        <h1 className="nmdd-auth__title" style={{ textAlign: 'center' }}>{tAuth(language, 'accessPendingTitle')}</h1>
        <p className="nmdd-auth__subtitle" style={{ textAlign: 'center' }}>
          {tAuth(language, 'accessPendingSubtitle')}
        </p>

        <div className="nmdd-access-pending__email">{currentUser?.email}</div>

        <ol className="nmdd-access-pending__steps">
          <li>{tAuth(language, 'accessPendingStep1')}</li>
          <li>{tAuth(language, 'accessPendingStep2')}</li>
          <li>
            {tAuth(language, 'accessPendingStep3Pre')}
            <code>doctors</code>
            {tAuth(language, 'accessPendingStep3Post')}
          </li>
          <li>{tAuth(language, 'accessPendingStep4')}</li>
        </ol>

        <button type="button" className="nmdd-button nmdd-button--secondary" onClick={onLogout} style={{ width: '100%', justifyContent: 'center' }}>
          {tCommon(language, 'signOut')}
        </button>
      </div>
    </div>
  );
}
