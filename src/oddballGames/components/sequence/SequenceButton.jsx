import { STIMULUS_LABELS } from '../../config/sequenceConfig';

/**
 * A single color button on the 2x2 board. Purely presentational — all
 * timing/validity decisions (whether a tap should register) live in
 * useSequenceEngine; `interactive` just reflects that decision visually
 * and blocks the click handler as a second line of defense.
 */
export default function SequenceButton({ colorId, active, pressed, interactive, onPress }) {
  const classes = [
    'seq-button',
    `seq-button--${colorId}`,
    active ? 'seq-button--active' : '',
    pressed ? 'seq-button--pressed' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={classes}
      onClick={() => {
        if (interactive) onPress(colorId);
      }}
      disabled={!interactive}
      aria-label={STIMULUS_LABELS[colorId]}
    />
  );
}
