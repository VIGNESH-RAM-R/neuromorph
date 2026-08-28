import { useState } from 'react';
import AuthTextField from '../auth/AuthTextField.jsx';
import BrandLogo from '../common/BrandLogo.jsx';
import { DEFAULT_LANGUAGE } from '../../config/i18nConfig.js';
import { t } from '../../i18n/strings/doctorAuth.js';

// The app_page counterpart to Doctor_Dashboard's AccessPendingScreen.jsx.
//
// 2026-08-25 REDESIGN -- this used to be a dead-end screen (real Firebase
// doctor auth auto-approved every account, so this rarely ever actually
// triggered -- see useDoctorAuth.js's old ACCESS-APPROVAL SCOPE NOTE). Now
// that accessApproved is a real gate again, this is the actual, working
// unlock path: a doctor stuck here enters the platform-wide access key
// their administrator shared with them (see FirestoreDoctorService.
// resolveAccessKey / useDoctorAuth.js's redeemAccessKey) -- no sign-out/
// sign-in round trip needed, the screen swaps away the moment it succeeds
// since currentDoctor.accessApproved flips in local state immediately.
// Same "invite code" form shape as CaregiverLinkPatientScreen.jsx.
export default function DoctorAccessPendingScreen({ doctor, onLogout, onRedeemAccessKey, errors = {}, isSubmitting = false, language = DEFAULT_LANGUAGE }) {
  const [key, setKey] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onRedeemAccessKey?.(key);
  };

  return (
    <div className="nmpa-session-loading" role="status">
      <BrandLogo size="lg" />
      <div className="nmpa-card" style={{ maxWidth: 480, textAlign: 'left' }}>
        <h1 className="nmpa-card__title">{t(language, 'accessPendingHeading')}</h1>
        <p className="nmpa-muted">
          {(() => {
            const [before, after] = t(language, 'accessPendingBody').split('{email}');
            return <>{before}<strong>{doctor?.email}</strong>{after}</>;
          })()}
        </p>
        <p className="nmpa-muted nmpa-muted--sm">
          {t(language, 'accessPendingNote')}
        </p>
        <form onSubmit={handleSubmit} className="nmpa-form" noValidate>
          <AuthTextField
            label={t(language, 'accessKeyOnlyLabel')}
            type="text"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            autoComplete="off"
            autoFocus
            error={errors?.accessKey}
          />
          <button type="submit" className="nmpa-button nmpa-button--primary nmpa-button--block" disabled={isSubmitting}>
            {isSubmitting ? t(language, 'verifyingButton') : t(language, 'unlockButton')}
          </button>
        </form>
        <button type="button" className="nmpa-button nmpa-button--secondary" onClick={onLogout} style={{ marginTop: 12 }}>
          {t(language, 'signOutButton')}
        </button>
      </div>
    </div>
  );
}
