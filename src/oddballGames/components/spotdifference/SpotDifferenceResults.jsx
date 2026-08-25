import { useMemo, useState } from 'react';
import MetricCard from '../shared/MetricCard';
import TrendChart from '../shared/TrendChart';
import SpotDifferenceDisclaimer from './SpotDifferenceDisclaimer';
import { starString } from '../../utils/spotDifferenceMetrics';
import { roundMetric } from '../../utils/stats';

const TREND_OPTIONS = [
  { key: 'accuracy', label: 'Accuracy', unit: '%' },
  { key: 'totalTimeMs', label: 'Total Time', unit: 's', transform: (v) => Math.round(v / 1000) },
  { key: 'levelsCompleted', label: 'Levels Completed', unit: '' },
];

function formatDateLabel(timestamp) {
  return new Date(timestamp).toLocaleDateString(undefined, { day: '2-digit', month: 'short' });
}

function formatDuration(ms) {
  if (ms == null || !Number.isFinite(ms)) return '—';
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export default function SpotDifferenceResults({
  currentAssessment,
  history,
  onPlayAgain,
  onViewHistory,
  onBackToDashboard,
}) {
  const [trendKey, setTrendKey] = useState('accuracy');

  const chronological = useMemo(() => [...history].sort((a, b) => a.timestamp - b.timestamp), [history]);
  const baseline = chronological.length > 0 ? chronological[0] : null;
  const hasBaselineComparison = chronological.length > 1;

  const trendPoints = useMemo(() => {
    const option = TREND_OPTIONS.find((o) => o.key === trendKey);
    return chronological
      .map((a) => {
        const raw = a[trendKey];
        if (raw == null) return null;
        const value = option.transform ? option.transform(raw) : raw;
        return { value, dateLabel: formatDateLabel(a.timestamp) };
      })
      .filter(Boolean);
  }, [chronological, trendKey]);
  const activeTrendOption = TREND_OPTIONS.find((o) => o.key === trendKey);

  const accuracyDisplay = currentAssessment.accuracy != null ? roundMetric(currentAssessment.accuracy, 0) : null;
  const accuracyChangePct =
    baseline?.accuracy != null && accuracyDisplay != null ? accuracyDisplay - roundMetric(baseline.accuracy, 0) : null;
  const timeChangePct =
    baseline?.totalTimeMs && currentAssessment.totalTimeMs != null
      ? ((currentAssessment.totalTimeMs - baseline.totalTimeMs) / baseline.totalTimeMs) * 100
      : null;

  return (
    <div className="oddball-screen sd-screen sd-screen--results">
      <div className="oddball-results-header">
        <span className="oddball-check-badge" aria-hidden="true">✓</span>
        <h1 className="oddball-heading">Session Complete</h1>
        <p className="oddball-subheading-muted">Spot the Difference</p>
      </div>

      <h2 className="oddball-section-title">Session Summary</h2>
      <div className="oddball-metric-grid">
        <MetricCard
          label="Levels Completed"
          value={currentAssessment.levelsCompleted}
          sublabel={`of ${currentAssessment.totalLevels}`}
          tone="primary"
        />
        <MetricCard
          label="Stars Earned"
          value={starString(currentAssessment.starsEarned, currentAssessment.maxStars)}
          sublabel={`${currentAssessment.starsEarned} of ${currentAssessment.maxStars}`}
          tone="primary"
        />
        <MetricCard
          label="Differences Found"
          value={currentAssessment.totalDifferencesFound}
          sublabel={`of ${currentAssessment.totalDifferencesAvailable}`}
          tone="primary"
        />
        <MetricCard
          label="Accuracy"
          value={accuracyDisplay}
          unit={accuracyDisplay != null ? '%' : undefined}
        />
        <MetricCard label="Wrong Taps" value={currentAssessment.totalWrongTaps} />
        <MetricCard label="Total Time" value={formatDuration(currentAssessment.totalTimeMs)} />
      </div>

      <p className="oddball-result-note">
        Accuracy reflects the share of taps that correctly located a difference, out of every tap
        made this session. This is an untimed, no-penalty task — total time is recorded for
        interest only and never affects scoring.
      </p>

      <h2 className="oddball-section-title">Level Breakdown</h2>
      <div className="sd-level-breakdown">
        {currentAssessment.perLevel.map((lvl) => (
          <div className="oddball-half-card" key={lvl.levelId}>
            <span className="oddball-info-label">
              {lvl.label} {starString(lvl.stars)}
            </span>
            <span className="oddball-half-stat">
              {lvl.foundDiffs} / {lvl.totalDiffs}
              <span className="oddball-half-stat-label">Differences found</span>
            </span>
            <span className="oddball-half-stat">
              {formatDuration(lvl.timeMs)}
              <span className="oddball-half-stat-label">Time</span>
            </span>
          </div>
        ))}
        {currentAssessment.perLevel.length === 0 && (
          <p className="oddball-result-note">No levels were completed this session.</p>
        )}
      </div>

      <h2 className="oddball-section-title">Performance Trend</h2>
      {chronological.length <= 1 ? (
        <div className="oddball-chart-empty">
          <p>Baseline established. Complete future sessions to see a performance trend here.</p>
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
          <TrendChart points={trendPoints} unit={activeTrendOption.unit} label={activeTrendOption.label} dark />
        </>
      )}

      <h2 className="oddball-section-title">Baseline Comparison</h2>
      {!hasBaselineComparison ? (
        <div className="oddball-baseline-card">
          <p>
            This is your baseline session. Future sessions will be compared against this result to
            help track changes over time.
          </p>
        </div>
      ) : (
        <div className="oddball-baseline-card">
          <div className="oddball-baseline-values">
            <div>
              <span className="oddball-info-label">Baseline Accuracy</span>
              <span className="oddball-info-value">
                {baseline.accuracy != null ? `${roundMetric(baseline.accuracy, 0)}%` : '—'}
              </span>
            </div>
            <div>
              <span className="oddball-info-label">Current Accuracy</span>
              <span className="oddball-info-value">{accuracyDisplay != null ? `${accuracyDisplay}%` : '—'}</span>
            </div>
            <div>
              <span className="oddball-info-label">Change</span>
              <span className="oddball-info-value">
                {accuracyChangePct != null ? `${accuracyChangePct >= 0 ? '+' : ''}${accuracyChangePct}%` : '—'}
              </span>
            </div>
          </div>
          <div className="oddball-baseline-values">
            <div>
              <span className="oddball-info-label">Baseline Time</span>
              <span className="oddball-info-value">{formatDuration(baseline.totalTimeMs)}</span>
            </div>
            <div>
              <span className="oddball-info-label">Current Time</span>
              <span className="oddball-info-value">{formatDuration(currentAssessment.totalTimeMs)}</span>
            </div>
            <div>
              <span className="oddball-info-label">Change</span>
              <span className="oddball-info-value">
                {timeChangePct != null ? `${timeChangePct >= 0 ? '+' : ''}${roundMetric(timeChangePct, 1)}%` : '—'}
              </span>
            </div>
          </div>
          <p>
            Performance changes should be interpreted together with other cognitive assessments and
            relevant clinical information.
          </p>
        </div>
      )}

      <SpotDifferenceDisclaimer />

      <div className="seq-cs-actions oddball-actions--results">
        <button className="seq-cs-btn seq-cs-btn--success" onClick={onPlayAgain}>
          Play Again
        </button>
        <button className="seq-cs-btn seq-cs-btn--secondary" onClick={onViewHistory}>
          View History
        </button>
        <button className="seq-cs-btn seq-cs-btn--secondary" onClick={onBackToDashboard}>
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
