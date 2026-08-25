import { useState, useMemo } from 'react';
import MetricCard from '../shared/MetricCard';
import TrendChart from '../shared/TrendChart';
import PointClickDisclaimer from './PointClickDisclaimer';
import { roundMetric } from '../../utils/stats';

// Reported separately from accuracy per spec — false alarm rate and correct
// rejection rate describe behavior on no-target trials specifically, and
// are never blended into accuracy (which is hit rate on target-present
// trials only).
const TREND_OPTIONS = [
  { key: 'accuracy', label: 'Accuracy', unit: '%' },
  { key: 'medianResponseTime', label: 'Median RT', unit: 'ms' },
  { key: 'responseTimeCV', label: 'RT Variability', unit: '%' },
  { key: 'falseAlarmRate', label: 'False Alarm Rate', unit: '%' },
];

function formatDateLabel(timestamp) {
  return new Date(timestamp).toLocaleDateString(undefined, { day: '2-digit', month: 'short' });
}

export default function PointClickResults({ currentAssessment, history, onViewHistory, onRepeatAssessment, onBackToDashboard }) {
  const [trendKey, setTrendKey] = useState('accuracy');

  const chronological = useMemo(() => [...history].sort((a, b) => a.timestamp - b.timestamp), [history]);
  const baseline = chronological.length > 0 ? chronological[0] : null;
  const hasBaselineComparison = chronological.length > 1;

  const trendPoints = useMemo(() => {
    return chronological
      .map((a) => {
        const value = a[trendKey];
        return value != null ? { value: roundMetric(value, 1), dateLabel: formatDateLabel(a.timestamp) } : null;
      })
      .filter(Boolean);
  }, [chronological, trendKey]);
  const activeTrendOption = TREND_OPTIONS.find((o) => o.key === trendKey);

  const rtByTrialPoints = useMemo(() => {
    return (currentAssessment.trialResponseTimes || [])
      .filter((t) => t.responseTime != null)
      .map((t) => ({ value: roundMetric(t.responseTime, 0), dateLabel: String(t.trialNumber) }));
  }, [currentAssessment]);

  const accuracyDisplay = currentAssessment.accuracy != null ? roundMetric(currentAssessment.accuracy, 1) : null;
  const medianRtDisplay =
    currentAssessment.medianResponseTime != null ? roundMetric(currentAssessment.medianResponseTime, 0) : null;
  const cvDisplay = currentAssessment.responseTimeCV != null ? roundMetric(currentAssessment.responseTimeCV, 1) : null;

  const accuracyChange =
    baseline?.accuracy != null && currentAssessment.accuracy != null
      ? currentAssessment.accuracy - baseline.accuracy
      : null;
  const rtChange =
    baseline?.medianResponseTime != null && currentAssessment.medianResponseTime != null
      ? currentAssessment.medianResponseTime - baseline.medianResponseTime
      : null;

  return (
    <div className="oddball-screen pc-screen pc-screen--results">
      <div className="oddball-results-header">
        <span className="oddball-check-badge" aria-hidden="true">✓</span>
        <h1 className="oddball-heading">Assessment Complete</h1>
        <p className="oddball-subheading-muted">Point &amp; Click Performance</p>
      </div>

      <h2 className="oddball-section-title">Visual Attention &amp; Target Detection — Performance Summary</h2>
      <div className="oddball-metric-grid">
        <MetricCard
          label="Correct Hits"
          value={currentAssessment.correctHits}
          sublabel={`of ${currentAssessment.targetPresentTrials} target rounds`}
          tone="primary"
        />
        <MetricCard label="Accuracy" value={accuracyDisplay} unit={accuracyDisplay != null ? '%' : undefined} tone="primary" />
        <MetricCard
          label="Median Response Time"
          value={medianRtDisplay}
          unit={medianRtDisplay != null ? 'ms' : undefined}
        />
        <MetricCard
          label="Missed Targets"
          value={currentAssessment.misses}
          sublabel={`of ${currentAssessment.targetPresentTrials} target rounds`}
        />
        <MetricCard label="False Alarms" value={currentAssessment.falseAlarms} sublabel="tapped a non-target object" />
        <MetricCard
          label="Correct Rejections"
          value={currentAssessment.correctRejections}
          sublabel={`of ${currentAssessment.noTargetTrials} no-target rounds`}
        />
        <MetricCard
          label="Response Variability"
          value={cvDisplay}
          unit={cvDisplay != null ? '%' : undefined}
          sublabel="coefficient of variation"
        />
      </div>

      <p className="oddball-result-note">
        Accuracy is the share of rounds where the target appeared and was correctly tapped.
        Correct Rejections and False Alarms describe rounds where no target appeared — a high
        correct-rejection rate means responses stayed selective rather than impulsive. Response
        Variability reflects how consistent response speed was from round to round.
      </p>

      <h2 className="oddball-section-title">Response Time by Trial</h2>
      <TrendChart points={rtByTrialPoints} unit="ms" label="Response Time" dark />

      {currentAssessment.difficultyResults?.length > 0 && (
        <>
          <h2 className="oddball-section-title">Performance by Difficulty Level</h2>
          <div className="oddball-history-table-wrap">
            <table className="oddball-history-table">
              <thead>
                <tr>
                  <th>Level</th>
                  <th>Rounds</th>
                  <th>Accuracy</th>
                  <th>Median RT</th>
                </tr>
              </thead>
              <tbody>
                {currentAssessment.difficultyResults.map((d) => (
                  <tr key={d.level}>
                    <td>{d.level}</td>
                    <td>{d.trials}</td>
                    <td>{d.accuracy != null ? `${roundMetric(d.accuracy, 1)}%` : '—'}</td>
                    <td>{d.medianResponseTime != null ? `${roundMetric(d.medianResponseTime, 0)} ms` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <h2 className="oddball-section-title">Performance Summary</h2>
      <p className="oddball-result-note">
        You correctly identified {currentAssessment.correctHits} of {currentAssessment.targetPresentTrials} target
        rounds{accuracyDisplay != null ? ` (${accuracyDisplay}% accuracy)` : ''}, with a median response time of{' '}
        {medianRtDisplay != null ? `${medianRtDisplay} ms` : 'no recorded hits'}. Your results provide behavioral
        information about visual search, target detection, and response speed.
        {chronological.length > 1 ? ' Your current results can be compared with previous assessments to monitor performance over time.' : ''}
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

          <div className="oddball-baseline-values">
            <div>
              <span className="oddball-info-label">Baseline Median RT</span>
              <span className="oddball-info-value">
                {baseline.medianResponseTime != null ? `${roundMetric(baseline.medianResponseTime, 0)} ms` : '—'}
              </span>
            </div>
            <div>
              <span className="oddball-info-label">Current Median RT</span>
              <span className="oddball-info-value">{medianRtDisplay != null ? `${medianRtDisplay} ms` : '—'}</span>
            </div>
            <div>
              <span className="oddball-info-label">Change</span>
              <span className="oddball-info-value">
                {rtChange != null ? `${rtChange >= 0 ? '+' : ''}${roundMetric(rtChange, 0)} ms` : '—'}
              </span>
            </div>
          </div>
          <p>
            Performance changes should be interpreted together with other cognitive assessments
            and relevant clinical information, and are more meaningful when assessments are
            completed on the same device and input method.
          </p>
        </div>
      )}

      <PointClickDisclaimer />

      <div className="oddball-actions oddball-actions--results">
        <button className="seq-cs-btn seq-cs-btn--primary" onClick={onViewHistory}>
          View Performance
        </button>
        <button className="seq-cs-btn seq-cs-btn--secondary" onClick={onBackToDashboard}>
          Return to Dashboard
        </button>
        <button className="seq-cs-btn seq-cs-btn--success" onClick={onRepeatAssessment}>
          Repeat Assessment
        </button>
      </div>
      <p className="oddball-device-note">
        For the most meaningful comparison over time, complete assessments using the same device
        and input method when possible.
      </p>
    </div>
  );
}
