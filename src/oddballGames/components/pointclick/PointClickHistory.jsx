import { useState, useMemo } from 'react';
import TrendChart from '../shared/TrendChart';
import { roundMetric } from '../../utils/stats';

const TREND_OPTIONS = [
  { key: 'accuracy', label: 'Accuracy', unit: '%' },
  { key: 'medianResponseTime', label: 'Median RT', unit: 'ms' },
  { key: 'responseTimeCV', label: 'RT Variability', unit: '%' },
  { key: 'falseAlarmRate', label: 'False Alarm Rate', unit: '%' },
];

function formatDate(timestamp) {
  return new Date(timestamp).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
}
function formatDateLabel(timestamp) {
  return new Date(timestamp).toLocaleDateString(undefined, { day: '2-digit', month: 'short' });
}

export default function PointClickHistory({ assessments, onBack }) {
  const [trendKey, setTrendKey] = useState('accuracy');
  const hasHistory = assessments && assessments.length > 0;

  const chronological = useMemo(() => [...(assessments || [])].sort((a, b) => a.timestamp - b.timestamp), [assessments]);

  const trendPoints = useMemo(() => {
    return chronological
      .map((a) => {
        const value = a[trendKey];
        return value != null ? { value: roundMetric(value, 1), dateLabel: formatDateLabel(a.timestamp) } : null;
      })
      .filter(Boolean);
  }, [chronological, trendKey]);
  const activeTrendOption = TREND_OPTIONS.find((o) => o.key === trendKey);

  return (
    <div className="oddball-screen pc-screen oddball-screen--history">
      <h1 className="oddball-heading">Point &amp; Click History</h1>

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
                  <th>Accuracy</th>
                  <th>Median RT</th>
                  <th>Missed</th>
                  <th>False Alarms</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {[...assessments].reverse().map((a) => (
                  <tr key={a.assessmentId}>
                    <td>{formatDate(a.timestamp)}</td>
                    <td>{a.accuracy != null ? `${roundMetric(a.accuracy, 1)}%` : '—'}</td>
                    <td>{a.medianResponseTime != null ? `${roundMetric(a.medianResponseTime, 0)} ms` : '—'}</td>
                    <td>{a.misses != null ? a.misses : '—'}</td>
                    <td>{a.falseAlarms != null ? a.falseAlarms : '—'}</td>
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
