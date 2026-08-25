import SectionCard from '../shared/SectionCard.jsx';
import LobeCard from './LobeCard.jsx';

export default function LobarFunctionAnalysis({ lobes }) {
  return (
    <SectionCard
      title="Lobar Function Analysis"
      subtitle="Observed functional performance mapped to lobe -- not a lesion localization or diagnosis"
    >
      <div className="nmdd-lobe-grid">
        {lobes.map((lobe) => (
          <LobeCard key={lobe.key} lobe={lobe} />
        ))}
      </div>
    </SectionCard>
  );
}
