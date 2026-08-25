// The real, structural bridge between this app's completed Detection
// Assessment sessions and the Doctor Dashboard's patient report. This
// keeps the promise AssessmentSessionModel's own header comment already
// made: "a session built here is a drop-in real replacement for a mock
// session over there, no format translation needed" -- this engine is
// where that promise gets kept, producing the EXACT session shape
// Doctor_Dashboard/src/data/mockPatients.js's session() helper and
// ReportModel.build() expect.
//
// HONESTY NOTE (updated 2026-08-11, later batch, for the 7-of-8 Final-8
// wiring -- see lobarTaskRegistryConfig.js's header comment for the full
// story): this app now measures 4 of the Doctor Dashboard's 6 cognitive
// domains via its active lobar tasks -- attention, executiveFunction,
// visualMemory, and recognitionMemory (the latter two feed directly, real
// domain matches, now that visualMemory/delayedRecognitionMemory tasks
// exist). processingSpeed has no active source task right now (its old
// sources, trailMaking/objectNaming, remain retired) and language is still
// honestly omitted, alongside visualMemoryDetail/speechDetail/
// questionnaireSummary, which come from OTHER modules (face_recognition/,
// face_module/) that are connected as their own apps but don't yet write
// into a shared patient record. Those fields are simply OMITTED here
// rather than fabricated -- Doctor Dashboard's own DomainAggregationEngine
// already handles a missing domain score gracefully (same as it does for
// every existing mock patient with sparse data), so this is not a new
// representational gap, just an honest, visible one that will shrink
// further once Face Recognition is integrated.
export const DoctorDashboardExportEngine = {
  // session: an AssessmentSessionModel.build() result.
  // cognitiveScore: a CognitiveScoreEngine.compute(session) result.
  // date: 'YYYY-MM-DD' the assessment was completed.
  buildSessionRecord(session, cognitiveScore, date) {
    if (!session || !date) return undefined;
    return {
      date,
      durationMs: session.durationMs,
      status: session.completedCount === session.totalCount ? 'completed' : 'partial',
      overallRawScore: cognitiveScore?.score ?? session.overallRawScore,
      domainScoresRaw: { ...session.domainScoresRaw },
      lobarTaskScores: { ...session.lobarTaskScores },
      // Not part of the Doctor Dashboard's schema, but kept for
      // transparency/debugging -- harmless extra field, ReportModel
      // never reads it.
      questionBankScore: session.questionBankScore,
      // 2026-08-20: same treatment as questionBankScore above -- not part
      // of Doctor_Dashboard's existing schema, kept so a doctor (or a
      // future Doctor_Dashboard feature) can see how comprehensive
      // overallRawScore actually was for this specific session, now that
      // it's a domain-equal-weighted composite (see
      // AssessmentSessionModel.js's 2026-08-20 comment) rather than
      // implying every session is equally thorough.
      domainCoverage: session.domainCoverage,
    };
  },

  // 2026-08-19: the daily Daily Set / Momentum Score bridge -- a completely
  // separate, smaller record from buildSessionRecord() above. Written once
  // per day (see useAuth.js's recordCompletedDailyTask), only the moment
  // the full 5-item Daily Set is complete, so a doctor viewing it always
  // sees a genuine "how did today go" number, never a live-ticking partial
  // one. `momentum` is a MomentumScoreEngine.scoreForDay() result.
  buildDailyMomentumRecord(momentum, date) {
    if (!momentum || !date) return undefined;
    return {
      date,
      score: momentum.score,
      completionPct: momentum.completionPct,
      performanceAvg: momentum.performanceAvg,
    };
  },
};
