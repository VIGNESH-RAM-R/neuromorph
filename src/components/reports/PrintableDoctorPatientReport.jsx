import { bandFromScore, BAND_INTERPRETATION_TEMPLATES, NON_DIAGNOSTIC_DISCLAIMER } from '../../config/scoringBands.js';
import { DOMAIN_LABELS } from '../../config/domainInsightConfig.js';

// The doctor counterpart to PrintableSelfReport.jsx -- same pattern: hidden
// on-screen via print.css (.nmpa-print-only), shown only inside the
// browser's print dialog, the clinician's own "Save as PDF" produces the
// actual file. Rendered whenever the doctor chat's "generate a PDF for
// <patient>" flow sets a patient to print; returns null otherwise so it
// never accidentally shows in a patient's own print job.
export default function PrintableDoctorPatientReport({ patient }) {
  if (!patient) return null;
  const { name, patientId, age, gender, riskFactors, sessions = [] } = patient;
  const latest = sessions[sessions.length - 1];
  const latestBand = latest ? bandFromScore(latest.overallRawScore) : null;

  return (
    <div className="nmpa-print-report nmpa-print-only">
      <h1>NEUROMORPH Clinician Patient Summary</h1>
      <p className="nmpa-print-disclaimer">{NON_DIAGNOSTIC_DISCLAIMER}</p>

      <h2>Patient</h2>
      <table className="nmpa-print-table">
        <tbody>
          <tr><td>Name</td><td>{name}</td></tr>
          <tr><td>Patient ID</td><td>{patientId}</td></tr>
          <tr><td>Age</td><td>{age}</td></tr>
          {gender && <tr><td>Gender</td><td>{gender}</td></tr>}
          <tr><td>Risk factors</td><td>{riskFactors && riskFactors.length ? riskFactors.join(', ') : 'None on file'}</td></tr>
        </tbody>
      </table>

      {latest && (
        <>
          <h2>Latest Session ({latest.date})</h2>
          <table className="nmpa-print-table">
            <tbody>
              <tr><td>Overall score</td><td>{latest.overallRawScore}</td></tr>
              <tr><td>Band</td><td>{latestBand}</td></tr>
              <tr><td>Interpretation</td><td>{BAND_INTERPRETATION_TEMPLATES[latestBand]}</td></tr>
              {/* 2026-08-20: overall score is now a domain-equal-weighted
                  composite (see AssessmentSessionModel.js) -- surfacing how
                  many of the 6 real cognitive domains it's actually built
                  from so a clinician doesn't read it as more comprehensive
                  than it is. Guarded: mock/older session records predating
                  this change won't have domainCoverage, and that's fine --
                  the row just doesn't render rather than showing undefined. */}
              {latest.domainCoverage && (
                <tr><td>Domains measured</td><td>{latest.domainCoverage.measuredDomainCount} of {latest.domainCoverage.totalDomainCount}</td></tr>
              )}
            </tbody>
          </table>

          <h2>Domain Breakdown (latest session)</h2>
          <table className="nmpa-print-table">
            <thead><tr><th>Domain</th><th>Score</th><th>Band</th></tr></thead>
            <tbody>
              {Object.entries(latest.domainScoresRaw || {}).map(([key, score]) => (
                <tr key={key}><td>{DOMAIN_LABELS[key] || key}</td><td>{score}</td><td>{bandFromScore(score)}</td></tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      <h2>Session History</h2>
      <table className="nmpa-print-table">
        <thead><tr><th>Date</th><th>Overall score</th><th>Band</th></tr></thead>
        <tbody>
          {sessions.map((s) => (
            <tr key={s.date}><td>{s.date}</td><td>{s.overallRawScore}</td><td>{bandFromScore(s.overallRawScore)}</td></tr>
          ))}
        </tbody>
      </table>

      <p className="nmpa-print-disclaimer">{NON_DIAGNOSTIC_DISCLAIMER}</p>
    </div>
  );
}
