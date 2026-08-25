import { DEFAULT_LANGUAGE } from '../../config/i18nConfig.js';
import { t, format } from '../../i18n/strings/assessment.js';

// Matches scoringBands.js's BANDS to a CSS modifier class -- kept local
// (display-only) rather than in the shared config, since scoringBands.js
// stays presentation-agnostic on purpose. Keyed on the English band value
// scoringBands.js/CognitiveScoreEngine always produce internally (not
// user-facing) -- the translated label shown on screen comes from
// BAND_LABEL_KEY below instead.
const BAND_CLASS = {
  Excellent: 'nmpa-cognitive-score-result--excellent',
  Normal: 'nmpa-cognitive-score-result--normal',
  'Mildly Reduced': 'nmpa-cognitive-score-result--mild',
  Reduced: 'nmpa-cognitive-score-result--reduced',
};

// Display-only translation of the band value -- scoringBands.js's own BAND
// strings stay English (used for logic/CSS-class matching elsewhere), this
// just maps them to the right assessment.js string key for what the patient
// actually reads.
const BAND_LABEL_KEY = {
  Excellent: 'bandExcellent',
  Normal: 'bandNormal',
  'Mildly Reduced': 'bandMildlyReduced',
  Reduced: 'bandReduced',
};

// Calm, minimal completion screen -- per the master prompt's Assessment
// Completion Experience: "Never celebrate like winning a game." No
// confetti, no coins, no streak talk. Just confirmation, the actual
// number, and a pointer to where the fuller result lives.
export default function AssessmentComplete({ session, cognitiveScore, onGoToProgress, onRestart, language = DEFAULT_LANGUAGE }) {
  if (!session) return null;
  const hasQuestionBank = typeof session.questionBankScore === 'number';
  const bodyKey = hasQuestionBank ? 'completeBodyWithQB' : 'completeBodyNoQB';
  return (
    <div className="nmpa-section">
      <section className="nmpa-card nmpa-assessment-intro">
        <p className="nmpa-eyebrow">{t(language, 'completeEyebrow')}</p>
        <h2 className="nmpa-card__title">{t(language, 'completeTitle')}</h2>
        <p>
          {format(t(language, bodyKey), { completed: session.completedCount, total: session.totalCount })}
        </p>
        {cognitiveScore && typeof cognitiveScore.score === 'number' && (
          <div className={`nmpa-cognitive-score-result ${BAND_CLASS[cognitiveScore.band] || ''}`}>
            <p className="nmpa-cognitive-score-result__value">{cognitiveScore.score}</p>
            <p className="nmpa-cognitive-score-result__band">
              {BAND_LABEL_KEY[cognitiveScore.band] ? t(language, BAND_LABEL_KEY[cognitiveScore.band]) : cognitiveScore.band}
            </p>
            {/* 2026-08-20: this score now weighs each measured cognitive
                domain equally (see AssessmentSessionModel.js), so it's only
                honest to also show how many of the 6 real domains it's
                actually built from -- avoids the number quietly reading as
                more comprehensive than it is until face/speech modules add
                the remaining domains. */}
            {session.domainCoverage && session.domainCoverage.measuredDomainCount > 0 && (
              <p className="nmpa-muted nmpa-muted--sm">
                {format(t(language, 'domainCoverageLine'), {
                  measured: session.domainCoverage.measuredDomainCount,
                  total: session.domainCoverage.totalDomainCount,
                })}
              </p>
            )}
          </div>
        )}
        {/* 2026-08-21: static, non-diagnostic awareness/preventive content --
            always shown here regardless of score, not gated behind asking
            Morphy. Claude-translated UI copy in all 7 languages, same
            honesty standard as authStrings.js's own header comment: this is
            general public-health-style guidance, not a clinically-validated
            instrument in each target language. */}
        <div className="nmpa-awareness nmpa-anim-fade-up" style={{ '--nmpa-anim-delay': '60ms' }}>
          <p className="nmpa-awareness__title">{t(language, 'awarenessTitle')}</p>
          <p className="nmpa-muted nmpa-muted--sm">{t(language, 'awarenessIntro')}</p>
          <ul className="nmpa-awareness__list">
            <li>{t(language, 'awarenessTip1')}</li>
            <li>{t(language, 'awarenessTip2')}</li>
            <li>{t(language, 'awarenessTip3')}</li>
            <li>{t(language, 'awarenessTip4')}</li>
          </ul>
        </div>
        <p className="nmpa-muted">
          {t(language, 'completeMuted')}
        </p>
        <div className="nmpa-assessment-intro__actions">
          <button type="button" className="nmpa-button nmpa-button--primary" onClick={onGoToProgress}>{t(language, 'viewProgressBtn')}</button>
          <button type="button" className="nmpa-button nmpa-button--secondary" onClick={onRestart}>{t(language, 'returnToOverviewBtn')}</button>
        </div>
      </section>
    </div>
  );
}
