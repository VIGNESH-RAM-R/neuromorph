import ImagePairsCard from './ImagePairsCard';

/**
 * Pure presentational grid. Card order follows `cards[].position` (assigned
 * once at deck-build time) so the layout never reshuffles mid-session —
 * spec section 12: "No shuffle during the active test."
 */
export default function ImagePairsCardGrid({ cards, gridCols, onSelect, isEvaluating }) {
  const ordered = [...cards].sort((a, b) => a.position - b.position);

  return (
    <div
      className="ip-card-grid"
      style={{ '--ip-grid-cols': gridCols }}
      role="group"
      aria-label="Image pairs card grid"
    >
      {ordered.map((card) => (
        <ImagePairsCard key={card.cardId} card={card} onSelect={onSelect} disabled={isEvaluating} />
      ))}
    </div>
  );
}
