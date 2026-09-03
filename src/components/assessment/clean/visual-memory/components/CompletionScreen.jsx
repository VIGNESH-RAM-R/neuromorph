import PerformanceSummaryCards from './PerformanceSummaryCards.jsx';
import RecognitionAccuracyChart from './RecognitionAccuracyChart.jsx';
import ResponseTimeChart from './ResponseTimeChart.jsx';
import DifficultyPerformanceChart from './DifficultyPerformanceChart.jsx';

const SEVERITY_CLASS = {
  EXCELLENT: 'vmt-severity--excellent',
  NORMAL: 'vmt-severity--normal',
  MILDLY_REDUCED: 'vmt-severity--mildly-reduced',
  REDUCED: 'vmt-severity--reduced'
};

export default function CompletionScreen({ resultModel, trialResults, onRestart, onHome }) {
  if (!resultModel) {
    return (
      <div className="vmt-screen">
        <p className="vmt-body">Scoring your assessment…</p>
      </div>
    );
  }

  const m = resultModel.metrics;

  return (
    <div className="vmt-screen">
      <h1>Assessment completed</h1>

      <div className="vmt-hero">
        <div className="vmt-hero-score">
          {m.cognitiveScore.toFixed(1)}<span className="vmt-hero-scale"> / 100</span>
        </div>
        <p className="vmt-hero-caption">Cognitive score — Visual Memory component</p>
        <span className={`vmt-severity-tag ${SEVERITY_CLASS[resultModel.severity] || ''}`}>
          {resultModel.severity.replace('_', ' ')}
        </span>
        <p className="vmt-body">{resultModel.interpretation}</p>
        <p className="vmt-fine-print">
          This result contributes to the Visual Memory component of NEUROMORPH's unified Cognitive Score.
          It does not diagnose dementia or any condition on its own.
        </p>
      </div>

      <h2>Core clinical metrics</h2>
      <PerformanceSummaryCards metrics={m} />

      <h2>Recognition accuracy per trial</h2>
      <RecognitionAccuracyChart trialResults={trialResults} />

      <h2>Response time vs. 30s limit</h2>
      <ResponseTimeChart trialResults={trialResults} />

      <h2>Difficulty-wise performance</h2>
      <DifficultyPerformanceChart difficultyBreakdown={resultModel.difficultyBreakdown} />

      <p className="vmt-fine-print">
        Research metrics (fastest/slowest recognition time, processing speed score, raw score,
        normalized score, attention consistency, timeouts, incorrect selections) are computed and
        stored in the result data but not shown on this report.
      </p>

      <div className="vmt-actions">
        <button className="vmt-btn vmt-btn--primary" onClick={onRestart}>Restart assessment</button>
        <button className="vmt-btn vmt-btn--secondary" onClick={onHome}>Return to home</button>
      </div>
    </div>
  );
}
