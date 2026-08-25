import { useState, useMemo } from 'react';
import MetricCard from '../shared/MetricCard';
import TrendChart from '../shared/TrendChart';
import SequenceDisclaimer from './SequenceDisclaimer';
import { LogoBrainIcon } from '../dashboard/icons';
import { roundMetric } from '../../utils/stats';

/* Small local icon components for the action buttons below — decorative
 * only, matching the inline-SVG convention already used throughout the
 * Sequence Memory screens (no icon library). */
function ChartIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
      <path d="M4 20V10M11 20V4M18 20v-7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.4" stroke="currentColor" strokeWidth="2" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.4" stroke="currentColor" strokeWidth="2" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.4" stroke="currentColor" strokeWidth="2" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.4" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
      <path
        d="M20 11a8 8 0 1 0-2.3 6.4M20 5v6h-6"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// These four are the measures span-task instruments (Corsi Block-Tapping,
// CANTAB Spatial Span) track longitudinally: peak span, a more
// reliability-optimized partial-credit span, response speed, and response
// consistency.
const TREND_OPTIONS = [
  { key: 'maximumSequenceSpan', label: 'Max Span', unit: 'items' },
  { key: 'meanSpan', label: 'Mean Span', unit: 'items' },
  { key: 'recallTime', label: 'Recall Time', unit: 's' },
  { key: 'recallTimeVariability', label: 'Recall Time Variability', unit: 's' },
];

function formatDateLabel(timestamp) {
  return new Date(timestamp).toLocaleDateString(undefined, { day: '2-digit', month: 'short' });
}

function trendValue(assessment, key) {
  if (key === 'recallTime') return assessment.meanRecallTime != null ? assessment.meanRecallTime / 1000 : null;
  if (key === 'recallTimeVariability')
    return assessment.recallTimeStdDev != null ? assessment.recallTimeStdDev / 1000 : null;
  return assessment[key];
}

export default function SequenceResults({
  currentAssessment,
  history,
  onViewHistory,
  onRepeatAssessment,
  onBackToDashboard,
}) {
  const [trendKey, setTrendKey] = useState('maximumSequenceSpan');

  const chronological = useMemo(
    () => [...history].sort((a, b) => a.timestamp - b.timestamp),
    [history]
  );

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

  const spanChange =
    baseline?.maximumSequenceSpan != null && currentAssessment.maximumSequenceSpan != null
      ? currentAssessment.maximumSequenceSpan - baseline.maximumSequenceSpan
      : null;

  const meanSpanChange =
    baseline?.meanSpan != null && currentAssessment.meanSpan != null
      ? currentAssessment.meanSpan - baseline.meanSpan
      : null;

  const recallSeconds =
    currentAssessment.meanRecallTime != null ? roundMetric(currentAssessment.meanRecallTime / 1000, 2) : null;
  const recallVariabilitySeconds =
    currentAssessment.recallTimeStdDev != null
      ? roundMetric(currentAssessment.recallTimeStdDev / 1000, 2)
      : null;
  const meanSpanDisplay =
    currentAssessment.meanSpan != null ? roundMetric(currentAssessment.meanSpan, 2) : null;

  // currentAssessment.timestamp already exists on every saved assessment
  // (see SequenceMemoryAssessment.jsx) — this is real data, just not
  // previously surfaced on this screen.
  const completedAt = new Date(currentAssessment.timestamp);
  const dateLabel = completedAt.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  const timeLabel = completedAt.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

  return (
    <div className="oddball-screen seq-screen seq-screen--results">
      <div className="seq-res-header">
        <div className="seq-res-brand">
          <LogoBrainIcon size={28} />
          <div className="seq-res-brand-text">
            <span className="seq-res-brand-mark">NEUROMORPH</span>
            <span className="seq-res-brand-sub">Cognitive Screening &amp; Longitudinal Monitoring</span>
          </div>
        </div>
        <div className="seq-res-datetime">
          <span>{dateLabel}</span>
          <span>{timeLabel}</span>
        </div>
      </div>

      <div className="seq-res-grid">
        <div className="seq-res-col seq-res-col--left">
          <div className="seq-res-complete">
            <span className="seq-ai-check-badge" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="30" height="30" fill="none">
                <path
                  d="M5 13l4 4L19 7"
                  stroke="#4ADE80"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <h1 className="oddball-heading">Assessment Complete</h1>
            <p className="oddball-subheading-muted">Sequence Memory Performance</p>
          </div>

          <div className="seq-res-eyebrow-row">
            <h2 className="oddball-section-title">Working Memory &amp; Sequential Recall — Performance Summary</h2>
          </div>
          <div className="oddball-metric-grid">
            <MetricCard
          label="Maximum Sequence Span"
          value={currentAssessment.maximumSequenceSpan}
          unit={currentAssessment.maximumSequenceSpan != null ? 'items' : undefined}
          tone="primary"
        />
        <MetricCard
          label="Mean Span"
          value={meanSpanDisplay}
          unit={meanSpanDisplay != null ? 'items' : undefined}
          tone="primary"
        />
        <MetricCard
          label="Total Correct"
          value={currentAssessment.correctTrialCount}
          sublabel={`of ${currentAssessment.totalTrialCount} rounds`}
        />
        <MetricCard
          label="Composite Score"
          value={currentAssessment.compositeScore}
          sublabel="Span × Correct"
        />
        <MetricCard label="Recall Time" value={recallSeconds} unit={recallSeconds != null ? 's' : undefined} />
        <MetricCard
          label="Recall Time Variability"
          value={recallVariabilitySeconds}
          unit={recallVariabilitySeconds != null ? 's' : undefined}
        />
        <MetricCard
          label="Total Errors"
          value={currentAssessment.totalErrors}
          sublabel={`of ${currentAssessment.totalTrialCount} rounds`}
        />
      </div>

          <p className="oddball-result-note">
            Maximum Sequence Span is the longest sequence reproduced exactly. Mean Span gives
            partial credit across every length attempted, which makes it a steadier measure to
            compare across assessments over time. Composite Score (Span × Correct) is a combined
            summary used by similar span-based memory tasks.
          </p>

          <h2 className="oddball-section-title">Performance Summary</h2>
          <p className="oddball-result-note">
            {currentAssessment.maximumSequenceSpan != null
              ? `You successfully reproduced sequences up to ${currentAssessment.maximumSequenceSpan} items in length during this assessment.`
              : 'No sequence length was fully reproduced during this assessment.'}{' '}
            You made {currentAssessment.totalErrors} error{currentAssessment.totalErrors === 1 ? '' : 's'} across{' '}
            {currentAssessment.totalTrialCount} rounds. Your results provide behavioral information about
            sequential recall and working-memory performance.
            {chronological.length > 1
              ? ' Your current results can be compared with previous assessments to monitor performance over time.'
              : ''}
          </p>
        </div>

        <div className="seq-res-col seq-res-col--right">
      <h2 className="oddball-section-title">Performance Trend</h2>
      {chronological.length <= 1 ? (
        <div className="oddball-chart-empty oddball-chart-empty--dark">
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
          <TrendChart points={trendPoints} unit={activeTrendOption.unit} label={activeTrendOption.label} dark />
        </>
      )}

      <h2 className="oddball-section-title">Baseline Comparison</h2>
      {!hasBaselineComparison ? (
        <div className="oddball-baseline-card">
          <p>
            This is your baseline assessment. Future assessments will be compared against this
            result to help track changes over time.
          </p>
        </div>
      ) : (
        <div className="oddball-baseline-card">
          <div className="oddball-baseline-values">
            <div>
              <span className="oddball-info-label">Baseline Max Span</span>
              <span className="oddball-info-value">
                {baseline.maximumSequenceSpan != null ? `${baseline.maximumSequenceSpan} items` : '—'}
              </span>
            </div>
            <div>
              <span className="oddball-info-label">Current Max Span</span>
              <span className="oddball-info-value">
                {currentAssessment.maximumSequenceSpan != null
                  ? `${currentAssessment.maximumSequenceSpan} items`
                  : '—'}
              </span>
            </div>
            <div>
              <span className="oddball-info-label">Change</span>
              <span className="oddball-info-value">
                {spanChange != null
                  ? `${spanChange >= 0 ? '+' : ''}${spanChange} item${Math.abs(spanChange) === 1 ? '' : 's'}`
                  : '—'}
              </span>
            </div>
          </div>
          {spanChange != null && (
            <p>
              {spanChange === 0
                ? 'Your current maximum sequence span matches your baseline measurement.'
                : spanChange > 0
                ? `Your current maximum sequence span is ${spanChange} item${spanChange === 1 ? '' : 's'} higher than your baseline.`
                : `Your current maximum sequence span is ${Math.abs(spanChange)} item${Math.abs(spanChange) === 1 ? '' : 's'} lower than your baseline.`}
            </p>
          )}

          <div className="oddball-baseline-values">
            <div>
              <span className="oddball-info-label">Baseline Mean Span</span>
              <span className="oddball-info-value">
                {baseline.meanSpan != null ? roundMetric(baseline.meanSpan, 2) : '—'}
              </span>
            </div>
            <div>
              <span className="oddball-info-label">Current Mean Span</span>
              <span className="oddball-info-value">{meanSpanDisplay != null ? meanSpanDisplay : '—'}</span>
            </div>
            <div>
              <span className="oddball-info-label">Change</span>
              <span className="oddball-info-value">
                {meanSpanChange != null
                  ? `${meanSpanChange >= 0 ? '+' : ''}${roundMetric(meanSpanChange, 2)}`
                  : '—'}
              </span>
            </div>
          </div>
          {meanSpanChange != null && (
            <p>
              Mean Span gives a steadier estimate across sessions than maximum span alone.
              Performance changes should be interpreted together with other cognitive
              assessments and relevant clinical information.
            </p>
          )}
        </div>
      )}
        </div>
      </div>

      <SequenceDisclaimer />

      <div className="oddball-actions oddball-actions--results">
        <button className="seq-cs-btn seq-cs-btn--primary" onClick={onViewHistory}>
          <ChartIcon />
          View Performance
        </button>
        <button className="seq-cs-btn seq-cs-btn--secondary" onClick={onBackToDashboard}>
          <GridIcon />
          Return to Dashboard
        </button>
        <button className="seq-cs-btn seq-cs-btn--success" onClick={onRepeatAssessment}>
          <RefreshIcon />
          Repeat Assessment
        </button>
      </div>
      <p className="oddball-device-note">
        Repeated attempts may influence performance because you have already seen the task.
      </p>
    </div>
  );
}
