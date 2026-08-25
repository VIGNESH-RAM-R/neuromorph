import { useEffect, useRef } from 'react';
import SequenceTrialView from './SequenceTrialView';
import { useSequenceEngine } from '../../hooks/useSequenceEngine';
import { SEQUENCE_TIMING, PRACTICE_SEQUENCE_LENGTHS } from '../../config/sequenceConfig';
import { buildPracticeSpecs } from '../../utils/sequenceGenerator';

/**
 * Short practice round on its own engine instance, so practice trial data
 * is structurally separate from — and never mixed into — actual assessment
 * metrics. Not scored or stored.
 */
export default function SequencePractice({ onPracticeComplete, onInterrupted }) {
  const specsRef = useRef(null);
  if (specsRef.current === null) {
    specsRef.current = buildPracticeSpecs(PRACTICE_SEQUENCE_LENGTHS);
  }

  const engine = useSequenceEngine({
    onSequenceComplete: () => onPracticeComplete(),
    onInterrupted,
  });

  useEffect(() => {
    engine.start(specsRef.current, SEQUENCE_TIMING);
    return () => engine.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="oddball-screen seq-screen seq-screen--game">
      <SequenceTrialView engine={engine} roundLabel="PRACTICE" />
    </div>
  );
}
