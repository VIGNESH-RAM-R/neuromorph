export default function WhackMolePracticeComplete({ onBeginTest }) {
  return (
    <div className="oddball-screen wm-screen">
      <div className="oddball-check-badge" aria-hidden="true">
        ✓
      </div>
      <h1 className="oddball-heading">You Are Ready</h1>
      <p className="oddball-lead">Practice complete. The real assessment is about to begin.</p>

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
        The assessment lasts 45 seconds. Moles will appear one at a time in random holes — tap each
        one as quickly and accurately as you can.
      </p>

      <div className="oddball-actions">
        <button className="oddball-btn oddball-btn--primary" onClick={onBeginTest}>
          Begin Test
        </button>
      </div>
    </div>
  );
}
