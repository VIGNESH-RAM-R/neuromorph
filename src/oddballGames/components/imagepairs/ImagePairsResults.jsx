import { useState, useMemo } from 'react';
import MetricCard from '../shared/MetricCard';
import TrendChart from '../shared/TrendChart';
import ImagePairsDisclaimer from './ImagePairsDisclaimer';
import { roundMetric } from '../../utils/stats';

const TREND_OPTIONS = [
  { key: 'accuracy', label: 'Accuracy', unit: '%' },
  { key: 'correctPairs', label: 'Pairs Found', unit: 'pairs' },
  { key: 'completionTime', label: 'Completion Time', unit: 's' },
  { key: 'meanDecisionTime', label: 'Mean Response Time', unit: 's' },
];

function formatDateLabel(timestamp) {
  return new Date(timestamp).toLocaleDateString(undefined, { day: '2-digit', month: 'short' });
}

function trendValue(assessment, key) {
  if (key === 'completionTime') return assessment.completionTimeMs != null ? assessment.completionTimeMs / 1000 : null;
  if (key === 'meanDecisionTime')
    return assessment.meanDecisionTimeMs != null ? assessment.meanDecisionTimeMs / 1000 : null;
  return assessment[key];
}

export default function ImagePairsResults({
  currentAssessment,
  history,
  onViewHistory,
  onRepeatAssessment,
  onBackToDashboard,
}) {
  const [trendKey, setTrendKey] = useState('accuracy');

  const chronological = useMemo(() => [...history].sort((a, b) => a.timestamp - b.timestamp), [history]);
  const baseline = chronological.length > 0 ? chronological[0] : null;
  const hasBaselineComparison = chronological.length > 1;

  const trendPoints = useMemo(() => {
    return chronological
      .map((a) => {
        const value = trendValue(a, trendKey);
        return value != null ? { value, dateLabel: formatDateLabel(a.timestamp) } : null;
      })
      .filter(Boolean);
  }, [chronological, trendKey]);

  const activeTrendOption = TREND_OPTIONS.find((o) => o.key === trendKey);

  const completionTimeSeconds =
    currentAssessment.completionTimeMs != null ? roundMetric(currentAssessment.completionTimeMs / 1000, 1) : null;
  const meanDecisionSeconds =
    currentAssessment.meanDecisionTimeMs != null ? roundMetric(currentAssessment.meanDecisionTimeMs / 1000, 2) : null;
  const accuracyDisplay = currentAssessment.accuracy != null ? roundMetric(currentAssessment.accuracy, 1) : null;

  const accuracyChange =
    baseline?.accuracy != null && currentAssessment.accuracy != null
      ? currentAssessment.accuracy - baseline.accuracy
      : null;
  const completionTimeChange =
    baseline?.completionTimeMs != null && currentAssessment.completionTimeMs != null
      ? (currentAssessment.completionTimeMs - baseline.completionTimeMs) / 1000
      : null;

  const wasFullyCompleted = currentAssessment.completionReason === 'ALL_MATCHED';

  return (
    <div className="oddball-screen ip-screen oddball-screen--results">
      <div className="oddball-results-header">
        <span className="oddball-check-badge" aria-hidden="true">
          ✓
        </span>
        <h1 className="oddball-heading">Assessment Complete</h1>
        <p className="oddball-subheading-muted">Image Pairs — Visual Memory Performance</p>
        <span className="oddball-status-pill">
          {wasFullyCompleted ? 'All pairs found' : 'Time limit reached'}
        </span>
      </div>

      <h2 className="oddball-section-title">Performance Metrics</h2>
      <div className="oddball-metric-grid">
        <MetricCard
          label="Pairs Found"
          value={currentAssessment.correctPairs}
          sublabel={`of ${currentAssessment.totalPairs}`}
          tone="primary"
        />
        <MetricCard label="Accuracy" value={accuracyDisplay} unit={accuracyDisplay != null ? '%' : undefined} tone="primary" />
        <MetricCard
          label="Total Time"
          value={completionTimeSeconds}
          unit={completionTimeSeconds != null ? 'sec' : undefined}
        />
        <MetricCard
          label="Mean Response Time"
          value={meanDecisionSeconds}
          unit={meanDecisionSeconds != null ? 'sec' : undefined}
        />
        <MetricCard label="Errors" value={currentAssessment.incorrectAttempts} sublabel="incorrect attempts" />
        <MetricCard label="Card Selections" value={currentAssessment.totalCardSelections} />
      </div>

      <p className="oddball-result-note">
        Accuracy is the proportion of pair decisions that were correct matches ({currentAssessment.correctPairs}{' '}
        correct of {currentAssessment.totalPairDecisions} pair {currentAssessment.totalPairDecisions === 1 ? 'decision' : 'decisions'}{' '}
        made). Card Selections counts every individual card tap and is tracked separately from pair decisions.
      </p>

      <h2 className="oddball-section-title">Performance Summary</h2>
      <p className="oddball-result-note">
        Your results have been recorded for your Neuromorph cognitive profile.{' '}
        {wasFullyCompleted
          ? `You found all ${currentAssessment.totalPairs} pairs in ${completionTimeSeconds ?? '—'} seconds.`
          : `You found ${currentAssessment.correctPairs} of ${currentAssessment.totalPairs} pairs before the 90-second limit was reached.`}{' '}
        {chronological.length > 1
          ? 'Your current results can be compared with previous assessments to monitor performance over time.'
          : ''}
      </p>

      <h2 className="oddball-section-title">Performance Trend</h2>
      {chronological.length <= 1 ? (
        <div className="oddball-chart-empty">
          <p>Baseline established. Complete future assessments to see a performance trend here.</p>
        </div>
      ) : (
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
          <TrendChart points={trendPoints} unit={activeTrendOption.unit} label={activeTrendOption.label} />
        </>
      )}

      <h2 className="oddball-section-title">Baseline Comparison</h2>
      {!hasBaselineComparison ? (
        <div className="oddball-baseline-card">
          <p>
            This is your baseline assessment. Future assessments will be compared against this result to
            help track changes over time.
          </p>
        </div>
      ) : (
        <div className="oddball-baseline-card">
          <div className="oddball-baseline-values">
            <div>
              <span className="oddball-info-label">Baseline Accuracy</span>
              <span className="oddball-info-value">
                {baseline.accuracy != null ? `${roundMetric(baseline.accuracy, 1)}%` : '—'}
              </span>
            </div>
            <div>
              <span className="oddball-info-label">Current Accuracy</span>
              <span className="oddball-info-value">{accuracyDisplay != null ? `${accuracyDisplay}%` : '—'}</span>
            </div>
            <div>
              <span className="oddball-info-label">Change</span>
              <span className="oddball-info-value">
                {accuracyChange != null
                  ? `${accuracyChange >= 0 ? '+' : ''}${roundMetric(accuracyChange, 1)}%`
                  : '—'}
              </span>
            </div>
          </div>
          {completionTimeChange != null && (
            <p>
              Completion time changed by {completionTimeChange >= 0 ? '+' : ''}
              {roundMetric(completionTimeChange, 1)}s compared with your baseline assessment. Performance
              changes should be interpreted together with other cognitive assessments and relevant clinical
              information — a single change is not evidence of decline on its own. Consider clinical review
              if a persistent decline is observed across repeated assessments.
            </p>
          )}
        </div>
      )}

      <ImagePairsDisclaimer />

      <div className="oddball-actions oddball-actions--results">
        <button className="oddball-btn oddball-btn--primary" onClick={onViewHistory}>
          View Performance
        </button>
        <button className="oddball-btn oddball-btn--secondary" onClick={onBackToDashboard}>
          Return to Dashboard
        </button>
        <button className="oddball-btn oddball-btn--secondary" onClick={onRepeatAssessment}>
          Repeat Assessment
        </button>
      </div>
      <p className="oddball-device-note">
        Repeated attempts may influence performance because you have already seen the task.
      </p>
    </div>
  );
}
