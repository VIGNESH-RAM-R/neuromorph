// A lightweight mirror of Doctor_Dashboard/src/data/mockPatients.js, for the
// doctor chatbot's "look up / summarize patient <name>" capability inside
// app_page. Same "mirrored config" precedent already used for
// scoringBands.js and lobarConfig.js: two separate frontend apps, one
// source of truth copied deliberately (not imported across app boundaries,
// since app_page and Doctor_Dashboard are, and stay, separate deployables).
//
// This is DELIBERATELY THINNER than the real Doctor_Dashboard record: only
// `date`, `overallRawScore`, and `domainScoresRaw` are kept per session
// (dropped: lobarTaskScores, visualMemoryDetail, speechDetail,
// questionnaireSummary, hiddenAnalytics, caregiverConcern, notes authorship
// detail). That's enough for the chatbot to report an honest score, band,
// per-domain breakdown, and trend across sessions -- the things a doctor
// actually asks the assistant for in chat -- without duplicating clinical
// note text or the full analytics payload into a second app's bundle.
//
// Every score below is copied verbatim from mockPatients.js -- nothing here
// is invented. If Doctor_Dashboard's mock data changes, this file needs a
// manual re-sync (same maintenance cost already accepted for
// scoringBands.js/lobarConfig.js).
export const DOCTOR_MOCK_PATIENTS = [
  {
    patientId: 'NMX-1001',
    name: 'Eleanor Whitfield',
    age: 74,
    gender: 'Female',
    riskFactors: ['Family history of dementia', 'Hypertension'],
    sessions: [
      { date: '2026-01-05', overallRawScore: 78, domainScoresRaw: { visualMemory: 80, attention: 76, executiveFunction: 79, language: 82, processingSpeed: 75, recognitionMemory: 77 } },
      { date: '2026-04-20', overallRawScore: 69, domainScoresRaw: { visualMemory: 68, attention: 70, executiveFunction: 66, language: 74, processingSpeed: 68, recognitionMemory: 65 } },
      { date: '2026-07-28', overallRawScore: 58, domainScoresRaw: { visualMemory: 55, attention: 60, executiveFunction: 54, language: 68, processingSpeed: 59, recognitionMemory: 52 } },
    ],
  },
  {
    patientId: 'NMX-1002',
    name: 'Marcus Ibe',
    age: 68,
    gender: 'Male',
    riskFactors: ['Type 2 diabetes'],
    sessions: [
      { date: '2026-03-10', overallRawScore: 88, domainScoresRaw: { visualMemory: 90, attention: 87, executiveFunction: 89, language: 91, processingSpeed: 85, recognitionMemory: 88 } },
      { date: '2026-06-24', overallRawScore: 86, domainScoresRaw: { visualMemory: 87, attention: 85, executiveFunction: 88, language: 89, processingSpeed: 84, recognitionMemory: 86 } },
    ],
  },
  {
    patientId: 'NMX-1003',
    name: 'Rosa Delgado',
    age: 81,
    gender: 'Female',
    riskFactors: ['Prior stroke (2021)', 'Family history of dementia', 'Lives alone'],
    sessions: [
      { date: '2026-02-01', overallRawScore: 61, domainScoresRaw: { visualMemory: 58, attention: 63, executiveFunction: 55, language: 66, processingSpeed: 60, recognitionMemory: 57 } },
      { date: '2026-07-30', overallRawScore: 59, domainScoresRaw: { visualMemory: 56, attention: 61, executiveFunction: 53, language: 64, processingSpeed: 58, recognitionMemory: 55 } },
    ],
  },
  {
    patientId: 'NMX-1004',
    name: 'Daniel Osei',
    age: 71,
    gender: 'Male',
    riskFactors: [],
    sessions: [
      { date: '2026-07-22', overallRawScore: 91, domainScoresRaw: { visualMemory: 92, attention: 90, executiveFunction: 91, language: 93, processingSpeed: 89, recognitionMemory: 90 } },
    ],
  },
  {
    patientId: 'NMX-1005',
    name: 'Priya Nair',
    age: 76,
    gender: 'Female',
    riskFactors: ['Lives alone'],
    sessions: [
      { date: '2026-01-10', overallRawScore: 79, domainScoresRaw: { visualMemory: 78, attention: 80, executiveFunction: 79, language: 81, processingSpeed: 77, recognitionMemory: 78 } },
      { date: '2026-03-25', overallRawScore: 71, domainScoresRaw: { visualMemory: 71, attention: 72, executiveFunction: 70, language: 74, processingSpeed: 69, recognitionMemory: 70 } },
      { date: '2026-07-29', overallRawScore: 63, domainScoresRaw: { visualMemory: 62, attention: 65, executiveFunction: 61, language: 68, processingSpeed: 60, recognitionMemory: 62 } },
    ],
  },
  {
    patientId: 'NMX-1006',
    name: 'Walter Higgins',
    age: 79,
    gender: 'Male',
    riskFactors: ['Hypertension', 'Lives alone'],
    sessions: [
      { date: '2026-06-30', overallRawScore: 75, domainScoresRaw: { visualMemory: 74, attention: 76, executiveFunction: 75, language: 77, processingSpeed: 73, recognitionMemory: 75 } },
      { date: '2026-07-07', overallRawScore: 76, domainScoresRaw: { visualMemory: 75, attention: 77, executiveFunction: 76, language: 78, processingSpeed: 74, recognitionMemory: 76 } },
      { date: '2026-07-14', overallRawScore: 74, domainScoresRaw: { visualMemory: 73, attention: 75, executiveFunction: 74, language: 76, processingSpeed: 72, recognitionMemory: 74 } },
      { date: '2026-07-21', overallRawScore: 68, domainScoresRaw: { visualMemory: 67, attention: 69, executiveFunction: 68, language: 70, processingSpeed: 66, recognitionMemory: 68 } },
      { date: '2026-07-28', overallRawScore: 84, domainScoresRaw: { visualMemory: 83, attention: 85, executiveFunction: 84, language: 86, processingSpeed: 82, recognitionMemory: 84 } },
      { date: '2026-08-04', overallRawScore: 78, domainScoresRaw: { visualMemory: 77, attention: 79, executiveFunction: 78, language: 80, processingSpeed: 76, recognitionMemory: 78 } },
    ],
  },
  {
    // The live bridge demo patient -- shaped exactly like a real completed
    // weekly Detection Assessment from app_page itself, via
    // DoctorDashboardExportEngine. Only 3 domains are present (attention,
    // executiveFunction, processingSpeed) because those are honestly all
    // app_page's own Detection Assessment currently measures -- visualMemory,
    // language, and recognitionMemory are intentionally absent here too,
    // not fabricated, matching mockPatients.js's own note about this patient.
    patientId: 'NMX-2001',
    name: 'Robert Hayes',
    age: 72,
    gender: undefined,
    riskFactors: [],
    sessions: [
      { date: '2026-06-28', overallRawScore: 83, domainScoresRaw: { attention: 82, executiveFunction: 85, processingSpeed: 81 } },
      { date: '2026-07-05', overallRawScore: 81, domainScoresRaw: { attention: 80, executiveFunction: 83, processingSpeed: 79 } },
      { date: '2026-07-12', overallRawScore: 80, domainScoresRaw: { attention: 79, executiveFunction: 82, processingSpeed: 78 } },
      { date: '2026-07-19', overallRawScore: 78, domainScoresRaw: { attention: 77, executiveFunction: 80, processingSpeed: 76 } },
      { date: '2026-07-26', overallRawScore: 76, domainScoresRaw: { attention: 75, executiveFunction: 78, processingSpeed: 74 } },
      { date: '2026-08-02', overallRawScore: 75, domainScoresRaw: { attention: 74, executiveFunction: 77, processingSpeed: 73 } },
    ],
  },
];
