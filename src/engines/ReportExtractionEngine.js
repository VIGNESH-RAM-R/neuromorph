import { REPORT_FIELD_PATTERNS, REPORT_DOMAIN_FIELDS } from '../config/reportSchemaConfig.js';

// PLACEHOLDER extraction logic: pulls structured fields out of raw PDF
// text using regex patterns that assume a simple "Label: value" layout.
// This WILL need to change once a real NEUROMORPH report PDF template
// exists -- only reportSchemaConfig.js's patterns should need editing,
// not this file, as long as the new template is still labeled text (if it
// becomes a purely visual/graphical layout, a different extraction
// approach entirely would be needed).
//
// Deliberately conservative: a field that doesn't match returns null,
// never a guessed or fabricated value -- consistent with the "never
// invent values" rule that governs everything else in this chatbot.
export const ReportExtractionEngine = {
  extractField(text, pattern) {
    if (!text) return null;
    const match = text.match(pattern);
    return match ? match[1].trim() : null;
  },

  extract(text) {
    const raw = {};
    for (const [field, pattern] of Object.entries(REPORT_FIELD_PATTERNS)) {
      raw[field] = this.extractField(text, pattern);
    }

    const toNumberOrNull = (v) => (v === null || v === undefined || v === '' ? null : Number(v));

    const domainScores = {};
    for (const field of REPORT_DOMAIN_FIELDS) {
      domainScores[field] = toNumberOrNull(raw[field]);
    }

    return {
      assessmentDate: raw.assessmentDate,
      overallCognitiveScore: toNumberOrNull(raw.overallCognitiveScore),
      detectionBand: raw.detectionBand ? raw.detectionBand.toUpperCase().replace(' ', '_') : null,
      trend: raw.trend ? raw.trend.toLowerCase() : null,
      domainScores,
      // True if literally nothing could be extracted -- the caller should
      // tell the user honestly rather than present an empty-looking report.
      isEmpty:
        raw.assessmentDate === null &&
        raw.overallCognitiveScore === null &&
        raw.detectionBand === null &&
        REPORT_DOMAIN_FIELDS.every((f) => domainScores[f] === null),
    };
  },
};
