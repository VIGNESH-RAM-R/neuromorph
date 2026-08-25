import SectionCard from '../shared/SectionCard.jsx';
import LineChart from '../shared/LineChart.jsx';
import BarChart from '../shared/BarChart.jsx';
import TrendIndicator from '../shared/TrendIndicator.jsx';

const BAND_COLOR = {
  Excellent: 'var(--nmdd-excellent)', Normal: 'var(--nmdd-normal)',
  'Mildly Reduced': 'var(--nmdd-mild)', Reduced: 'var(--nmdd-reduced)',
};

export default function LongitudinalProgressSection({ report }) {
  const { trend, history, domains, lobes } = report;

  const domainTrendItems = domains.map((d) => ({
    key: d.key, label: d.label, score: trend.domains[d.key]?.delta ?? 0,
  }));

  const lobeTrendItems = lobes.map((l) => ({
    key: l.key, label: l.label, score: l.score ?? 0,
  }));

  return (
    <SectionCard title="Longitudinal Progress" subtitle={`${history.length} assessment${history.length === 1 ? '' : 's'} on record`}>
      <div className="nmdd-longitudinal">
        <div className="nmdd-longitudinal__chart">
          <h3 className="nmdd-subheading">Overall Cognitive Score Trend</h3>
          <LineChart series={history.map((h) => ({ date: h.date, score: h.overallRawScore }))} label="Overall cognitive score over time" />
          <TrendIndicator trend={trend.overall.trend} delta={trend.overall.delta} />
        </div>

        <div className="nmdd-longitudinal__row">
          <div>
            <h3 className="nmdd-subheading">Visual Memory Trend</h3>
            <TrendIndicator trend={trend.visualMemory.trend} delta={trend.visualMemory.delta} />
          </div>
          <div>
            <h3 className="nmdd-subheading">Speech Trend</h3>
            <TrendIndicator trend={trend.speech.trend} delta={trend.speech.delta} />
          </div>
        </div>

        <div>
          <h3 className="nmdd-subheading">Lobar Function (current session)</h3>
          <BarChart items={lobeTrendItems} colorFor={(item) => BAND_COLOR[lobes.find((l) => l.key === item.key)?.band] || 'var(--nmdd-accent)'} label="Lobar function scores" />
        </div>

        <div className="nmdd-longitudinal__domain-trends">
          <h3 className="nmdd-subheading">Domain-wise Trend</h3>
          <ul className="nmdd-trend-list">
            {domains.map((d) => (
              <li key={d.key}>
                <span>{d.label}</span>
                <TrendIndicator trend={trend.domains[d.key]?.trend} delta={trend.domains[d.key]?.delta} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </SectionCard>
  );
}
