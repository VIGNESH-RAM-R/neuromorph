import graphSparkline from '../../assets/graph-sparkline.webp';

/** One glassmorphic stat card in the hero (completed assessments / last
 * assessment date), each with an icon badge and a small decorative trend
 * graph. Purely presentational — all values are passed in as props. */
export default function SummaryCard({ icon, label, value, hint }) {
  return (
    <div className="dash-summary-card">
      <span className="dash-summary-icon">{icon}</span>
      <div className="dash-summary-body">
        <span className="dash-summary-label">{label}</span>
        <span className="dash-summary-value">{value}</span>
        <span className="dash-summary-hint">{hint}</span>
      </div>
      <span className="dash-summary-spark">
        <img src={graphSparkline} alt="" className="dash-summary-spark-img" />
      </span>
    </div>
  );
}
