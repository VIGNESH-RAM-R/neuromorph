import SectionCard from '../shared/SectionCard.jsx';
import LineChart from '../shared/LineChart.jsx';
import BarChart from '../shared/BarChart.jsx';
import TrendIndicator from '../shared/TrendIndicator.jsx';
import { DEFAULT_LANGUAGE } from '../../config/i18nConfig.js';
import { t, format } from '../../i18n/strings/report.js';

const BAND_COLOR = {
  Excellent: 'var(--nmdd-excellent)', Normal: 'var(--nmdd-normal)',
  'Mildly Reduced': 'var(--nmdd-mild)', Reduced: 'var(--nmdd-reduced)',
};

export default function LongitudinalProgressSection({ report, language = DEFAULT_LANGUAGE }) {
  const { trend, history, domains, lobes } = report;

  const domainTrendItems = domains.map((d) => ({
    key: d.key, label: d.label, score: trend.domains[d.key]?.delta ?? 0,
  }));

  const lobeTrendItems = lobes.map((l) => ({
    key: l.key, label: l.label, score: l.score ?? 0,
  }));

  const subtitle = format(t(language, history.length === 1 ? 'assessmentsOnRecordOne' : 'assessmentsOnRecordOther'), { count: history.length });
  const overallChartLabel = t(language, 'overallScoreTrendChartLabel');
  const lobarChartLabel = t(language, 'lobarFunctionChartLabel');

  return (
    <SectionCard title={t(language, 'longitudinalProgressTitle')} subtitle={subtitle}>
      <div className="nmdd-longitudinal">
        <div className="nmdd-longitudinal__chart">
          <h3 className="nmdd-subheading">{t(language, 'overallScoreTrendHeading')}</h3>
          <LineChart series={history.map((h) => ({ date: h.date, score: h.overallRawScore }))} label={overallChartLabel} />
          <TrendIndicator trend={trend.overall.trend} delta={trend.overall.delta} language={language} />
        </div>

        <div className="nmdd-longitudinal__row">
          <div>
            <h3 className="nmdd-subheading">{t(language, 'visualMemoryTrendHeading')}</h3>
            <TrendIndicator trend={trend.visualMemory.trend} delta={trend.visualMemory.delta} language={language} />
          </div>
          <div>
            <h3 className="nmdd-subheading">{t(language, 'speechTrendHeading')}</h3>
            <TrendIndicator trend={trend.speech.trend} delta={trend.speech.delta} language={language} />
          </div>
        </div>

        <div>
          <h3 className="nmdd-subheading">{t(language, 'lobarFunctionCurrentSessionHeading')}</h3>
          <BarChart items={lobeTrendItems} colorFor={(item) => BAND_COLOR[lobes.find((l) => l.key === item.key)?.band] || 'var(--nmdd-accent)'} label={lobarChartLabel} />
        </div>

        <div className="nmdd-longitudinal__domain-trends">
          <h3 className="nmdd-subheading">{t(language, 'domainWiseTrendHeading')}</h3>
          <ul className="nmdd-trend-list">
            {domains.map((d) => (
              <li key={d.key}>
                <span>{d.label}</span>
                <TrendIndicator trend={trend.domains[d.key]?.trend} delta={trend.domains[d.key]?.delta} language={language} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </SectionCard>
  );
}
