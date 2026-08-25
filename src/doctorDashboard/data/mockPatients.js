// Mock, ResultModel-inspired session data standing in for the real per-module
// outputs (Questionnaire, Visual Memory Assessment, Speech Assessment,
// Digital Lobar Function Assessment) that the Doctor Dashboard aggregates.
// Shape mirrors what a real integration would pass into ReportModel.build():
// raw 0-100 task/domain scores in, clinician-facing bands out (computed by
// the engines, never hardcoded here).
//
// NOTE ON SANDBOX SCOPE: this file is the dashboard's only data source in
// this delivery, since the upstream modules (Speech, Lobar Function Games,
// Questionnaire) either don't yet write to a shared store or aren't built
// yet. See README "What's real vs mocked" for the integration path.

function session(dateStr, overrides = {}) {
  return {
    date: dateStr,
    durationMs: overrides.durationMs ?? 22 * 60 * 1000,
    status: overrides.status ?? 'completed',
    overallRawScore: overrides.overallRawScore,
    domainScoresRaw: {
      visualMemory: 70,
      attention: 70,
      executiveFunction: 70,
      language: 70,
      processingSpeed: 70,
      recognitionMemory: 70,
      ...(overrides.domainScoresRaw || {}),
    },
    lobarTaskScores: {
      stroop: 70, trailMaking: 70, goNoGo: 70, verbalFluency: 70,
      wordListRecall: 70, delayedRecognition: 70, naming: 70,
      clockDrawing: 70, cubeCopy: 70, calculation: 70,
      embeddedFigures: 70, objectNaming: 70,
      ...(overrides.lobarTaskScores || {}),
    },
    visualMemoryDetail: {
      encoding: 72, recognition: 74, retention: 70,
      distractorDiscrimination: 68, reactionConsistency: 75,
      ...(overrides.visualMemoryDetail || {}),
    },
    speechDetail: {
      fluency: 74, pauseFrequency: 70, lexicalDiversity: 72,
      naming: 76, wordRetrieval: 71, speechRate: 73,
      ...(overrides.speechDetail || {}),
    },
    questionnaireSummary: {
      memoryComplaints: 'None',
      orientation: 'Intact',
      dailyActivities: 'Independent',
      behaviour: 'No Changes',
      functionalIndependence: 'Full',
      ...(overrides.questionnaireSummary || {}),
    },
    caregiverConcern: overrides.caregiverConcern ?? 'Low',
    hiddenAnalytics: {
      hitRate: 0.86, missRate: 0.14, falsePositiveRate: 0.08, correctRejectionRate: 0.92,
      averageReactionTimeMs: 1180, reactionTimeVariability: 210, timeouts: 1,
      rawScore: overrides.overallRawScore ?? 70, normalizedScore: overrides.overallRawScore ?? 70,
      ...(overrides.hiddenAnalytics || {}),
    },
  };
}

export const MOCK_PATIENTS = [
  {
    patientId: 'NMX-1001',
    name: 'Eleanor Whitfield',
    age: 74,
    gender: 'Female',
    riskFactors: ['Family history of dementia', 'Hypertension'],
    notes: [
      { id: 'n1', author: 'Dr. Anika Rao', timestamp: '2026-06-02T10:15:00Z', text: 'Patient reports occasional word-finding difficulty. Recommend repeat assessment in 3 months given mild decline trend.' },
    ],
    sessions: [
      session('2026-01-05', {
        overallRawScore: 78,
        domainScoresRaw: { visualMemory: 80, attention: 76, executiveFunction: 79, language: 82, processingSpeed: 75, recognitionMemory: 77 },
        lobarTaskScores: { stroop: 78, trailMaking: 80, goNoGo: 76, verbalFluency: 81, wordListRecall: 79, delayedRecognition: 77, naming: 83, clockDrawing: 82, cubeCopy: 79, calculation: 80, embeddedFigures: 78, objectNaming: 80 },
        visualMemoryDetail: { encoding: 81, recognition: 80, retention: 78, distractorDiscrimination: 76, reactionConsistency: 82 },
        speechDetail: { fluency: 82, pauseFrequency: 80, lexicalDiversity: 81, naming: 84, wordRetrieval: 79, speechRate: 80 },
        questionnaireSummary: { memoryComplaints: 'Mild', orientation: 'Intact', dailyActivities: 'Independent', behaviour: 'No Changes', functionalIndependence: 'Full' },
        caregiverConcern: 'Low',
      }),
      session('2026-04-20', {
        overallRawScore: 69,
        domainScoresRaw: { visualMemory: 68, attention: 70, executiveFunction: 66, language: 74, processingSpeed: 68, recognitionMemory: 65 },
        lobarTaskScores: { stroop: 65, trailMaking: 67, goNoGo: 68, verbalFluency: 73, wordListRecall: 66, delayedRecognition: 64, naming: 75, clockDrawing: 70, cubeCopy: 69, calculation: 71, embeddedFigures: 70, objectNaming: 72 },
        visualMemoryDetail: { encoding: 69, recognition: 67, retention: 63, distractorDiscrimination: 62, reactionConsistency: 70 },
        speechDetail: { fluency: 75, pauseFrequency: 72, lexicalDiversity: 74, naming: 77, wordRetrieval: 70, speechRate: 74 },
        questionnaireSummary: { memoryComplaints: 'Moderate', orientation: 'Intact', dailyActivities: 'Independent', behaviour: 'Mild Changes', functionalIndependence: 'Partial' },
        caregiverConcern: 'Moderate',
      }),
      session('2026-07-28', {
        overallRawScore: 58,
        domainScoresRaw: { visualMemory: 55, attention: 60, executiveFunction: 54, language: 68, processingSpeed: 59, recognitionMemory: 52 },
        lobarTaskScores: { stroop: 52, trailMaking: 55, goNoGo: 58, verbalFluency: 66, wordListRecall: 53, delayedRecognition: 50, naming: 70, clockDrawing: 60, cubeCopy: 57, calculation: 61, embeddedFigures: 59, objectNaming: 63 },
        visualMemoryDetail: { encoding: 56, recognition: 54, retention: 48, distractorDiscrimination: 50, reactionConsistency: 57 },
        speechDetail: { fluency: 67, pauseFrequency: 60, lexicalDiversity: 65, naming: 70, wordRetrieval: 58, speechRate: 66 },
        questionnaireSummary: { memoryComplaints: 'Significant', orientation: 'Mild Difficulty', dailyActivities: 'Needs Occasional Help', behaviour: 'Mild Changes', functionalIndependence: 'Partial' },
        caregiverConcern: 'High',
      }),
    ],
  },
  {
    patientId: 'NMX-1002',
    name: 'Marcus Ibe',
    age: 68,
    gender: 'Male',
    riskFactors: ['Type 2 diabetes'],
    notes: [],
    sessions: [
      session('2026-03-10', {
        overallRawScore: 88,
        domainScoresRaw: { visualMemory: 90, attention: 87, executiveFunction: 89, language: 91, processingSpeed: 85, recognitionMemory: 88 },
        lobarTaskScores: { stroop: 88, trailMaking: 90, goNoGo: 87, verbalFluency: 92, wordListRecall: 89, delayedRecognition: 87, naming: 93, clockDrawing: 90, cubeCopy: 88, calculation: 91, embeddedFigures: 89, objectNaming: 90 },
        visualMemoryDetail: { encoding: 91, recognition: 90, retention: 88, distractorDiscrimination: 87, reactionConsistency: 92 },
        speechDetail: { fluency: 91, pauseFrequency: 90, lexicalDiversity: 92, naming: 93, wordRetrieval: 89, speechRate: 90 },
        questionnaireSummary: { memoryComplaints: 'None', orientation: 'Intact', dailyActivities: 'Independent', behaviour: 'No Changes', functionalIndependence: 'Full' },
        caregiverConcern: 'Low',
      }),
      session('2026-06-24', {
        overallRawScore: 86,
        domainScoresRaw: { visualMemory: 87, attention: 85, executiveFunction: 88, language: 89, processingSpeed: 84, recognitionMemory: 86 },
        lobarTaskScores: { stroop: 86, trailMaking: 88, goNoGo: 85, verbalFluency: 90, wordListRecall: 87, delayedRecognition: 85, naming: 91, clockDrawing: 89, cubeCopy: 87, calculation: 89, embeddedFigures: 87, objectNaming: 88 },
        visualMemoryDetail: { encoding: 89, recognition: 88, retention: 86, distractorDiscrimination: 85, reactionConsistency: 90 },
        speechDetail: { fluency: 89, pauseFrequency: 88, lexicalDiversity: 90, naming: 91, wordRetrieval: 87, speechRate: 88 },
        questionnaireSummary: { memoryComplaints: 'None', orientation: 'Intact', dailyActivities: 'Independent', behaviour: 'No Changes', functionalIndependence: 'Full' },
        caregiverConcern: 'Low',
      }),
    ],
  },
  {
    patientId: 'NMX-1003',
    name: 'Rosa Delgado',
    age: 81,
    gender: 'Female',
    riskFactors: ['Prior stroke (2021)', 'Family history of dementia', 'Lives alone'],
    notes: [
      { id: 'n2', author: 'Dr. Anika Rao', timestamp: '2026-07-15T09:00:00Z', text: 'Caregiver-reported concern substantially exceeds patient self-report. Discussed with daughter; suggested formal neuropsych referral.' },
    ],
    sessions: [
      session('2026-02-01', {
        overallRawScore: 61,
        domainScoresRaw: { visualMemory: 58, attention: 63, executiveFunction: 55, language: 66, processingSpeed: 60, recognitionMemory: 57 },
        lobarTaskScores: { stroop: 54, trailMaking: 57, goNoGo: 60, verbalFluency: 64, wordListRecall: 56, delayedRecognition: 55, naming: 68, clockDrawing: 58, cubeCopy: 56, calculation: 59, embeddedFigures: 61, objectNaming: 62 },
        visualMemoryDetail: { encoding: 59, recognition: 57, retention: 52, distractorDiscrimination: 53, reactionConsistency: 58 },
        speechDetail: { fluency: 65, pauseFrequency: 58, lexicalDiversity: 63, naming: 68, wordRetrieval: 55, speechRate: 62 },
        questionnaireSummary: { memoryComplaints: 'Mild', orientation: 'Mild Difficulty', dailyActivities: 'Needs Occasional Help', behaviour: 'No Changes', functionalIndependence: 'Partial' },
        caregiverConcern: 'High',
      }),
      session('2026-07-30', {
        overallRawScore: 59,
        domainScoresRaw: { visualMemory: 56, attention: 61, executiveFunction: 53, language: 64, processingSpeed: 58, recognitionMemory: 55 },
        lobarTaskScores: { stroop: 52, trailMaking: 55, goNoGo: 58, verbalFluency: 63, wordListRecall: 54, delayedRecognition: 53, naming: 67, clockDrawing: 56, cubeCopy: 54, calculation: 57, embeddedFigures: 59, objectNaming: 60 },
        visualMemoryDetail: { encoding: 57, recognition: 55, retention: 50, distractorDiscrimination: 51, reactionConsistency: 56 },
        speechDetail: { fluency: 64, pauseFrequency: 56, lexicalDiversity: 61, naming: 67, wordRetrieval: 53, speechRate: 60 },
        questionnaireSummary: { memoryComplaints: 'Mild', orientation: 'Mild Difficulty', dailyActivities: 'Needs Occasional Help', behaviour: 'No Changes', functionalIndependence: 'Partial' },
        caregiverConcern: 'High',
      }),
    ],
  },
  {
    patientId: 'NMX-1004',
    name: 'Daniel Osei',
    age: 71,
    gender: 'Male',
    riskFactors: [],
    notes: [],
    sessions: [
      session('2026-07-22', {
        overallRawScore: 91,
        domainScoresRaw: { visualMemory: 92, attention: 90, executiveFunction: 91, language: 93, processingSpeed: 89, recognitionMemory: 90 },
        lobarTaskScores: { stroop: 90, trailMaking: 92, goNoGo: 89, verbalFluency: 93, wordListRecall: 91, delayedRecognition: 90, naming: 94, clockDrawing: 92, cubeCopy: 90, calculation: 92, embeddedFigures: 91, objectNaming: 92 },
        visualMemoryDetail: { encoding: 93, recognition: 92, retention: 90, distractorDiscrimination: 89, reactionConsistency: 93 },
        speechDetail: { fluency: 93, pauseFrequency: 92, lexicalDiversity: 93, naming: 94, wordRetrieval: 91, speechRate: 92 },
        questionnaireSummary: { memoryComplaints: 'None', orientation: 'Intact', dailyActivities: 'Independent', behaviour: 'No Changes', functionalIndependence: 'Full' },
        caregiverConcern: 'Low',
      }),
    ],
  },
  {
    patientId: 'NMX-1005',
    name: 'Priya Nair',
    age: 76,
    gender: 'Female',
    riskFactors: ['Lives alone'],
    notes: [],
    // Demonstrates the cumulative-decline risk check: each step below drops
    // 7-8 points (under the 10-point session-over-session threshold), but
    // the full-history drop from the first to the latest session is 16
    // points -- over the 15-point cumulative threshold. A slow, real
    // decline that the step-only check (before this project's self-review
    // fix) would have missed entirely.
    sessions: [
      session('2026-01-10', {
        overallRawScore: 79,
        domainScoresRaw: { visualMemory: 78, attention: 80, executiveFunction: 79, language: 81, processingSpeed: 77, recognitionMemory: 78 },
      }),
      session('2026-03-25', {
        overallRawScore: 71,
        domainScoresRaw: { visualMemory: 71, attention: 72, executiveFunction: 70, language: 74, processingSpeed: 69, recognitionMemory: 70 },
      }),
      session('2026-07-29', {
        overallRawScore: 63,
        domainScoresRaw: { visualMemory: 62, attention: 65, executiveFunction: 61, language: 68, processingSpeed: 60, recognitionMemory: 62 },
      }),
    ],
  },
  {
    patientId: 'NMX-1006',
    name: 'Walter Higgins',
    age: 79,
    gender: 'Male',
    riskFactors: ['Hypertension', 'Lives alone'],
    notes: [],
    // Flagship Trend Intelligence demo case: the first and last sessions
    // (75 -> 78) and the two most recent sessions (84 -> 78, a 6-point drop)
    // both stay safely under RiskAlertEngine's thresholds, and DriftEngine's
    // own multi-week slope fit isn't significant either -- there is no
    // mean-level or step-level signal here at all. But the spread of scores
    // around that flat average grows sharply in the second half (a swing up
    // to 68 then 84, versus a 1-2 point spread in the first three sessions):
    // VariabilityEngine catches this as rising inconsistency, which
    // TrendIntelligenceEngine surfaces as "volatile" -- a real early-warning
    // signal a mean/threshold-only system would miss completely.
    sessions: [
      session('2026-06-30', {
        overallRawScore: 75,
        domainScoresRaw: { visualMemory: 74, attention: 76, executiveFunction: 75, language: 77, processingSpeed: 73, recognitionMemory: 75 },
      }),
      session('2026-07-07', {
        overallRawScore: 76,
        domainScoresRaw: { visualMemory: 75, attention: 77, executiveFunction: 76, language: 78, processingSpeed: 74, recognitionMemory: 76 },
      }),
      session('2026-07-14', {
        overallRawScore: 74,
        domainScoresRaw: { visualMemory: 73, attention: 75, executiveFunction: 74, language: 76, processingSpeed: 72, recognitionMemory: 74 },
      }),
      session('2026-07-21', {
        overallRawScore: 68,
        domainScoresRaw: { visualMemory: 67, attention: 69, executiveFunction: 68, language: 70, processingSpeed: 66, recognitionMemory: 68 },
      }),
      session('2026-07-28', {
        overallRawScore: 84,
        domainScoresRaw: { visualMemory: 83, attention: 85, executiveFunction: 84, language: 86, processingSpeed: 82, recognitionMemory: 84 },
      }),
      session('2026-08-04', {
        overallRawScore: 78,
        domainScoresRaw: { visualMemory: 77, attention: 79, executiveFunction: 78, language: 80, processingSpeed: 76, recognitionMemory: 78 },
      }),
    ],
  },
  {
    patientId: 'NMX-2001',
    name: 'Robert Hayes',
    age: 72,
    riskFactors: [],
    notes: [
      {
        id: 'n3',
        author: 'System',
        timestamp: '2026-08-09T00:00:00Z',
        text: 'This is the live bridge demo patient: every session below is shaped exactly like a real completed weekly Detection Assessment from the patient app (app_page), via DoctorDashboardExportEngine. Only the 3 domains and 8 lobar tasks that app actually measures are present -- visualMemory, language, and recognitionMemory are intentionally absent (not fabricated) until the Visual Memory and Speech modules are wired into a shared patient record too.',
      },
    ],
    // NOT built with the session() helper above on purpose -- that helper
    // defaults every domain/task to 70 unless overridden, which would
    // silently fabricate scores for the 3 domains and 4 lobar tasks this
    // patient's real source (app_page) never measures. These 6 sessions
    // are plain objects with ONLY the fields DoctorDashboardExportEngine
    // actually produces, so this patient renders exactly as an honest,
    // partial-but-real integration would -- a mild, realistic 6-week
    // decline (83 -> 75) to demonstrate the trend/insight machinery
        // usefully without needing alarming, edge-case numbers.
    sessions: [
      {
        date: '2026-06-28', durationMs: 21 * 60 * 1000, status: 'completed', overallRawScore: 83,
        domainScoresRaw: { attention: 82, executiveFunction: 85, processingSpeed: 81 },
        lobarTaskScores: { stroop: 86, trailMaking: 80, wordListRecall: 83, delayedRecognition: 81, clockDrawing: 84, cubeCopy: 85, embeddedFigures: 82, objectNaming: 82 },
      },
      {
        date: '2026-07-05', durationMs: 22 * 60 * 1000, status: 'completed', overallRawScore: 81,
        domainScoresRaw: { attention: 80, executiveFunction: 83, processingSpeed: 79 },
        lobarTaskScores: { stroop: 84, trailMaking: 78, wordListRecall: 81, delayedRecognition: 79, clockDrawing: 82, cubeCopy: 83, embeddedFigures: 80, objectNaming: 80 },
      },
      {
        date: '2026-07-12', durationMs: 21 * 60 * 1000, status: 'completed', overallRawScore: 80,
        domainScoresRaw: { attention: 79, executiveFunction: 82, processingSpeed: 78 },
        lobarTaskScores: { stroop: 83, trailMaking: 77, wordListRecall: 80, delayedRecognition: 78, clockDrawing: 81, cubeCopy: 82, embeddedFigures: 79, objectNaming: 79 },
      },
      {
        date: '2026-07-19', durationMs: 23 * 60 * 1000, status: 'completed', overallRawScore: 78,
        domainScoresRaw: { attention: 77, executiveFunction: 80, processingSpeed: 76 },
        lobarTaskScores: { stroop: 81, trailMaking: 75, wordListRecall: 78, delayedRecognition: 76, clockDrawing: 79, cubeCopy: 80, embeddedFigures: 77, objectNaming: 77 },
      },
      {
        date: '2026-07-26', durationMs: 22 * 60 * 1000, status: 'completed', overallRawScore: 76,
        domainScoresRaw: { attention: 75, executiveFunction: 78, processingSpeed: 74 },
        lobarTaskScores: { stroop: 79, trailMaking: 73, wordListRecall: 76, delayedRecognition: 74, clockDrawing: 77, cubeCopy: 78, embeddedFigures: 75, objectNaming: 75 },
      },
      {
        date: '2026-08-02', durationMs: 21 * 60 * 1000, status: 'completed', overallRawScore: 75,
        domainScoresRaw: { attention: 74, executiveFunction: 77, processingSpeed: 73 },
        lobarTaskScores: { stroop: 78, trailMaking: 72, wordListRecall: 75, delayedRecognition: 73, clockDrawing: 76, cubeCopy: 77, embeddedFigures: 74, objectNaming: 74 },
      },
    ],
    // 2026-08-19: shaped exactly like DoctorDashboardExportEngine's
    // (app_page) buildDailyMomentumRecord() output -- a real DAILY (not
    // weekly) signal, separate from the sessions above. Demonstrates the
    // new dailyMomentum bridge on the one mock patient standing in for the
    // real live app_page integration; every other mock patient omits this
    // field entirely (honestly "not measured", not fabricated as 0).
    dailyMomentum: { date: '2026-08-18', score: 84, completionPct: 100, performanceAvg: 84 },
  },
];
