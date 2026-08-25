import { useMemo, useState } from 'react';
import MetricCard from '../shared/MetricCard';
import TrendChart from '../shared/TrendChart';
import WhackMoleDisclaimer from './WhackMoleDisclaimer';
import { roundMetric } from '../../utils/stats';

const LONGITUDINAL_TREND_OPTIONS = [
  { key: 'meanReactionTime', label: 'Mean RT', unit: 'ms' },
  { key: 'accuracy', label: 'Accuracy', unit: '%' },
  { key: 'missRate', label: 'Miss Rate', unit: '%' },
  { key: 'reactionTimeSD', label: 'RT Variability', unit: 'ms' },
];

function formatDateLabel(timestamp) {
  return new Date(timestamp).toLocaleDateString(undefined, { day: '2-digit', month: 'short' });
}

const TREND_DIRECTION_TEXT = {
  slower: 'Response speed became somewhat slower toward the end of the assessment.',
  faster: 'Response speed became somewhat faster toward the end of the assessment.',
  stable: 'Response speed remained fairly stable across the assessment.',
};

function formatDifficulty(difficulty) {
  if (!difficulty) return null;
  return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
}

export default function WhackMoleResults({
  currentAssessment,
  history,
  onViewHistory,
  onRepeatAssessment,
  onBackToDashboard,
}) {
  const [trendKey, setTrendKey] = useState('meanReactionTime');

  const hitTrials = useMemo(
    () =>
      (currentAssessment.trials || [])
        .filter((t) => t.result === 'correct' && typeof t.reactionTime === 'number')
        .sort((a, b) => a.trial - b.trial),
    [currentAssessment.trials]
  );

  const rtPoints = useMemo(
    () => hitTrials.map((t) => ({ value: t.reactionTime, dateLabel: `T${t.trial}` })),
    [hitTrials]
  );

  const chronological = useMemo(() => [...history].sort((a, b) => a.timestamp - b.timestamp), [history]);
  const baseline = chronological.length > 0 ? chronological[0] : null;
  const hasBaselineComparison = chronological.length > 1;

  const longitudinalPoints = useMemo(() => {
    return chronological
      .map((a) => {
        const value = a[trendKey];
        return value != null ? { value, dateLabel: formatDateLabel(a.timestamp) } : null;
      })
      .filter(Boolean);
  }, [chronological, trendKey]);
  const activeLongitudinalOption = LONGITUDINAL_TREND_OPTIONS.find((o) => o.key === trendKey);

  const meanRT = currentAssessment.meanReactionTime != null ? roundMetric(currentAssessment.meanReactionTime, 0) : null;
  const medianRT = currentAssessment.medianReactionTime != null ? roundMetric(currentAssessment.medianReactionTime, 0) : null;
  const rtSD = currentAssessment.reactionTimeSD != null ? roundMetric(currentAssessment.reactionTimeSD, 0) : null;
  const accuracyDisplay = currentAssessment.accuracy != null ? roundMetric(currentAssessment.accuracy, 0) : null;
  const totalOpportunities = currentAssessment.totalOpportunities ?? 0;

  const trend = currentAssessment.trend || {};

  return (
    <div className="oddball-screen wm-screen oddball-screen--results">
      <div className="oddball-results-header">
        <span className="oddball-check-badge" aria-hidden="true">
          ✓
        </span>
        <h1 className="oddball-heading">Whack the Mole — Assessment Complete</h1>
        <p className="oddball-subheading-muted">
          Your performance has been recorded.
          {formatDifficulty(currentAssessment.difficulty) ? ` Difficulty: ${formatDifficulty(currentAssessment.difficulty)}.` : ''}
        </p>
      </div>

      <div className="wm-score-summary">
        <span className="oddball-info-label">Game Score</span>
        <span className="wm-score-summary-value">{currentAssessment.score ?? 0}</span>
        <span className="oddball-metric-sublabel">Gamification only — not a clinical measure</span>
      </div>

      <h2 className="oddball-section-title">Overall Performance</h2>
      <div className="oddball-metric-grid">
        <MetricCard label="Average Reaction Time" value={meanRT} unit={meanRT != null ? 'ms' : undefined} tone="primary" />
        <MetricCard label="Median Reaction Time" value={medianRT} unit={medianRT != null ? 'ms' : undefined} tone="primary" />
        <MetricCard label="Accuracy" value={accuracyDisplay} unit={accuracyDisplay != null ? '%' : undefined} tone="primary" />
        <MetricCard label="Correct Hits" value={currentAssessment.hits} sublabel={`of ${totalOpportunities}`} />
        <MetricCard label="Missed Targets" value={currentAssessment.misses} sublabel={`of ${totalOpportunities}`} />
        <MetricCard label="False Responses" value={currentAssessment.falseResponses} sublabel="taps with no valid target" />
        <MetricCard label="Reaction-Time Variability" value={rtSD} unit={rtSD != null ? 'ms' : undefined} sublabel="standard deviation" />
      </div>

      <div className="oddball-halves" style={{ marginTop: 16 }}>
        <div className="oddball-half-card">
          <span className="oddball-half-stat-label">Total Targets</span>
          <span className="oddball-half-stat">{totalOpportunities}</span>
        </div>
        <div className="oddball-half-card">
          <span className="oddball-half-stat-label">Assessment Duration</span>
          <span className="oddball-half-stat">45 seconds</span>
        </div>
      </div>

      {currentAssessment.paused && (
        <p className="oddball-result-note">
          <strong>Note:</strong> this assessment included a pause. Any target that was showing when the
          pause began was excluded from the results above rather than scored as a miss.
        </p>
      )}

      <h2 className="oddball-section-title">Reaction Time Across Trials</h2>
      {rtPoints.length >= 2 ? (
        <TrendChart points={rtPoints} unit="ms" label="Reaction Time" />
      ) : (
        <div className="oddball-chart-empty">
          <p>Not enough valid responses in this assessment to plot a trial-by-trial graph.</p>
        </div>
      )}

      <h2 className="oddball-section-title">Performance Trend</h2>
      {trend.direction == null ? (
        <div className="oddball-chart-empty">
          <p>Not enough valid trials in this assessment to calculate a within-test trend.</p>
        </div>
      ) : (
        <>
          <div className="wm-thirds-grid">
            <div className="oddball-half-card">
              <span className="oddball-half-stat-label">First Third</span>
              <span className="oddball-half-stat">
                {trend.firstThirdMeanRT != null ? `${roundMetric(trend.firstThirdMeanRT, 0)} ms` : '—'}
              </span>
            </div>
            <div className="oddball-half-card">
              <span className="oddball-half-stat-label">Middle Third</span>
              <span className="oddball-half-stat">
                {trend.middleThirdMeanRT != null ? `${roundMetric(trend.middleThirdMeanRT, 0)} ms` : '—'}
              </span>
            </div>
            <div className="oddball-half-card">
              <span className="oddball-half-stat-label">Final Third</span>
              <span className="oddball-half-stat">
                {trend.finalThirdMeanRT != null ? `${roundMetric(trend.finalThirdMeanRT, 0)} ms` : '—'}
              </span>
            </div>
          </div>
          <p className="oddball-result-note">{TREND_DIRECTION_TEXT[trend.direction]}</p>
        </>
      )}

      <h2 className="oddball-section-title">About Your Result</h2>
      <p className="oddball-result-note">
        Your response speed and accuracy were recorded for comparison with future assessments and
        other cognitive measures. These results represent performance on this task only.
        {chronological.length > 1
          ? ' Your current results can be compared with previous assessments to monitor performance over time.'
          : ''}
      </p>

      <h2 className="oddball-section-title">Performance Trend Across Assessments</h2>
      {chronological.length <= 1 ? (
        <div className="oddball-chart-empty">
          <p>Baseline established. Complete future assessments to see a performance trend here.</p>
        </div>
      ) : (
        <>
          <div className="oddball-trend-toggle">
            {LONGITUDINAL_TREND_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                className={`oddball-toggle-btn${trendKey === opt.key ? ' oddball-toggle-btn--active' : ''}`}
                onClick={() => setTrendKey(opt.key)}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <TrendChart points={longitudinalPoints} unit={activeLongitudinalOption.unit} label={activeLongitudinalOption.label} />
        </>
      )}

      <h2 className="oddball-section-title">Baseline Comparison</h2>
      {!hasBaselineComparison ? (
        <div className="oddball-baseline-card">
          <p>
            This is your baseline assessment. Future assessments will be compared against this result
            to help track changes over time.
          </p>
        </div>
      ) : (
        <div className="oddball-baseline-card">
          <div className="oddball-baseline-values">
            <div>
              <span className="oddball-info-label">Previous Mean RT</span>
              <span className="oddball-info-value">
                {baseline.meanReactionTime != null ? `${roundMetric(baseline.meanReactionTime, 0)} ms` : '—'}
              </span>
            </div>
            <div>
              <span className="oddball-info-label">Current Mean RT</span>
              <span className="oddball-info-value">{meanRT != null ? `${meanRT} ms` : '—'}</span>
            </div>
            <div>
              <span className="oddball-info-label">Previous Accuracy</span>
              <span className="oddball-info-value">
                {baseline.accuracy != null ? `${roundMetric(baseline.accuracy, 0)}%` : '—'}
              </span>
            </div>
            <div>
              <span className="oddball-info-label">Current Accuracy</span>
              <span className="oddball-info-value">{accuracyDisplay != null ? `${accuracyDisplay}%` : '—'}</span>
            </div>
          </div>
          <p>
            Performance differs from the previous assessment. Changes should be interpreted together
            with other cognitive assessments and relevant clinical information, not as evidence of
            decline on their own.
          </p>
        </div>
      )}

      <WhackMoleDisclaimer />

      <div className="oddball-actions oddball-actions--results">
        <button className="oddball-btn oddball-btn--primary" onClick={onViewHistory}>
          View History
        </button>
        <button className="oddball-btn oddball-btn--secondary" onClick={onBackToDashboard}>
          Return to Dashboard
        </button>
        <button className="oddball-btn oddball-btn--secondary" onClick={onRepeatAssessment}>
          Repeat Assessment
        </button>
      </div>
      <p className="oddball-device-note">
        Repeat this assessment according to your Neuromorph assessment schedule, or discuss any
        concerns with a healthcare professional. Repeated attempts may influence performance because
        you have already seen the task.
      </p>
    </div>
  );
}
