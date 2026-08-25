import SectionCard from '../shared/SectionCard.jsx';

// A deliberately different visual treatment (dashed border, "Research
// Preview" badge) from every other panel on this screen -- everything else
// here comes from this project's own validated scoring model; this one is a
// statistical proxy grounded in published connectivity research (see
// README), not a clinical measurement, and it should never be mistaken for
// one at a glance.
const PATTERN_LABEL = {
  distributed: 'Distributed pattern',
  'multi-domain-independent': 'Independent domain declines',
  isolated: 'Isolated to one domain',
  'no-decline': 'No decline to analyze',
  'insufficient-data': 'Not enough history yet',
};

export default function NetworkCoherencePanel({ networkCoherence }) {
  if (!networkCoherence) return null;
  const { pattern, narrative, decliningDomains, coupledPairs, coherenceScore } = networkCoherence;

  return (
    <SectionCard
      title={<>Network Coherence <span className="nmdd-research-badge">Research Preview</span></>}
      subtitle="Experimental: a statistical proxy for whether declines look isolated to one domain or coordinated across several -- not real brain-connectivity data. See README for the research this is teasing toward."
      className="nmdd-card--preview"
    >
      <div className="nmdd-trendintel">
        <div className="nmdd-trendintel__headline">
          <span className="nmdd-subheading">Pattern</span>
          <span className="nmdd-tag nmdd-tag--warn">{PATTERN_LABEL[pattern] || pattern}</span>
        </div>

        <div className="nmdd-alert nmdd-alert--info">
          <p>{narrative}</p>
        </div>

        {coupledPairs.length > 0 && (
          <div>
            <h3 className="nmdd-subheading">Coupled Domain Pairs</h3>
            <ul className="nmdd-tasklist">
              {coupledPairs.map((p) => (
                <li key={`${p.a}-${p.b}`}>{p.a} &amp; {p.b} -- moving together (r = {p.r})</li>
              ))}
            </ul>
          </div>
        )}

        {decliningDomains.length > 0 && coupledPairs.length === 0 && pattern !== 'isolated' && (
          <div>
            <h3 className="nmdd-subheading">Declining Domains (independent)</h3>
            <p className="nmdd-muted">{decliningDomains.join(', ')}</p>
          </div>
        )}

        {typeof coherenceScore === 'number' && (
          <p className="nmdd-card__footnote">Average cross-domain correlation among declining domains: {coherenceScore}</p>
        )}
      </div>
    </SectionCard>
  );
}
