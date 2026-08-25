import { useState } from 'react';
import AuthTextField from '../auth/AuthTextField.jsx';
import BrandLogo from '../common/BrandLogo.jsx';

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
export default function DoctorAccessPendingScreen({ doctor, onLogout, onRedeemAccessKey, errors = {}, isSubmitting = false }) {
  const [key, setKey] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onRedeemAccessKey?.(key);
  };

  return (
    <div className="nmpa-session-loading" role="status">
      <BrandLogo size="lg" />
      <div className="nmpa-card" style={{ maxWidth: 480, textAlign: 'left' }}>
        <h1 className="nmpa-card__title">Access not set up yet</h1>
        <p className="nmpa-muted">
          You're signed in as <strong>{doctor?.email}</strong>, but this account isn't yet approved to view patient
          data.
        </p>
        <p className="nmpa-muted nmpa-muted--sm">
          If your administrator gave you a platform access key, enter it below to unlock your account immediately.
          Otherwise, ask them for one -- signing in alone doesn't grant patient data access.
        </p>
        <form onSubmit={handleSubmit} className="nmpa-form" noValidate>
          <AuthTextField
            label="Access key"
            type="text"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            autoComplete="off"
            autoFocus
            error={errors?.accessKey}
          />
          <button type="submit" className="nmpa-button nmpa-button--primary nmpa-button--block" disabled={isSubmitting}>
            {isSubmitting ? 'Verifying…' : 'Unlock access'}
          </button>
        </form>
        <button type="button" className="nmpa-button nmpa-button--secondary" onClick={onLogout} style={{ marginTop: 12 }}>
          Sign out
        </button>
      </div>
    </div>
  );
}
