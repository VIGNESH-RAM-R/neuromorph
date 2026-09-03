import BarChart from './BarChart.jsx';

export default function RecognitionAccuracyChart({ trialResults }) {
  const labels = trialResults.map((_, i) => `T${i + 1}`);
  const values = trialResults.map((t) => ((t.hits + t.correctRejections) / (t.totalTargets + t.totalDistractors)) * 100);
  return <BarChart labels={labels} values={values} barColor="var(--vmt-accent)" />;
}
