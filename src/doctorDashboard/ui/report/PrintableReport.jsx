import { formatCaregiverAnswer, DEEP_STATUS_LABEL, buildCaregiverEntries } from '../../engines/CaregiverResponsesFormat.js';
import { CAREGIVER_MICRO_QUESTIONS } from '../../../config/caregiverMicroCheckinConfig.js';
import { DEFAULT_LANGUAGE } from '../../config/i18nConfig.js';
import { t, format } from '../../i18n/strings/report.js';
import { t as tPatients } from '../../i18n/strings/patients.js';

// Print-only, single-column layout used for the "Download PDF Report"
// workflow. Rendered alongside the interactive screen but hidden on-screen
// via print.css; the browser's print-to-PDF destination turns this into the
// deliverable file. See README for the documented jsPDF/pdf-lib upgrade
// path for a server-generated PDF instead of client print().
//
// 2026-08-25 ADDITION -- `caregiver` (from useCaregiverResponses, same read
// CaregiverResponsesPanel.jsx uses) is optional and additive: undefined/null
// (no linked caregiver, still loading, or a permission-denied read) simply
// skips the caregiver section entirely rather than showing an error inside
// an exported PDF -- the on-screen panel is still the place a doctor sees a
// real error message.
//
// 2026-08-26 i18n: this print view mirrors the on-screen report, so it
// reuses the exact same translation keys/lookups those components already
// established (band/status/pattern labels, section titles, field labels)
// rather than duplicating a second English copy of each string. Per the
// same 2026-08-26 scope note as CaregiverResponsesPanel.jsx, the caregiver
// QUESTION content (q.label / formatCaregiverAnswer / DEEP_STATUS_LABEL) is
// left untranslated -- that's caregiver-config content, out of scope for
// this pass.
const BAND_LABEL_KEY = {
  Excellent: 'bandExcellent',
  Normal: 'bandNormal',
  'Mildly Reduced': 'bandMildlyReduced',
  Reduced: 'bandReduced',
  'Slightly Reduced': 'bandSlightlyReduced',
  'Not Measured': 'bandNotMeasured',
};

const BAND_INTERPRETATION_KEY = {
  Excellent: 'bandInterpretationExcellent',
  Normal: 'bandInterpretationNormal',
  'Mildly Reduced': 'bandInterpretationMildlyReduced',
  Reduced: 'bandInterpretationReduced',
  'Not Measured': 'measureNotMeasuredInterpretation',
};

const SESSION_STATUS_KEY = { completed: 'sessionStatusCompleted', partial: 'sessionStatusPartial' };

const TRAJECTORY_LABEL_KEY = {
  improving: 'trendImproving',
  declining: 'trendDeclining',
  stable: 'trendStable',
  volatile: 'trendVolatile',
  'insufficient-data': 'trendInsufficientData',
};

const PATTERN_LABEL_KEY = {
  distributed: 'patternDistributed',
  'multi-domain-independent': 'patternMultiDomainIndependent',
  isolated: 'patternIsolated',
  'no-decline': 'patternNoDecline',
  'insufficient-data': 'patternInsufficientData',
};

const RECOMMENDATION_TEXT_KEY = {
  REPEAT_SIX_MONTHS: 'recommendationRepeatSixMonths',
  REPEAT_THREE_MONTHS: 'recommendationRepeatThreeMonths',
  FORMAL_NEUROPSYCH: 'recommendationFormalNeuropsych',
  NEUROLOGY_CONSULT: 'recommendationNeurologyConsult',
  LIFESTYLE: 'recommendationLifestyle',
  GATHER_COLLATERAL: 'recommendationGatherCollateral',
  CONTINUE_ROUTINE: 'recommendationContinueRoutine',
  CONSISTENCY_MONITORING: 'recommendationConsistencyMonitoring',
};

function bandLabel(language, band) {
  return BAND_LABEL_KEY[band] ? tPatients(language, BAND_LABEL_KEY[band]) : band;
}

function bandInterpretation(language, band, fallback) {
  return BAND_INTERPRETATION_KEY[band] ? t(language, BAND_INTERPRETATION_KEY[band]) : fallback;
}

export default function PrintableReport({ report, caregiver, language = DEFAULT_LANGUAGE }) {
  const { patient, session, overallCognitive, domains, lobes, visualMemory, speech, questionnaire, caregiverConcordance, clinicalNotes, recommendations, adherence, trendIntelligence, networkCoherence } = report;
  const { weeklyEntries, microDays } = buildCaregiverEntries(caregiver);
  const statusLabel = SESSION_STATUS_KEY[session.status] ? t(language, SESSION_STATUS_KEY[session.status]) : session.status;

  return (
    <div className="nmdd-print-report nmdd-print-only">
      <h1>NEUROMORPH {t(language, 'cognitiveScreeningReportTitle')}</h1>
      <p className="nmdd-print-disclaimer">
        {t(language, 'printTopDisclaimer')}
      </p>

      <h2>{t(language, 'patientInformationHeading')}</h2>
      <table className="nmdd-print-table">
        <tbody>
          <tr><td>{t(language, 'labelName')}</td><td>{patient.name}</td></tr>
          <tr><td>{t(language, 'labelAge')}</td><td>{patient.age}</td></tr>
          <tr><td>{t(language, 'labelGender')}</td><td>{patient.gender}</td></tr>
          <tr><td>{t(language, 'labelPatientId')}</td><td>{patient.patientId}</td></tr>
          <tr><td>{t(language, 'labelRiskFactors')}</td><td>{patient.riskFactors?.join(', ') || t(language, 'noneRecorded')}</td></tr>
        </tbody>
      </table>

      <h2>{t(language, 'assessmentSummaryHeading')}</h2>
      <table className="nmdd-print-table">
        <tbody>
          <tr><td>{t(language, 'labelAssessmentDate')}</td><td>{session.date}</td></tr>
          <tr><td>{t(language, 'labelStatus')}</td><td>{statusLabel}</td></tr>
          <tr><td>{t(language, 'overallCognitiveScoreLabel')}</td><td>{overallCognitive.score}</td></tr>
          <tr><td>{t(language, 'performanceCategoryLabel')}</td><td>{bandLabel(language, overallCognitive.band)}</td></tr>
          <tr><td>{t(language, 'interpretationLabel')}</td><td>{bandInterpretation(language, overallCognitive.band, overallCognitive.interpretation)}</td></tr>
          <tr><td>{t(language, 'labelAdherence')}</td><td>{adherence.overdue ? format(t(language, 'adherenceOverdue'), { days: adherence.daysSinceLast }) : format(t(language, 'adherenceOnTrack'), { date: adherence.nextDueDate })}</td></tr>
        </tbody>
      </table>

      <h2>{t(language, 'domainAnalysisTitle')}</h2>
      <table className="nmdd-print-table">
        <thead><tr><th>{t(language, 'domainTableHeader')}</th><th>{t(language, 'scoreTableHeader')}</th><th>{t(language, 'statusTableHeader')}</th><th>{t(language, 'interpretationLabel')}</th></tr></thead>
        <tbody>
          {domains.map((d) => (
            <tr key={d.key}><td>{d.label}</td><td>{d.score}</td><td>{bandLabel(language, d.band)}</td><td>{d.band === 'Not Measured' ? t(language, 'domainNotMeasuredInterpretation') : bandInterpretation(language, d.band, d.interpretation)}</td></tr>
          ))}
        </tbody>
      </table>

      <h2>{t(language, 'lobarAnalysisTitle')}</h2>
      {lobes.map((lobe) => (
        <div key={lobe.key} className="nmdd-print-lobe">
          <h3>{lobe.label} -- {bandLabel(language, lobe.band)} ({lobe.score ?? '—'})</h3>
          <p><strong>{t(language, 'primaryFunctionsLabel')}:</strong> {lobe.primaryFunctions.join(', ')}</p>
          <p><strong>{t(language, 'contributingTasksLabel')}:</strong> {lobe.contributingTasks.join(', ') || t(language, 'lobeNoTasksAdministered')}</p>
          <p>{bandInterpretation(language, lobe.band, lobe.explanation)}</p>
        </div>
      ))}

      <h2>{t(language, 'visualMemorySummaryHeading')}</h2>
      <table className="nmdd-print-table">
        <thead><tr><th>{t(language, 'subscoreTableHeader')}</th><th>{t(language, 'scoreTableHeader')}</th><th>{t(language, 'statusTableHeader')}</th></tr></thead>
        <tbody>
          {visualMemory.subscores.map((s) => (
            <tr key={s.key}><td>{s.label}</td><td>{s.score}</td><td>{bandLabel(language, s.band)}</td></tr>
          ))}
          <tr><td><strong>{t(language, 'overallVisualMemoryScoreLabel')}</strong></td><td><strong>{visualMemory.overallScore}</strong></td><td><strong>{bandLabel(language, visualMemory.band)}</strong></td></tr>
        </tbody>
      </table>

      <h2>{t(language, 'speechSummaryHeading')}</h2>
      <table className="nmdd-print-table">
        <thead><tr><th>{t(language, 'metricTableHeader')}</th><th>{t(language, 'statusTableHeader')}</th></tr></thead>
        <tbody>
          {speech.metrics.map((m) => (
            <tr key={m.key}><td>{m.label}</td><td>{bandLabel(language, m.band)}</td></tr>
          ))}
        </tbody>
      </table>

      <h2>{t(language, 'questionnaireSummaryTitle')}</h2>
      <table className="nmdd-print-table">
        <tbody>
          <tr><td>{t(language, 'fieldMemoryComplaints')}</td><td>{questionnaire?.memoryComplaints}</td></tr>
          <tr><td>{t(language, 'fieldOrientation')}</td><td>{questionnaire?.orientation}</td></tr>
          <tr><td>{t(language, 'fieldDailyActivities')}</td><td>{questionnaire?.dailyActivities}</td></tr>
          <tr><td>{t(language, 'fieldBehaviour')}</td><td>{questionnaire?.behaviour}</td></tr>
          <tr><td>{t(language, 'fieldFunctionalIndependence')}</td><td>{questionnaire?.functionalIndependence}</td></tr>
          <tr><td>{t(language, 'fieldCaregiverConcern')}</td><td>{caregiverConcordance?.caregiverConcern || '—'}</td></tr>
        </tbody>
      </table>

      <h2>{t(language, 'caregiverResponsesTitle')}</h2>
      {!caregiver ? (
        <p>{t(language, 'noCaregiverAccountMessage')}</p>
      ) : (
        <>
          <p><strong>{t(language, 'caregiverLabelPrint')}</strong> {caregiver.name || t(language, 'unnamedCaregiver')}</p>

          <h3>{format(t(language, 'weeklyCheckinHeading'), { count: weeklyEntries.length })}</h3>
          {weeklyEntries.length === 0 ? <p>{t(language, 'noWeeklyCheckinsTitle')}.</p> : weeklyEntries.map((entry) => (
            <table className="nmdd-print-table" key={entry.unlockedForDate} style={{ marginBottom: 10 }}>
              <thead>
                <tr>
                  <th colSpan={2}>
                    {format(t(language, 'assessmentOnDate'), { date: entry.unlockedForDate })} -- {DEEP_STATUS_LABEL[entry.status] || entry.status}
                  </th>
                </tr>
              </thead>
              <tbody>
                {(entry.questions || []).map((q) => (
                  <tr key={q.id}><td>{q.label}</td><td>{formatCaregiverAnswer(q, entry.completion?.[q.id])}</td></tr>
                ))}
              </tbody>
            </table>
          ))}

          <h3>{format(t(language, 'quickDailyCheckinHeading'), { count: microDays.length })}</h3>
          {microDays.length === 0 ? <p>{t(language, 'noDailyCheckinsTitle')}.</p> : microDays.map((day) => (
            <table className="nmdd-print-table" key={day.date} style={{ marginBottom: 10 }}>
              <thead><tr><th colSpan={2}>{day.date}</th></tr></thead>
              <tbody>
                {CAREGIVER_MICRO_QUESTIONS.map((q) => (
                  <tr key={q.id}><td>{q.label}</td><td>{formatCaregiverAnswer(q, day.completion?.[q.id])}</td></tr>
                ))}
              </tbody>
            </table>
          ))}
        </>
      )}

      <h2>{t(language, 'trendIntelligenceTitle')}</h2>
      <table className="nmdd-print-table">
        <tbody>
          <tr><td>{t(language, 'overallTrajectoryLabel')}</td><td>{t(language, TRAJECTORY_LABEL_KEY[trendIntelligence?.overallTrajectory] || TRAJECTORY_LABEL_KEY['insufficient-data'])}</td></tr>
        </tbody>
      </table>
      <p>{trendIntelligence?.narrativeSummary}</p>
      {trendIntelligence?.domainsToWatch?.length > 0 && (
        <>
          <p><strong>{t(language, 'domainsToWatchHeading')}:</strong></p>
          <ul>
            {trendIntelligence.domainsToWatch.map((d) => (
              <li key={d.key}>{d.label} -- {format(t(language, 'domainDecliningSentence'), { rate: Math.abs(d.weeklyRate), n: d.n })}</li>
            ))}
          </ul>
        </>
      )}

      <h2>{t(language, 'networkCoherenceHeadingPrint')}</h2>
      <table className="nmdd-print-table">
        <tbody>
          <tr><td>{t(language, 'patternLabel')}</td><td>{t(language, PATTERN_LABEL_KEY[networkCoherence?.pattern] || PATTERN_LABEL_KEY['insufficient-data'])}</td></tr>
        </tbody>
      </table>
      <p>{networkCoherence?.narrative}</p>

      <h2>{t(language, 'clinicalNotesHeadingPrint')}</h2>
      {clinicalNotes.length === 0 ? <p>{t(language, 'noClinicalNotesRecordedPrint')}</p> : (
        <ul>
          {clinicalNotes.map((n) => (
            <li key={n.id}>{new Date(n.timestamp).toLocaleDateString()} -- {n.author}: {n.text}</li>
          ))}
        </ul>
      )}

      <h2>{t(language, 'clinicalRecommendationsTitle')}</h2>
      <ul>
        {recommendations.map((r) => <li key={r.key}>{RECOMMENDATION_TEXT_KEY[r.key] ? t(language, RECOMMENDATION_TEXT_KEY[r.key]) : r.text}</li>)}
      </ul>

      <h2>{t(language, 'assessmentMetadataHeading')}</h2>
      <table className="nmdd-print-table">
        <tbody>
          <tr><td>{t(language, 'reportGeneratedLabel')}</td><td>{new Date().toLocaleString()}</td></tr>
          <tr><td>{t(language, 'sessionsOnRecordLabel')}</td><td>{session.sessionCount}</td></tr>
          <tr><td>{t(language, 'platformLabel')}</td><td>NEUROMORPH Doctor Dashboard</td></tr>
        </tbody>
      </table>

      <p className="nmdd-print-disclaimer">
        {t(language, 'printBottomDisclaimer')}
      </p>
    </div>
  );
}
