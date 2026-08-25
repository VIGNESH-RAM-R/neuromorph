import { roundMetric } from '../../utils/stats';

function formatDate(timestamp) {
  return new Date(timestamp).toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatDuration(ms) {
  if (ms == null || !Number.isFinite(ms)) return '—';
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export default function SpotDifferenceHistory({ assessments, onBack }) {
  const hasHistory = assessments && assessments.length > 0;

  return (
    <div className="oddball-screen sd-screen oddball-screen--history">
      <h1 className="oddball-heading">Session History</h1>

      {!hasHistory && (
        <div className="oddball-empty-state">
          <p>No previous sessions available.</p>
          <p>Complete additional sessions to monitor changes over time.</p>
        </div>
      )}

      {hasHistory && (
        <div className="oddball-history-table-wrap">
          <table className="oddball-history-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Levels Completed</th>
                <th>Differences Found</th>
                <th>Accuracy</th>
                <th>Total Time</th>
                <th>Stars</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {[...assessments].reverse().map((a) => (
                <tr key={a.assessmentId}>
                  <td>{formatDate(a.timestamp)}</td>
                  <td>{a.levelsCompleted} of {a.totalLevels}</td>
                  <td>{a.totalDifferencesFound} of {a.totalDifferencesAvailable}</td>
                  <td>{a.accuracy != null ? `${roundMetric(a.accuracy, 0)}%` : '—'}</td>
                  <td>{formatDuration(a.totalTimeMs)}</td>
                  <td>{a.starsEarned} of {a.maxStars}</td>
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
          <span aria-hidden="true">&larr;</span> Back
        </button>
      </div>
    </div>
  );
}
