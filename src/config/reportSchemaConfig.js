// PLACEHOLDER report schema and text-extraction patterns. No real
// NEUROMORPH report PDF template exists yet in this project, so this is a
// best-guess "label: value" layout to adapt the moment the real one is
// finalized -- see ReportExtractionEngine.js. The field names deliberately
// match MockBackendService.getReport()'s shape, so extracted-from-PDF data
// and live-backend data can be explained by the exact same downstream
// logic (ReportExplanationEngine).
export const REPORT_FIELD_PATTERNS = {
  assessmentDate: /assessment date[:\s]+([0-9]{4}-[0-9]{2}-[0-9]{2}|[A-Za-z]+ [0-9]{1,2},? [0-9]{4})/i,
  overallCognitiveScore: /overall (?:cognitive )?score[:\s]+([0-9]{1,3})/i,
  detectionBand: /detection (?:score|band|risk)[:\s]+(EXCELLENT|NORMAL|MILDLY[_ ]REDUCED|REDUCED)/i,
  trend: /trend[:\s]+(improving|stable|declining)/i,
  memory: /memory[:\s]+([0-9]{1,3})/i,
  attention: /attention[:\s]+([0-9]{1,3})/i,
  reaction: /reaction[:\s]+([0-9]{1,3})/i,
  speech: /speech[:\s]+([0-9]{1,3})/i,
  facialExpressivity: /facial expressivity[:\s]+([0-9]{1,3})/i,
};

export const REPORT_DOMAIN_FIELDS = ['memory', 'attention', 'reaction', 'speech', 'facialExpressivity'];
