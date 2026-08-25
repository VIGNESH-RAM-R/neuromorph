import { MockBackendService } from './MockBackendService.js';

const BAND_EXPLANATIONS = {
  EXCELLENT: 'well within the excellent range',
  NORMAL: 'within the normal range',
  MILDLY_REDUCED: 'mildly reduced compared to the expected range',
  REDUCED: 'notably reduced compared to the expected range',
};

// Per the medical safety rules: a reduced/elevated band is explained
// plainly, marked as non-diagnostic, and paired with a recommendation to
// consult a clinician -- never phrased in a way designed to frighten.
function bandCaveat(band) {
  if (band === 'REDUCED' || band === 'MILDLY_REDUCED') {
    return " This is not a diagnosis -- it's a signal that a real conversation with a doctor (ideally a neurologist or geriatric specialist) could be worthwhile, especially if this trend continues.";
  }
  return '';
}

// Formats each backend action's mock data into a natural-language reply,
// consistent with the system prompt's "explain scores in simple language"
// and "never invent values, never fabricate" rules -- every number shown
// here traces back to MockBackendService, never made up inline.
export const BackendActionEngine = {
  execute(action, params = {}, service = MockBackendService) {
    switch (action) {
      case 'GET_PROGRESS': {
        const p = service.getProgress(params);
        return {
          raw: p,
          text: `You've completed ${p.assessmentsCompletedThisMonth} of ${p.assessmentsScheduledThisMonth} scheduled assessments this month, and you're on a ${p.currentStreakDays}-day streak (your longest so far is ${p.longestStreakDays} days). Your overall adherence is ${p.adherencePercentage}%. ${p.dailySetCompletedToday ? "You've already completed today's daily set." : "You haven't completed today's daily set yet."}`,
        };
      }

      case 'GET_REPORT': {
        const r = service.getReport(params);
        const bandText = BAND_EXPLANATIONS[r.detectionBand] || r.detectionBand;
        return {
          raw: r,
          text: `Your most recent assessment (${r.assessmentDate}) gave an overall Cognitive Score of ${r.overallCognitiveScore}/100, ${bandText} for the Detection Score.${bandCaveat(r.detectionBand)} By domain: memory ${r.domainScores.memory}, attention ${r.domainScores.attention}, reaction ${r.domainScores.reaction}, speech ${r.domainScores.speech}, facial expressivity ${r.domainScores.facialExpressivity}. Your trend is currently ${r.trend}.`,
        };
      }

      case 'COMPARE_REPORTS': {
        const c = service.compareReports(params);
        const directionWord = c.changeDirection === 'improving' ? 'up' : c.changeDirection === 'declining' ? 'down' : 'about the same';
        return {
          raw: c,
          text: `Comparing ${c.fromPeriod} to ${c.toPeriod}, your overall Cognitive Score moved from ${c.fromScore} to ${c.toScore} (${directionWord}, a change of ${c.change > 0 ? '+' : ''}${c.change} points). Remember that small week-to-week movement is normal -- what matters most is the trend over several sessions, not one comparison.`,
        };
      }

      case 'DOWNLOAD_REPORT': {
        const d = service.downloadReport(params);
        return { raw: d, text: `Your report is ready: ${d.fileName} (${d.sizeKb} KB). Downloading now.` };
      }

      case 'SHARE_REPORT': {
        const s = service.shareReport(params);
        return { raw: s, text: `Done -- your latest report has been shared with ${s.sharedWith}.` };
      }

      case 'GET_CURRENT_VERSION': {
        const v = service.getCurrentVersion();
        return { raw: v, text: `You're on version ${v.version}, released ${v.releaseDate}.` };
      }

      case 'CHECK_UPDATE': {
        const u = service.checkUpdate();
        return {
          raw: u,
          text: u.updateAvailable
            ? `A new version (${u.latestVersion}) is available -- worth updating when you get a chance.`
            : "You're already on the latest version.",
        };
      }

      case 'SYNC_DATA': {
        const sy = service.syncData();
        return { raw: sy, text: `Synced ${sy.itemsSynced} item${sy.itemsSynced === 1 ? '' : 's'} just now.` };
      }

      default:
        return {
          raw: null,
          text: "I don't have a way to do that from here yet -- I've noted it down as something the app should be able to do.",
        };
    }
  },
};
