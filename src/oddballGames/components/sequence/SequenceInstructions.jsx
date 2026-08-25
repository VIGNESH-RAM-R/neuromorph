import { SEQUENCE_BOARD_LAYOUT } from '../../config/sequenceConfig';
import TitleDecoLine from './TitleDecoLine';

/* Icon colors below are tuned for this screen's dark glass card only —
 * these components aren't shared elsewhere, so it's safe to keep the
 * palette local rather than parameterizing it. */
function EyeIcon() {
  return (
    <svg viewBox="0 0 40 40" width="30" height="30" aria-hidden="true">
      <path
        d="M4 20c4-8 12-12 16-12s12 4 16 12c-4 8-12 12-16 12S8 28 4 20z"
        fill="none"
        stroke="#7DB2FF"
        strokeWidth="2.2"
      />
      <circle cx="20" cy="20" r="5.5" fill="#C4B5FD" />
    </svg>
  );
}

function BrainMiniIcon() {
  return (
    <svg viewBox="0 0 40 40" width="30" height="30" aria-hidden="true">
      <path
        d="M12 16c0-4 3-6.5 8-6.5s8 2.5 8 6.5c2.5 0.5 4 3 4 5.5 0 3-2 5-4.5 5.5 0 3-2.5 5.5-7.5 5.5s-7.5-2.5-7.5-5.5C10 26.5 8 24.5 8 21.5c0-2.5 1.5-5 4-5.5z"
        fill="none"
        stroke="#C4B5FD"
        strokeWidth="2"
      />
    </svg>
  );
}

function HandTapIcon() {
  return (
    <svg viewBox="0 0 40 40" width="30" height="30" aria-hidden="true">
      <circle cx="20" cy="20" r="7" fill="none" stroke="#7DB2FF" strokeWidth="2" />
      <circle cx="20" cy="20" r="13" fill="none" stroke="#C4B5FD" strokeWidth="1.6" strokeDasharray="3 4" />
    </svg>
  );
}

/** Miniature, non-interactive 4x4 grid preview used inside each of the 4
 * stage columns below. `dimmed` mutes every tile except the ones listed in
 * `activeIndices` (illustrating "this is the color currently being shown /
 * remembered"). `tapMarks` overlays small numbered badges on top of tiles
 * to illustrate tap order during the "Repeating" stage. */
function MiniGrid({ dimmed = false, activeIndices = [], tapMarks = [] }) {
  return (
    <div className="seq-htp-grid" aria-hidden="true">
      {SEQUENCE_BOARD_LAYOUT.map((color, i) => {
        const isActive = !dimmed || activeIndices.includes(i);
        const tap = tapMarks.find((t) => t.index === i);
        return (
          <span
            key={i}
            className={`seq-htp-tile seq-htp-tile--${color} ${isActive ? '' : 'seq-htp-tile--dim'}`}
          >
            {tap && <span className="seq-htp-tap">{tap.order}</span>}
          </span>
        );
      })}
    </div>
  );
}

const STAGES = [
  {
    num: 1,
    icon: <EyeIcon />,
    title: 'Watching',
    caption: 'Observe the sequence.',
    dimmed: false,
  },
  {
    num: 2,
    icon: <BrainMiniIcon />,
    title: 'Remembering',
    caption: 'Remember the order.',
    dimmed: true,
    activeIndices: [0],
  },
  {
    num: 3,
    icon: <BrainMiniIcon />,
    title: 'Remembering',
    caption: 'Continue remembering.',
    dimmed: true,
    activeIndices: [0, 5],
  },
  {
    num: 4,
    icon: <HandTapIcon />,
    title: 'Repeating',
    caption: 'Tap the colors in the same order.',
    dimmed: true,
    activeIndices: [0, 5, 10],
    tapMarks: [
      { index: 0, order: 1 },
      { index: 5, order: 2 },
      { index: 10, order: 3 },
    ],
  },
];

/**
 * Shown once, right after the participant clicks "Start Assessment" on
 * Welcome, and before Practice. This is the only explanation screen in the
 * flow — there is no separate "How It Works" preview elsewhere.
 */
export default function SequenceInstructions({ onContinue, onBack }) {
  return (
    <div className="oddball-screen seq-screen seq-screen--instructions">
      <div className="seq-htp-title-row">
        <TitleDecoLine />
        <h1 className="seq-htp-title">How To Play</h1>
        <TitleDecoLine flip />
      </div>
      <p className="seq-htp-desc">
        Watch the demonstration below to understand how the Color Sequence game works.
      </p>

      <div className="seq-htp-panel">
        <div className="seq-htp-stages">
          {STAGES.map((stage, i) => [
            i > 0 && (
              <span className="seq-htp-stage-arrow" aria-hidden="true" key={`arrow-${stage.num}`}>
                &rarr;
              </span>
            ),
            <div className="seq-htp-stage" key={stage.num}>
              <span className="seq-htp-step-num">{stage.num}</span>
              <span className="seq-htp-stage-icon">{stage.icon}</span>
              <span className="seq-htp-stage-title">{stage.title}</span>
              <MiniGrid
                dimmed={stage.dimmed}
                activeIndices={stage.activeIndices}
                tapMarks={stage.tapMarks}
              />
              <p className="seq-htp-stage-caption">{stage.caption}</p>
            </div>,
          ])}
        </div>
      </div>

      <div className="seq-htp-example">
        <div className="seq-htp-example-row">
          <span className="seq-htp-example-dot seq-htp-example-dot--red" />
          <span className="seq-htp-example-arrow">&rarr;</span>
          <span className="seq-htp-example-dot seq-htp-example-dot--green" />
          <span className="seq-htp-example-arrow">&rarr;</span>
          <span className="seq-htp-example-dot seq-htp-example-dot--blue" />
        </div>
        <p className="seq-htp-example-caption">
          Example order: <span className="seq-htp-word--red">Red</span> &rarr;{' '}
          <span className="seq-htp-word--green">Green</span> &rarr;{' '}
          <span className="seq-htp-word--blue">Blue</span>
        </p>
      </div>

      <div className="seq-cs-actions">
        <button className="seq-cs-btn seq-cs-btn--primary" onClick={onContinue}>
          <span className="seq-cs-btn-arrow" aria-hidden="true">
            &#9654;
          </span>
          Continue
        </button>
        {onBack && (
          <button className="seq-cs-btn seq-cs-btn--secondary" onClick={onBack}>
            <span aria-hidden="true">&larr;</span> Back
          </button>
        )}
      </div>
    </div>
  );
}
