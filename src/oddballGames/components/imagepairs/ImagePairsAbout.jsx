/**
 * "About This Assessment" — reached from Welcome, returns to Welcome.
 * Wording follows spec section 59 closely and is deliberately explicit
 * about what the task does and does not establish (spec sections 3, 30, 81).
 */
export default function ImagePairsAbout({ onBack }) {
  return (
    <div className="oddball-screen ip-screen">
      <h1 className="oddball-heading">About This Assessment</h1>
      <p className="oddball-lead" style={{ textAlign: 'left' }}>
        Image Pairs is a computerized visual memory assessment within Neuromorph.
      </p>
      <div className="oddball-prep-list">
        <p>
          The task evaluates visual recognition, spatial memory, short-term visual memory, attention
          and response efficiency by requiring you to identify matching visual pairs.
        </p>
        <p>
          Your performance is recorded using measures such as accuracy, response time, number of
          correct pairs and errors.
        </p>
        <p>
          This task is one component of a broader cognitive assessment and is not intended to
          independently diagnose dementia, Alzheimer&rsquo;s disease, or any other medical condition.
          Results should be interpreted together with other Neuromorph assessments and, where
          appropriate, a clinical evaluation.
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
