import SequenceButton from './SequenceButton';
import { SEQUENCE_BOARD_LAYOUT } from '../../config/sequenceConfig';

/**
 * Fixed 4x4 board (16 tiles, each of the 4 colors repeated 4 times — see
 * SEQUENCE_BOARD_LAYOUT). Tile positions never change during an
 * assessment. Every tile of a given color is an equally valid tap for that
 * color, since the underlying task only manipulates sequence length, not
 * position — `onRespond` always receives the tile's logical color, exactly
 * as it did with the old 4-button board, so useSequenceEngine needs no
 * changes at all.
 */
export default function SequenceBoard({ activeStimulusId, lastTappedId, interactive, onRespond, presenting }) {
  return (
    <div className={`seq-board${presenting ? ' seq-board--presenting' : ''}`}>
      {SEQUENCE_BOARD_LAYOUT.map((colorId, i) => (
        <SequenceButton
          key={i}
          colorId={colorId}
          active={activeStimulusId === colorId}
          pressed={lastTappedId === colorId}
          interactive={interactive}
          onPress={onRespond}
        />
      ))}
    </div>
  );
}
