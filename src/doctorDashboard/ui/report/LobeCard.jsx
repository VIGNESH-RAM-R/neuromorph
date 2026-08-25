import StatusBadge from '../shared/StatusBadge.jsx';

export default function LobeCard({ lobe }) {
  return (
    <div className="nmdd-lobecard">
      <div className="nmdd-lobecard__header">
        <h3 className="nmdd-lobecard__title">{lobe.label}</h3>
        <StatusBadge band={lobe.band} size="sm" />
      </div>
      <div className="nmdd-lobecard__score">{lobe.score ?? '—'}</div>
      <div className="nmdd-lobecard__section">
        <span className="nmdd-kv__label">Primary Functions</span>
        <ul className="nmdd-taglist">
          {lobe.primaryFunctions.map((f) => <li key={f} className="nmdd-tag nmdd-tag--muted">{f}</li>)}
        </ul>
      </div>
      <div className="nmdd-lobecard__section">
        <span className="nmdd-kv__label">Contributing Tasks</span>
        {lobe.contributingTasks.length > 0 ? (
          <ul className="nmdd-tasklist">
            {lobe.contributingTasks.map((t) => <li key={t}>{t}</li>)}
          </ul>
        ) : (
          <p className="nmdd-muted">No tasks from this lobe were administered this session.</p>
        )}
      </div>
      <p className="nmdd-lobecard__explanation">{lobe.explanation}</p>
    </div>
  );
}
