import { useEffect, useRef, useState } from 'react';
import ImagePairsIcon from './ImagePairsIcon';

function BackMotif() {
  return (
    <svg viewBox="0 0 40 40" width="30%" height="30%" aria-hidden="true">
      <path
        d="M20 3l4.5 10.2L35 15l-8 7.6L29 34l-9-5.6L11 34l2-11.4-8-7.6 10.5-1.8z"
        fill="rgba(255,255,255,0.9)"
      />
    </svg>
  );
}

/**
 * A single memory card. Deliberately does NOT use a 3D backface-visibility
 * CSS flip — that trick is unreliable inside a <button> element across
 * browsers/renderers (it can silently paint both faces stacked, showing
 * only the top one). Instead the correct face is chosen directly from
 * React state (guaranteed correct in every environment), with a short
 * horizontal-squash animation on state change to keep the "flip" feel.
 *
 * Interaction is intentionally reduced to a single click/tap target with
 * no drag, no hover-based hints, and no feedback beyond the flip +
 * matched/mismatched state itself (spec sections 13-15, 38-40). `disabled`
 * covers "not currently selectable" for reasons other than the card's own
 * status (e.g. two cards are already being evaluated, or the session ended).
 */
export default function ImagePairsCard({ card, onSelect, disabled }) {
  const { cardId, stimulusId, iconId, label, status } = card;
  const isInteractive = status === 'hidden' && !disabled;
  const isFlipped = status === 'revealed' || status === 'matched';

  const [animating, setAnimating] = useState(false);
  const prevFlipped = useRef(isFlipped);
  useEffect(() => {
    if (prevFlipped.current !== isFlipped) {
      prevFlipped.current = isFlipped;
      setAnimating(true);
      const id = setTimeout(() => setAnimating(false), 300);
      return () => clearTimeout(id);
    }
  }, [isFlipped]);

  return (
    <button
      type="button"
      className={`ip-card ip-card--${status}${animating ? ' ip-card--flipping' : ''}`}
      onClick={() => onSelect(cardId)}
      disabled={!isInteractive}
      aria-label={isFlipped ? label : 'Hidden card'}
      aria-pressed={isFlipped}
      data-card-id={cardId}
      data-stimulus-id={stimulusId}
      data-status={status}
    >
      <span className="ip-card-face">
        {isFlipped ? <ImagePairsIcon iconId={iconId} className="ip-card-icon" /> : <BackMotif />}
      </span>
    </button>
  );
}
