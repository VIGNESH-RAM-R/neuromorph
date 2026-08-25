import DoctorDashboardApp from '../../doctorDashboard/App.jsx';
import '../../doctorDashboard/styles/theme.css';
import '../../doctorDashboard/styles/print.css';

// 2026-08-23: the full Doctor Dashboard, integrated directly into
// app_page instead of living behind an external link (see
// DoctorHomeSection.jsx's "Go to Doctor Dashboard" card, which used to
// open DOCTOR_DASHBOARD_URL in a new tab -- a separately hosted site that
// 404s until its own deploy step is run). It now ships as part of this
// same build: same bundle, same Firebase project, same signed-in doctor
// session (DoctorDashboardApp's own useDoctorAuth() picks up the
// already-signed-in Firebase user via onAuthStateChanged, so a doctor who
// is already logged into app_page is NOT asked to log in again here --
// see doctorDashboard/hooks/useDoctorAuth.js).
//
// .nmdd-root (see doctorDashboard/styles/theme.css) scopes the dashboard's
// background/ink/font to this subtree only, so its theme can't bleed into
// the patient/caregiver chrome the rest of app_page uses. onExit renders a
// small fixed "back" bar above the dashboard's own top bar -- the
// dashboard itself has no concept of a parent app to return to.
export default function FullDoctorDashboard({ onExit }) {
  return (
    <div className="nmdd-root">
      <div className="nmpa-embedded-exit-bar nmpa-screen-only">
        <button type="button" className="nmpa-link" onClick={onExit}>&larr; Back to NEUROMORPH</button>
      </div>
      <DoctorDashboardApp />
    </div>
  );
}
