import { useEffect, useRef, useState } from 'react';
import ImagePairsBoard from './ImagePairsBoard';
import { useImagePairsEngine } from '../../hooks/useImagePairsEngine';
import { buildDeck } from '../../utils/imagePairsGenerator';
import { validateDeck } from '../../utils/imagePairsValidation';
import { IMAGE_PAIRS_CONFIG, IMAGE_PAIRS_STIMULI } from '../../config/imagePairsConfig';

/**
 * The scored assessment. Builds one fixed, validated deck for the session
 * (spec section 53 — the assessment never starts on a malformed deck),
 * then hands everything else to useImagePairsEngine. Ends when either all
 * 8 pairs are matched or the 90-second limit is reached; both paths report
 * through the same onAssessmentComplete callback with the full raw engine
 * state, so the results screen can distinguish completion reason.
 */
export default function ImagePairsGame({ onAssessmentComplete, onInterrupted }) {
  const [deckError, setDeckError] = useState(null);
  const deckRef = useRef(null);
  if (deckRef.current === null) {
    const built = buildDeck(IMAGE_PAIRS_STIMULI);
    const validation = validateDeck(built.cards, IMAGE_PAIRS_CONFIG.totalPairs);
    deckRef.current = { ...built, validation };
  }

  const engine = useImagePairsEngine({
    onComplete: (finalState) => {
      if (finalState.completionReason === 'INTERRUPTED') {
        onInterrupted?.();
      } else {
        onAssessmentComplete(finalState, deckRef.current.seed);
      }
    },
  });

  useEffect(() => {
    if (!deckRef.current.validation.valid) {
      setDeckError(deckRef.current.validation.errors.join('; '));
      return;
    }
    engine.start(deckRef.current.cards, IMAGE_PAIRS_CONFIG);
    return () => engine.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (deckError) {
    return (
      <div className="oddball-screen ip-screen">
        <h1 className="oddball-heading">Unable to start assessment</h1>
        <p className="oddball-lead">
          A problem was found with the stimulus set before the assessment could begin, so it was not
          started. Please return to the dashboard and try again.
        </p>
        <p className="oddball-hint">{deckError}</p>
      </div>
    );
  }

  return (
    <div className="oddball-screen ip-screen ip-screen--game">
      <ImagePairsBoard
        eyebrow="IMAGE PAIRS"
        title="Memory Assessment"
        timeRemainingMs={engine.timeRemainingMs}
        pairsFound={engine.state.matchedPairs}
        totalPairs={engine.state.totalPairs}
        cards={engine.state.cards}
        gridCols={IMAGE_PAIRS_CONFIG.gridCols}
        onSelect={engine.selectCard}
        isEvaluating={engine.state.phase === 'evaluating'}
        onExit={engine.interrupt}
      />
    </div>
  );
}
