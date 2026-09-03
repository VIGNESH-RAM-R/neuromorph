import BarChart from './BarChart.jsx';

const TYPE_LABEL = { object: 'Objects', figure: 'Figures', symbol: 'Symbols', face: 'Faces' };

// Retention here = hit rate per category (proportion of that category's
// retrieved targets still correctly recognized after the delay).
export default function MemoryRetentionChart({ trialResults }) {
  const labels = trialResults.map((t) => TYPE_LABEL[t.itemType] || t.itemType);
  const values = trialResults.map((t) => (t.hits / t.totalTargets) * 100);
  return <BarChart labels={labels} values={values} barColor="var(--drt-success)" />;
}
