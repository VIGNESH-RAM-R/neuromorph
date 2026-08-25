import { DriftEngine } from './DriftEngine.js';
import { VariabilityEngine } from './VariabilityEngine.js';
import { COGNITIVE_DOMAINS, DOMAIN_KEYS } from '../config/domainConfig.js';
import { TREND_INTELLIGENCE_CONFIG } from '../config/trendIntelligenceConfig.js';

function labelFor(key) {
  return COGNITIVE_DOMAINS.find((d) => d.key === key)?.label || key;
}

// The single consolidator: runs DriftEngine (multi-session slope, catches
// gradual decline no single step shows) and VariabilityEngine (rising
// inconsistency, independent of the mean) across the overall score and
// every cognitive domain, then reduces all of that into one clinician-facing
// summary AND one plain-language narrative -- the same narrative string is
// reused verbatim by the dashboard UI and by Morphy's "explain my trend"
// backend action, so a doctor and a patient never get two different stories
// about the same data.
export const TrendIntelligenceEngine = {
  evaluate(sessions, config = TREND_INTELLIGENCE_CONFIG) {
    const overallDrift = DriftEngine.analyzeSessions(sessions, (s) => s.overallRawScore);
    const overallVariability = VariabilityEngine.analyzeSessions(sessions, (s) => s.overallRawScore);
    const domainDrift = DriftEngine.analyzeForKeys(sessions, DOMAIN_KEYS, 'domainScoresRaw');

    const domainsToWatch = DOMAIN_KEYS
      .map((key) => ({ key, label: labelFor(key), ...domainDrift[key] }))
      .filter((d) => d.significant && d.trend === 'declining')
      .sort((a, b) => a.weeklyRate - b.weeklyRate) // most negative (fastest decline) first
      .slice(0, config.maxDomainsToWatch);

    let overallTrajectory = 'insufficient-data';
    if (overallDrift.evaluable) {
      overallTrajectory = overallDrift.trend; // 'declining' | 'improving' | 'stable'
    }
    if (overallVariability.flagged && overallTrajectory === 'stable') {
      // A flat mean with rising swings is its own distinct picture -- worth
      // naming separately rather than folding it silently into "stable".
      overallTrajectory = 'volatile';
    }

    const narrativeSummary = buildNarrative({ overallTrajectory, overallDrift, overallVariability, domainsToWatch, sessionCount: sessions.length });

    return {
      overallTrajectory,
      overallDrift,
      overallVariability,
      domainsToWatch,
      narrativeSummary,
      evaluable: overallDrift.evaluable || overallVariability.evaluable,
    };
  },
};

function buildNarrative({ overallTrajectory, overallDrift, overallVariability, domainsToWatch, sessionCount }) {
  if (overallTrajectory === 'insufficient-data') {
    return `Not enough sessions on record yet (${sessionCount}) to compute a reliable multi-week trend. This becomes available once at least 3 sessions have been completed.`;
  }

  const parts = [];

  if (overallTrajectory === 'declining') {
    parts.push(`Overall cognitive score has shown a statistically meaningful downward trend of about ${Math.abs(overallDrift.weeklyRate)} points per week across the ${overallDrift.n} sessions on record, beyond what week-to-week noise alone would explain.`);
  } else if (overallTrajectory === 'improving') {
    parts.push(`Overall cognitive score has shown a meaningful upward trend of about ${overallDrift.weeklyRate} points per week across the ${overallDrift.n} sessions on record.`);
  } else if (overallTrajectory === 'volatile') {
    parts.push(`Overall cognitive score has stayed roughly flat on average, but this patient's session-to-session consistency has dropped -- their scores are swinging noticeably more than they used to (variability up about ${overallVariability.riseRatio}x).`);
  } else {
    parts.push(`Overall cognitive score has stayed stable and consistent across the ${overallDrift.n} sessions on record; no meaningful drift detected.`);
  }

  if (overallTrajectory !== 'volatile' && overallVariability.flagged) {
    parts.push(`Separately, session-to-session consistency has also declined (about ${overallVariability.riseRatio}x more variable recently than earlier on) -- worth watching even alongside the score trend above.`);
  }

  if (domainsToWatch.length > 0) {
    const domainText = domainsToWatch.map((d) => `${d.label} (about ${Math.abs(d.weeklyRate)} pts/week)`).join(', ');
    parts.push(`Domain-specific declines significant enough to flag: ${domainText}.`);
  }

  parts.push('This is a statistical trend flag, not a diagnosis -- it is meant to prompt a closer look, not to replace clinical judgment.');

  return parts.join(' ');
}
