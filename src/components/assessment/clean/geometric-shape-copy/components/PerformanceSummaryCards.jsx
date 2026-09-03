export default function PerformanceSummaryCards({ resultModel }) {
  if (!resultModel) return null;
  const cards = [
    { label: 'Cognitive score', value: resultModel.cognitiveScore.toFixed(1) },
    { label: 'Constructional praxis', value: resultModel.constructionalPraxisScore.toFixed(1) },
    { label: 'Visuospatial', value: resultModel.visuospatialScore.toFixed(1) },
    { label: 'Motor planning', value: resultModel.motorPlanningScore.toFixed(1) },
    { label: 'Processing speed', value: resultModel.processingSpeedScore.toFixed(1) },
    { label: 'Easy tier accuracy', value: resultModel.easyTierAccuracy != null ? resultModel.easyTierAccuracy.toFixed(1) : 'N/A' },
    { label: 'Medium tier accuracy', value: resultModel.mediumTierAccuracy != null ? resultModel.mediumTierAccuracy.toFixed(1) : 'N/A' },
    { label: 'Hard tier accuracy', value: resultModel.hardTierAccuracy != null ? resultModel.hardTierAccuracy.toFixed(1) : 'N/A' },
    { label: 'Figures completed', value: `${resultModel.figuresCompleted}/${resultModel.figuresPresented}` },
    { label: 'Timed out', value: resultModel.figuresTimedOut },
    { label: 'Not administered', value: resultModel.figuresNotAdministered },
    { label: 'Avg response time', value: resultModel.avgResponseTimeMs != null ? `${Math.round(resultModel.avgResponseTimeMs / 100) / 10}s` : 'N/A' }
  ];
  return (
    <div className="gsc-card-grid">
      {cards.map((c) => (
        <div className="gsc-card" key={c.label}>
          <div className="gsc-card-value">{c.value}</div>
          <div className="gsc-card-label">{c.label}</div>
        </div>
      ))}
    </div>
  );
}
