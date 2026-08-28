import MomentumRing from '../charts/MomentumRing.jsx';
import CaregiverRequestsPanel from './CaregiverRequestsPanel.jsx';
import { t, format } from '../../i18n/strings/home.js';
import { tNav } from '../../i18n/strings/common.js';
import { DEFAULT_LANGUAGE, SPEECH_RECOGNITION_LOCALE } from '../../config/i18nConfig.js';

function greeting(language, now = new Date()) {
  const hour = now.getHours();
  if (hour < 12) return t(language, 'goodMorning');
  if (hour < 18) return t(language, 'goodAfternoon');
  return t(language, 'goodEvening');
}

function formatDate(language, now = new Date()) {
  const locale = SPEECH_RECOGNITION_LOCALE[language] || SPEECH_RECOGNITION_LOCALE[DEFAULT_LANGUAGE];
  return now.toLocaleDateString(locale, { weekday: 'long', month: 'long', day: 'numeric' });
}

// 2026-08-19/20 overnight pass: full i18n (see src/i18n/strings/home.js --
// this is the reference implementation the rest of the app follows) plus a
// first Samsung Health-style visual pass -- an animated momentum ring
// instead of a plain number, a lit/pulsing streak flame, and staggered
// card entrance. Two things stay English-only here on purpose (documented
// in home.js's own header): milestone badge labels and the 5 daily task
// names/descriptions, both config-driven data rather than component copy.
//
// 2026-08-23 (VR request, "premium/professional, not a college project"):
// rebuilt as a bento grid -- a wide hero row (Momentum Score + Streak) and
// a wide secondary row (Today's Set + Detection Assessment status) instead
// of the previous flat stack of equal-width cards, matching the layout
// approved in the "NEUROMORPH -- Premium Redesign" Figma file. Every
// string call, prop, and conditional below is unchanged from the previous
// version -- only the JSX structure/classNames moved, no copy or logic
// changed. The assessment card's title reuses the existing nav label
// ("Detection Assessment", tNav('assessment','label')) rather than
// inventing new copy -- it didn't have a dedicated title before since it
// was a plain alert bar, not a card.
export default function HomeSection({ self, onGoToAssessment, onGoToGames, caregiverInviteCode, onGenerateInviteCode, language = DEFAULT_LANGUAGE, currentUser }) {
  if (!self) return null;
  const { name, today, streak, longestStreak, weeklyAssessment, milestone, weekendReminder } = self;
  const firstName = name?.split(' ')[0] || 'there';

  const weeklyStatusText = {
    overdue: t(language, 'weeklyOverdue'),
    'due-today': t(language, 'weeklyDueToday'),
    'not-due-yet': t(language, 'weeklyNotDueYet'),
    unknown: t(language, 'weeklyUnknown'),
  };

  // English pluralizes with a trailing "s"; the other 6 languages here
  // don't mark plural on this phrase the same way, so the {plural} token
  // in their strings is intentionally always empty -- see home.js.
  const nextMilestonePlural = language === 'en' && milestone?.next?.daysRemaining !== 1 ? 's' : '';

  return (
    <div className="nmpa-home">
      <div className="nmpa-home__greeting nmpa-anim-fade-up" style={{ '--nmpa-anim-delay': '0ms' }}>
        <p className="nmpa-eyebrow">{formatDate(language)}</p>
        <h1 className="nmpa-home__title">{greeting(language)}, {firstName}.</h1>
      </div>

      {weekendReminder?.showReminder && (
        <section className={`nmpa-card nmpa-alert nmpa-alert--${weekendReminder.isRestDay ? 'warn' : 'info'} nmpa-anim-fade-up`} style={{ '--nmpa-anim-delay': '60ms' }}>
          <p>{weekendReminder.isRestDay ? t(language, 'restDayBanner') : t(language, 'weekendPendingBanner')}</p>
          <button type="button" className="nmpa-button nmpa-button--secondary" onClick={onGoToAssessment}>{t(language, 'goToAssessment')}</button>
        </section>
      )}

      <div className="nmpa-home__bento">
        {/* Hero row: Momentum Score (wide) + Streak (narrow) */}
        <div className="nmpa-home__row nmpa-home__row--hero">
          <section className="nmpa-card nmpa-home__hero nmpa-anim-fade-up" style={{ '--nmpa-anim-delay': '120ms' }}>
            <div className="nmpa-home__hero-copy">
              <p className="nmpa-eyebrow">{t(language, 'todaysMomentumScore')}</p>
              <p className="nmpa-muted" style={{ marginTop: 10 }}>
                {today.momentum?.revealed
                  ? (today.momentum.performanceAvg !== undefined
                      ? format(t(language, 'tasksDoneBlended'), { completed: today.completedCount, total: today.totalCount })
                      : format(t(language, 'tasksDone'), { completed: today.completedCount, total: today.totalCount }))
                  : format(t(language, 'completeAllToReveal'), { total: today.totalCount, completed: today.completedCount })}
              </p>
            </div>
            <MomentumRing
              score={today.momentum?.score}
              revealed={Boolean(today.momentum?.revealed)}
              label={t(language, 'todaysMomentumScore')}
            />
          </section>

          <section className="nmpa-card nmpa-home__streak-card nmpa-anim-fade-up" style={{ '--nmpa-anim-delay': '160ms' }}>
            <div className="nmpa-streak">
              <p className="nmpa-streak__count">
                <span className={`nmpa-streak__flame ${streak > 0 ? 'is-lit' : ''}`} aria-hidden="true">🔥</span>
                {streak}
              </p>
              <p className="nmpa-muted">{t(language, 'dayStreak')}</p>
              {streak === 0
                ? <p className="nmpa-muted nmpa-muted--sm">{t(language, 'completeToStartStreak')}</p>
                : <p className="nmpa-muted nmpa-muted--sm">{format(t(language, 'longest'), { days: longestStreak })}</p>}
              {milestone?.current && (
                <p className="nmpa-milestone-badge">🏅 {milestone.current.label}</p>
              )}
              {milestone?.next && (
                <p className="nmpa-muted nmpa-muted--sm">{format(t(language, 'moreDaysTo'), { days: milestone.next.daysRemaining, plural: nextMilestonePlural, label: milestone.next.label })}</p>
              )}
            </div>
          </section>
        </div>

        {/* Secondary row: Today's Set (wide) + Detection Assessment status (narrow) */}
        <div className="nmpa-home__row nmpa-home__row--secondary">
          <section className="nmpa-card nmpa-home__set-card nmpa-anim-fade-up" style={{ '--nmpa-anim-delay': '200ms' }}>
            <div className="nmpa-section__header">
              <h2 className="nmpa-card__title">{t(language, 'todaysSet')}</h2>
              {today.isRestDay && <span className="nmpa-tag nmpa-tag--info">{t(language, 'restDayOptionalTag')}</span>}
            </div>
            <ul className="nmpa-checklist">
              {today.checklist.map((task) => (
                <li key={task.id} className={`nmpa-checklist__item ${task.completed ? 'is-done' : ''}`}>
                  <span className="nmpa-checklist__mark" aria-hidden="true">{task.completed ? '✓' : '○'}</span>
                  <span>
                    <span className="nmpa-checklist__label">{task.label}</span>
                    <span className="nmpa-muted nmpa-muted--sm">{task.description}</span>
                  </span>
                </li>
              ))}
            </ul>
            {today.fullyComplete ? (
              <p className="nmpa-muted">{t(language, 'setComplete')}</p>
            ) : (
              <button type="button" className="nmpa-button nmpa-button--primary nmpa-button--block" onClick={onGoToGames}>
                {today.isRestDay ? t(language, 'playAnywayOptional') : t(language, 'continueTodaysGames')}
              </button>
            )}
          </section>

          <section className="nmpa-card nmpa-home__assessment-card nmpa-anim-fade-up" style={{ '--nmpa-anim-delay': '240ms' }}>
            <h2 className="nmpa-card__title">{tNav(language, 'assessment', 'label')}</h2>
            <p className="nmpa-muted">{weeklyStatusText[weeklyAssessment.status] || weeklyStatusText.unknown}</p>
            <button type="button" className="nmpa-button nmpa-button--secondary nmpa-button--block" onClick={onGoToAssessment}>{t(language, 'goToAssessment')}</button>
          </section>
        </div>

        {onGenerateInviteCode && (
          <section className="nmpa-card nmpa-home__invite-card nmpa-anim-fade-up" style={{ '--nmpa-anim-delay': '280ms' }}>
            <div className="nmpa-home__invite-text">
              <h2 className="nmpa-card__title">{t(language, 'inviteACaregiver')}</h2>
              <p className="nmpa-muted">{t(language, 'inviteCaregiverBlurb')}</p>
              {caregiverInviteCode ? (
                <p className="nmpa-home__score" style={{ fontSize: 24, letterSpacing: 3, marginTop: 8 }}>{caregiverInviteCode}</p>
              ) : (
                <p className="nmpa-muted nmpa-muted--sm">{t(language, 'noActiveCode')}</p>
              )}
              {/* 2026-08-27 ADDITION (VR: "antha caregiver patient username
                  potu request kudukanum") -- the caregiver-initiated
                  counterpart to the invite code above: a caregiver who
                  already knows this username can search for and request
                  this patient directly (CaregiverLinkPatientScreen.jsx's
                  "search by username" tab), no code needed. Shown only
                  once the username has actually loaded onto currentUser
                  (self-heals on login for older accounts -- see
                  useAuth.js -- so this is briefly absent for a handful of
                  very first page loads on a pre-existing account, never
                  wrong/fabricated).
              */}
              {currentUser?.username && (
                <p className="nmpa-muted nmpa-muted--sm" style={{ marginTop: 6 }}>
                  {format(t(language, 'yourUsernameLabel'), { username: currentUser.username })}
                </p>
              )}
            </div>
            <button type="button" className="nmpa-button nmpa-button--secondary" onClick={onGenerateInviteCode}>
              {caregiverInviteCode ? t(language, 'generateNewCode') : t(language, 'generateCode')}
            </button>
          </section>
        )}

        {currentUser?.uid && <CaregiverRequestsPanel patientId={currentUser.uid} language={language} />}
      </div>
    </div>
  );
}
