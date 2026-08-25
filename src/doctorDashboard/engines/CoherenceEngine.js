import { DriftEngine } from './DriftEngine.js';
import { pearsonCorrelation, round1 } from './mathUtils.js';
import { COGNITIVE_DOMAINS, DOMAIN_KEYS } from '../config/domainConfig.js';
import { NETWORK_COHERENCE_CONFIG } from '../config/networkCoherenceConfig.js';

function labelFor(key) {
  return COGNITIVE_DOMAINS.find((d) => d.key === key)?.label || key;
}

// CoherenceEngine is an explicit RESEARCH PREVIEW: a statistical proxy for
// "is this patient's decline isolated to one domain, or moving together
// across several domains" -- the buildable-today version of the network-
// connectivity question a clinician might otherwise ask with fMRI/EEG. It
// reuses DriftEngine (already-verified per-domain slopes) to find which
// domains are actually declining, then asks whether those specific domains'
// session-by-session score movements correlate with each other.
//
// Every output carries `researchPreview: true` and this engine never
// produces a band, a score threshold crossing, or any clinical claim --
// only a descriptive pattern label and a plainly-hedged narrative, because
// unlike every other engine in this dashboard, this one is not grounded in
// this project's own validated scoring model, only in published connectivity
// research (see README) applied to a proxy signal.
export const CoherenceEngine = {
  evaluate(sessions, config = NETWORK_COHERENCE_CONFIG) {
    const sorted = [...(sessions || [])]
      .filter((s) => s?.date)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    if (sorted.length < config.minSessionsForCoherence) {
      return {
        evaluable: false,
        researchPreview: true,
        pattern: 'insufficient-data',
        decliningDomains: [],
        coupledPairs: [],
        coherenceScore: undefined,
        narrative: `Not enough sessions on record yet (${sorted.length}) for even a preview-level coherence read -- this needs at least ${config.minSessionsForCoherence}.`,
      };
    }

    const domainDrift = DriftEngine.analyzeForKeys(sorted, DOMAIN_KEYS, 'domainScoresRaw');
    const decliningDomains = DOMAIN_KEYS.filter((k) => domainDrift[k].significant && domainDrift[k].trend === 'declining');

    if (decliningDomains.length === 0) {
      return {
        evaluable: true,
        researchPreview: true,
        pattern: 'no-decline',
        decliningDomains: [],
        coupledPairs: [],
        coherenceScore: undefined,
        narrative: 'No domain currently shows a statistically meaningful decline, so there is nothing to check for a coordinated cross-domain pattern.',
      };
    }

    if (decliningDomains.length === 1) {
      return {
        evaluable: true,
        researchPreview: true,
        pattern: 'isolated',
        decliningDomains: [labelFor(decliningDomains[0])],
        coupledPairs: [],
        coherenceScore: undefined,
        narrative: `${labelFor(decliningDomains[0])} is the only domain showing a meaningful decline -- a pattern more consistent with an isolated, localized effect (the traditional lobar-function model) than a distributed one. This is a preview signal only, based on ${decliningDomains.length} domain, not real connectivity data.`,
      };
    }

    // 2+ declining domains: check whether their score trajectories, over
    // this same session history, actually move together.
    const seriesFor = (key) => sorted.map((s) => s?.domainScoresRaw?.[key]).filter((v) => typeof v === 'number');
    const coupledPairs = [];
    const correlations = [];
    for (let i = 0; i < decliningDomains.length; i++) {
      for (let j = i + 1; j < decliningDomains.length; j++) {
        const a = decliningDomains[i];
        const b = decliningDomains[j];
        const r = pearsonCorrelation(seriesFor(a), seriesFor(b));
        if (r === undefined) continue;
        correlations.push(r);
        if (Math.abs(r) >= config.couplingThreshold) {
          coupledPairs.push({ a: labelFor(a), b: labelFor(b), r: round1(r) });
        }
      }
    }

    const coherenceScore = correlations.length > 0
      ? round1(correlations.reduce((sum, r) => sum + Math.abs(r), 0) / correlations.length)
      : undefined;

    const pattern = coupledPairs.length > 0 ? 'distributed' : 'multi-domain-independent';
    const decliningLabels = decliningDomains.map(labelFor);

    let narrative;
    if (pattern === 'distributed') {
      const pairText = coupledPairs.map((p) => `${p.a} & ${p.b}`).join(', ');
      narrative = `${decliningLabels.join(', ')} are all declining, and their score trajectories move together closely enough (${pairText}) to look like a coordinated, cross-domain pattern rather than isolated single-domain effects -- the kind of picture a distributed network-level disruption, not a single lobe, would produce. This is a preview signal computed from cognitive score trends, not real brain connectivity data, and should be read as a hypothesis worth watching, not a finding.`;
    } else {
      narrative = `${decliningLabels.join(', ')} are each declining on their own, but their trajectories do not move together closely enough to call this a coordinated pattern -- more consistent with separate, independent domain-level effects than one shared underlying cause. This is a preview signal only, not real connectivity data.`;
    }

    return {
      evaluable: true,
      researchPreview: true,
      pattern,
      decliningDomains: decliningLabels,
      coupledPairs,
      coherenceScore,
      narrative,
    };
  },
};
