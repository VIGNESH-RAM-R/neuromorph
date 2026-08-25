import { useEffect, useState } from 'react';
import AuthTextField from '../auth/AuthTextField.jsx';
import { UserIcon } from '../icons/FormIcons.jsx';
import BrandLogo from '../common/BrandLogo.jsx';

// Shown whenever a signed-in caregiver's account isn't linked to a patient
// yet (currentCaregiver.linkedPatientUid is null). Unlike
// DoctorAccessPendingScreen (a passive wait on an admin), this used to be
// a purely active retry screen -- but the 2026-08-23 connection redesign
// (VR: "let's make it through some other way") means entering a code no
// longer links instantly. It now sends the PATIENT a request, the same
// accept/decline step a doctor request already gets, so this screen has
// three real states instead of one:
//   'none'     -- no request out yet; show the code form.
//   'pending'  -- a request was sent; show a waiting message and poll
//                 (onRefreshStatus) for the patient's response instead of
//                 making the caregiver sign out/in to find out.
//   'declined' -- the patient said no; explain that plainly and let them
//                 try a different code right away.
export default function CaregiverLinkPatientScreen({
  onLink, onLogout, errors, isSubmitting, linkRequestStatus = 'none', pendingPatientName, onRefreshStatus,
}) {
  const [code, setCode] = useState('');

  // Poll every 8s while a request is pending, so the caregiver sees the
  // moment the patient accepts without needing to refresh anything
  // themselves -- App.jsx swaps this whole screen out automatically once
  // linkedPatientUid becomes non-null.
  useEffect(() => {
    if (linkRequestStatus !== 'pending' || !onRefreshStatus) return undefined;
    onRefreshStatus();
    const interval = setInterval(onRefreshStatus, 8000);
    return () => clearInterval(interval);
  }, [linkRequestStatus, onRefreshStatus]);

  function handleSubmit(e) {
    e.preventDefault();
    onLink(code);
  }

  if (linkRequestStatus === 'pending') {
    return (
      <div className="nmpa-session-loading" role="status">
        <BrandLogo size="lg" />
        <div className="nmpa-card" style={{ maxWidth: 480, textAlign: 'left' }}>
          <h1 className="nmpa-card__title">Waiting for approval</h1>
          <p className="nmpa-muted">
            We sent {pendingPatientName || 'the patient'} a request to link your account. Once they accept it from
            their own app, you'll land here automatically -- no need to do anything else in the meantime.
          </p>
          <button type="button" className="nmpa-button nmpa-button--secondary" onClick={onLogout} style={{ marginTop: 12 }}>
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="nmpa-session-loading" role="status">
      <BrandLogo size="lg" />
      <div className="nmpa-card" style={{ maxWidth: 480, textAlign: 'left' }}>
        <h1 className="nmpa-card__title">Link to a patient</h1>
        {linkRequestStatus === 'declined' && (
          <p className="nmpa-alert nmpa-alert--danger" style={{ marginBottom: 12 }}>
            {pendingPatientName ? `${pendingPatientName} declined that request.` : 'That request was declined.'} You
            can try a different code below.
          </p>
        )}
        <p className="nmpa-muted">
          Your account isn't linked to a patient yet. Ask the person you're caring for to open their NeuroMorph app,
          generate an invite code from their home screen, and share it with you. Entering it sends them a request --
          they'll need to approve it from their own account before you're linked.
        </p>
        <form onSubmit={handleSubmit} className="nmpa-form" noValidate>
          <AuthTextField
            icon={<UserIcon />}
            label="Invite code"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            autoComplete="off"
            autoFocus
            error={errors?.inviteCode}
          />
          <button type="submit" className="nmpa-button nmpa-button--primary nmpa-button--block" disabled={isSubmitting}>
            {isSubmitting ? 'Sending request…' : 'Send Request'}
          </button>
        </form>
        <button type="button" className="nmpa-button nmpa-button--secondary" onClick={onLogout} style={{ marginTop: 12 }}>
          Sign out
        </button>
      </div>
    </div>
  );
}
