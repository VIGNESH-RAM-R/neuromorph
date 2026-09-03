import PerformanceSummaryCards from './PerformanceSummaryCards.jsx';
import RecognitionAccuracyChart from './RecognitionAccuracyChart.jsx';
import ResponseTimeChart from './ResponseTimeChart.jsx';
import MemoryRetentionChart from './MemoryRetentionChart.jsx';

const SEVERITY_CLASS = {
  EXCELLENT: 'drt-severity--excellent',
  NORMAL: 'drt-severity--normal',
  MILDLY_REDUCED: 'drt-severity--mildly-reduced',
  REDUCED: 'drt-severity--reduced'
};

export default function CompletionScreen({ resultModel, trialResults, onRestart, onHome }) {
  if (!resultModel) {
    return (
      <div className="drt-screen">
        <p className="drt-body">Scoring your assessment…</p>
      </div>
    );
  }

  const m = resultModel.metrics;

  return (
    <div className="drt-screen">
      <h1>Assessment completed</h1>

      <div className="drt-hero">
        <div className="drt-hero-score">
          {m.cognitiveScore.toFixed(1)}<span className="drt-hero-scale"> / 100</span>
        </div>
        <p className="drt-hero-caption">Cognitive score — Delayed Recognition component</p>
        <span className={`drt-severity-tag ${SEVERITY_CLASS[resultModel.severity] || ''}`}>
          {resultModel.severity.replace('_', ' ')}
        </span>
        <p className="drt-body">{resultModel.interpretation}</p>
        <p className="drt-fine-print">
          This result contributes to the Delayed Recognition component of NEUROMORPH's unified Cognitive Score.
          It does not diagnose dementia or any condition on its own. Items retrieved from: {resultModel.retrievedSourceModules.join(', ')}.
        </p>
      </div>

      <h2>Core clinical metrics</h2>
      <PerformanceSummaryCards metrics={m} />

      <h2>Recognition accuracy per category</h2>
      <RecognitionAccuracyChart trialResults={trialResults} />

      <h2>Response time vs. 30s limit</h2>
      <ResponseTimeChart trialResults={trialResults} />

      <h2>Memory retention per category</h2>
      <MemoryRetentionChart trialResults={trialResults} />

      <p className="drt-fine-print">
        Research metrics (fastest/slowest recognition time, attention consistency, processing speed score,
        raw score, normalized score, timeouts, incorrect selections) are computed and stored in the result
        data but not shown on this report.
      </p>

      <div className="drt-actions">
        <button className="drt-btn drt-btn--primary" onClick={onRestart}>Restart assessment</button>
        <button className="drt-btn drt-btn--secondary" onClick={onHome}>Return to home</button>
      </div>
    </div>
  );
}
