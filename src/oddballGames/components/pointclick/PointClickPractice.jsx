import { useEffect, useRef } from 'react';
import PointClickTrialView from './PointClickTrialView';
import { useTargetClickEngine } from '../../hooks/useTargetClickEngine';
import { POINT_CLICK_CONFIG } from '../../config/pointClickConfig';
import { generatePracticeTrials } from '../../utils/pointClickTrialGenerator';

/**
 * Short practice round on its own engine instance, so practice trial data
 * is structurally separate from — and never mixed into — actual assessment
 * metrics. Not scored or stored.
 */
export default function PointClickPractice({ onPracticeComplete }) {
  const trialsRef = useRef(null);
  if (trialsRef.current === null) {
    trialsRef.current = generatePracticeTrials(POINT_CLICK_CONFIG.practiceTrials, POINT_CLICK_CONFIG);
  }

  const engine = useTargetClickEngine({
    onSequenceComplete: () => onPracticeComplete(),
  });

  useEffect(() => {
    engine.start(trialsRef.current, POINT_CLICK_CONFIG);
    return () => engine.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="oddball-screen pc-screen pc-screen--game">
      <span className="oddball-eyebrow">PRACTICE</span>
      <PointClickTrialView engine={engine} roundLabel="Practice" />
    </div>
  );
}
