import { ClipboardIcon } from '../dashboard/icons';
import TitleDecoLine from './TitleDecoLine';
import { SEQUENCE_LEVELS } from '../../config/sequenceConfig';

/* Icon colors below are tuned for this screen's dark glass card only —
 * these components aren't shared elsewhere, so it's safe to keep the
 * palette local rather than parameterizing it. */
function EyeIcon() {
  return (
    <svg viewBox="0 0 40 40" width="20" height="20" aria-hidden="true">
      <path
        d="M4 20c4-8 12-12 16-12s12 4 16 12c-4 8-12 12-16 12S8 28 4 20z"
        fill="none"
        stroke="#7DB2FF"
        strokeWidth="2.4"
      />
      <circle cx="20" cy="20" r="5.5" fill="#C4B5FD" />
    </svg>
  );
}

function ChairIcon() {
  return (
    <svg viewBox="0 0 40 40" width="20" height="20" aria-hidden="true">
      <path d="M11 8v15M29 8v15" stroke="#7DB2FF" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M11 23h18" stroke="#C4B5FD" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M11 23v10M29 23v6" stroke="#7DB2FF" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

function MuteIcon() {
  return (
    <svg viewBox="0 0 40 40" width="20" height="20" aria-hidden="true">
      <path d="M8 16v8h6l9 7V9l-9 7H8z" fill="none" stroke="#7DB2FF" strokeWidth="2" strokeLinejoin="round" />
      <path d="M28 14L34 26M34 14L28 26" stroke="#C4B5FD" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function HandCursorIcon() {
  return (
    <svg viewBox="0 0 40 40" width="20" height="20" aria-hidden="true">
      <path
        d="M16 22V9.5a2 2 0 0 1 4 0V19M20 19v-3.5a2 2 0 0 1 4 0V19M24 19.5v-2a2 2 0 0 1 4 0V21M28 21v2c0 5-3 9-8 9h-2c-4 0-6-1.5-8-5l-3-6c-.7-1.4.4-3 2-3 .8 0 1.5.4 2 1l2 3"
        fill="none"
        stroke="#C4B5FD"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const READY_ITEMS = [
  { icon: <EyeIcon />, label: 'Screen visible and comfortable to view' },
  { icon: <ChairIcon />, label: 'Comfortable seated position' },
  { icon: <MuteIcon />, label: 'No major distractions nearby' },
  { icon: <HandCursorIcon />, label: 'Finger or mouse ready' },
];

const TOTAL_ROUNDS = SEQUENCE_LEVELS.reduce((n, level) => n + level.trials, 0);

/**
 * Shown once practice finishes and before the real, scored assessment
 * begins. `onBack` is optional and unused today — no destination for it is
 * currently wired from SequenceMemoryAssessment.jsx.
 */
export default function SequenceAssessmentIntro({ onBeginAssessment, onBack }) {
  return (
    <div className="oddball-screen seq-screen seq-screen--intro">
      <div className="seq-ai-check-row">
        <TitleDecoLine />
        <span className="seq-ai-check-badge" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="30" height="30" fill="none">
            <path d="M5 13l4 4L19 7" stroke="#4ADE80" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <TitleDecoLine flip />
      </div>

      <div className="seq-htp-title-row">
        <h1 className="seq-htp-title">Practice Complete</h1>
      </div>
      <p className="seq-htp-desc">You are ready for the assessment.</p>

      <div className="seq-htp-panel seq-ai-ready-panel">
        <p className="seq-ai-ready-heading">
          <ClipboardIcon color="#C4B5FD" />
          Ready?
        </p>
        <div className="seq-ai-check-list">
          {READY_ITEMS.map((item) => (
            <div className="seq-ai-check-item" key={item.label}>
              <span className="seq-ai-check-icon">{item.icon}</span>
              <span className="seq-ai-check-label">{item.label}</span>
              <span className="seq-ai-check-ok" aria-hidden="true">
                &#10003;
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="seq-cs-info-panel">
        <span className="seq-cs-info-icon">
          <ClipboardIcon color="#C4B5FD" />
        </span>
        <p className="seq-cs-info-text">
          The assessment has {TOTAL_ROUNDS} rounds. Sequences gradually become longer. Stay
          focused and take your time — try to respond accurately rather than guessing.
        </p>
      </div>

      <div className="seq-cs-actions">
        <button className="seq-cs-btn seq-cs-btn--primary" onClick={onBeginAssessment}>
          <span className="seq-cs-btn-arrow" aria-hidden="true">
            &#9654;
          </span>
          Start Assessment
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
