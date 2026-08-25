import { roundMetric } from '../../utils/oddballMetrics';

function formatDate(timestamp) {
  return new Date(timestamp).toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function OddballHistory({ assessments, onBack }) {
  const hasHistory = assessments && assessments.length > 0;

  return (
    <div className="oddball-screen oddball-screen--history">
      <h1 className="oddball-heading">Assessment History</h1>

      {!hasHistory && (
        <div className="oddball-empty-state">
          <p>No previous assessments available.</p>
          <p>Complete additional assessments to monitor changes over time.</p>
        </div>
      )}

      {hasHistory && (
        <div className="oddball-history-table-wrap">
          <table className="oddball-history-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Hit RT</th>
                <th>Detectability (d′)</th>
                <th>RT Variability</th>
                <th>Omissions</th>
                <th>Commissions</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {[...assessments].reverse().map((a) => (
                <tr key={a.assessmentId}>
                  <td>{formatDate(a.timestamp)}</td>
                  <td>{a.meanReactionTime != null ? `${Math.round(a.meanReactionTime)} ms` : '—'}</td>
                  <td>{a.dPrime != null ? roundMetric(a.dPrime, 2) : '—'}</td>
                  <td>{a.reactionTimeStdDev != null ? `${Math.round(a.reactionTimeStdDev)} ms` : '—'}</td>
                  <td>{a.misses}</td>
                  <td>{a.falseAlarms}</td>
                  <td>
                    <span className="oddball-status-pill">Completed</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="seq-cs-actions">
        <button className="seq-cs-btn seq-cs-btn--secondary" onClick={onBack}>
          <span aria-hidden="true">&larr;</span> Back to Dashboard
        </button>
      </div>
    </div>
  );
}
