import BarChart from './BarChart.jsx';

const TYPE_LABEL = { object: 'Objects', figure: 'Figures', symbol: 'Symbols', face: 'Faces' };

export default function RecognitionAccuracyChart({ trialResults }) {
  const labels = trialResults.map((t) => TYPE_LABEL[t.itemType] || t.itemType);
  const values = trialResults.map((t) => ((t.hits + t.correctRejections) / (t.totalTargets + t.totalDistractors)) * 100);
  return <BarChart labels={labels} values={values} barColor="var(--drt-accent)" />;
}
