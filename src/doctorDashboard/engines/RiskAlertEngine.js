import { RISK_ALERT_CONFIG } from '../config/operationalConfig.js';
import { BAND_RANK } from '../config/scoringBands.js';

// Flags a case for clinician attention. Two independent checks:
//   1. Session-over-session: overall/domain score drop or band downgrade
//      between the two most recent sessions.
//   2. Cumulative: overall score drop across the FULL history on record
//      (first session vs. latest), which catches a slow decline that never
//      exceeds the session-over-session threshold at any single step --
//      a gap identified in this project's own self-review (see README).
export const RiskAlertEngine = {
  evaluate(previousSession, latestSession, previousOverallBand, latestOverallBand, config = RISK_ALERT_CONFIG, allSessions = undefined) {
    const reasons = [];

    if (previousSession && latestSession) {
      const overallDelta = (latestSession.overallRawScore ?? 0) - (previousSession.overallRawScore ?? 0);
      if (overallDelta <= -config.scoreDropThreshold) {
        reasons.push(`Overall cognitive score dropped ${Math.abs(overallDelta)} points since the previous session.`);
      }

      if (previousOverallBand && latestOverallBand && BAND_RANK[latestOverallBand] < BAND_RANK[previousOverallBand]) {
        reasons.push(`Overall performance band moved from ${previousOverallBand} to ${latestOverallBand}.`);
      }

      const prevDomains = previousSession.domainScoresRaw || {};
      const latestDomains = latestSession.domainScoresRaw || {};
      for (const key of Object.keys(latestDomains)) {
        const prevVal = prevDomains[key];
        const latestVal = latestDomains[key];
        if (typeof prevVal === 'number' && typeof latestVal === 'number') {
          const domainDelta = latestVal - prevVal;
          if (domainDelta <= -config.domainDropThreshold) {
            reasons.push(`${key} domain dropped ${Math.abs(domainDelta)} points since the previous session.`);
          }
        }
      }
    }

    if (Array.isArray(allSessions) && allSessions.length >= config.cumulativeMinSessions) {
      const first = allSessions[0];
      const latest = allSessions[allSessions.length - 1];
      if (typeof first?.overallRawScore === 'number' && typeof latest?.overallRawScore === 'number') {
        const cumulativeDelta = latest.overallRawScore - first.overallRawScore;
        const alreadyCaughtByStepCheck = reasons.some((r) => r.startsWith('Overall cognitive score dropped'));
        if (cumulativeDelta <= -config.cumulativeDropThreshold && !alreadyCaughtByStepCheck) {
          reasons.push(`Overall cognitive score has declined ${Math.abs(cumulativeDelta)} points across ${allSessions.length} sessions on record (${first.date} to ${latest.date}), a gradual pattern not visible in the most recent step alone.`);
        }
      }
    }

    return { flagged: reasons.length > 0, reasons };
  },
};
