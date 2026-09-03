import PerformanceSummaryCards from './PerformanceSummaryCards.jsx';
import DrawingAccuracyChart from './DrawingAccuracyChart.jsx';
import DrawingTimeChart from './DrawingTimeChart.jsx';

const SEVERITY_CLASS = {
  TYPICAL: 'gsc-severity--typical',
  MILD: 'gsc-severity--mild',
  MODERATE: 'gsc-severity--moderate',
  SIGNIFICANT: 'gsc-severity--significant'
};

export default function CompletionScreen({ resultModel, perFigureResults, onRestart }) {
  if (!resultModel) {
    return (
      <div className="gsc-screen gsc-screen--completion">
        <p>Scoring your assessment&hellip;</p>
      </div>
    );
  }

  return (
    <div className="gsc-screen gsc-screen--completion">
      <h1>Assessment complete</h1>

      <div className={`gsc-severity-banner ${SEVERITY_CLASS[resultModel.severity] || ''}`}>
        <span className="gsc-severity-label">{resultModel.severity}</span>
        <p>{resultModel.interpretation}</p>
        <p className="gsc-caption">
          Severity bands are illustrative placeholders pending clinical validation -- not a diagnosis.
        </p>
      </div>

      <PerformanceSummaryCards resultModel={resultModel} />

      <div className="gsc-chart-block">
        <h2>Drawing accuracy per figure</h2>
        <DrawingAccuracyChart perFigureResults={perFigureResults} />
      </div>
      <div className="gsc-chart-block">
        <h2>Response time vs. time limit</h2>
        <DrawingTimeChart perFigureResults={perFigureResults} />
      </div>

      <button className="gsc-btn gsc-btn--primary" onClick={onRestart}>Run again</button>
    </div>
  );
}
