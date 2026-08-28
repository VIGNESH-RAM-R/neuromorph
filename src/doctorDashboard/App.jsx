import { useState, useEffect, useCallback } from 'react';
import { useTheme } from './hooks/useTheme.js';
import { useLanguage } from './hooks/useLanguage.js';
import { useDoctorAuth } from './hooks/useDoctorAuth.js';
import { usePatientDirectory } from './hooks/usePatientDirectory.js';
import DashboardShell from './ui/layout/DashboardShell.jsx';
import PatientListScreen from './ui/patients/PatientListScreen.jsx';
import ConnectionRequestsScreen from './ui/patients/ConnectionRequestsScreen.jsx';
import PatientReportScreen from './ui/report/PatientReportScreen.jsx';
import DoctorLoginScreen from './ui/auth/DoctorLoginScreen.jsx';
import AccessPendingScreen from './ui/auth/AccessPendingScreen.jsx';
import { t as tCommon } from './i18n/strings/common.js';
import { FirestoreCareRelationshipService } from '../services/FirestoreCareRelationshipService.js';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const doctorAuth = useDoctorAuth();
  const [view, setView] = useState('list');
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [pendingRequestCount, setPendingRequestCount] = useState(0);

  // Only fetch real Firestore patients once a doctor is signed in AND has
  // confirmed /doctors/{uid} access -- see FirestorePatientService.js.
  const canLoadPatients = doctorAuth.isAuthenticated && doctorAuth.hasAccess === true;
  const directory = usePatientDirectory(canLoadPatients, doctorAuth.currentUser?.uid);

  // 2026-08-23: badge count for the new "Requests" nav item -- refreshed
  // on sign-in and again whenever a request is accepted/declined (see
  // ConnectionRequestsScreen's onRespond callback below).
  const refreshPendingCount = useCallback(async () => {
    if (!canLoadPatients || !doctorAuth.currentUser?.uid) return;
    try {
      const pending = await FirestoreCareRelationshipService.listPendingRequestsForDoctor(doctorAuth.currentUser.uid);
      setPendingRequestCount(pending.length);
    } catch {
      // Non-fatal -- the badge just stays at its last known value.
    }
  }, [canLoadPatients, doctorAuth.currentUser?.uid]);

  useEffect(() => {
    refreshPendingCount();
  }, [refreshPendingCount]);

  const openPatient = (patientId) => {
    setSelectedPatientId(patientId);
    setView('report');
  };

  const navigate = (nextView) => {
    if (nextView === 'report' && !selectedPatientId) return; // nothing to show yet
    setView(nextView);
  };

  // Firebase resolves whether a session already exists asynchronously --
  // this brief window only happens on page load, and only when Firebase is
  // actually configured (see useDoctorAuth.js). Without this guard, an
  // already-signed-in doctor would see a flash of the login screen on
  // every reload. `language` is already resolved synchronously from
  // localStorage by useLanguage() before this ever renders (same
  // precedent as app_page's RoleGateScreen -- see PROGRESS.md, 2026-08-20
  // 04:48 entry), so a returning doctor sees this in their own language too.
  if (doctorAuth.isCheckingSession) {
    return (
      <div className="nmdd-session-loading" role="status" aria-live="polite">
        <p className="nmdd-session-loading__brand">NEUROMORPH</p>
        <p>{tCommon(language, 'loadingSession')}</p>
      </div>
    );
  }

  if (!doctorAuth.isAuthenticated) {
    return (
      <DoctorLoginScreen
        doctorAuth={doctorAuth}
        theme={theme}
        onToggleTheme={toggleTheme}
        language={language}
        onChangeLanguage={setLanguage}
      />
    );
  }

  if (doctorAuth.hasAccess === false) {
    return <AccessPendingScreen currentUser={doctorAuth.currentUser} onLogout={doctorAuth.logout} language={language} />;
  }

  return (
    <DashboardShell
      theme={theme}
      onToggleTheme={toggleTheme}
      view={view}
      onNavigate={navigate}
      currentUser={doctorAuth.currentUser}
      onLogout={doctorAuth.logout}
      language={language}
      onChangeLanguage={setLanguage}
      pendingRequestCount={pendingRequestCount}
    >
      {view === 'list' && <PatientListScreen onOpenPatient={openPatient} patients={directory.patients} language={language} />}
      {view === 'requests' && (
        <ConnectionRequestsScreen
          doctorUid={doctorAuth.currentUser?.uid}
          onRespond={() => {
            refreshPendingCount();
            directory.reload();
          }}
          language={language}
        />
      )}
      {view === 'report' && (
        <PatientReportScreen
          patientId={selectedPatientId}
          onBack={() => setView('list')}
          patients={directory.patients}
          currentUser={doctorAuth.currentUser}
          language={language}
        />
      )}
    </DashboardShell>
  );
}
