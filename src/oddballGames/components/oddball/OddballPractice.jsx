import { useEffect, useRef } from 'react';
import OddballStimulus from './OddballStimulus';
import { useOddballEngine } from '../../hooks/useOddballEngine';
import { ODDBALL_CONFIG } from '../../config/oddballConfig';
import { generatePracticeSequence } from '../../utils/oddballTrialGenerator';
import iconEye from '../../assets/icons/oddball-howto/oddball-icon-eye.png';

/**
 * Short practice round. Runs entirely on its own engine instance so
 * practice trial data is structurally separate from — and never mixed
 * into — actual assessment metrics.
 */
export default function OddballPractice({ onPracticeComplete }) {
  const trialsRef = useRef(null);
  if (trialsRef.current === null) {
    trialsRef.current = generatePracticeSequence();
  }

  const engine = useOddballEngine({
    onSequenceComplete: () => onPracticeComplete(),
  });

  useEffect(() => {
    engine.start(trialsRef.current, ODDBALL_CONFIG);
    return () => engine.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const interactive = engine.phase === 'stimulus' || engine.phase === 'blank';
  const showFixation = engine.phase === 'fixation';
  const showShape = engine.phase === 'stimulus';

  return (
    <div className="oddball-screen oddball-screen--game">
      <div className="oddball-game-header">
        <span className="oddball-eyebrow">PRACTICE</span>
        <span className="oddball-trial-count">
          Trial {Math.min(engine.trialNumber, engine.totalTrials || ODDBALL_CONFIG.practiceTrials)} /{' '}
          {engine.totalTrials || ODDBALL_CONFIG.practiceTrials}
        </span>
      </div>

      <OddballStimulus
        stimulusType={showShape ? engine.activeStimulusType : null}
        fixation={showFixation}
        interactive={interactive}
        onRespond={engine.respond}
      />

      <p className="oddball-hint">
        <img src={iconEye} alt="" className="oddball-hint-icon" />
        Keep watching. Tap only the <strong className="oddball-hint-kw">target</strong>.
      </p>
    </div>
  );
}
