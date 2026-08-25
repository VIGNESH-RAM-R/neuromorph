export default function OddballPracticeComplete({ onBeginAssessment }) {
  return (
    <div className="oddball-screen oddball-screen--practice-complete">
      <div className="oddball-check-badge" aria-hidden="true">✓</div>
      <h1 className="oddball-heading">Practice Complete</h1>
      <p className="oddball-lead">You are ready for the actual assessment.</p>
      <p className="oddball-hint">
        The actual assessment takes about 1 minute. Watch the shapes and tap only the target.
      </p>
      <div className="seq-cs-actions">
        <button className="seq-cs-btn seq-cs-btn--primary" onClick={onBeginAssessment}>
          Begin Assessment
          <span className="seq-cs-btn-arrow" aria-hidden="true">
            &rarr;
          </span>
        </button>
      </div>
    </div>
  );
}
