import SectionCard from '../shared/SectionCard.jsx';
import DomainCard from './DomainCard.jsx';

export default function CognitiveDomainAnalysis({ domains }) {
  return (
    <SectionCard title="Cognitive Domain Analysis" subtitle="Summarized by domain, not by individual game">
      <div className="nmdd-domain-grid">
        {domains.map((d) => (
          <DomainCard key={d.key} domain={d} />
        ))}
      </div>
    </SectionCard>
  );
}
