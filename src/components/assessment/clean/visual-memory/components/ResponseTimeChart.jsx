import BarChart from './BarChart.jsx';

export default function ResponseTimeChart({ trialResults }) {
  const labels = trialResults.map((_, i) => `T${i + 1}`);
  const values = trialResults.map((t) => Math.min(100, (t.reactionTimeMs / 30000) * 100));
  const colorFor = (i) => (trialResults[i].timedOut ? 'var(--vmt-danger)' : 'var(--vmt-accent)');
  return <BarChart labels={labels} values={values} barColor={colorFor} />;
}
