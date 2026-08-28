import { useEffect, useState } from 'react';
import AuthTextField from '../auth/AuthTextField.jsx';
import { UserIcon } from '../icons/FormIcons.jsx';

// 2026-08-28 NEW (VR: "login laam panni dashboard kula vacha better ah
// irukum -- until that oru guest id maari irukatum -- only after
// selecting the patient ... activities ellam enable aaganum"). Extracted
// from the old CaregiverLinkPatientScreen.jsx, which used to be a
// full-page HARD GATE shown instead of the dashboard until a patient was
// linked -- a caregiver couldn't see anything, not even Morphy, until
// that finished. Same three states (none / pending / declined), same
// two link methods (invite code / username search), same onRefreshStatus
// poll -- just rendered as one card INSIDE CaregiverHomeSection now,
// so the caregiver lands in their dashboard immediately after login (a
// "guest" view: Ask Morphy works, but the check-in cards are locked --
// see CaregiverHomeSection.jsx) instead of being blocked at the door.
export default function CaregiverLinkPatientCard({
  onLink, onLinkByUsername, errors, isSubmitting, linkRequestStatus = 'none', pendingPatientName, onRefreshStatus,
}) {
  const [code, setCode] = useState('');
  const [mode, setMode] = useState('code'); // 'code' | 'username'
  const [username, setUsername] = useState('');

  // Poll every 8s while a request is pending, so the caregiver's dashboard
  // unlocks itself the moment the patient accepts -- no manual refresh.
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

  function handleUsernameSubmit(e) {
    e.preventDefault();
    onLinkByUsername(username);
  }

  if (linkRequestStatus === 'pending') {
    return (
      <section className="nmpa-card nmpa-anim-fade-up" style={{ '--nmpa-anim-delay': '0ms' }}>
        <h2 className="nmpa-card__title">Waiting for approval</h2>
        <p className="nmpa-muted">
          We sent {pendingPatientName || 'the patient'} a request to link your account. Once they accept it from
          their own app, your check-ins below will unlock automatically -- no need to do anything else in the
          meantime.
        </p>
      </section>
    );
  }

  return (
    <section className="nmpa-card nmpa-anim-fade-up" style={{ '--nmpa-anim-delay': '0ms' }}>
      <h2 className="nmpa-card__title">Link to a patient</h2>
      {linkRequestStatus === 'declined' && (
        <p className="nmpa-alert nmpa-alert--danger" style={{ marginBottom: 12 }}>
          {pendingPatientName ? `${pendingPatientName} declined that request.` : 'That request was declined.'} You
          can try a different code below.
        </p>
      )}
      {mode === 'code' ? (
        <>
          <p className="nmpa-muted">
            Ask the person you're caring for to open their NeuroMorph app, generate an invite code from their home
            screen, and share it with you. Entering it sends them a request -- they'll need to approve it from
            their own account before your check-ins unlock.
          </p>
          <form onSubmit={handleSubmit} className="nmpa-form" noValidate>
            <AuthTextField
              icon={<UserIcon />}
              label="Invite code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              autoComplete="off"
              error={errors?.inviteCode}
            />
            <button type="submit" className="nmpa-button nmpa-button--primary nmpa-button--block" disabled={isSubmitting}>
              {isSubmitting ? 'Sending request…' : 'Send Request'}
            </button>
          </form>
          {onLinkByUsername && (
            <button
              type="button"
              className="nmpa-link"
              style={{ marginTop: 14, display: 'inline-block' }}
              onClick={() => setMode('username')}
            >
              Or search for them by username instead
            </button>
          )}
        </>
      ) : (
        <>
          <p className="nmpa-muted">
            If you already know the patient's NeuroMorph username, search for them directly -- no code needed.
            Sending a request still requires them to approve it from their own account before your check-ins
            unlock.
          </p>
          <form onSubmit={handleUsernameSubmit} className="nmpa-form" noValidate>
            <AuthTextField
              icon={<UserIcon />}
              label="Patient's username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="off"
              error={errors?.username}
            />
            <button type="submit" className="nmpa-button nmpa-button--primary nmpa-button--block" disabled={isSubmitting}>
              {isSubmitting ? 'Sending request…' : 'Send Request'}
            </button>
          </form>
          <button
            type="button"
            className="nmpa-link"
            style={{ marginTop: 14, display: 'inline-block' }}
            onClick={() => setMode('code')}
          >
            Or use an invite code instead
          </button>
        </>
      )}
    </section>
  );
}
