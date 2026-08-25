/**
 * "About This Test" — reached from Welcome, returns to Welcome. Wording
 * follows spec sections 90, 101, 109 closely.
 */
export default function WhackMoleAbout({ onBack }) {
  return (
    <div className="oddball-screen wm-screen">
      <h1 className="oddball-heading">About This Test</h1>
      <p className="oddball-lead" style={{ textAlign: 'left' }}>
        This task measures behavioral responses to visual targets, including reaction speed,
        accuracy and missed responses. It is designed as one component of a broader cognitive
        assessment.
      </p>
      <div className="oddball-prep-list">
        <p>
          It measures observable behavior such as reaction time, accuracy, sustained attention and
          response consistency. It does not directly measure amyloid, tau, brain structure, or
          neuronal activity.
        </p>
        <p>
          <strong>Important:</strong> this task is not a standalone diagnostic test. Results should
          be interpreted together with other assessments and relevant clinical information. If you
          have concerns about memory or thinking, discuss them with a qualified healthcare
          professional.
        </p>
        <p>
          Performance can be influenced by age, education, vision, motor ability, device/input
          latency, familiarity with touchscreen devices, sleep, fatigue, medications, stress and
          other factors.
        </p>
      </div>
      <div className="oddball-actions">
        <button className="oddball-btn oddball-btn--secondary" onClick={onBack}>
          Back
        </button>
      </div>
    </div>
  );
}
