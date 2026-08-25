import { useState, useMemo } from 'react';
import OddballMetricCard from './OddballMetricCard';
import OddballTrendChart from './OddballTrendChart';
import OddballDisclaimer from './OddballDisclaimer';
import { roundMetric } from '../../utils/oddballMetrics';
import { ODDBALL_CONFIG } from '../../config/oddballConfig';
import iconPlay from '../../assets/icons/oddball-howto/oddball-icon-play.png';
import iconCalendar from '../../assets/icons/oddball-howto/oddball-icon-calendar.png';
import iconClockNeon from '../../assets/icons/oddball-results/oddball-icon-clock-neon.png';
import iconTargetNeon from '../../assets/icons/oddball-results/oddball-icon-target-neon.png';
import iconChartNeon from '../../assets/icons/oddball-results/oddball-icon-chart-neon.png';
import iconGlanceDetectability from '../../assets/icons/oddball-results/oddball-icon-glance-detectability.png';
import iconGlanceRtVariability from '../../assets/icons/oddball-results/oddball-icon-glance-rt-variability.png';
import iconGlanceHitRt from '../../assets/icons/oddball-results/oddball-icon-glance-hit-rt.png';
import iconGlanceResponseBias from '../../assets/icons/oddball-results/oddball-icon-glance-response-bias.png';
import iconGlanceOmission from '../../assets/icons/oddball-results/oddball-icon-glance-omission.png';
import iconGlanceCommission from '../../assets/icons/oddball-results/oddball-icon-glance-commission.png';

// These four are the measures clinical Continuous Performance Test
// instruments (Conners CPT-3, TOVA) track longitudinally: response speed,
// response consistency, target/non-target discrimination, and vigilance
// (omissions over time).
const TREND_OPTIONS = [
  { key: 'meanReactionTime', label: 'Hit RT', unit: 'ms' },
  { key: 'reactionTimeStdDev', label: 'RT Variability', unit: 'ms' },
  { key: 'dPrime', label: 'Detectability (d′)', unit: '' },
  { key: 'omissionRate', label: 'Omission rate', unit: '%' },
];

function formatDateLabel(timestamp) {
  return new Date(timestamp).toLocaleDateString(undefined, { day: '2-digit', month: 'short' });
}

function describeDelta(deltaMs) {
  if (deltaMs === null || deltaMs === undefined) {
    return 'There were not enough valid responses in each half of the session to compare reaction time across time-on-task.';
  }
  const rounded = Math.round(Math.abs(deltaMs));
  if (rounded < 1) {
    return 'Hit reaction time was essentially unchanged between the first and second half of the session.';
  }
  const direction = deltaMs > 0 ? 'slower' : 'faster';
  return (
    <>
      Hit reaction time was <strong className="oddball-results-kw">{rounded} ms</strong> {direction} in the
      second half of the session compared with the first half.
    </>
  );
}

// Both Hit RT and RT Variability are lower-is-better in this app, so a
// negative % change against baseline is an improvement for either metric —
// this intentionally does NOT treat "negative number" as automatically bad.
function changeTone(pct) {
  if (pct === null || pct === undefined) return 'neutral';
  if (pct < 0) return 'positive';
  if (pct > 0) return 'warning';
  return 'neutral';
}

function describeBaselineInsight(rtChangePct, variabilityChangePct) {
  const flags = [rtChangePct, variabilityChangePct]
    .filter((v) => v !== null && v !== undefined)
    .map((v) => v < 0);
  if (flags.length === 0) return null;
  const betterCount = flags.filter(Boolean).length;
  if (betterCount === flags.length) {
    return { tone: 'positive', text: 'Your current performance is better than your baseline measurement.' };
  }
  if (betterCount === 0) {
    return { tone: 'warning', text: 'Your current performance is below your baseline measurement.' };
  }
  return {
    tone: 'neutral',
    text: 'Your current performance is mixed compared with your baseline — improved on some measures, down on others.',
  };
}

function buildShareText(assessment) {
  const rt = assessment.meanReactionTime != null ? `${Math.round(assessment.meanReactionTime)} ms` : '—';
  const dPrime = assessment.dPrime != null ? roundMetric(assessment.dPrime, 2) : '—';
  return `My NeuroMorph Visual Oddball Assessment results: Hit RT ${rt}, Detectability (d') ${dPrime}.`;
}

function TitleFlourish({ side }) {
  return (
    <svg
      viewBox="0 0 90 20"
      width="90"
      height="20"
      aria-hidden="true"
      className={`oddball-howto-flourish oddball-howto-flourish--${side}`}
    >
      {side === 'left' ? (
        <>
          <path d="M4 10h30l8 -8h44" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="34" cy="10" r="3.5" fill="currentColor" />
        </>
      ) : (
        <>
          <path d="M86 10H56l-8 -8H4" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="56" cy="10" r="3.5" fill="currentColor" />
        </>
      )}
    </svg>
  );
}

function PlayIcon() {
  return <img src={iconPlay} alt="" className="oddball-results-btn-icon" />;
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <circle cx="6" cy="12" r="2.4" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="18" cy="6" r="2.4" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="18" cy="18" r="2.4" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8.1 10.8 15.9 7.2M8.1 13.2l7.8 3.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" className="oddball-results-inline-icon">
      <path
        d="M12 2.5l2.9 6 6.6.7-4.9 4.6 1.3 6.5L12 17l-5.9 3.3 1.3-6.5-4.9-4.6 6.6-.7L12 2.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function OddballResults({
  currentAssessment,
  history,
  onTakeAnother,
  onBackToDashboard,
  onViewHistory,
}) {
  const [trendKey, setTrendKey] = useState('meanReactionTime');
  const [shareStatus, setShareStatus] = useState(null);

  const chronological = useMemo(
    () => [...history].sort((a, b) => a.timestamp - b.timestamp),
    [history]
  );

  const baseline = chronological.length > 0 ? chronological[0] : null;
  const hasBaselineComparison = chronological.length > 1;

  const trendPoints = useMemo(() => {
    return chronological
      .map((a) => {
        let value;
        if (trendKey === 'omissionRate') {
          value = a.targetTrials ? (a.misses / a.targetTrials) * 100 : null;
        } else {
          value = a[trendKey];
        }
        return value != null ? { value, dateLabel: formatDateLabel(a.timestamp) } : null;
      })
      .filter(Boolean);
  }, [chronological, trendKey]);

  const activeTrendOption = TREND_OPTIONS.find((o) => o.key === trendKey);

  const rtChangePct =
    baseline?.meanReactionTime && currentAssessment.meanReactionTime != null
      ? ((currentAssessment.meanReactionTime - baseline.meanReactionTime) / baseline.meanReactionTime) * 100
      : null;

  const variabilityChangePct =
    baseline?.reactionTimeStdDev && currentAssessment.reactionTimeStdDev != null
      ? ((currentAssessment.reactionTimeStdDev - baseline.reactionTimeStdDev) / baseline.reactionTimeStdDev) * 100
      : null;

  const baselineInsight = describeBaselineInsight(rtChangePct, variabilityChangePct);

  const halves = currentAssessment.sessionHalves;
  const halfRtDelta =
    halves?.firstHalf?.meanReactionTime != null && halves?.secondHalf?.meanReactionTime != null
      ? halves.secondHalf.meanReactionTime - halves.firstHalf.meanReactionTime
      : null;

  const omissionRateSub =
    currentAssessment.targetTrials
      ? `${roundMetric((currentAssessment.misses / currentAssessment.targetTrials) * 100, 1)}% of targets`
      : null;
  const commissionRateSub =
    currentAssessment.nonTargetTrials
      ? `${roundMetric((currentAssessment.falseAlarms / currentAssessment.nonTargetTrials) * 100, 1)}% of non-targets`
      : null;

  const handleShareResults = async () => {
    const text = buildShareText(currentAssessment);
    if (navigator.share) {
      try {
        await navigator.share({ title: 'NeuroMorph Assessment Results', text });
      } catch {
        // user cancelled the native share sheet — nothing to do
      }
      return;
    }
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(text);
        setShareStatus('copied');
        setTimeout(() => setShareStatus(null), 2000);
      } catch {
        // clipboard write blocked — silently ignore, button stays usable
      }
    }
  };

  return (
    <div className="oddball-screen oddball-screen--results">
      <div className="oddball-results-header">
        <div className="oddball-results-header-row">
          <TitleFlourish side="left" />
          <span className="oddball-check-badge" aria-hidden="true">✓</span>
          <h1 className="oddball-heading">
            Assessment <span className="oddball-results-accent">Complete</span>
          </h1>
          <TitleFlourish side="right" />
        </div>
        <p className="oddball-subheading-muted">Visual Oddball Assessment</p>
        <p className="oddball-results-tagline">Great job! Here's your performance summary.</p>
      </div>

      <h2 className="oddball-section-title">Performance Across the Session</h2>
      {halves?.firstHalf && halves?.secondHalf ? (
        <div className="oddball-halves">
          <div className="oddball-half-card">
            <span className="oddball-info-label">First Half</span>
            <span className="oddball-half-stat">
              <span className="oddball-half-icon-badge">
                <img src={iconClockNeon} alt="" className="oddball-half-icon" />
              </span>
              <span className="oddball-half-stat-text">
                {halves.firstHalf.meanReactionTime != null
                  ? `${Math.round(halves.firstHalf.meanReactionTime)} ms`
                  : '—'}{' '}
                <span className="oddball-half-stat-label">Hit RT</span>
              </span>
            </span>
            <span className="oddball-half-stat">
              <span className="oddball-half-icon-badge">
                <img src={iconClockNeon} alt="" className="oddball-half-icon" />
              </span>
              <span className="oddball-half-stat-text">
                {halves.firstHalf.targetDetectionRate != null
                  ? `${roundMetric(halves.firstHalf.targetDetectionRate, 0)}%`
                  : '—'}{' '}
                <span className="oddball-half-stat-label">Detection rate</span>
              </span>
            </span>
          </div>
          <div className="oddball-half-card">
            <span className="oddball-info-label">Second Half</span>
            <span className="oddball-half-stat">
              <span className="oddball-half-icon-badge">
                <img src={iconTargetNeon} alt="" className="oddball-half-icon" />
              </span>
              <span className="oddball-half-stat-text">
                {halves.secondHalf.meanReactionTime != null
                  ? `${Math.round(halves.secondHalf.meanReactionTime)} ms`
                  : '—'}{' '}
                <span className="oddball-half-stat-label">Hit RT</span>
              </span>
            </span>
            <span className="oddball-half-stat">
              <span className="oddball-half-icon-badge">
                <img src={iconTargetNeon} alt="" className="oddball-half-icon" />
              </span>
              <span className="oddball-half-stat-text">
                {halves.secondHalf.targetDetectionRate != null
                  ? `${roundMetric(halves.secondHalf.targetDetectionRate, 0)}%`
                  : '—'}{' '}
                <span className="oddball-half-stat-label">Detection rate</span>
              </span>
            </span>
          </div>
          <div className="oddball-session-insight-card">
            <span className="oddball-session-insight-title">
              <span className="oddball-session-insight-icon-badge">
                <img src={iconChartNeon} alt="" className="oddball-half-icon" />
              </span>
              Session Insight
            </span>
            <p>{describeDelta(halfRtDelta)}</p>
          </div>
        </div>
      ) : null}
      <p className="oddball-result-note oddball-result-note--compact">
        {currentAssessment.perseverativeResponses > 0
          ? `${currentAssessment.perseverativeResponses} response${
              currentAssessment.perseverativeResponses === 1 ? '' : 's'
            } occurred faster than ${ODDBALL_CONFIG.perseverationThresholdMs} ms — too quick to reflect genuine target detection.`
          : 'No unusually fast or random responses were detected during this assessment.'}
      </p>

      <div className="oddball-results-grid2">
        <div className="oddball-results-panel oddball-trend-panel">
          <h2 className="oddball-section-title oddball-section-title--panel">Performance Trend</h2>
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
              <OddballTrendChart
                points={trendPoints}
                unit={activeTrendOption.unit}
                label={activeTrendOption.label}
                dark
                lineColor="#A855F7"
              />
            </>
          )}
        </div>

        <div className="oddball-results-panel oddball-baseline-panel">
          <h2 className="oddball-section-title oddball-section-title--panel oddball-section-title--cyan">
            Baseline Comparison
          </h2>
          {!hasBaselineComparison ? (
            <div className="oddball-baseline-card">
              <p>
                This is your baseline assessment. Future assessments will be compared against
                this result to help track changes over time.
              </p>
            </div>
          ) : (
            <div className="oddball-baseline-card">
              <div className="oddball-baseline-values">
                <div>
                  <span className="oddball-info-label">Baseline Hit RT</span>
                  <span className="oddball-info-value oddball-info-value--baseline">
                    {baseline.meanReactionTime != null ? `${Math.round(baseline.meanReactionTime)} ms` : '—'}
                  </span>
                </div>
                <div>
                  <span className="oddball-info-label">Current Hit RT</span>
                  <span className="oddball-info-value oddball-info-value--current">
                    {currentAssessment.meanReactionTime != null
                      ? `${Math.round(currentAssessment.meanReactionTime)} ms`
                      : '—'}
                  </span>
                </div>
                <div>
                  <span className="oddball-info-label">Change</span>
                  <span className={`oddball-info-value oddball-info-value--change-${changeTone(rtChangePct)}`}>
                    {rtChangePct != null ? `${rtChangePct >= 0 ? '+' : ''}${roundMetric(rtChangePct, 1)}%` : '—'}
                  </span>
                </div>
              </div>

              <div className="oddball-baseline-values">
                <div>
                  <span className="oddball-info-label">Baseline RT Variability</span>
                  <span className="oddball-info-value oddball-info-value--baseline">
                    {baseline.reactionTimeStdDev != null ? `${Math.round(baseline.reactionTimeStdDev)} ms` : '—'}
                  </span>
                </div>
                <div>
                  <span className="oddball-info-label">Current RT Variability</span>
                  <span className="oddball-info-value oddball-info-value--current">
                    {currentAssessment.reactionTimeStdDev != null
                      ? `${Math.round(currentAssessment.reactionTimeStdDev)} ms`
                      : '—'}
                  </span>
                </div>
                <div>
                  <span className="oddball-info-label">Change</span>
                  <span
                    className={`oddball-info-value oddball-info-value--change-${changeTone(variabilityChangePct)}`}
                  >
                    {variabilityChangePct != null
                      ? `${variabilityChangePct >= 0 ? '+' : ''}${roundMetric(variabilityChangePct, 1)}%`
                      : '—'}
                  </span>
                </div>
              </div>

              {baselineInsight && (
                <div className={`oddball-baseline-insight oddball-baseline-insight--${baselineInsight.tone}`}>
                  <StarIcon />
                  <p>{baselineInsight.text}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <h2 className="oddball-section-title">At a Glance</h2>
      <div className="oddball-metric-grid oddball-metric-grid--glance">
        <OddballMetricCard
          label="Detectability (d′)"
          value={roundMetric(currentAssessment.dPrime, 2)}
          tone="primary"
          icon={iconGlanceDetectability}
        />
        <OddballMetricCard
          label="RT Variability"
          value={
            currentAssessment.reactionTimeStdDev != null
              ? Math.round(currentAssessment.reactionTimeStdDev)
              : null
          }
          unit="ms"
          tone="primary"
          icon={iconGlanceRtVariability}
        />
        <OddballMetricCard
          label="Hit Reaction Time"
          value={
            currentAssessment.meanReactionTime != null
              ? Math.round(currentAssessment.meanReactionTime)
              : null
          }
          unit="ms"
          icon={iconGlanceHitRt}
        />
        <OddballMetricCard
          label="Response Bias (criterion)"
          value={roundMetric(currentAssessment.responseCriterion, 2)}
          icon={iconGlanceResponseBias}
        />
        <OddballMetricCard
          label="Omission Errors"
          value={currentAssessment.misses}
          sublabel={omissionRateSub}
          icon={iconGlanceOmission}
        />
        <OddballMetricCard
          label="Commission Errors"
          value={currentAssessment.falseAlarms}
          sublabel={commissionRateSub}
          icon={iconGlanceCommission}
        />
      </div>

      <OddballDisclaimer />

      <p className="oddball-device-note">
        For the most reliable longitudinal comparison, use the same device whenever possible.
      </p>

      <div className="seq-cs-actions oddball-actions--results">
        <button className="seq-cs-btn seq-cs-btn--primary" onClick={onTakeAnother}>
          <PlayIcon />
          Play Again
        </button>
        <button className="seq-cs-btn seq-cs-btn--secondary" onClick={handleShareResults}>
          <ShareIcon />
          {shareStatus === 'copied' ? 'Copied!' : 'Share Results'}
        </button>
        {onViewHistory && (
          <button className="seq-cs-btn seq-cs-btn--secondary" onClick={onViewHistory}>
            <img src={iconCalendar} alt="" className="oddball-results-btn-icon" />
            View Past Assessments
          </button>
        )}
      </div>

      <div className="oddball-results-divider" role="separator" />

      <div className="oddball-results-footer-links">
        {onBackToDashboard && (
          <button className="oddball-results-back-link" onClick={onBackToDashboard}>
            Back to Dashboard
          </button>
        )}
      </div>
    </div>
  );
}
