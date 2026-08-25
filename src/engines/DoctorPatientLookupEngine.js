import { bandFromScore, BAND_INTERPRETATION_TEMPLATES, NON_DIAGNOSTIC_DISCLAIMER } from '../config/scoringBands.js';
import { DOMAIN_LABELS } from '../config/domainInsightConfig.js';

// Pure lookup + summary-text assembly for the doctor chatbot's "find /
// summarize patient <name>" capability. No component or hook computes a
// patient match or a summary string itself -- same "engine decides, UI
// renders" split as every other module in this app.

// Case-insensitive substring match against name OR patientId, so "eleanor",
// "whitfield", and "nmx-1001" all find the same record. Returns [] (never
// throws, never guesses) when nothing matches -- the caller decides what an
// honest "not found" reply looks like.
export function findPatientByName(query, patients) {
  const q = (query || '').trim().toLowerCase();
  if (!q) return [];
  return patients.filter((p) => {
    return p.name.toLowerCase().includes(q) || p.patientId.toLowerCase().includes(q);
  });
}

// Words that signal "this message wants a patient summary/report", not just
// a passing mention of a name. Kept as a flat list (not full NLP) on
// purpose -- same "cheap, honest, deterministic" bar as the rest of the
// local matching layer; a real intent classifier is what the LLM fallback
// is for.
const SUMMARY_REQUEST_KEYWORDS = ['summarize', 'summarise', 'summary', 'report', 'pdf', 'generate', 'overview', 'breakdown', 'how is', "how's"];

export function messageRequestsPatientSummary(message) {
  const lower = (message || '').toLowerCase();
  return SUMMARY_REQUEST_KEYWORDS.some((kw) => lower.includes(kw));
}

// Scans a free-text chat message for any patient whose full name or patient
// ID appears in it -- e.g. "generate a pdf for Eleanor Whitfield" or
// "summarize NMX-1005". Unlike findPatientByName (a deliberate search
// query), this is a passive scan over an arbitrary sentence.
export function findPatientsMentionedInMessage(message, patients) {
  const lower = (message || '').toLowerCase();
  if (!lower.trim()) return [];
  return patients.filter((p) => lower.includes(p.name.toLowerCase()) || lower.includes(p.patientId.toLowerCase()));
}

// Percent change from the first to the latest session's overall score.
// Mirrors DomainInsightEngine's own "need at least 2 points, never divide by
// zero" rule.
function overallPercentChange(sessions) {
  if (!sessions || sessions.length < 2) return null;
  const first = sessions[0].overallRawScore;
  const latest = sessions[sessions.length - 1].overallRawScore;
  if (typeof first !== 'number' || first === 0) return null;
  return ((latest - first) / first) * 100;
}

function formatPct(pct) {
  const rounded = Math.round(pct);
  return rounded > 0 ? `+${rounded}%` : `${rounded}%`;
}

// Builds the plain-text summary the doctor chat renders when asked to
// "summarize", "generate a report for", or "give me the PDF for" a matched
// patient. Every number here comes straight from DOCTOR_MOCK_PATIENTS --
// nothing is invented, and the same non-diagnostic disclaimer used
// everywhere else in this app (scoringBands.js) is appended every time.
export function buildSummaryText(patient) {
  const sessions = patient.sessions || [];
  const latest = sessions[sessions.length - 1];
  const latestBand = latest ? bandFromScore(latest.overallRawScore) : null;
  const pctChange = overallPercentChange(sessions);

  const lines = [];
  lines.push(`${patient.name} (${patient.patientId}), age ${patient.age}${patient.gender ? `, ${patient.gender}` : ''}.`);
  lines.push(
    patient.riskFactors && patient.riskFactors.length
      ? `Risk factors on file: ${patient.riskFactors.join(', ')}.`
      : 'No risk factors on file.'
  );

  if (!sessions.length) {
    lines.push('No completed sessions on record yet.');
  } else {
    lines.push(
      `Latest session (${latest.date}): overall score ${latest.overallRawScore} -- ${latestBand} band. ${BAND_INTERPRETATION_TEMPLATES[latestBand]}`
    );
    if (sessions.length > 1 && pctChange !== null) {
      lines.push(
        `Trend across ${sessions.length} sessions (${sessions[0].date} to ${latest.date}): ${formatPct(pctChange)} overall.`
      );
    } else {
      lines.push('Only one session on record -- not enough data yet for a trend.');
    }

    const domainKeys = Object.keys(latest.domainScoresRaw || {});
    if (domainKeys.length) {
      const domainLines = domainKeys.map((key) => {
        const label = DOMAIN_LABELS[key] || key;
        const score = latest.domainScoresRaw[key];
        return `${label} ${score} (${bandFromScore(score)})`;
      });
      lines.push(`Domain breakdown (latest session): ${domainLines.join(', ')}.`);
    }
  }

  lines.push(NON_DIAGNOSTIC_DISCLAIMER);
  return lines.join('\n');
}
