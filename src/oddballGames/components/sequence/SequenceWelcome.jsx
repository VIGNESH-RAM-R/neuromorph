import { CalendarIcon } from '../dashboard/icons';
import { SEQUENCE_BOARD_LAYOUT } from '../../config/sequenceConfig';

/** Small circular "how this works" icon for the info panel below the color
 * grid. Colors are tuned for the dark glass card on this screen only —
 * this component isn't shared, so it's safe to keep the palette local. */
function BrainIcon() {
  return (
    <svg viewBox="0 0 64 64" width="34" height="34" aria-hidden="true">
      <circle cx="32" cy="32" r="28" fill="none" stroke="#7DB2FF" strokeWidth="2" opacity="0.4" />
      <path
        d="M20 26c0-6 5-10 12-10s12 4 12 10c4 1 6 5 6 9 0 5-3 8-7 9 0 5-4 9-11 9s-11-4-11-9c-4-1-7-4-7-9 0-4 2-8 6-9z"
        fill="none"
        stroke="#C4B5FD"
        strokeWidth="2.5"
      />
      <path d="M32 18v26M24 24c3 2 3 6 0 8M40 24c-3 2-3 6 0 8" fill="none" stroke="#C4B5FD" strokeWidth="2" />
    </svg>
  );
}

/** Fixed, non-interactive preview of the color-sequence tiles — purely
 * decorative on this welcome screen. Reuses the exact same 4x4 layout as
 * the real game board (SequenceBoard.jsx) so the preview matches actual
 * gameplay instead of showing a different arrangement. */
function ColorGridPreview() {
  return (
    <div className="seq-cs-grid" aria-hidden="true">
      {SEQUENCE_BOARD_LAYOUT.map((color, i) => (
        <div key={i} className={`seq-cs-tile seq-cs-tile--${color}`} />
      ))}
    </div>
  );
}

/**
 * Welcome screen. Clicking "Start Assessment" leads into the Instructions
 * ("How To Play") screen before Practice — there is no separate "How It
 * Works" preview button here, so the explanation is shown exactly once,
 * at the point the participant actually commits to starting.
 */
export default function SequenceWelcome({ onStart, onViewHistory, onBack }) {
  return (
    <div className="oddball-screen seq-screen seq-screen--welcome">
      <p className="oddball-eyebrow">NEUROMORPH</p>

      <h1 className="seq-cs-title">
        <span className="seq-cs-title-main">Color</span>
        <span className="seq-cs-title-sub">Sequence</span>
      </h1>

      <div className="seq-cs-domain-line">
        <span className="seq-cs-domain-text">Working Memory &bull; Attention &bull; Concentration</span>
      </div>

      <ColorGridPreview />

      <div className="seq-cs-info-panel">
        <span className="seq-cs-info-icon">
          <BrainIcon />
        </span>
        <div>
          <p className="seq-cs-info-title">Remember the sequence</p>
          <p className="seq-cs-info-text">
            Remember the order of the colors and reproduce the sequence by tapping them in the
            same order.
          </p>
        </div>
      </div>

      <div className="seq-cs-actions">
        <button className="seq-cs-btn seq-cs-btn--primary" onClick={onStart}>
          Start Assessment
          <span className="seq-cs-btn-arrow" aria-hidden="true">
            &rarr;
          </span>
        </button>
        {onBack && (
          <button className="seq-cs-btn seq-cs-btn--secondary" onClick={onBack}>
            <span aria-hidden="true">&larr;</span> Back
          </button>
        )}
      </div>

      {onViewHistory && (
        <button className="seq-cs-history-link" onClick={onViewHistory}>
          <CalendarIcon color="#C4B5FD" />
          View past assessments
        </button>
      )}
    </div>
  );
}
