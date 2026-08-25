import { InterpretationEngine } from './InterpretationEngine.js';
import { DomainAggregationEngine } from './DomainAggregationEngine.js';
import { LobarMappingEngine } from './LobarMappingEngine.js';
import { TrendAnalysisEngine } from './TrendAnalysisEngine.js';
import { TrendIntelligenceEngine } from './TrendIntelligenceEngine.js';
import { CoherenceEngine } from './CoherenceEngine.js';
import { RiskAlertEngine } from './RiskAlertEngine.js';
import { CaregiverConcordanceEngine } from './CaregiverConcordanceEngine.js';
import { AdherenceEngine } from './AdherenceEngine.js';
import { RecommendationEngine } from './RecommendationEngine.js';
import { average } from './mathUtils.js';
import { speechBandFromScore, SPEECH_BAND_INTERPRETATION_TEMPLATES } from '../config/scoringBands.js';
import { DOMAIN_KEYS } from '../config/domainConfig.js';
import { LOBES, LOBE_KEYS } from '../config/lobarConfig.js';

function visualMemoryOverall(session) {
  const d = session?.visualMemoryDetail || {};
  return average([d.encoding, d.recognition, d.retention, d.distractorDiscrimination, d.reactionConsistency]);
}

function speechOverall(session) {
  const d = session?.speechDetail || {};
  return average([d.fluency, d.pauseFrequency, d.lexicalDiversity, d.naming, d.wordRetrieval, d.speechRate]);
}

// A subscore/metric this patient's connected modules never measured (not a
// number) is clinically different from one that WAS measured and came back
// low -- same distinction, and same reason, as DomainAggregationEngine's
// "Not Measured" fix below. Without this, a real, partial-integration
// patient (e.g. one whose app only runs the Lobar Function + QB modules,
// like the app_page bridge -- see README) would show a false "Reduced"
// Visual Memory / Speech card instead of an honest "not measured yet" one.
const NOT_MEASURED_INTERPRETATION = 'No completed module currently feeds this measure yet.';

function interpretOrNotMeasured(score) {
  return typeof score === 'number'
    ? InterpretationEngine.interpret(score)
    : { band: 'Not Measured', interpretation: NOT_MEASURED_INTERPRETATION };
}

function speechInterpretOrNotMeasured(score) {
  if (typeof score !== 'number') return { band: 'Not Measured', interpretation: NOT_MEASURED_INTERPRETATION };
  const band = speechBandFromScore(score);
  return { band, interpretation: SPEECH_BAND_INTERPRETATION_TEMPLATES[band] };
}

function buildVisualMemoryReport(session) {
  const d = session?.visualMemoryDetail || {};
  const subscores = ['encoding', 'recognition', 'retention', 'distractorDiscrimination', 'reactionConsistency'].map((key) => {
    const { band } = interpretOrNotMeasured(d[key]);
    return { key, label: key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()), score: d[key], band };
  });
  const overallScore = visualMemoryOverall(session);
  const { band, interpretation } = interpretOrNotMeasured(overallScore);
  return { subscores, overallScore, band, interpretation };
}

function buildSpeechReport(session) {
  const d = session?.speechDetail || {};
  const metrics = ['fluency', 'pauseFrequency', 'lexicalDiversity', 'naming', 'wordRetrieval', 'speechRate'].map((key) => {
    const { band, interpretation } = speechInterpretOrNotMeasured(d[key]);
    return { key, label: key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()), score: d[key], band, interpretation };
  });
  const overallScore = speechOverall(session);
  const { band: overallBand, interpretation } = speechInterpretOrNotMeasured(overallScore);
  return { metrics, overallScore, overallBand, interpretation };
}

function buildLobeTrends(sessions) {
  const perSessionLobes = sessions.map((s) => ({ date: s.date, lobes: LobarMappingEngine.mapLobes(s) }));
  const out = {};
  for (const lobeDef of LOBES) {
    const series = perSessionLobes.map((entry) => ({
      date: entry.date,
      score: entry.lobes.find((l) => l.key === lobeDef.key)?.score,
    }));
    out[lobeDef.key] = TrendAnalysisEngine.trendFromSeries(series);
  }
  return out;
}

// The single assembler: given a patient record (with sessions sorted oldest
// -> newest), produces the complete, clinician-facing report object every
// dashboard component reads from. No component talks to the raw session
// data or an engine directly -- this is the ResultModel-equivalent for the
// Doctor Dashboard.
export const ReportModel = {
  build(patient, now = new Date()) {
    const sessions = patient?.sessions || [];
    const latestSession = sessions[sessions.length - 1];
    const previousSession = sessions.length >= 2 ? sessions[sessions.length - 2] : undefined;

    if (!latestSession) {
      return {
        patient: { patientId: patient?.patientId, name: patient?.name, age: patient?.age, gender: patient?.gender, riskFactors: patient?.riskFactors || [] },
        hasData: false,
        // A patient can have real daily engagement (Daily Set/Momentum
        // Score) before ever completing their first weekly Detection
        // Assessment -- so this is surfaced even on the "no session data
        // yet" path, not just below.
        dailyMomentum: patient?.dailyMomentum,
      };
    }

    const overallInterp = InterpretationEngine.interpret(latestSession.overallRawScore);
    const previousOverallInterp = previousSession ? InterpretationEngine.interpret(previousSession.overallRawScore) : undefined;

    const domains = DomainAggregationEngine.aggregate(latestSession);
    const lobes = LobarMappingEngine.mapLobes(latestSession);
    const visualMemory = buildVisualMemoryReport(latestSession);
    const speech = buildSpeechReport(latestSession);

    const overallTrend = TrendAnalysisEngine.overallTrend(sessions, (s) => s.overallRawScore);
    const domainTrends = TrendAnalysisEngine.trendForKeys(sessions, DOMAIN_KEYS, 'domainScoresRaw');
    const lobeTrends = buildLobeTrends(sessions);
    const visualMemoryTrend = TrendAnalysisEngine.trendFromSeries(sessions.map((s) => ({ date: s.date, score: visualMemoryOverall(s) })));
    const speechTrend = TrendAnalysisEngine.trendFromSeries(sessions.map((s) => ({ date: s.date, score: speechOverall(s) })));

    const riskAlert = RiskAlertEngine.evaluate(previousSession, latestSession, previousOverallInterp?.band, overallInterp.band, undefined, sessions);
    const trendIntelligence = TrendIntelligenceEngine.evaluate(sessions);
    const networkCoherence = CoherenceEngine.evaluate(sessions);
    const caregiverConcordance = CaregiverConcordanceEngine.evaluate(latestSession, overallInterp.band);
    const adherence = AdherenceEngine.evaluate(latestSession.date, now);

    const recommendations = RecommendationEngine.recommend({
      overallBand: overallInterp.band,
      trend: overallTrend.trend,
      riskAlertFlagged: riskAlert.flagged,
      concordanceDiscordant: caregiverConcordance.discordant === true,
      trendVolatile: trendIntelligence.overallTrajectory === 'volatile',
    });

    return {
      hasData: true,
      patient: {
        patientId: patient.patientId,
        name: patient.name,
        age: patient.age,
        gender: patient.gender,
        riskFactors: patient.riskFactors || [],
      },
      session: {
        date: latestSession.date,
        durationMs: latestSession.durationMs,
        status: latestSession.status,
        sessionCount: sessions.length,
      },
      overallCognitive: {
        score: latestSession.overallRawScore,
        band: overallInterp.band,
        interpretation: overallInterp.interpretation,
      },
      domains,
      lobes,
      visualMemory,
      speech,
      questionnaire: latestSession.questionnaireSummary,
      caregiverConcordance,
      riskAlert,
      trendIntelligence,
      networkCoherence,
      adherence,
      trend: {
        overall: overallTrend,
        domains: domainTrends,
        lobes: lobeTrends,
        visualMemory: visualMemoryTrend,
        speech: speechTrend,
      },
      history: sessions.map((s) => ({ date: s.date, overallRawScore: s.overallRawScore })),
      clinicalNotes: patient.notes || [],
      // 2026-08-20: honest load-error passthrough for real (Firestore)
      // patients whose doctorNotes subcollection couldn't be read (e.g. the
      // new security rule isn't deployed yet) -- see
      // FirestorePatientService.getPatientRecord. undefined for mock
      // patients and any real patient whose notes loaded fine.
      notesError: patient.notesError,
      recommendations,
      hiddenAnalytics: latestSession.hiddenAnalytics,
      // 2026-08-19: real daily engagement signal (Daily Set / Momentum
      // Score), bridged from app_page separately from the weekly session
      // data above -- see FirestorePatientService.getPatientRecord and
      // app_page's DoctorDashboardExportEngine.buildDailyMomentumRecord.
      // undefined for any patient who hasn't completed a full Daily Set
      // since this feature shipped -- passed through as-is, never
      // defaulted to a fabricated 0.
      dailyMomentum: patient.dailyMomentum,
    };
  },
};
