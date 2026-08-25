import { useState } from 'react';

/**
 * Pause overlay for the scored assessment. Two internal views: the default
 * "paused" view (Resume / Exit Assessment), and a confirmation view shown
 * before an exit is actually carried out, so a mis-tap can't discard an
 * in-progress assessment.
 */
export default function PauseModal({ onResume, onConfirmExit }) {
  const [confirmingExit, setConfirmingExit] = useState(false);

  return (
    <div className="pc-modal-overlay" role="dialog" aria-modal="true" aria-label="Assessment paused">
      <div className="pc-modal">
        {!confirmingExit ? (
          <>
            <h2 className="pc-modal-title">Your assessment is paused</h2>
            <p className="pc-modal-text">Take your time. Nothing is being recorded while paused.</p>
            <div className="oddball-actions">
              <button className="seq-cs-btn seq-cs-btn--primary" onClick={onResume}>
                Resume
              </button>
              <button className="seq-cs-btn seq-cs-btn--secondary" onClick={() => setConfirmingExit(true)}>
                Exit Assessment
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="pc-modal-title">End this assessment?</h2>
            <p className="pc-modal-text">
              Your progress so far will not be saved. You can start a new assessment at any time.
            </p>
            <div className="oddball-actions">
              <button className="seq-cs-btn seq-cs-btn--secondary" onClick={() => setConfirmingExit(false)}>
                Keep Going
              </button>
              <button className="seq-cs-btn seq-cs-btn--danger" onClick={onConfirmExit}>
                End Assessment
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
