import { formatCaregiverAnswer, DEEP_STATUS_LABEL, buildCaregiverEntries } from '../../engines/CaregiverResponsesFormat.js';
import { CAREGIVER_MICRO_QUESTIONS } from '../../../config/caregiverMicroCheckinConfig.js';

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
export default function PrintableReport({ report, caregiver }) {
  const { patient, session, overallCognitive, domains, lobes, visualMemory, speech, questionnaire, caregiverConcordance, clinicalNotes, recommendations, adherence, trendIntelligence, networkCoherence } = report;
  const { weeklyEntries, microDays } = buildCaregiverEntries(caregiver);

  return (
    <div className="nmdd-print-report nmdd-print-only">
      <h1>NEUROMORPH Cognitive Screening Report</h1>
      <p className="nmdd-print-disclaimer">
        Early cognitive screening summary. Not a diagnostic report. Findings require clinical correlation.
      </p>

      <h2>Patient Information</h2>
      <table className="nmdd-print-table">
        <tbody>
          <tr><td>Name</td><td>{patient.name}</td></tr>
          <tr><td>Age</td><td>{patient.age}</td></tr>
          <tr><td>Gender</td><td>{patient.gender}</td></tr>
          <tr><td>Patient ID</td><td>{patient.patientId}</td></tr>
          <tr><td>Risk Factors</td><td>{patient.riskFactors?.join(', ') || 'None recorded'}</td></tr>
        </tbody>
      </table>

      <h2>Assessment Summary</h2>
      <table className="nmdd-print-table">
        <tbody>
          <tr><td>Assessment Date</td><td>{session.date}</td></tr>
          <tr><td>Status</td><td>{session.status}</td></tr>
          <tr><td>Overall Cognitive Score</td><td>{overallCognitive.score}</td></tr>
          <tr><td>Performance Category</td><td>{overallCognitive.band}</td></tr>
          <tr><td>Interpretation</td><td>{overallCognitive.interpretation}</td></tr>
          <tr><td>Adherence</td><td>{adherence.overdue ? `Overdue (${adherence.daysSinceLast} days since last)` : `This week's cognitive test: Completed, next due ${adherence.nextDueDate}`}</td></tr>
        </tbody>
      </table>

      <h2>Cognitive Domain Analysis</h2>
      <table className="nmdd-print-table">
        <thead><tr><th>Domain</th><th>Score</th><th>Status</th><th>Interpretation</th></tr></thead>
        <tbody>
          {domains.map((d) => (
            <tr key={d.key}><td>{d.label}</td><td>{d.score}</td><td>{d.band}</td><td>{d.interpretation}</td></tr>
          ))}
        </tbody>
      </table>

      <h2>Lobar Function Analysis</h2>
      {lobes.map((lobe) => (
        <div key={lobe.key} className="nmdd-print-lobe">
          <h3>{lobe.label} -- {lobe.band} ({lobe.score ?? '—'})</h3>
          <p><strong>Primary Functions:</strong> {lobe.primaryFunctions.join(', ')}</p>
          <p><strong>Contributing Tasks:</strong> {lobe.contributingTasks.join(', ') || 'None administered this session'}</p>
          <p>{lobe.explanation}</p>
        </div>
      ))}

      <h2>Visual Memory Summary</h2>
      <table className="nmdd-print-table">
        <thead><tr><th>Subscore</th><th>Score</th><th>Status</th></tr></thead>
        <tbody>
          {visualMemory.subscores.map((s) => (
            <tr key={s.key}><td>{s.label}</td><td>{s.score}</td><td>{s.band}</td></tr>
          ))}
          <tr><td><strong>Overall Visual Memory Score</strong></td><td><strong>{visualMemory.overallScore}</strong></td><td><strong>{visualMemory.band}</strong></td></tr>
        </tbody>
      </table>

      <h2>Speech Summary</h2>
      <table className="nmdd-print-table">
        <thead><tr><th>Metric</th><th>Status</th></tr></thead>
        <tbody>
          {speech.metrics.map((m) => (
            <tr key={m.key}><td>{m.label}</td><td>{m.band}</td></tr>
          ))}
        </tbody>
      </table>

      <h2>Questionnaire Summary</h2>
      <table className="nmdd-print-table">
        <tbody>
          <tr><td>Memory Complaints</td><td>{questionnaire?.memoryComplaints}</td></tr>
          <tr><td>Orientation</td><td>{questionnaire?.orientation}</td></tr>
          <tr><td>Daily Activities</td><td>{questionnaire?.dailyActivities}</td></tr>
          <tr><td>Behaviour</td><td>{questionnaire?.behaviour}</td></tr>
          <tr><td>Functional Independence</td><td>{questionnaire?.functionalIndependence}</td></tr>
          <tr><td>Caregiver Concern</td><td>{caregiverConcordance?.caregiverConcern || '—'}</td></tr>
        </tbody>
      </table>

      <h2>Caregiver Responses</h2>
      {!caregiver ? (
        <p>No linked caregiver account, or caregiver data was not available when this report was generated.</p>
      ) : (
        <>
          <p><strong>Caregiver:</strong> {caregiver.name || 'Unnamed caregiver'}</p>

          <h3>Weekly Check-In ({weeklyEntries.length})</h3>
          {weeklyEntries.length === 0 ? <p>No weekly check-ins yet.</p> : weeklyEntries.map((entry) => (
            <table className="nmdd-print-table" key={entry.unlockedForDate} style={{ marginBottom: 10 }}>
              <thead>
                <tr>
                  <th colSpan={2}>
                    Assessment on {entry.unlockedForDate} -- {DEEP_STATUS_LABEL[entry.status] || entry.status}
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

          <h3>Quick Daily Check-In ({microDays.length})</h3>
          {microDays.length === 0 ? <p>No daily check-ins yet.</p> : microDays.map((day) => (
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

      <h2>Trend Intelligence</h2>
      <table className="nmdd-print-table">
        <tbody>
          <tr><td>Overall Trajectory</td><td>{trendIntelligence?.overallTrajectory ?? 'insufficient-data'}</td></tr>
        </tbody>
      </table>
      <p>{trendIntelligence?.narrativeSummary}</p>
      {trendIntelligence?.domainsToWatch?.length > 0 && (
        <>
          <p><strong>Domains to watch:</strong></p>
          <ul>
            {trendIntelligence.domainsToWatch.map((d) => (
              <li key={d.key}>{d.label} -- declining about {Math.abs(d.weeklyRate)} points/week across {d.n} sessions.</li>
            ))}
          </ul>
        </>
      )}

      <h2>Network Coherence (Research Preview -- not real connectivity data)</h2>
      <table className="nmdd-print-table">
        <tbody>
          <tr><td>Pattern</td><td>{networkCoherence?.pattern ?? 'insufficient-data'}</td></tr>
        </tbody>
      </table>
      <p>{networkCoherence?.narrative}</p>

      <h2>Clinical Notes</h2>
      {clinicalNotes.length === 0 ? <p>No clinical notes recorded.</p> : (
        <ul>
          {clinicalNotes.map((n) => (
            <li key={n.id}>{new Date(n.timestamp).toLocaleDateString()} -- {n.author}: {n.text}</li>
          ))}
        </ul>
      )}

      <h2>Clinical Recommendations</h2>
      <ul>
        {recommendations.map((r) => <li key={r.key}>{r.text}</li>)}
      </ul>

      <h2>Assessment Metadata</h2>
      <table className="nmdd-print-table">
        <tbody>
          <tr><td>Report generated</td><td>{new Date().toLocaleString()}</td></tr>
          <tr><td>Sessions on record</td><td>{session.sessionCount}</td></tr>
          <tr><td>Platform</td><td>NEUROMORPH Doctor Dashboard</td></tr>
        </tbody>
      </table>

      <p className="nmdd-print-disclaimer">
        NEUROMORPH is an early cognitive screening tool, not a diagnostic instrument. This report summarizes task performance
        only and does not constitute a diagnosis of dementia or any other condition.
      </p>
    </div>
  );
}
