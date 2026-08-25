import { DEFAULT_LANGUAGE } from '../../config/i18nConfig.js';
import { t, format } from '../../i18n/strings/assessment.js';
import { estimateAssessmentMinutes } from '../../config/assessmentTimeEstimateConfig.js';

// Mode 1 (Cognitive Assessment Mode) framing, per the NEUROMORPH master
// prompt: calm, professional, no hints/retries/rewards language anywhere
// on this screen. This is a screening instrument, not a game, and the
// intro should set that tone before the first task even starts.
//
// 2026-08-20: the time estimate shown here is now REAL, derived from every
// active task's own configured trial counts/timings (see
// assessmentTimeEstimateConfig.js) -- it replaces a hardcoded, unverified
// "20-30 minutes" that had been sitting in introMuted since the login/
// signup i18n pass. Computed fresh on every render rather than cached,
// since it's cheap (a handful of additions over LOBAR_TASKS) and always
// reflects the current active task set if one is ever re-enabled/retired.
export default function AssessmentIntro({ onBegin, taskCount, language = DEFAULT_LANGUAGE }) {
  const { minMinutes, maxMinutes } = estimateAssessmentMinutes();
  return (
    <div className="nmpa-section">
      <section className="nmpa-card nmpa-assessment-intro">
        <p className="nmpa-eyebrow">{t(language, 'introEyebrow')}</p>
        <h2 className="nmpa-card__title">{t(language, 'introTitle')}</h2>
        <p>
          {format(t(language, 'introBody'), { taskCount })}
        </p>
        <ul className="nmpa-tasklist">
          <li>{t(language, 'introBullet1')}</li>
          <li>{t(language, 'introBullet2')}</li>
          <li>{t(language, 'introBullet3')}</li>
        </ul>
        <p className="nmpa-assessment-intro__time-estimate">
          {format(t(language, 'estimatedTimeLine'), { min: minMinutes, max: maxMinutes })}
        </p>
        <p className="nmpa-muted">
          {t(language, 'introMuted')}
        </p>
        <button type="button" className="nmpa-button nmpa-button--primary" onClick={onBegin}>{t(language, 'beginAssessmentBtn')}</button>
      </section>
    </div>
  );
}
