export default function PointClickPracticeComplete({ onBeginAssessment }) {
  return (
    <div className="oddball-screen pc-screen pc-screen--practice-complete">
      <div className="oddball-check-badge" aria-hidden="true">
        ✓
      </div>
      <h1 className="oddball-heading">Practice Complete</h1>
      <p className="oddball-lead">You are ready to begin the assessment.</p>

      <div className="seq-ready-checklist">
        <h2 className="oddball-subheading">Ready?</h2>
        <ul>
          <li>Screen visible and comfortable to view</li>
          <li>Comfortable seated position</li>
          <li>No major distractions nearby</li>
          <li>Finger or mouse ready</li>
        </ul>
      </div>

      <p className="oddball-hint">
        The assessment has 20 rounds. The target and the number of objects will change from round
        to round. Respond as quickly and accurately as you can.
      </p>

      <div className="oddball-actions">
        <button className="seq-cs-btn seq-cs-btn--primary" onClick={onBeginAssessment}>
          Begin Assessment
        </button>
      </div>
    </div>
  );
}
