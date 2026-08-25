import { bandFromScore, DEFAULT_BAND_THRESHOLDS, BAND_INTERPRETATION_TEMPLATES, NON_DIAGNOSTIC_DISCLAIMER } from '../config/scoringBands.js';
import {
  DOMAIN_LABELS,
  DOMAIN_SHORT_DESCRIPTIONS,
  ACTIVE_INSIGHT_DOMAINS,
  PENDING_INSIGHT_DOMAINS,
  FLAT_CHANGE_THRESHOLD_PCT,
  NOTABLE_DECLINE_THRESHOLD_PCT,
} from '../config/domainInsightConfig.js';
import { round1 } from './mathUtils.js';

// Turns raw per-domain score history (weekly points, oldest -> newest) into
// the "Domain Breakdown" the Progress screen renders: a latest score, its
// non-diagnostic performance band (same thresholds/vocabulary as
// CognitiveScoreEngine, mirrored from the Doctor Dashboard), and a
// percent-change-from-the-previous-point figure in the +8% / -13% style
// requested for the dashboard.
//
// Never fabricates a number: a domain with fewer than 1 data point is
// reported as `hasData: false` rather than defaulting to 0, and percent
// change is only computed when there are at least two points (and the
// earlier one is non-zero, to avoid a divide-by-zero producing a nonsense
// "+Infinity%").
export const DomainInsightEngine = {
  breakdown(domainScoreHistory = {}) {
    return ACTIVE_INSIGHT_DOMAINS.map((domain) => {
      const history = (domainScoreHistory[domain] || []).filter((p) => typeof p.score === 'number');
      if (history.length === 0) {
        return { domain, label: DOMAIN_LABELS[domain], description: DOMAIN_SHORT_DESCRIPTIONS[domain], hasData: false, history: [] };
      }
      const latest = history[history.length - 1];
      const previous = history.length >= 2 ? history[history.length - 2] : undefined;
      let percentChange;
      let direction = 'flat';
      if (previous && typeof previous.score === 'number' && previous.score !== 0) {
        percentChange = round1(((latest.score - previous.score) / previous.score) * 100);
        if (percentChange > FLAT_CHANGE_THRESHOLD_PCT) direction = 'up';
        else if (percentChange < -FLAT_CHANGE_THRESHOLD_PCT) direction = 'down';
      }
      const band = bandFromScore(latest.score, DEFAULT_BAND_THRESHOLDS);
      return {
        domain,
        label: DOMAIN_LABELS[domain],
        description: DOMAIN_SHORT_DESCRIPTIONS[domain],
        hasData: true,
        latestScore: latest.score,
        latestDate: latest.date,
        previousScore: previous?.score,
        percentChange,
        direction,
        band,
        history,
      };
    });
  },

  // Domains the dashboard can't score yet, so it can render an honest
  // "not measured yet" placeholder instead of omitting them silently.
  pendingDomains() {
    return PENDING_INSIGHT_DOMAINS.map((domain) => ({
      domain,
      label: DOMAIN_LABELS[domain],
      description: DOMAIN_SHORT_DESCRIPTIONS[domain],
      hasData: false,
    }));
  },

  // Turns the breakdown into a short list of plain-language, non-diagnostic
  // callouts -- a notable decline, a notable improvement, or a domain
  // sitting in the Reduced/Mildly Reduced band regardless of trend. Sorted
  // so the most clinically-relevant (declines, then low bands) come first.
  insights(breakdownResults) {
    const items = [];
    for (const d of breakdownResults) {
      if (!d.hasData) continue;
      if (typeof d.percentChange === 'number' && d.percentChange <= -NOTABLE_DECLINE_THRESHOLD_PCT) {
        items.push({
          domain: d.domain,
          level: 'warn',
          text: `${d.label} is down ${Math.abs(d.percentChange)}% from the previous assessment. ${BAND_INTERPRETATION_TEMPLATES[d.band]}`,
        });
      } else if (typeof d.percentChange === 'number' && d.percentChange >= NOTABLE_DECLINE_THRESHOLD_PCT) {
        items.push({
          domain: d.domain,
          level: 'info',
          text: `${d.label} is up ${d.percentChange}% from the previous assessment -- a positive trend worth keeping up.`,
        });
      } else if (d.band === 'Reduced' || d.band === 'Mildly Reduced') {
        items.push({
          domain: d.domain,
          level: d.band === 'Reduced' ? 'warn' : 'info',
          text: `${d.label} is currently in the "${d.band}" range. ${BAND_INTERPRETATION_TEMPLATES[d.band]}`,
        });
      }
    }
    items.sort((a, b) => (a.level === 'warn' ? -1 : 0) - (b.level === 'warn' ? -1 : 0));
    return { items, disclaimer: NON_DIAGNOSTIC_DISCLAIMER };
  },
};
