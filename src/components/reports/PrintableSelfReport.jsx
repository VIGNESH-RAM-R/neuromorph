import { bandFromScore, BAND_INTERPRETATION_TEMPLATES, NON_DIAGNOSTIC_DISCLAIMER } from '../../config/scoringBands.js';
import { LOBES } from '../../config/lobarConfig.js';

function average(values) {
  const numeric = values.filter((value) => typeof value === 'number');
  return numeric.length ? Math.round((numeric.reduce((sum, value) => sum + value, 0) / numeric.length) * 10) / 10 : null;
}

function changeFromPrevious(series) {
  if (series.length < 2) return null;
  const previous = series[series.length - 2]?.score;
  const latest = series[series.length - 1]?.score;
  return typeof previous === 'number' && typeof latest === 'number' ? latest - previous : null;
}

function PrintTrendChart({ title, series, color = '#4f46e5' }) {
  const data = series.filter((point) => typeof point.score === 'number').slice(-12);
  if (!data.length) return <div className="nmpa-print-empty">No recorded data is available for this reporting period.</div>;
  const width = 720;
  const height = 190;
  const pad = { left: 38, right: 16, top: 18, bottom: 34 };
  const plotWidth = width - pad.left - pad.right;
  const plotHeight = height - pad.top - pad.bottom;
  const pointFor = (point, index) => {
    const x = pad.left + (data.length === 1 ? plotWidth / 2 : (index / (data.length - 1)) * plotWidth);
    const y = pad.top + (1 - Math.max(0, Math.min(100, point.score)) / 100) * plotHeight;
    return { x, y };
  };
  const points = data.map(pointFor);
  const polyline = points.map(({ x, y }) => `${x},${y}`).join(' ');
  return (
    <figure className="nmpa-print-chart">
      <figcaption>{title}<span>Most recent {data.length} entries · score out of 100</span></figcaption>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={title}>
        {[0, 25, 50, 75, 100].map((value) => {
          const y = pad.top + (1 - value / 100) * plotHeight;
          return <g key={value}><line x1={pad.left} x2={width - pad.right} y1={y} y2={y} className="nmpa-print-chart__grid" /><text x="3" y={y + 4}>{value}</text></g>;
        })}
        <polyline points={polyline} className="nmpa-print-chart__line" style={{ stroke: color }} />
        {points.map(({ x, y }, index) => <circle key={data[index].date || index} cx={x} cy={y} r="3.5" style={{ fill: color }} />)}
        <text x={pad.left} y={height - 8}>{data[0].date}</text>
        <text x={width - pad.right} y={height - 8} textAnchor="end">{data[data.length - 1].date}</text>
      </svg>
    </figure>
  );
}

// Print-only layout for the "Download Monthly Report" workflow. Hidden on
// screen and expanded into a structured PDF-ready report by the browser's
// print destination.
export default function PrintableSelfReport({ self }) {
  if (!self) return null;
  const { name, patientId, age, streak, longestStreak, weeklyCognitiveScoreHistory = [], monthlyCognitiveScoreHistory = [], momentumHistory = [], weeklyAssessment = {}, domainBreakdown = [], pendingDomains = [], clinicalInsights = {} } = self;
  const latestScore = weeklyCognitiveScoreHistory.at(-1)?.score;
  const scoreChange = changeFromPrevious(weeklyCognitiveScoreHistory);
  const averageMomentum = average(momentumHistory.map((entry) => entry.score));
  const averageCompletion = average(momentumHistory.map((entry) => entry.completionPct));
  const measuredDomains = domainBreakdown.filter((domain) => domain.hasData);

  return (
    <div className="nmpa-print-report nmpa-print-only">
      <header className="nmpa-print-report__header">
        <div><p className="nmpa-print-kicker">Patient progress summary</p><h1>NEUROMORPH Monthly Progress Report</h1></div>
        <div className="nmpa-print-report__issued">Generated<br /><strong>{new Date().toLocaleDateString()}</strong></div>
      </header>
      <p className="nmpa-print-disclaimer">{NON_DIAGNOSTIC_DISCLAIMER}</p>

      <section className="nmpa-print-summary-grid">
        <div><span>Latest cognitive score</span><strong>{latestScore ?? '—'}</strong><small>{latestScore != null ? bandFromScore(latestScore) : 'No assessment recorded'}</small></div>
        <div><span>Change from prior</span><strong>{scoreChange == null ? '—' : `${scoreChange > 0 ? '+' : ''}${scoreChange}`}</strong><small>{scoreChange == null ? 'Need two assessments' : 'Score points'}</small></div>
        <div><span>Average momentum</span><strong>{averageMomentum ?? '—'}</strong><small>Across recorded days</small></div>
        <div><span>Average completion</span><strong>{averageCompletion == null ? '—' : `${averageCompletion}%`}</strong><small>Daily activity completion</small></div>
      </section>

      <h2>Patient</h2>
      <table className="nmpa-print-table">
        <tbody>
          <tr><td>Name</td><td>{name}</td></tr>
          <tr><td>Age</td><td>{age}</td></tr>
          <tr><td>Patient ID</td><td>{patientId}</td></tr>
          <tr><td>Current Streak</td><td>{streak} days (longest: {longestStreak})</td></tr>
          <tr><td>This Week's Assessment</td><td>{weeklyAssessment.status}</td></tr>
        </tbody>
      </table>

      <h2>Assessment Summary</h2>
      <table className="nmpa-print-table"><tbody>
        <tr><td>Latest assessment date</td><td>{weeklyCognitiveScoreHistory.at(-1)?.date || 'No assessment recorded'}</td></tr>
        <tr><td>Weekly assessment status</td><td>{weeklyAssessment.status || 'Unknown'}</td></tr>
        <tr><td>Next due date</td><td>{weeklyAssessment.dueDate || 'Not scheduled'}</td></tr>
        <tr><td>Current performance band</td><td>{latestScore == null ? 'Not available' : `${bandFromScore(latestScore)} — ${BAND_INTERPRETATION_TEMPLATES[bandFromScore(latestScore)]}`}</td></tr>
      </tbody></table>

      <h2>Cognitive Score Trends</h2>
      <PrintTrendChart title="Weekly cognitive score trend" series={weeklyCognitiveScoreHistory} />
      <PrintTrendChart title="Monthly cognitive score trend" series={monthlyCognitiveScoreHistory} color="#0891b2" />

      <h2>Weekly Cognitive Score History</h2>
      <table className="nmpa-print-table">
        <thead><tr><th>Date</th><th>Score</th></tr></thead>
        <tbody>
          {weeklyCognitiveScoreHistory.length ? weeklyCognitiveScoreHistory.slice(-12).reverse().map((h) => (
            <tr key={h.date}><td>{h.date}</td><td>{h.score}</td></tr>
          )) : <tr><td colSpan="2">No completed assessments recorded.</td></tr>}
        </tbody>
      </table>

      <h2>Daily Engagement Trend</h2>
      <PrintTrendChart title="Daily momentum score" series={momentumHistory} color="#7c3aed" />
      <h2>Daily Momentum Score History</h2>
      <table className="nmpa-print-table">
        <thead><tr><th>Date</th><th>Momentum Score</th><th>Completion %</th></tr></thead>
        <tbody>
          {momentumHistory.length ? momentumHistory.slice(-14).reverse().map((h) => (
            <tr key={h.date}><td>{h.date}</td><td>{h.score}</td><td>{h.completionPct}%</td></tr>
          )) : <tr><td colSpan="3">No daily activity recorded for this reporting period.</td></tr>}
        </tbody>
      </table>

      <h2>Domain Detail</h2>
      <table className="nmpa-print-table">
        <thead><tr><th>Domain</th><th>Latest score</th><th>Performance band</th><th>Change</th><th>Latest observation</th></tr></thead>
        <tbody>
          {measuredDomains.length ? measuredDomains.map((domain) => (
            <tr key={domain.domain}><td>{domain.label}</td><td>{domain.latestScore}</td><td>{domain.band}</td><td>{domain.percentChange == null ? '—' : `${domain.percentChange > 0 ? '+' : ''}${domain.percentChange}%`}</td><td>{domain.latestDate}</td></tr>
          )) : <tr><td colSpan="5">Domain-level data becomes available after completed assessments.</td></tr>}
          {pendingDomains.map((domain) => <tr key={domain.domain}><td>{domain.label}</td><td colSpan="4">Not yet measured by the current assessment set.</td></tr>)}
        </tbody>
      </table>

      <h2>Assessment Coverage</h2>
      <table className="nmpa-print-table"><thead><tr><th>Brain region</th><th>Structured tasks included</th></tr></thead><tbody>
        {LOBES.map((lobe) => <tr key={lobe.key}><td>{lobe.label}</td><td>{lobe.tasks.join(', ')}</td></tr>)}
      </tbody></table>

      <h2>Progress Notes</h2>
      {clinicalInsights.items?.length ? <ul className="nmpa-print-notes">{clinicalInsights.items.map((item) => <li key={item.domain}>{item.text}</li>)}</ul> : <p className="nmpa-print-empty">No notable pattern can be identified yet. Continue regular check-ins to establish a reliable trend.</p>}

      <p className="nmpa-print-disclaimer">
        {NON_DIAGNOSTIC_DISCLAIMER} This report summarizes task performance and engagement only and does not constitute a diagnosis of dementia or any other condition.
      </p>
    </div>
  );
}
