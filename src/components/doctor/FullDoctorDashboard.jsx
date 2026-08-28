import DoctorDashboardApp from '../../doctorDashboard/App.jsx';
import { DEFAULT_LANGUAGE } from '../../config/i18nConfig.js';
import { t } from '../../i18n/strings/doctorHome.js';
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
//
// 2026-08-26 (VR): label changed from "Back to NEUROMORPH" -- onExit
// actually returns to doctorView 'home' (DoctorHomeSection, this doctor's
// own home screen -- see App.jsx), not out to the NEUROMORPH landing page.
// Since the doctor dashboard is fully integrated into app_page now (not a
// separate site), naming the actual destination instead of the app's own
// brand name reads as one connected product rather than two apps stitched
// together.
export default function FullDoctorDashboard({ onExit, language = DEFAULT_LANGUAGE }) {
  return (
    <div className="nmdd-root">
      <div className="nmpa-embedded-exit-bar nmpa-screen-only">
        <button type="button" className="nmpa-link" onClick={onExit}>&larr; {t(language, 'backToDoctorHome')}</button>
      </div>
      <DoctorDashboardApp />
    </div>
  );
}
