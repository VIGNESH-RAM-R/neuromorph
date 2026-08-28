import { useState, useCallback, useEffect, useRef } from 'react';
import BrandLogo from './components/common/BrandLogo.jsx';
import { useAuth } from './hooks/useAuth.js';
import { useSelf } from './hooks/useSelf.js';
import { useMorphyChat } from './hooks/useMorphyChat.js';
import { useDetectionAssessment } from './hooks/useDetectionAssessment.js';
import { useOnboarding } from './hooks/useOnboarding.js';
import { useTheme } from './hooks/useTheme.js';
import { useLanguage } from './hooks/useLanguage.js';
import { useDoctorAuth } from './hooks/useDoctorAuth.js';
import { useDoctorChat } from './hooks/useDoctorChat.js';
import { useCaregiverAuth } from './hooks/useCaregiverAuth.js';
import { useCaregiverChat } from './hooks/useCaregiverChat.js';
import { CaregiverSelfModel } from './engines/CaregiverSelfModel.js';
import { DOCTOR_ONBOARDING_STEPS } from './config/doctorOnboardingConfig.js';
import { CAREGIVER_ONBOARDING_STEPS } from './config/caregiverOnboardingConfig.js';

import LoginScreen from './components/auth/LoginScreen.jsx';
import SignupScreen from './components/auth/SignupScreen.jsx';
import OnboardingStep from './components/onboarding/OnboardingStep.jsx';
import OnboardingComplete from './components/onboarding/OnboardingComplete.jsx';
import DashboardShell from './components/dashboard/DashboardShell.jsx';
import HomeSection from './components/dashboard/HomeSection.jsx';
import AssessmentSection from './components/dashboard/AssessmentSection.jsx';
import GamesSection from './components/dashboard/GamesSection.jsx';
import ProgressSection from './components/dashboard/ProgressSection.jsx';
import InsightsSection from './components/dashboard/InsightsSection.jsx';
import ReportsSection from './components/dashboard/ReportsSection.jsx';
import MorphySection from './components/dashboard/MorphySection.jsx';
import PrintableSelfReport from './components/reports/PrintableSelfReport.jsx';
import MorphyCompanion from './components/companion/MorphyCompanion.jsx';
import ChatPanel from './components/chat/ChatPanel.jsx';
import RoleGateScreen from './components/auth/RoleGateScreen.jsx';
import DoctorLoginScreen from './components/doctor/DoctorLoginScreen.jsx';
import DoctorSignupScreen from './components/doctor/DoctorSignupScreen.jsx';
import DoctorAccessPendingScreen from './components/doctor/DoctorAccessPendingScreen.jsx';
import DoctorHomeSection from './components/doctor/DoctorHomeSection.jsx';
import FullDoctorDashboard from './components/doctor/FullDoctorDashboard.jsx';
import PrintableDoctorPatientReport from './components/reports/PrintableDoctorPatientReport.jsx';
import DoctorChatBubbleButton from './components/doctor/DoctorChatBubbleButton.jsx';
import DoctorChatPanel from './components/doctor/DoctorChatPanel.jsx';
import CaregiverLoginScreen from './components/caregiver/CaregiverLoginScreen.jsx';
import CaregiverSignupScreen from './components/caregiver/CaregiverSignupScreen.jsx';
import CaregiverHomeSection from './components/caregiver/CaregiverHomeSection.jsx';
import CaregiverChatBubbleButton from './components/caregiver/CaregiverChatBubbleButton.jsx';
import CaregiverChatPanel from './components/caregiver/CaregiverChatPanel.jsx';
import InstallAppPrompt from './components/common/InstallAppPrompt.jsx';

// Single top-level wiring point, same shape as the Doctor Dashboard's
// App.jsx and AI_ChatBot's App.jsx: one `useMorphyChat()` instance shared
// between the always-present corner bubble and the dedicated "Chat with
// Morphy" section's "Open Chat" button, so both open the SAME conversation.
export default function App() {
  const auth = useAuth();
  const self = useSelf(auth.currentUser);
  const assessment = useDetectionAssessment();
  const onboarding = useOnboarding();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  // 2026-08-18: language is threaded into both chat hooks now, so Morphy
  // (patient and doctor) replies in whatever language is selected app-wide
  // -- see LanguageEngine.promptInstruction's comment for exactly how.
  const chat = useMorphyChat(assessment.phase, language);
  const [activeSection, setActiveSection] = useState('home');
  const hasRecordedThisCompletion = useRef(false);

  // 2026-08-17: the doctor front door -- role is chosen once, before either
  // login form, via RoleGateScreen. `null` means "not chosen yet" (show the
  // role gate); everything below this is a completely separate hook stack
  // from the patient flow above, mirroring how Doctor_Dashboard is a
  // separate app rather than a role flag bolted onto useAuth.
  // 2026-08-24 ADDITION (VR: "give me a link that directs me inside
  // caregiver dashboard") -- a plain ?role=caregiver|patient|doctor query
  // param skips RoleGateScreen and lands directly on that role's own
  // login/signup screen, so a specific role can be reached/tested with one
  // bookmarked URL instead of clicking through the landing page every
  // time. Read once at mount (not on every render) since role selection
  // is otherwise fully in-app state (setRole) -- this is only a shortcut
  // for the FIRST screen shown, not a routing system. Still requires a
  // real login -- there's no way to skip authentication itself, by design.
  const [role, setRole] = useState(() => {
    if (typeof window === 'undefined') return null;
    const requested = new URLSearchParams(window.location.search).get('role');
    return ['patient', 'caregiver', 'doctor'].includes(requested) ? requested : null;
  });
  // 2026-08-23: 'home' | 'dashboard' -- which doctor screen is showing.
  // Separate from `role`/`activeSection` (the patient tab state) since the
  // full Doctor Dashboard is a whole other integrated app (see
  // FullDoctorDashboard.jsx), not one more section on this shell.
  const [doctorView, setDoctorView] = useState('home');
  const doctorAuth = useDoctorAuth();
  const doctorOnboarding = useOnboarding(DOCTOR_ONBOARDING_STEPS);
  const doctorChat = useDoctorChat(language);

  // 2026-08-19: third role, same "completely separate hook stack" pattern
  // as the doctor branch above -- see useCaregiverAuth.js.
  const caregiverAuth = useCaregiverAuth();
  const caregiverOnboarding = useOnboarding(CAREGIVER_ONBOARDING_STEPS);
  const caregiverChat = useCaregiverChat(language);
  const caregiverSelf = caregiverAuth.currentCaregiver ? CaregiverSelfModel.build(caregiverAuth.currentCaregiver) : null;

  const handlePrint = useCallback(() => window.print(), []);
  const handleLogout = useCallback(() => {
    auth.logout();
    onboarding.reset();
    setRole(null);
  }, [auth, onboarding]);

  const handleDoctorLogout = useCallback(() => {
    doctorAuth.logout();
    doctorOnboarding.reset();
    doctorChat.restart();
    setRole(null);
    setDoctorView('home');
  }, [doctorAuth, doctorOnboarding, doctorChat]);

  const handleCaregiverLogout = useCallback(() => {
    caregiverAuth.logout();
    caregiverOnboarding.reset();
    caregiverChat.restart();
    setRole(null);
  }, [caregiverAuth, caregiverOnboarding, caregiverChat]);

  // 2026-08-24 ADDITION -- checks once as soon as this caregiver is linked
  // (covers "the patient already had an assessment done before I linked"),
  // then every 5 minutes while the Home screen is open, so a caregiver
  // sitting on the app when the patient finishes their weekly assessment
  // sees the new set unlock without needing to log out/in. Cheap no-op read
  // when nothing is due -- see useCaregiverAuth.js's checkForDeepCheckinUnlock.
  const linkedCaregiverPatientUid = caregiverAuth.currentCaregiver?.linkedPatientUid;
  useEffect(() => {
    if (!linkedCaregiverPatientUid) return undefined;
    caregiverAuth.checkForDeepCheckinUnlock();
    const interval = setInterval(() => caregiverAuth.checkForDeepCheckinUnlock(), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [linkedCaregiverPatientUid, caregiverAuth.checkForDeepCheckinUnlock]);

  // The doctor chat's "generate a PDF for <patient>" flow sets
  // patientToPrint; this is the one place that actually opens the browser
  // print dialog, same "hook decides, App triggers the browser API" split
  // as handlePrint above. Cleared right after so re-asking for the same
  // patient still re-triggers a fresh print.
  useEffect(() => {
    if (doctorChat.patientToPrint) {
      const t = setTimeout(() => {
        window.print();
        doctorChat.clearPrintRequest();
      }, 50);
      return () => clearTimeout(t);
    }
  }, [doctorChat.patientToPrint, doctorChat.clearPrintRequest]);

  // The moment the assessment finishes, patch the in-memory record so
  // "this week's test: completed" shows immediately everywhere that reads
  // self.weeklyAssessment/weeklyCognitiveScoreHistory (Home, this section,
  // Progress) -- session-only, no backend yet, but real enough that the
  // app never re-invites a same-week retake right after finishing one.
  useEffect(() => {
    if (assessment.phase === 'complete' && assessment.session && !hasRecordedThisCompletion.current) {
      hasRecordedThisCompletion.current = true;
      auth.recordCompletedAssessment(assessment.session);
    }
    if (assessment.phase !== 'complete') {
      hasRecordedThisCompletion.current = false;
    }
  }, [assessment.phase, assessment.session, auth.recordCompletedAssessment]);

  // Firebase resolves whether a session already exists asynchronously --
  // this brief window only ever happens right on page load, and only when
  // Firebase is actually configured (see useAuth.js). Without this guard,
  // an already-logged-in user would see a flash of the login screen every
  // time they reload the page.
  if (auth.isCheckingSession) {
    return (
      <div className="nmpa-session-loading" role="status" aria-live="polite">
        <BrandLogo size="lg" />
        <p className="nmpa-muted">Loading your session…</p>
      </div>
    );
  }

  // Role picker is the very first screen -- before either login form.
  if (role === null) {
    return <RoleGateScreen onSelectRole={setRole} theme={theme} onToggleTheme={toggleTheme} language={language} onChangeLanguage={setLanguage} />;
  }

  if (role === 'doctor') {
    if (doctorAuth.isCheckingSession) {
      return (
        <div className="nmpa-session-loading" role="status" aria-live="polite">
          <BrandLogo size="lg" />
          <p className="nmpa-muted">Loading your session…</p>
        </div>
      );
    }
    if (!doctorAuth.isAuthenticated) {
      return doctorAuth.view === 'signup' ? (
        <DoctorSignupScreen
          onSignup={doctorAuth.signup}
          onSwitchToLogin={() => doctorAuth.setView('login')}
          onSocialAuth={doctorAuth.loginWithProvider}
          onBackToRoleGate={() => setRole(null)}
          errors={doctorAuth.errors}
          isSubmitting={doctorAuth.isSubmitting}
          theme={theme}
          onToggleTheme={toggleTheme}
          language={language}
          onChangeLanguage={setLanguage}
        />
      ) : (
        <DoctorLoginScreen
          onLogin={doctorAuth.login}
          onSwitchToSignup={() => doctorAuth.setView('signup')}
          onSocialAuth={doctorAuth.loginWithProvider}
          onBackToRoleGate={() => setRole(null)}
          errors={doctorAuth.errors}
          isSubmitting={doctorAuth.isSubmitting}
          theme={theme}
          onToggleTheme={toggleTheme}
          language={language}
          onChangeLanguage={setLanguage}
        />
      );
    }

    // Shown exactly once, right after a fresh doctor signup (never after a
    // login -- MOCK_DOCTOR defaults to onboardingComplete: true, same
    // pattern as the patient flow's MOCK_SELF vs. signup() override).
    if (doctorAuth.currentDoctor?.onboardingComplete === false) {
      if (doctorOnboarding.isComplete) {
        return (
          <OnboardingComplete
            wasSkipped={doctorOnboarding.wasSkipped}
            onContinue={() => doctorAuth.completeOnboarding(doctorOnboarding.profile)}
          />
        );
      }
      return (
        <OnboardingStep
          steps={DOCTOR_ONBOARDING_STEPS}
          stepId={doctorOnboarding.currentStepId}
          values={doctorOnboarding.values}
          errors={doctorOnboarding.errors}
          onFieldChange={doctorOnboarding.setFieldValue}
          onNext={doctorOnboarding.next}
          onBack={doctorOnboarding.back}
          onSkip={doctorOnboarding.skip}
          stepNumber={doctorOnboarding.stepNumber}
          totalSteps={doctorOnboarding.totalSteps}
        />
      );
    }

    // Signing in doesn't automatically grant patient data access -- an
    // administrator must add the account first (mirrors the real
    // Doctor Dashboard's admin-approval gate; see mockDoctor.js).
    if (doctorAuth.currentDoctor && !doctorAuth.currentDoctor.accessApproved) {
      return (
        <DoctorAccessPendingScreen
          doctor={doctorAuth.currentDoctor}
          onLogout={handleDoctorLogout}
          onRedeemAccessKey={doctorAuth.redeemAccessKey}
          errors={doctorAuth.errors}
          isSubmitting={doctorAuth.isSubmitting}
          language={language}
        />
      );
    }

    if (doctorView === 'dashboard') {
      return <FullDoctorDashboard onExit={() => setDoctorView('home')} language={language} />;
    }

    return (
      <>
        <div className="nmpa-screen-only">
          <DoctorHomeSection
            doctor={doctorAuth.currentDoctor}
            onLogout={handleDoctorLogout}
            theme={theme}
            onToggleTheme={toggleTheme}
            onOpenChat={doctorChat.open}
            onOpenDashboard={() => setDoctorView('dashboard')}
            language={language}
            onChangeLanguage={setLanguage}
          />
        </div>

        <div className="morphy-widget">
          {doctorChat.isOpen && (
            <DoctorChatPanel
              messages={doctorChat.messages}
              inputValue={doctorChat.inputValue}
              onInputChange={doctorChat.setInputValue}
              onSend={doctorChat.send}
              onSuggestionClick={doctorChat.selectSuggestion}
              onUploadReport={doctorChat.uploadReport}
              isThinking={doctorChat.isThinking}
              onClose={doctorChat.close}
              language={language}
            />
          )}
          <DoctorChatBubbleButton isOpen={doctorChat.isOpen} onToggle={doctorChat.toggle} language={language} />
        </div>

        <InstallAppPrompt language={language} />
        <PrintableDoctorPatientReport patient={doctorChat.patientToPrint} />
      </>
    );
  }

  if (role === 'caregiver') {
    if (caregiverAuth.isCheckingSession) {
      return (
        <div className="nmpa-session-loading" role="status" aria-live="polite">
          <BrandLogo size="lg" />
          <p className="nmpa-muted">Loading your session…</p>
        </div>
      );
    }
    if (!caregiverAuth.isAuthenticated) {
      return caregiverAuth.view === 'signup' ? (
        <CaregiverSignupScreen
          onSignup={caregiverAuth.signup}
          onSwitchToLogin={() => caregiverAuth.setView('login')}
          onSocialAuth={caregiverAuth.loginWithProvider}
          onBackToRoleGate={() => setRole(null)}
          errors={caregiverAuth.errors}
          isSubmitting={caregiverAuth.isSubmitting}
          theme={theme}
          onToggleTheme={toggleTheme}
          language={language}
          onChangeLanguage={setLanguage}
        />
      ) : (
        <CaregiverLoginScreen
          onLogin={caregiverAuth.login}
          onSwitchToSignup={() => caregiverAuth.setView('signup')}
          onSocialAuth={caregiverAuth.loginWithProvider}
          onBackToRoleGate={() => setRole(null)}
          errors={caregiverAuth.errors}
          isSubmitting={caregiverAuth.isSubmitting}
          theme={theme}
          onToggleTheme={toggleTheme}
          language={language}
          onChangeLanguage={setLanguage}
        />
      );
    }

    // Shown exactly once, right after a fresh caregiver signup -- same
    // pattern as the doctor branch above.
    if (caregiverAuth.currentCaregiver?.onboardingComplete === false) {
      if (caregiverOnboarding.isComplete) {
        return (
          <OnboardingComplete
            wasSkipped={caregiverOnboarding.wasSkipped}
            onContinue={() => caregiverAuth.completeOnboarding(caregiverOnboarding.profile)}
          />
        );
      }
      return (
        <OnboardingStep
          steps={CAREGIVER_ONBOARDING_STEPS}
          stepId={caregiverOnboarding.currentStepId}
          values={caregiverOnboarding.values}
          errors={caregiverOnboarding.errors}
          onFieldChange={caregiverOnboarding.setFieldValue}
          onNext={caregiverOnboarding.next}
          onBack={caregiverOnboarding.back}
          onSkip={caregiverOnboarding.skip}
          stepNumber={caregiverOnboarding.stepNumber}
          totalSteps={caregiverOnboarding.totalSteps}
        />
      );
    }

    // 2026-08-28 REDESIGN (VR: "login laam panni dashboard kula vacha
    // better ah irukum -- until that oru guest id maari irukatum -- only
    // after selecting the patient ... activities ellam enable aaganum").
    // This used to be a hard gate: an unlinked caregiver saw ONLY
    // CaregiverLinkPatientScreen, full-page, nothing else -- no Morphy, no
    // dashboard, nothing -- until a patient accepted their request. Now
    // the caregiver lands in the real dashboard immediately after login
    // (a "guest" view), and the exact same link form lives as a card
    // inside CaregiverHomeSection (see CaregiverLinkPatientCard.jsx) --
    // Ask Morphy works right away, and the two check-in cards stay locked
    // (with an explicit "link to a patient first" message) until
    // linkedPatientUid actually becomes non-null. See
    // useCaregiverAuth.js's LINKING NOTE for the request/accept flow
    // itself, which is unchanged.
    return (
      <>
        <div className="nmpa-screen-only">
          <CaregiverHomeSection
            self={caregiverSelf}
            microAnswers={caregiverAuth.currentCaregiver?.microToday?.completion}
            deepAnswers={caregiverAuth.currentCaregiver?.deepCheckin?.completion}
            onMicroAnswer={caregiverAuth.recordMicroCheckinAnswer}
            onDeepAnswer={caregiverAuth.recordDeepCheckinAnswer}
            onOpenChat={caregiverChat.open}
            onLogout={handleCaregiverLogout}
            theme={theme}
            onToggleTheme={toggleTheme}
            language={language}
            onChangeLanguage={setLanguage}
            onLink={caregiverAuth.linkToPatient}
            onLinkByUsername={caregiverAuth.linkToPatientByUsername}
            linkErrors={caregiverAuth.errors}
            isLinkSubmitting={caregiverAuth.isSubmitting}
            linkRequestStatus={caregiverAuth.currentCaregiver?.linkRequestStatus}
            pendingPatientName={caregiverAuth.currentCaregiver?.pendingPatientName}
            onRefreshStatus={caregiverAuth.refreshLinkStatus}
          />
        </div>

        <div className="morphy-widget">
          {caregiverChat.isOpen && (
            <CaregiverChatPanel
              messages={caregiverChat.messages}
              inputValue={caregiverChat.inputValue}
              onInputChange={caregiverChat.setInputValue}
              onSend={caregiverChat.send}
              onSuggestionClick={caregiverChat.selectSuggestion}
              onUploadReport={caregiverChat.uploadReport}
              isThinking={caregiverChat.isThinking}
              onClose={caregiverChat.close}
              language={language}
            />
          )}
          <CaregiverChatBubbleButton isOpen={caregiverChat.isOpen} onToggle={caregiverChat.toggle} />
        </div>
        <InstallAppPrompt language={language} />
      </>
    );
  }

  if (!auth.isAuthenticated) {
    return auth.view === 'signup' ? (
      <SignupScreen
        onSignup={auth.signup}
        onSwitchToLogin={() => auth.setView('login')}
        onSocialAuth={auth.loginWithProvider}
        onBackToRoleGate={() => setRole(null)}
        errors={auth.errors}
        isSubmitting={auth.isSubmitting}
        theme={theme}
        onToggleTheme={toggleTheme}
        language={language}
        onChangeLanguage={setLanguage}
      />
    ) : (
      <LoginScreen
        onLogin={auth.login}
        onSwitchToSignup={() => auth.setView('signup')}
        onSocialAuth={auth.loginWithProvider}
        onBackToRoleGate={() => setRole(null)}
        errors={auth.errors}
        isSubmitting={auth.isSubmitting}
        theme={theme}
        onToggleTheme={toggleTheme}
        language={language}
        onChangeLanguage={setLanguage}
      />
    );
  }

  // Shown exactly once, right after a fresh signup (never after a login --
  // see MOCK_SELF's default vs. signup()'s explicit override in
  // useAuth.js). Gated on the raw auth flag rather than anything in
  // SelfModel's curated output, since this is an auth-flow concern, not a
  // "cognitive self" one.
  if (auth.currentUser?.onboardingComplete === false) {
    if (onboarding.isComplete) {
      return (
        <OnboardingComplete
          wasSkipped={onboarding.wasSkipped}
          onContinue={() => auth.completeOnboarding(onboarding.profile)}
        />
      );
    }
    return (
      <OnboardingStep
        stepId={onboarding.currentStepId}
        values={onboarding.values}
        errors={onboarding.errors}
        onFieldChange={onboarding.setFieldValue}
        onNext={onboarding.next}
        onBack={onboarding.back}
        onSkip={onboarding.skip}
        stepNumber={onboarding.stepNumber}
        totalSteps={onboarding.totalSteps}
      />
    );
  }

  return (
    <>
      <div className="nmpa-screen-only">
        <DashboardShell activeSection={activeSection} onSelectSection={setActiveSection} userName={self?.name} onLogout={handleLogout} theme={theme} onToggleTheme={toggleTheme} language={language} onChangeLanguage={setLanguage}>
          {activeSection === 'home' && (
            <HomeSection
              self={self}
              onGoToAssessment={() => setActiveSection('assessment')}
              onGoToGames={() => setActiveSection('games')}
              caregiverInviteCode={auth.currentUser?.caregiverInviteCode}
              onGenerateInviteCode={auth.generateCaregiverInviteCode}
              language={language}
              currentUser={auth.currentUser}
            />
          )}
          {activeSection === 'assessment' && (
            <AssessmentSection self={self} assessment={assessment} onGoToProgress={() => setActiveSection('progress')} language={language} />
          )}
          {activeSection === 'games' && (
            <GamesSection
              self={self}
              onCompleteTask={(taskId, score) => auth.recordCompletedDailyTask(taskId, score)}
              onGoToAssessment={() => setActiveSection('assessment')}
              language={language}
            />
          )}
          {activeSection === 'progress' && <ProgressSection self={self} language={language} />}
          {activeSection === 'insights' && <InsightsSection self={self} language={language} />}
          {activeSection === 'reports' && (
            <ReportsSection self={self} onDownloadReport={handlePrint} currentUser={auth.currentUser} language={language} />
          )}
          {activeSection === 'morphy' && <MorphySection onOpenChat={chat.open} language={language} />}
        </DashboardShell>
      </div>

      {/* 2026-08-28 REPLACEMENT (VR, this session: "isn't this just a
         chatbot with a mascot skin" -- Goal 2). ChatBubbleButton (a plain
         floating icon) is no longer rendered for the patient shell --
         MorphyCompanion.jsx is the one persistent presence in this corner
         now: it still opens/toggles this exact same ChatPanel
         (onOpenChat={chat.toggle}, same call ChatBubbleButton used to
         make), but also idles, transitions between dashboard sections, and
         reacts to real app events (streak milestones, Daily Set
         completion, momentum improvement, a newly-due weekly assessment --
         see MorphyCompanionEngine.js) without ever being tapped. See
         theme.css's .nmpa-morphy-panel-slot for why the panel now has its
         own fixed slot instead of stacking above ChatBubbleButton via
         flex. ChatBubbleButton itself is untouched and still used as-is by
         the doctor and caregiver shells above. */}
      <div className="nmpa-morphy-panel-slot">
        {chat.isOpen && (
          <ChatPanel
            messages={chat.messages}
            inputValue={chat.inputValue}
            onInputChange={chat.setInputValue}
            onSend={chat.send}
            onSuggestionClick={chat.selectSuggestion}
            onUploadReport={chat.uploadReport}
            isThinking={chat.isThinking}
            onClose={chat.close}
            language={language}
          />
        )}
      </div>
      <MorphyCompanion
        self={self}
        assessmentPhase={assessment.phase}
        activeSection={activeSection}
        onOpenChat={chat.toggle}
        language={language}
      />

      <InstallAppPrompt language={language} />

      {/* Sibling of the screen-only wrapper so print.css can hide the
          interactive dashboard and show only this. */}
      <PrintableSelfReport self={self} />
    </>
  );
}
