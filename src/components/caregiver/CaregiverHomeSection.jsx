import ThemeToggle from '../common/ThemeToggle.jsx';
import AuthTopBar from '../auth/AuthTopBar.jsx';
import BrandLogo from '../common/BrandLogo.jsx';
import CaregiverDailyCheckIn from './CaregiverDailyCheckIn.jsx';
import CareTeamSection from '../dashboard/CareTeamSection.jsx';
import CaregiverLinkPatientCard from './CaregiverLinkPatientCard.jsx';
import { useCountUp } from '../../hooks/useCountUp.js';

function initials(name) {
  if (!name) return '?';
  return name.trim().split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase();
}

function greeting(now = new Date()) {
  const hour = now.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

// The caregiver counterpart to HomeSection.jsx/DoctorHomeSection.jsx --
// single-screen shell (a caregiver's whole job here is the daily check-in
// + Morphy, no multi-tab nav needed) showing who they're linked to, their
// streak, today's 15-question check-in, and the caregiver assistant.
//
// 2026-08-21: same card-entrance treatment as patient Home (nmpa-anim-fade-up,
// 60ms stagger), plus the same lit-flame + count-up streak number treatment
// HomeSection.jsx uses (nmpa-streak__flame.is-lit, useCountUp) -- same
// "streak" concept, same visual language, not a one-off reinvention.
//
// 2026-08-23 (VR request, "premium/professional, every page"): rebuilt as
// a bento grid using the exact same nmpa-home__bento/row classes
// HomeSection.jsx introduced -- a wide "Caring for" hero card next to the
// streak card, matching the patient Home layout language instead of a flat
// stack.
//
// 2026-08-24 REDESIGN (VR: "simpler tasks on day to day basis" alongside
// "once a week... after the patient completes the detection assessment"):
// the single 15-question daily check-in is now TWO independent cards --
// a always-available 2-question daily pulse (self.micro, streak-bearing)
// and a 15-question weekly deep check-in (self.deep) that's locked until
// the linked patient finishes an assessment, then stays available until
// answered or superseded by the next assessment.
export default function CaregiverHomeSection({
  self, microAnswers, deepAnswers, onMicroAnswer, onDeepAnswer, onOpenChat, onLogout, theme, onToggleTheme, language, onChangeLanguage,
  // 2026-08-28 ADDITION -- see CaregiverLinkPatientCard.jsx's header comment. Passed straight
  // through from App.jsx so an unlinked caregiver can send/retry a link request without ever
  // leaving the dashboard.
  onLink, onLinkByUsername, linkErrors, isLinkSubmitting, linkRequestStatus, pendingPatientName, onRefreshStatus,
}) {
  if (!self) return null;
  const firstName = self.name?.split(' ')[0] || 'there';
  const animatedStreak = useCountUp(self.streak ?? 0);

  return (
    <div className="nmpa-shell">
      <header className="nmpa-topbar">
        <BrandLogo size="sm" />
        <div className="nmpa-topbar__user">
          {onChangeLanguage && <AuthTopBar language={language} onChangeLanguage={onChangeLanguage} showAbout={false} className="nmpa-topbar__language" />}
          {theme && onToggleTheme && <ThemeToggle theme={theme} onToggle={onToggleTheme} size="sm" />}
          <span className="nmpa-avatar" aria-hidden="true">{initials(self.name)}</span>
          <span>{self.name}</span>
          <button type="button" className="nmpa-link" onClick={onLogout}>Log out</button>
        </div>
      </header>

      <main className="nmpa-shell__main nmpa-home">
        <div className="nmpa-home__greeting">
          <p className="nmpa-eyebrow">Caregiver</p>
          <h1 className="nmpa-home__title">{greeting()}, {firstName}.</h1>
        </div>

        <div className="nmpa-home__bento">
          <div className="nmpa-home__row nmpa-home__row--hero">
            <section className="nmpa-card nmpa-home__hero nmpa-anim-fade-up" style={{ '--nmpa-anim-delay': '0ms' }}>
              <div>
                <p className="nmpa-eyebrow">Caring for</p>
                <p className="nmpa-home__score" style={{ fontSize: 28 }}>{self.linkedPatientName || 'Not linked'}</p>
                <p className="nmpa-muted">{self.micro.completedCount} of {self.micro.totalCount} quick check-in questions done today.</p>
              </div>
            </section>

            <section className="nmpa-card nmpa-home__streak-card nmpa-anim-fade-up" style={{ '--nmpa-anim-delay': '60ms' }}>
              <div className="nmpa-streak">
                <p className="nmpa-streak__count">
                  <span className={`nmpa-streak__flame ${self.streak > 0 ? 'is-lit' : ''}`} aria-hidden="true">🔥</span>
                  {animatedStreak}
                </p>
                <p className="nmpa-muted">day streak</p>
                {self.streak === 0
                  ? <p className="nmpa-muted nmpa-muted--sm">Complete today's quick check-in to start a streak.</p>
                  : <p className="nmpa-muted nmpa-muted--sm">Longest: {self.longestStreak} days</p>}
              </div>
            </section>
          </div>

          {/* 2026-08-28 ADDITION (VR: "dashboard kula vacha better ah
             irukum ... guest id maari irukatum") -- an unlinked caregiver
             used to be hard-blocked on a separate full-page screen before
             ever seeing this dashboard. Now they land here right after
             login/onboarding and get this card instead; Ask Morphy stays
             open for general guidance, only the two check-ins below stay
             locked until linking actually finishes. */}
          {!self.isLinked && (
            <CaregiverLinkPatientCard
              onLink={onLink}
              onLinkByUsername={onLinkByUsername}
              errors={linkErrors}
              isSubmitting={isLinkSubmitting}
              linkRequestStatus={linkRequestStatus}
              pendingPatientName={pendingPatientName}
              onRefreshStatus={onRefreshStatus}
            />
          )}

          <section className="nmpa-card nmpa-anim-fade-up" style={{ '--nmpa-anim-delay': '120ms' }}>
            <h2 className="nmpa-card__title">Ask Morphy for Caregivers</h2>
            <p className="nmpa-muted">
              General caregiving guidance, help with the check-in, or questions about how NeuroMorph works -- upload a
              file, use voice input, or just type.
            </p>
            <button type="button" className="nmpa-button nmpa-button--primary" onClick={onOpenChat}>Open Morphy for Caregivers</button>
          </section>

          {/* 2026-08-24 ADDITION -- the always-on daily pulse (VR: "simpler
             tasks on a day to day basis"). Just 2 questions, every day, no
             rotation, no lock state -- meant to take 10 seconds and give the
             doctor a lightweight daily engagement signal alongside the
             weekly deep set below. */}
          <section className="nmpa-card nmpa-anim-fade-up" style={{ '--nmpa-anim-delay': '180ms' }}>
            <div className="nmpa-section__header">
              <h2 className="nmpa-card__title">Quick Daily Check-In</h2>
              {self.micro.fullyComplete && <span className="nmpa-tag nmpa-tag--info">Done for today</span>}
            </div>
            {self.isLinked ? (
              <>
                <p className="nmpa-muted">
                  Two quick questions about how {self.linkedPatientName || 'the patient'} seemed today -- takes a few
                  seconds, every day, and helps build a day-to-day picture alongside the weekly check-in below.
                </p>
                <CaregiverDailyCheckIn checklist={self.micro.checklist} answers={microAnswers} onAnswer={onMicroAnswer} />
              </>
            ) : (
              <p className="nmpa-muted">Link to a patient above to start your daily check-ins.</p>
            )}
          </section>

          {/* 2026-08-24 ADDITION -- the weekly deep set, now triggered by
             the patient's own assessment completion (see
             CaregiverWeeklyUnlockEngine.js) instead of a calendar day. Three
             states: locked (nothing to do yet), available (answer now),
             completed (already answered this week's set). */}
          <section className="nmpa-card nmpa-anim-fade-up" style={{ '--nmpa-anim-delay': '240ms' }}>
            <div className="nmpa-section__header">
              <h2 className="nmpa-card__title">Weekly Check-In</h2>
              {self.deep.status === 'completed' && <span className="nmpa-tag nmpa-tag--info">Completed this week</span>}
              {self.deep.status === 'locked' && <span className="nmpa-tag">Locked</span>}
            </div>
            {!self.isLinked && (
              <p className="nmpa-muted">Link to a patient above -- this unlocks after they complete a Detection Assessment.</p>
            )}
            {self.isLinked && self.deep.status === 'locked' && (
              <p className="nmpa-muted">
                This unlocks automatically right after {self.linkedPatientName || 'the patient'} completes their next
                Detection Assessment -- you'll be asked to observe and answer 15 questions covering memory, mood,
                daily activities, and safety.
              </p>
            )}
            {self.isLinked && self.deep.status !== 'locked' && (
              <>
                <p className="nmpa-muted">
                  {self.linkedPatientName || 'The patient'} completed a Detection Assessment on {self.deep.unlockedForDate} --
                  5 core questions plus 10 that rotate through a wider set, so the set rarely repeats week to week. Any
                  free-text question is always optional.
                </p>
                <CaregiverDailyCheckIn checklist={self.deep.checklist} answers={deepAnswers} onAnswer={onDeepAnswer} />
              </>
            )}
          </section>

          {self.isLinked && <CareTeamSection patientId={self.linkedPatientUid} patientName={self.linkedPatientName} />}
        </div>
      </main>
    </div>
  );
}
