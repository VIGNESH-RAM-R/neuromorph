import ImagePairsCardGrid from './ImagePairsCardGrid';

function formatTime(ms) {
  if (ms == null) return null;
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Shared header + grid layout used by both the practice round and the
 * scored assessment. The header shows PAIRS always, and TIME only when a
 * duration limit is configured (practice is untimed). An optional Exit
 * control is shown only during the scored assessment (spec section 35) —
 * it always routes through the caller's interruption handling rather than
 * silently leaving.
 */
export default function ImagePairsBoard({
  eyebrow,
  title,
  timeRemainingMs,
  pairsFound,
  totalPairs,
  cards,
  gridCols,
  onSelect,
  isEvaluating,
  onExit,
}) {
  const timeLabel = formatTime(timeRemainingMs);
  const lowTime = timeRemainingMs != null && timeRemainingMs <= 15000;

  return (
    <div className="ip-board-shell">
      <div className="ip-game-header">
        <div>
          <span className="oddball-eyebrow">{eyebrow}</span>
          <span className="oddball-game-title">{title}</span>
        </div>
        <div className="ip-game-header-right">
          {timeLabel && (
            <span className={`oddball-timer${lowTime ? ' ip-timer--low' : ''}`} aria-live="polite">
              TIME&nbsp;{timeLabel}
            </span>
          )}
          <span className="ip-pairs-counter" aria-live="polite">
            PAIRS&nbsp;{pairsFound}/{totalPairs}
          </span>
          {onExit && (
            <button type="button" className="pc-pause-btn" onClick={onExit}>
              Exit
            </button>
          )}
        </div>
      </div>

      <ImagePairsCardGrid cards={cards} gridCols={gridCols} onSelect={onSelect} isEvaluating={isEvaluating} />
    </div>
  );
}
