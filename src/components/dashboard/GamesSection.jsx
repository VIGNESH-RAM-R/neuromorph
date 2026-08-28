import { useState } from 'react';
import FacialExpressivityTask from '../daily/FacialExpressivityTask.jsx';
import OddballGamesLauncher from './OddballGamesLauncher.jsx';
import { t, format } from '../../i18n/strings/games.js';
import { DEFAULT_LANGUAGE } from '../../config/i18nConfig.js';

// Maps Daily Set tasks that play directly inside this screen to their
// embedded component. The other cognitive tasks open the integrated games
// suite at their matching domain.
const DAILY_TASK_COMPONENTS = {
  'facial-expressivity': FacialExpressivityTask,
};

// `self` is the SelfModel-shaped view (see App.jsx) -- self.today.checklist,
// self.today.gamePicks, self.today.momentum, self.today.isRestDay, and
// self.weekendReminder are all already-computed by SelfModel; this
// component only renders, never recomputes, completion/momentum/rotation
// logic.
//
// 2026-08-19/20 overnight pass: full i18n (see src/i18n/strings/games.js,
// which also covers FacialExpressivityTask.jsx's copy since it's the one
// Daily Set task rendered inside this screen) plus a Samsung Health-style
// motion pass -- staggered card entrance (same nmpa-anim-fade-up pattern as
// HomeSection) and a small "pop" on a completed task's checkmark instead of
// a static glyph (see the .nmpa-checklist__item.is-done .nmpa-checklist__mark
// rule in theme.css). Both respect prefers-reduced-motion.
export default function GamesSection({ self, onCompleteTask, onGoToAssessment, language = DEFAULT_LANGUAGE }) {
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [gameSuiteDomain, setGameSuiteDomain] = useState(null);
  const [gameSuiteGame, setGameSuiteGame] = useState(null);
  // 2026-08-23: separate from activeTaskId -- the games suite isn't a
  // Daily Set task with a score to record, it's a standalone module (see
  // OddballGamesLauncher.jsx's own comment on why it isn't wired into
  // onCompleteTask).
  const [showGameSuite, setShowGameSuite] = useState(false);

  if (showGameSuite) {
    return <OddballGamesLauncher onExit={() => setShowGameSuite(false)} userName={self?.name} initialDomain={gameSuiteDomain} initialGame={gameSuiteGame} language={language} />;
  }

  if (activeTaskId) {
    const TaskComponent = DAILY_TASK_COMPONENTS[activeTaskId];
    if (!TaskComponent) { setActiveTaskId(null); return null; }
    return (
      <div className="nmpa-section">
        <section className="nmpa-card">
          <TaskComponent
            key={activeTaskId}
            language={language}
            onSubmit={({ score, raw }) => {
              onCompleteTask?.(activeTaskId, score, raw);
              setActiveTaskId(null);
            }}
          />
        </section>
      </div>
    );
  }

  if (!self) return null;
  const checklist = self.today?.checklist || [];
  const momentum = self.today?.momentum;
  const gamePicks = self.today?.gamePicks || {};
  const isRestDay = self.today?.isRestDay;
  const weekendReminder = self.weekendReminder;

  return (
    <div className="nmpa-section">
      {/* Standalone entry point into the full cognitive games suite. Kept at
          the top so it is immediately available when this section opens. */}
      <section className="nmpa-card nmpa-anim-fade-up" style={{ '--nmpa-anim-delay': '0ms' }}>
        <div className="nmpa-section__header">
          <h2 className="nmpa-card__title">Cognitive Games Suite</h2>
        </div>
        <p className="nmpa-muted">
          Six more games -- Visual Oddball, Sequence Memory, Point &amp; Click, Image Pairs, Whack the Mole, and
          Spot the Difference -- each with its own practice round and history.
        </p>
        <button type="button" className="nmpa-button nmpa-button--secondary" onClick={() => { setGameSuiteDomain(null); setGameSuiteGame(null); setShowGameSuite(true); }}>
          Play Games
        </button>
      </section>

      {/* Weekend / rest-day messaging -- see WeekendAssessmentReminderEngine.js.
          Shown above the Daily Set so it's the first thing seen when entering
          this section, per the spec ("remind them... once they enter the game"). */}
      {weekendReminder?.showReminder && (
        <section className={`nmpa-card nmpa-alert nmpa-alert--${isRestDay ? 'warn' : 'info'} nmpa-anim-fade-up`} style={{ '--nmpa-anim-delay': '0ms' }}>
          <p>{isRestDay ? t(language, 'restDayBanner') : t(language, 'weekendPendingBanner')}</p>
          <button type="button" className="nmpa-button nmpa-button--primary" onClick={onGoToAssessment}>
            {t(language, 'goToAssessment')}
          </button>
        </section>
      )}
      {weekendReminder?.showAlreadyDoneNotice && (
        <section className="nmpa-card nmpa-alert nmpa-alert--info nmpa-anim-fade-up" style={{ '--nmpa-anim-delay': '0ms' }}>
          <p>{t(language, 'alreadyDoneNotice')}</p>
        </section>
      )}

      {isRestDay ? (
        <section className="nmpa-card nmpa-anim-fade-up" style={{ '--nmpa-anim-delay': '60ms' }}>
          <div className="nmpa-section__header">
            <h2 className="nmpa-card__title">{t(language, 'restDayTitle')}</h2>
            <span className="nmpa-tag nmpa-tag--info">{t(language, 'noDailyMission')}</span>
          </div>
          <p className="nmpa-muted">{t(language, 'restDayParagraph')}</p>
        </section>
      ) : (
        <section className="nmpa-card nmpa-anim-fade-up" style={{ '--nmpa-anim-delay': '60ms' }}>
          <div className="nmpa-section__header">
            <h2 className="nmpa-card__title">{t(language, 'todaysDailySet')}</h2>
            {momentum?.revealed ? (
              <span className="nmpa-tag nmpa-tag--info">{format(t(language, 'momentumScoreTag'), { score: momentum.score })}</span>
            ) : (
              <span className="nmpa-tag nmpa-tag--neutral">{format(t(language, 'doneCountTag'), { completed: momentum?.completedCount ?? 0, total: momentum?.totalCount ?? 5 })}</span>
            )}
          </div>
          <p className="nmpa-muted">
            {momentum?.revealed ? t(language, 'setCompleteBlurb') : t(language, 'completeAllBlurb')}
          </p>
        </section>
      )}

      <section className="nmpa-card nmpa-anim-fade-up" style={{ '--nmpa-anim-delay': '120ms' }}>
        <div className="nmpa-checklist">
          {checklist.map((task) => {
            const TaskComponent = DAILY_TASK_COMPONENTS[task.id];
            const pick = gamePicks[task.id];
            return (
              <div key={task.id} className={`nmpa-checklist__item ${task.completed ? 'is-done' : ''}`}>
                <span className="nmpa-checklist__mark">{task.completed ? '✓' : '○'}</span>
                <div style={{ flex: 1 }}>
                  <span className="nmpa-checklist__label">{task.label}</span>
                  <p className="nmpa-muted nmpa-muted--sm">{task.description}</p>
                  {pick && (
                    <p className="nmpa-muted nmpa-muted--sm">{t(language, 'todaysPick')} <strong>{pick.label}</strong></p>
                  )}
                </div>
                {!task.completed && TaskComponent && (
                  <button type="button" className="nmpa-button nmpa-button--primary" onClick={() => setActiveTaskId(task.id)}>
                    {t(language, 'play')}
                  </button>
                )}
                {!task.completed && !TaskComponent && (
                  <button
                    type="button"
                    className="nmpa-button nmpa-button--primary"
                    onClick={() => {
                      setGameSuiteDomain(['memory', 'reaction', 'attention'].includes(task.category) ? task.category : null);
                      setGameSuiteGame(pick?.id || null);
                      setShowGameSuite(true);
                    }}
                  >
                    {t(language, 'play')}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
