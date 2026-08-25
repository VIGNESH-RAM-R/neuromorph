/**
 * Orientation only — round number, current sequence length, and (during
 * REPEAT) taps collected so far. Deliberately not a countdown timer: the
 * task measures sequential memory, not time pressure.
 */
export default function TrialProgress({ roundLabel, trialNumber, totalTrials, sequenceLength, phase, tapCount }) {
  return (
    <div className="seq-progress-row">
      <span className="seq-progress-chip">
        {roundLabel} {trialNumber} / {totalTrials}
      </span>
      {sequenceLength ? (
        <span className="seq-progress-chip">SEQUENCE LENGTH: {sequenceLength}</span>
      ) : null}
      {phase === 'repeat' && sequenceLength ? (
        <span className="seq-progress-chip seq-progress-chip--active">
          TAPS: {tapCount} / {sequenceLength}
        </span>
      ) : null}
    </div>
  );
}
