import { useEffect, useRef, useState } from 'react';
import ImagePairsBoard from './ImagePairsBoard';
import { useImagePairsEngine } from '../../hooks/useImagePairsEngine';
import { buildDeck } from '../../utils/imagePairsGenerator';
import { IMAGE_PAIRS_PRACTICE_CONFIG, IMAGE_PAIRS_PRACTICE_STIMULI } from '../../config/imagePairsConfig';

/**
 * Practice round on its own engine instance so practice data is
 * structurally separate from — and never mixed into — actual assessment
 * metrics (spec sections 10, 33). Uses a stimulus set disjoint from the
 * scored assessment and has no time limit; its purpose is teaching the
 * interaction, not measuring speed. "Try Again" rebuilds a fresh shuffled
 * practice deck without affecting the assessment in any way.
 */
export default function ImagePairsPractice({ onPracticeComplete, onInterrupted }) {
  const [deckVersion, setDeckVersion] = useState(0);
  const deckRef = useRef(null);
  if (deckRef.current === null || deckRef.current.version !== deckVersion) {
    deckRef.current = { version: deckVersion, deck: buildDeck(IMAGE_PAIRS_PRACTICE_STIMULI) };
  }

  const engine = useImagePairsEngine({
    onComplete: (finalState) => {
      if (finalState.completionReason === 'INTERRUPTED') {
        onInterrupted?.();
      } else {
        onPracticeComplete();
      }
    },
  });

  useEffect(() => {
    engine.start(deckRef.current.deck.cards, IMAGE_PAIRS_PRACTICE_CONFIG);
    return () => engine.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deckVersion]);

  const handleTryAgain = () => {
    engine.stop();
    setDeckVersion((v) => v + 1);
  };

  return (
    <div className="oddball-screen ip-screen ip-screen--game">
      <ImagePairsBoard
        eyebrow="PRACTICE"
        title="Find the matching pair"
        timeRemainingMs={null}
        pairsFound={engine.state.matchedPairs}
        totalPairs={engine.state.totalPairs}
        cards={engine.state.cards}
        gridCols={IMAGE_PAIRS_PRACTICE_CONFIG.gridCols}
        onSelect={engine.selectCard}
        isEvaluating={engine.state.phase === 'evaluating'}
      />
      <button className="oddball-link-btn" onClick={handleTryAgain}>
        Try Again
      </button>
    </div>
  );
}
