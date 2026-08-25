import { useState, useMemo } from 'react';
import TrendChart from '../shared/TrendChart';
import { roundMetric } from '../../utils/stats';

const TREND_OPTIONS = [
  { key: 'maximumSequenceSpan', label: 'Max Span', unit: 'items' },
  { key: 'meanSpan', label: 'Mean Span', unit: 'items' },
  { key: 'recallTime', label: 'Recall Time', unit: 's' },
  { key: 'recallTimeVariability', label: 'Recall Time Variability', unit: 's' },
];

function formatDate(timestamp) {
  return new Date(timestamp).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
}
function formatDateLabel(timestamp) {
  return new Date(timestamp).toLocaleDateString(undefined, { day: '2-digit', month: 'short' });
}
function trendValue(assessment, key) {
  if (key === 'recallTime') return assessment.meanRecallTime != null ? assessment.meanRecallTime / 1000 : null;
  if (key === 'recallTimeVariability')
    return assessment.recallTimeStdDev != null ? assessment.recallTimeStdDev / 1000 : null;
  return assessment[key];
}

export default function SequenceHistory({ assessments, onBack }) {
  const [trendKey, setTrendKey] = useState('maximumSequenceSpan');
  const hasHistory = assessments && assessments.length > 0;

  const chronological = useMemo(
    () => [...(assessments || [])].sort((a, b) => a.timestamp - b.timestamp),
    [assessments]
  );

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
    <div className="oddball-screen seq-screen oddball-screen--history">
      <h1 className="oddball-heading">Sequence Memory History</h1>

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
                  <th>Max Span</th>
                  <th>Mean Span</th>
                  <th>Recall Time</th>
                  <th>Recall Variability</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {[...assessments].reverse().map((a) => (
                  <tr key={a.assessmentId}>
                    <td>{formatDate(a.timestamp)}</td>
                    <td>{a.maximumSequenceSpan != null ? a.maximumSequenceSpan : '—'}</td>
                    <td>{a.meanSpan != null ? roundMetric(a.meanSpan, 2) : '—'}</td>
                    <td>{a.meanRecallTime != null ? `${roundMetric(a.meanRecallTime / 1000, 2)}s` : '—'}</td>
                    <td>{a.recallTimeStdDev != null ? `${roundMetric(a.recallTimeStdDev / 1000, 2)}s` : '—'}</td>
                    <td>
                      <span className="oddball-status-pill">Completed</span>
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
