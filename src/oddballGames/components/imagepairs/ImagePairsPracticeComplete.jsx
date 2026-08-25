export default function ImagePairsPracticeComplete({ onBeginAssessment }) {
  return (
    <div className="oddball-screen ip-screen">
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
        The assessment has 16 cards (8 pairs) and a 90-second time limit. Work as accurately and
        quickly as possible — there are no hints during the assessment.
      </p>

      <div className="oddball-actions">
        <button className="oddball-btn oddball-btn--primary" onClick={onBeginAssessment}>
          Start Assessment
        </button>
      </div>
    </div>
  );
}
