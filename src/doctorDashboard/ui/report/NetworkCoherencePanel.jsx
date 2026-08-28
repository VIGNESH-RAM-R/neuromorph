import SectionCard from '../shared/SectionCard.jsx';
import { DEFAULT_LANGUAGE } from '../../config/i18nConfig.js';
import { t, format } from '../../i18n/strings/report.js';

// A deliberately different visual treatment (dashed border, "Research
// Preview" badge) from every other panel on this screen -- everything else
// here comes from this project's own validated scoring model; this one is a
// statistical proxy grounded in published connectivity research (see
// README), not a clinical measurement, and it should never be mistaken for
// one at a glance.
const PATTERN_LABEL_KEY = {
  distributed: 'patternDistributed',
  'multi-domain-independent': 'patternMultiDomainIndependent',
  isolated: 'patternIsolated',
  'no-decline': 'patternNoDecline',
  'insufficient-data': 'patternInsufficientData',
};

// 2026-08-26 scope note: `narrative` (CoherenceEngine.js) is a multi-branch,
// free-composed sentence with several distinct shapes -- unlike the fixed
// single-sentence templates elsewhere in this file, it isn't a safe
// find/replace into a translation key without a larger engine restructure.
// This panel's chrome (title/labels/pattern tags/pair text/footnote) is
// fully translated below; `narrative` itself stays English for now. Flagged
// to VR as a deliberate, separate follow-up -- this is an explicitly
// "Research Preview" / experimental panel, not the core clinical report.
export default function NetworkCoherencePanel({ networkCoherence, language = DEFAULT_LANGUAGE }) {
  if (!networkCoherence) return null;
  const { pattern, narrative, decliningDomains, coupledPairs, coherenceScore } = networkCoherence;

  return (
    <SectionCard
      title={<>{t(language, 'networkCoherenceTitle')} <span className="nmdd-research-badge">{t(language, 'researchPreviewBadge')}</span></>}
      subtitle={t(language, 'networkCoherenceSubtitle')}
      className="nmdd-card--preview"
    >
      <div className="nmdd-trendintel">
        <div className="nmdd-trendintel__headline">
          <span className="nmdd-subheading">{t(language, 'patternLabel')}</span>
          <span className="nmdd-tag nmdd-tag--warn">{PATTERN_LABEL_KEY[pattern] ? t(language, PATTERN_LABEL_KEY[pattern]) : pattern}</span>
        </div>

        <div className="nmdd-alert nmdd-alert--info">
          <p>{narrative}</p>
        </div>

        {coupledPairs.length > 0 && (
          <div>
            <h3 className="nmdd-subheading">{t(language, 'coupledDomainPairsHeading')}</h3>
            <ul className="nmdd-tasklist">
              {coupledPairs.map((p) => (
                <li key={`${p.a}-${p.b}`}>{format(t(language, 'coupledPairText'), { a: p.a, b: p.b, r: p.r })}</li>
              ))}
            </ul>
          </div>
        )}

        {decliningDomains.length > 0 && coupledPairs.length === 0 && pattern !== 'isolated' && (
          <div>
            <h3 className="nmdd-subheading">{t(language, 'decliningDomainsIndependentHeading')}</h3>
            <p className="nmdd-muted">{decliningDomains.join(', ')}</p>
          </div>
        )}

        {typeof coherenceScore === 'number' && (
          <p className="nmdd-card__footnote">{format(t(language, 'coherenceScoreFootnote'), { score: coherenceScore })}</p>
        )}
      </div>
    </SectionCard>
  );
}
