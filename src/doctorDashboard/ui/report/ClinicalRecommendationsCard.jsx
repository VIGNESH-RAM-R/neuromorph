import SectionCard from '../shared/SectionCard.jsx';

export default function ClinicalRecommendationsCard({ recommendations }) {
  return (
    <SectionCard title="Clinical Recommendations" subtitle="Rule-based, evidence-informed -- never a diagnosis, never a medication">
      <ul className="nmdd-recommendation-list">
        {recommendations.map((r) => (
          <li key={r.key}>{r.text}</li>
        ))}
      </ul>
    </SectionCard>
  );
}
