import { CORE_METRIC_KEYS, METRIC_LABELS } from '../config/scoringConfig.js';

function formatMetric(key, value) {
  if (key === 'averageRecognitionTimeMs') return (value / 1000).toFixed(1) + 's';
  if (key.toLowerCase().includes('rate') || key === 'overallRecognitionAccuracy') return value.toFixed(1) + '%';
  if (key === 'reactionTimeVariability') return Math.round(value) + 'ms';
  return value.toFixed(1);
}

// Renders only the Core Clinical Metrics (CORE_METRIC_KEYS). Research metrics
// are still present on resultModel.metrics -- they're just not rendered here,
// per the clinician-facing report design.
export default function PerformanceSummaryCards({ metrics }) {
  return (
    <div className="vmt-card-grid">
      {CORE_METRIC_KEYS.map((key) => (
        <div className="vmt-card" key={key}>
          <div className="vmt-card-value">{formatMetric(key, metrics[key])}</div>
          <div className="vmt-card-label">{METRIC_LABELS[key]}</div>
        </div>
      ))}
    </div>
  );
}
