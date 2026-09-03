import BarChart from './BarChart.jsx';

const TYPE_LABEL = { object: 'Objects', figure: 'Figures', symbol: 'Symbols', face: 'Faces' };

export default function ResponseTimeChart({ trialResults }) {
  const labels = trialResults.map((t) => TYPE_LABEL[t.itemType] || t.itemType);
  const values = trialResults.map((t) => Math.min(100, (t.reactionTimeMs / 30000) * 100));
  const colorFor = (i) => (trialResults[i].timedOut ? 'var(--drt-danger)' : 'var(--drt-accent)');
  return <BarChart labels={labels} values={values} barColor={colorFor} />;
}
