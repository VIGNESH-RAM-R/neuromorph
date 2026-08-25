import { useMemo, useState } from 'react';
import TrendChart from '../shared/TrendChart';
import { roundMetric } from '../../utils/stats';

const TREND_OPTIONS = [
  { key: 'meanReactionTime', label: 'Mean RT', unit: 'ms' },
  { key: 'accuracy', label: 'Accuracy', unit: '%' },
  { key: 'missRate', label: 'Miss Rate', unit: '%' },
  { key: 'reactionTimeSD', label: 'RT Variability', unit: 'ms' },
];

function formatDate(timestamp) {
  return new Date(timestamp).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
}
function formatDateLabel(timestamp) {
  return new Date(timestamp).toLocaleDateString(undefined, { day: '2-digit', month: 'short' });
}
function formatDifficulty(difficulty) {
  if (!difficulty) return '—';
  return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
}

export default function WhackMoleHistory({ assessments, onBack }) {
  const [trendKey, setTrendKey] = useState('meanReactionTime');
  const hasHistory = assessments && assessments.length > 0;

  const chronological = useMemo(() => [...(assessments || [])].sort((a, b) => a.timestamp - b.timestamp), [assessments]);

  const trendPoints = useMemo(() => {
    return chronological
      .map((a) => {
        const value = a[trendKey];
        return value != null ? { value, dateLabel: formatDateLabel(a.timestamp) } : null;
      })
      .filter(Boolean);
  }, [chronological, trendKey]);

  const activeTrendOption = TREND_OPTIONS.find((o) => o.key === trendKey);

  return (
    <div className="oddball-screen wm-screen oddball-screen--history">
      <h1 className="oddball-heading">Whack the Mole History</h1>

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
                  <th>Difficulty</th>
                  <th>Mean RT</th>
                  <th>Accuracy</th>
                  <th>Hits</th>
                  <th>Misses</th>
                  <th>False Resp.</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {[...assessments].reverse().map((a) => (
                  <tr key={a.assessmentId}>
                    <td>{formatDate(a.timestamp)}</td>
                    <td>{formatDifficulty(a.difficulty)}</td>
                    <td>{a.meanReactionTime != null ? `${roundMetric(a.meanReactionTime, 0)} ms` : '—'}</td>
                    <td>{a.accuracy != null ? `${roundMetric(a.accuracy, 0)}%` : '—'}</td>
                    <td>{a.hits ?? '—'}</td>
                    <td>{a.misses ?? '—'}</td>
                    <td>{a.falseResponses ?? '—'}</td>
                    <td>
                      <span className="oddball-status-pill">{a.paused ? 'Completed (paused)' : 'Completed'}</span>
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
