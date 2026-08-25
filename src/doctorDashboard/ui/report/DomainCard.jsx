import StatusBadge from '../shared/StatusBadge.jsx';

export default function DomainCard({ domain }) {
  return (
    <div className="nmdd-domaincard">
      <div className="nmdd-domaincard__header">
        <span className="nmdd-domaincard__label">{domain.label}</span>
        <StatusBadge band={domain.band} size="sm" />
      </div>
      <div className="nmdd-domaincard__score">{domain.score ?? '—'}</div>
      <p className="nmdd-domaincard__interpretation">{domain.interpretation}</p>
    </div>
  );
}
