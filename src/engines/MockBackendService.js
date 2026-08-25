// Fake-but-realistic data standing in for NEUROMORPH's real backend, which
// this project has no live connection to yet (Flutter + Firestore, built
// elsewhere). Every function here is a pure, deterministic placeholder --
// no randomness, so tests and demos are reproducible -- clearly named and
// documented as the seam to replace with real API/Firestore calls.
//
// THE SWAP-IN POINT: once a real backend exists, replace the bodies of
// these functions with real fetch/Firestore calls (same shape as
// AiFallbackService's injectable-fetch pattern). BackendActionEngine,
// which calls these, doesn't need to change at all.
const MOCK_USER_NAME = 'there';

export const MockBackendService = {
  getProgress() {
    return {
      userName: MOCK_USER_NAME,
      assessmentsCompletedThisMonth: 3,
      assessmentsScheduledThisMonth: 4,
      dailySetCompletedToday: true,
      currentStreakDays: 12,
      longestStreakDays: 19,
      adherencePercentage: 86,
      totalAssessmentsAllTime: 27,
      remainingThisWeek: ['Weekly Detection Assessment'],
    };
  },

  getReport({ period = 'latest' } = {}) {
    return {
      period,
      assessmentDate: '2026-08-03',
      overallCognitiveScore: 78,
      detectionBand: 'NORMAL',
      domainScores: {
        memory: 81,
        attention: 76,
        reaction: 74,
        speech: 80,
        facialExpressivity: 72,
      },
      trend: 'stable',
      recommendations: [
        'Keep up your current daily routine -- consistency matters more than any single score.',
        'Your reaction and facial expressivity scores are your two lowest this month; nothing concerning on their own, but worth keeping an eye on.',
      ],
    };
  },

  compareReports({ fromPeriod = 'last month', toPeriod = 'this month' } = {}) {
    return {
      fromPeriod,
      toPeriod,
      fromScore: 74,
      toScore: 78,
      change: 4,
      changeDirection: 'improving',
      domainChanges: {
        memory: 2,
        attention: 3,
        reaction: -1,
        speech: 5,
        facialExpressivity: 1,
      },
    };
  },

  downloadReport() {
    return { ok: true, fileName: 'neuromorph-report-2026-08-03.pdf', sizeKb: 214 };
  },

  shareReport({ recipient = 'your doctor' } = {}) {
    return { ok: true, sharedWith: recipient, sharedAt: '2026-08-06T12:00:00.000Z' };
  },

  getCurrentVersion() {
    return { version: '1.4.2', releaseDate: '2026-07-20' };
  },

  checkUpdate() {
    return { updateAvailable: false, latestVersion: '1.4.2' };
  },

  syncData() {
    return { ok: true, syncedAt: '2026-08-06T12:00:00.000Z', itemsSynced: 6 };
  },
};
