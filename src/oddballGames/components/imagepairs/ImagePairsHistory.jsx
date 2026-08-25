import { useState, useMemo } from 'react';
import TrendChart from '../shared/TrendChart';
import { roundMetric } from '../../utils/stats';

const TREND_OPTIONS = [
  { key: 'accuracy', label: 'Accuracy', unit: '%' },
  { key: 'correctPairs', label: 'Pairs Found', unit: 'pairs' },
  { key: 'completionTime', label: 'Completion Time', unit: 's' },
  { key: 'meanDecisionTime', label: 'Mean Response Time', unit: 's' },
];

function formatDate(timestamp) {
  return new Date(timestamp).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
}
function formatDateLabel(timestamp) {
  return new Date(timestamp).toLocaleDateString(undefined, { day: '2-digit', month: 'short' });
}
function trendValue(assessment, key) {
  if (key === 'completionTime') return assessment.completionTimeMs != null ? assessment.completionTimeMs / 1000 : null;
  if (key === 'meanDecisionTime')
    return assessment.meanDecisionTimeMs != null ? assessment.meanDecisionTimeMs / 1000 : null;
  return assessment[key];
}

export default function ImagePairsHistory({ assessments, onBack }) {
  const [trendKey, setTrendKey] = useState('accuracy');
  const hasHistory = assessments && assessments.length > 0;

  const chronological = useMemo(() => [...(assessments || [])].sort((a, b) => a.timestamp - b.timestamp), [assessments]);

  const trendPoints = useMemo(() => {
    return chronological
      .map((a) => {
        const value = trendValue(a, trendKey);
        return value != null ? { value, dateLabel: formatDateLabel(a.timestamp) } : null;
      })
      .filter(Boolean);
  }, [chronological, trendKey]);

  const activeTrendOption = TREND_OPTIONS.find((o) => o.key === trendKey);

  return (
    <div className="oddball-screen ip-screen oddball-screen--history">
      <h1 className="oddball-heading">Image Pairs History</h1>

      {!hasHistory && (
        <div className="oddball-empty-state">
          <p>No previous assessments available.</p>
          <p>Complete additional assessments to monitor changes over time.</p>
        </div>
      )}

      {hasHistory && (
        <>
          <div className="oddball-trend-toggle">
            {TREND_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                className={`oddball-toggle-btn${trendKey === opt.key ? ' oddball-toggle-btn--active' : ''}`}
                onClick={() => setTrendKey(opt.key)}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <TrendChart points={trendPoints} unit={activeTrendOption.unit} label={activeTrendOption.label} dark />

          <div className="oddball-history-table-wrap">
            <table className="oddball-history-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Pairs Found</th>
                  <th>Accuracy</th>
                  <th>Time</th>
                  <th>Mean Response</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {[...assessments].reverse().map((a) => (
                  <tr key={a.assessmentId}>
                    <td>{formatDate(a.timestamp)}</td>
                    <td>
                      {a.correctPairs != null ? a.correctPairs : '—'}/{a.totalPairs != null ? a.totalPairs : '—'}
                    </td>
                    <td>{a.accuracy != null ? `${roundMetric(a.accuracy, 1)}%` : '—'}</td>
                    <td>{a.completionTimeMs != null ? `${roundMetric(a.completionTimeMs / 1000, 1)}s` : '—'}</td>
                    <td>{a.meanDecisionTimeMs != null ? `${roundMetric(a.meanDecisionTimeMs / 1000, 2)}s` : '—'}</td>
                    <td>
                      <span className="oddball-status-pill">
                        {a.completionReason === 'ALL_MATCHED' ? 'Completed' : 'Time limit reached'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <div className="seq-cs-actions">
        <button className="seq-cs-btn seq-cs-btn--secondary" onClick={onBack}>
          <span aria-hidden="true">&larr;</span> Back to Dashboard
        </button>
      </div>
    </div>
  );
}
