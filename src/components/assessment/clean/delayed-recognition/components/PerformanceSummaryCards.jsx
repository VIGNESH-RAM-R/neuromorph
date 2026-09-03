import { CORE_METRIC_KEYS, METRIC_LABELS } from '../config/scoringConfig.js';

function formatMetric(key, value) {
  if (key === 'averageRecognitionTimeMs') return (value / 1000).toFixed(1) + 's';
  if (key.toLowerCase().includes('rate') || key === 'delayedRecognitionAccuracy') return value.toFixed(1) + '%';
  if (key === 'reactionTimeVariability') return Math.round(value) + 'ms';
  return value.toFixed(1);
}

// Renders only CORE_METRIC_KEYS. Research metrics stay on
// resultModel.metrics -- they're just not rendered on this report.
export default function PerformanceSummaryCards({ metrics }) {
  return (
    <div className="drt-card-grid">
      {CORE_METRIC_KEYS.map((key) => (
        <div className="drt-card" key={key}>
          <div className="drt-card-value">{formatMetric(key, metrics[key])}</div>
          <div className="drt-card-label">{METRIC_LABELS[key]}</div>
        </div>
      ))}
    </div>
  );
}
