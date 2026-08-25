import SequenceBoard from './SequenceBoard';
import TrialProgress from './TrialProgress';

const STATUS_TEXT = {
  watch: 'WATCH THE SEQUENCE',
  remember: 'REMEMBER THE SEQUENCE',
  repeat: 'REPEAT THE SEQUENCE',
  'trial-complete': 'Next sequence…',
};

/**
 * Shared presentational layout for a running trial (branded header + board
 * + status + progress). Used by both the practice round and the actual
 * assessment, so the "Color Sequence" branding only lives in one place —
 * each caller supplies its own useSequenceEngine instance so their trial
 * data never mixes.
 */
export default function SequenceTrialView({ engine, roundLabel }) {
  const { phase, trialNumber, totalTrials, currentSpec, activeStimulusId, lastTappedId, tapCount, respond } = engine;
  const interactive = phase === 'repeat';
  const statusText = STATUS_TEXT[phase] || ' ';

  return (
    <div className="seq-game-area">
      <div className="seq-game-header">
        <span className="oddball-eyebrow">NEUROMORPH</span>
        <h2 className="seq-game-title">
          <span className="seq-game-title-main">Color</span>
          <span className="seq-game-title-sub">Sequence</span>
        </h2>
        <p className="seq-game-domain-text">Working Memory &bull; Attention &bull; Concentration</p>
      </div>

      <TrialProgress
        roundLabel={roundLabel}
        trialNumber={trialNumber}
        totalTrials={totalTrials}
        sequenceLength={currentSpec?.sequenceLength}
        phase={phase}
        tapCount={tapCount}
      />

      <p className="seq-status-text" aria-live="polite">
        {statusText}
      </p>

      <SequenceBoard
        activeStimulusId={activeStimulusId}
        lastTappedId={lastTappedId}
        interactive={interactive}
        onRespond={respond}
        presenting={phase === 'watch'}
      />

      <p className="seq-hint">
        {phase === 'repeat' ? 'Tap the colors in the same order.' : 'Stay focused and take your time.'}
      </p>
    </div>
  );
}
