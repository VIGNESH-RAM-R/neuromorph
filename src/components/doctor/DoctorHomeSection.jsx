import { useEffect, useState } from 'react';
import ThemeToggle from '../common/ThemeToggle.jsx';
import MorphyLaunchOverlay from '../chat/MorphyLaunchOverlay.jsx';
import BrandLogo from '../common/BrandLogo.jsx';
import AuthTopBar from '../auth/AuthTopBar.jsx';
import { DOCTOR_MOCK_PATIENTS } from '../../data/doctorMockPatients.js';
import { bandFromScore } from '../../config/scoringBands.js';
import { DEFAULT_LANGUAGE } from '../../config/i18nConfig.js';
import { t, format } from '../../i18n/strings/doctorHome.js';

function initials(name) {
  if (!name) return '?';
  return name.trim().split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase();
}

function greeting(language, now = new Date()) {
  const hour = now.getHours();
  if (hour < 12) return t(language, 'greetingMorning');
  if (hour < 18) return t(language, 'greetingAfternoon');
  return t(language, 'greetingEvening');
}

// The doctor counterpart to HomeSection.jsx -- a single-screen shell
// (doctors don't get the patient's 5-tab sidenav; today the only thing to
// do here is read your profile, open the clinical assistant, or open the
// full Doctor Dashboard) rather than generalizing DashboardShell's
// hardcoded SECTIONS just for a one-section role.
//
// 2026-08-23: "Go to Doctor Dashboard" used to link out to a separately
// hosted site (DOCTOR_DASHBOARD_URL); the full dashboard is now integrated
// directly into this app (see FullDoctorDashboard.jsx / App.jsx's
// doctorView state), so this calls onOpenDashboard instead of opening a
// new tab.
//
// 2026-08-21: same card-entrance treatment as patient Home (nmpa-anim-fade-up,
// 60ms stagger top to bottom) -- motion/design pass only.
// 2026-08-27: this screen (and DoctorChatPanel.jsx/DoctorChatBubbleButton.jsx)
// is now translated across all 7 languages (src/i18n/strings/doctorHome.js)
// -- previously stayed English-only on purpose ("same as the rest of the
// doctor/caregiver chrome"); that's done now for the doctor side (caregiver
// chrome stays excluded, per standing instructions).
//
// 2026-08-23 (VR request, "premium/professional, every page"): rebuilt as
// a bento grid reusing HomeSection.jsx's nmpa-home__row classes -- a narrow
// profile card next to the wider "ask the assistant" card, then a wide
// patient roster next to the Doctor Dashboard hand-off card, instead of a
// flat stack of 4 equal-width cards. Every string, prop, and conditional
// below is unchanged -- only the JSX structure/classNames moved.
export default function DoctorHomeSection({ doctor, onLogout, theme, onToggleTheme, onOpenChat, onOpenDashboard, language = DEFAULT_LANGUAGE, onChangeLanguage }) {
  const [isLaunching, setIsLaunching] = useState(false);

  // 2026-08-27 ADDITION -- reuse the patient dashboard's "Morphy is
  // opening" launch animation (MorphySection.jsx) here too, so the
  // animation plays wherever a Morphy/"open companion" entry point
  // exists, not only in the patient dashboard.
  useEffect(() => {
    if (!isLaunching) return undefined;
    const openTimer = window.setTimeout(onOpenChat, 610);
    const resetTimer = window.setTimeout(() => setIsLaunching(false), 760);
    return () => {
      window.clearTimeout(openTimer);
      window.clearTimeout(resetTimer);
    };
  }, [isLaunching, onOpenChat]);

  function launchAssistant() {
    if (!isLaunching) setIsLaunching(true);
  }

  if (!doctor) return null;
  const firstName = doctor.name?.split(' ')[1] || doctor.name?.split(' ')[0] || t(language, 'fallbackDoctorName');
  const profile = doctor.professionalProfile;

  return (
    <div className="nmpa-shell">
      <header className="nmpa-topbar">
        <BrandLogo size="sm" />
        <div className="nmpa-topbar__user">
          {onChangeLanguage && <AuthTopBar language={language} onChangeLanguage={onChangeLanguage} showAbout={false} className="nmpa-topbar__language" />}
          {theme && onToggleTheme && <ThemeToggle theme={theme} onToggle={onToggleTheme} size="sm" />}
          <span className="nmpa-avatar" aria-hidden="true">{initials(doctor.name)}</span>
          <span>{doctor.name}</span>
          <button type="button" className="nmpa-link" onClick={onLogout}>{t(language, 'logOutButton')}</button>
        </div>
      </header>

      {isLaunching && <MorphyLaunchOverlay />}
      <main className="nmpa-shell__main nmpa-home">
        <div className="nmpa-home__greeting">
          <p className="nmpa-eyebrow">{t(language, 'portalEyebrow')}</p>
          <h1 className="nmpa-home__title">{format(t(language, 'greetingTemplate'), { greeting: greeting(language), name: firstName })}</h1>
        </div>

        <div className="nmpa-home__bento">
          <div className="nmpa-home__row" style={{ gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.7fr)' }}>
            <section className="nmpa-card nmpa-anim-fade-up" style={{ '--nmpa-anim-delay': '0ms' }}>
              <h2 className="nmpa-card__title">{t(language, 'profileTitle')}</h2>
              {/* 2026-08-25 ADDITION -- the doctor's own searchable ID (see
                  FirestoreDoctorService.searchDoctors) was generated at
                  signup but never actually shown anywhere on the doctor's
                  own screen -- a patient or caregiver could search FOR a
                  doctor by this ID, but the doctor had no way to find out
                  and share their own. Surfaced here, first, since it's the
                  one piece of information this whole connection flow
                  depends on. */}
              <p className="nmpa-muted nmpa-muted--sm" style={{ marginTop: -4, marginBottom: 10 }}>
                {(() => {
                  const [before, after] = t(language, 'idNote').split('{id}');
                  return <>{before}<strong style={{ userSelect: 'all' }}>{doctor.doctorId}</strong>{after}</>;
                })()}
              </p>
              {profile ? (
                <ul className="nmpa-checklist">
                  <li className="nmpa-checklist__item">
                    <span><span className="nmpa-checklist__label">{t(language, 'specialtyLabel')}</span><span className="nmpa-muted nmpa-muted--sm"> {profile.specialty === 'Other' ? profile.specialtyOther : profile.specialty}</span></span>
                  </li>
                  <li className="nmpa-checklist__item">
                    <span><span className="nmpa-checklist__label">{t(language, 'yearsLabel')}</span><span className="nmpa-muted nmpa-muted--sm"> {profile.yearsOfPractice}</span></span>
                  </li>
                  <li className="nmpa-checklist__item">
                    <span><span className="nmpa-checklist__label">{t(language, 'practiceSettingLabel')}</span><span className="nmpa-muted nmpa-muted--sm"> {profile.practiceSetting === 'Other' ? profile.practiceSettingOther : profile.practiceSetting}</span></span>
                  </li>
                </ul>
              ) : (
                <p className="nmpa-muted">{t(language, 'noProfileText')}</p>
              )}
            </section>

            <section className="nmpa-card nmpa-anim-fade-up" style={{ '--nmpa-anim-delay': '60ms' }}>
              <h2 className="nmpa-card__title">{t(language, 'assistantTitle')}</h2>
              <p className="nmpa-muted">
                {t(language, 'assistantDesc')}
              </p>
              <button type="button" className="nmpa-button nmpa-button--primary" onClick={launchAssistant} disabled={isLaunching}>{t(language, 'openAssistantButton')}</button>
            </section>
          </div>

          <div className="nmpa-home__row nmpa-home__row--secondary">
            <section className="nmpa-card nmpa-anim-fade-up" style={{ '--nmpa-anim-delay': '120ms' }}>
              <h2 className="nmpa-card__title">{t(language, 'rosterTitle')}</h2>
              <p className="nmpa-muted nmpa-muted--sm">
                {t(language, 'rosterDesc')}
              </p>
              <ul className="nmpa-checklist">
                {DOCTOR_MOCK_PATIENTS.map((p) => {
                  const latest = p.sessions[p.sessions.length - 1];
                  return (
                    <li key={p.patientId} className="nmpa-checklist__item">
                      <span>
                        <span className="nmpa-checklist__label">{p.name}</span>
                        <span className="nmpa-muted nmpa-muted--sm"> {p.patientId} -- latest {latest.overallRawScore} ({bandFromScore(latest.overallRawScore)})</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>

            <section className="nmpa-card nmpa-anim-fade-up" style={{ '--nmpa-anim-delay': '180ms' }}>
              <h2 className="nmpa-card__title">{t(language, 'fullDashboardTitle')}</h2>
              <p className="nmpa-muted nmpa-muted--sm">
                {t(language, 'fullDashboardDesc')}
              </p>
              <button type="button" className="nmpa-button nmpa-button--secondary" onClick={onOpenDashboard}>
                {t(language, 'goToDashboardButton')}
              </button>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
