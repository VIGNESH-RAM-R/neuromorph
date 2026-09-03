import BarChart from './BarChart.jsx';

const ORDER = ['easy', 'medium', 'hard'];
const LABELS = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };

export default function DifficultyPerformanceChart({ difficultyBreakdown }) {
  const present = ORDER.filter((d) => difficultyBreakdown[d]);
  const labels = present.map((d) => LABELS[d]);
  const values = present.map((d) => difficultyBreakdown[d].hitRate);
  return <BarChart labels={labels} values={values} barColor="var(--vmt-success)" />;
}
