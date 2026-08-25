import { useEffect, useMemo, useRef, useState } from 'react';
import OddballStimulus from './OddballStimulus';
import { useOddballEngine } from '../../hooks/useOddballEngine';
import { ODDBALL_CONFIG } from '../../config/oddballConfig';
import { formatTimeRemaining } from '../../utils/oddballTiming';
import iconEye from '../../assets/icons/oddball-howto/oddball-icon-eye.png';

/**
 * The actual, scored assessment screen. Trial flow is entirely governed by
 * useOddballEngine; the on-screen timer is a display-only estimate and
 * never influences trial timing or when the sequence ends (the sequence
 * ends when all generated trials have run).
 */
export default function OddballGame({ trials, onAssessmentComplete }) {
  const trialRecordsRef = useRef([]);
  const [elapsedMs, setElapsedMs] = useState(0);
  const startWallClockRef = useRef(null);
  const intervalRef = useRef(null);

  const estimatedTotalMs = useMemo(() => {
    const avgFixation = (ODDBALL_CONFIG.fixationMinMs + ODDBALL_CONFIG.fixationMaxMs) / 2;
    const avgIti = (ODDBALL_CONFIG.itiMinMs + ODDBALL_CONFIG.itiMaxMs) / 2;
    const perTrial = avgFixation + ODDBALL_CONFIG.responseWindowMs + avgIti;
    return Math.round(perTrial * trials.length);
  }, [trials.length]);

  const engine = useOddballEngine({
    onTrialRecorded: (record) => {
      trialRecordsRef.current = [...trialRecordsRef.current, record];
    },
    onSequenceComplete: () => {
      onAssessmentComplete(trialRecordsRef.current);
    },
  });

  useEffect(() => {
    trialRecordsRef.current = [];
    engine.start(trials, ODDBALL_CONFIG);

    startWallClockRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      setElapsedMs(Date.now() - startWallClockRef.current);
    }, 250);

    return () => {
      engine.stop();
      clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const remainingMs = Math.max(0, estimatedTotalMs - elapsedMs);
  const progress = engine.totalTrials
    ? Math.min(100, Math.round((engine.trialNumber / engine.totalTrials) * 100))
    : 0;

  const interactive = engine.phase === 'stimulus' || engine.phase === 'blank';
  const showFixation = engine.phase === 'fixation';
  const showShape = engine.phase === 'stimulus';

  return (
    <div className="oddball-screen oddball-screen--game oddball-screen--focus">
      <div className="oddball-game-header">
        <div>
          <span className="oddball-eyebrow">NEUROMORPH</span>
          <span className="oddball-game-title">Attention Test</span>
        </div>
        <span className="oddball-timer" aria-label="Estimated time remaining">
          {formatTimeRemaining(remainingMs)}
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

      <div className="oddball-progress-track" aria-label="Assessment progress">
        <div className="oddball-progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <span className="oddball-progress-label">
        Trial{' '}
        <strong className="oddball-progress-count">
          {Math.min(engine.trialNumber, engine.totalTrials || trials.length)}
        </strong>{' '}
        / {engine.totalTrials || trials.length}
      </span>
    </div>
  );
}
