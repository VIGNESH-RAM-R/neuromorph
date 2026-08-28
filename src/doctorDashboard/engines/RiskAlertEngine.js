import { RISK_ALERT_CONFIG } from '../config/operationalConfig.js';
import { BAND_RANK } from '../config/scoringBands.js';

// Flags a case for clinician attention. Two independent checks:
//   1. Session-over-session: overall/domain score drop or band downgrade
//      between the two most recent sessions.
//   2. Cumulative: overall score drop across the FULL history on record
//      (first session vs. latest), which catches a slow decline that never
//      exceeds the session-over-session threshold at any single step --
//      a gap identified in this project's own self-review (see README).
//
// 2026-08-26: alongside the raw English `reasons` (kept for any other
// consumer/export path), each reason now also gets a structured
// `reasonEntries` counterpart -- { key, values } -- so the UI can render a
// translated sentence via report.js's translation-key + `format()` instead
// of the hardcoded English template literal. `reasons` and `reasonEntries`
// are always the same length and in the same order.
export const RiskAlertEngine = {
  evaluate(previousSession, latestSession, previousOverallBand, latestOverallBand, config = RISK_ALERT_CONFIG, allSessions = undefined) {
    const reasons = [];
    const reasonEntries = [];

    if (previousSession && latestSession) {
      const overallDelta = (latestSession.overallRawScore ?? 0) - (previousSession.overallRawScore ?? 0);
      if (overallDelta <= -config.scoreDropThreshold) {
        const points = Math.abs(overallDelta);
        reasons.push(`Overall cognitive score dropped ${points} points since the previous session.`);
        reasonEntries.push({ key: 'riskReasonScoreDropped', values: { points } });
      }

      if (previousOverallBand && latestOverallBand && BAND_RANK[latestOverallBand] < BAND_RANK[previousOverallBand]) {
        reasons.push(`Overall performance band moved from ${previousOverallBand} to ${latestOverallBand}.`);
        reasonEntries.push({ key: 'riskReasonBandDowngraded', values: { previousBand: previousOverallBand, latestBand: latestOverallBand } });
      }

      const prevDomains = previousSession.domainScoresRaw || {};
      const latestDomains = latestSession.domainScoresRaw || {};
      for (const key of Object.keys(latestDomains)) {
        const prevVal = prevDomains[key];
        const latestVal = latestDomains[key];
        if (typeof prevVal === 'number' && typeof latestVal === 'number') {
          const domainDelta = latestVal - prevVal;
          if (domainDelta <= -config.domainDropThreshold) {
            const points = Math.abs(domainDelta);
            reasons.push(`${key} domain dropped ${points} points since the previous session.`);
            reasonEntries.push({ key: 'riskReasonDomainDropped', values: { domain: key, points } });
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
          const points = Math.abs(cumulativeDelta);
          reasons.push(`Overall cognitive score has declined ${points} points across ${allSessions.length} sessions on record (${first.date} to ${latest.date}), a gradual pattern not visible in the most recent step alone.`);
          reasonEntries.push({ key: 'riskReasonCumulativeDecline', values: { points, sessionCount: allSessions.length, fromDate: first.date, toDate: latest.date } });
        }
      }
    }

    return { flagged: reasons.length > 0, reasons, reasonEntries };
  },
};
