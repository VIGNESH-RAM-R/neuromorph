/** One top-level domain card (Memory / Attention / Reaction). Clicking it
 * (or its "View Assessments" action) opens that domain's own screen, where
 * its games actually live — this card never shows game names itself. */
export default function DomainCard({ accent, icon, illustration, name, description, onOpen }) {
  return (
    <button
      type="button"
      className={`dash-domain-card dash-domain-card--${accent}`}
      onClick={onOpen}
    >
      <span className="dash-domain-illustration">{illustration}</span>
      <span className="dash-domain-icon">{icon}</span>
      <span className="dash-domain-name">{name}</span>
      <p className="dash-domain-desc">{description}</p>
      <span className="dash-domain-cta">View Assessments &rarr;</span>
    </button>
  );
}
