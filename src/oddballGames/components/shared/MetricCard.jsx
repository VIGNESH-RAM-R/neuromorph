/**
 * Generic result-summary card, shared across Neuromorph modules. Renders a
 * label, a value with optional unit, and an optional sublabel (e.g. a rate
 * next to a raw count). Value of null/undefined displays as "—" rather
 * than crashing or showing NaN.
 */
export default function MetricCard({ label, value, unit, sublabel, tone = 'neutral', icon }) {
  const display = value === null || value === undefined ? '—' : value;
  return (
    <div className={`oddball-metric-card oddball-metric-card--${tone}`}>
      <span className="oddball-metric-header-row">
        {icon && (
          <span className="oddball-metric-icon-badge">
            <img src={icon} alt="" className="oddball-metric-icon" />
          </span>
        )}
        <span className="oddball-metric-label">{label}</span>
      </span>
      <span className="oddball-metric-value">
        {display}
        {value !== null && value !== undefined && unit ? (
          <span className="oddball-metric-unit"> {unit}</span>
        ) : null}
      </span>
      {sublabel && <span className="oddball-metric-sublabel">{sublabel}</span>}
    </div>
  );
}
