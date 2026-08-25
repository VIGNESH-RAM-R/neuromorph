import { useEffect, useRef } from 'react';
import SequenceTrialView from './SequenceTrialView';
import { useSequenceEngine } from '../../hooks/useSequenceEngine';
import { SEQUENCE_TIMING } from '../../config/sequenceConfig';

/**
 * The actual, scored assessment. Trial flow is entirely governed by
 * useSequenceEngine over the pre-built 6-trial spec list; this component
 * just accumulates trial records and reports completion / interruption.
 */
export default function SequenceAssessmentGame({ trials, onAssessmentComplete, onInterrupted }) {
  const trialRecordsRef = useRef([]);

  const engine = useSequenceEngine({
    onTrialRecorded: (record) => {
      trialRecordsRef.current = [...trialRecordsRef.current, record];
    },
    onSequenceComplete: () => onAssessmentComplete(trialRecordsRef.current),
    onInterrupted: () => onInterrupted?.(trialRecordsRef.current),
  });

  useEffect(() => {
    trialRecordsRef.current = [];
    engine.start(trials, SEQUENCE_TIMING);
    return () => engine.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="oddball-screen seq-screen seq-screen--game">
      <SequenceTrialView engine={engine} roundLabel="ROUND" />
    </div>
  );
}
