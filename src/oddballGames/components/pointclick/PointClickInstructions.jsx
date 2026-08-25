import StimulusIcon from './StimulusIcon';

function FindIcon() {
  return (
    <svg viewBox="0 0 40 40" width="32" height="32" aria-hidden="true">
      <circle cx="17" cy="17" r="11" fill="none" stroke="#3B82F6" strokeWidth="2.2" />
      <line x1="25" y1="25" x2="34" y2="34" stroke="#22D3EE" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function IdentifyIcon() {
  return (
    <svg viewBox="0 0 40 40" width="32" height="32" aria-hidden="true">
      <path d="M4 20c4-8 12-12 16-12s12 4 16 12c-4 8-12 12-16 12S8 28 4 20z" fill="none" stroke="#3B82F6" strokeWidth="2.2" />
      <circle cx="20" cy="20" r="5.5" fill="#22D3EE" />
    </svg>
  );
}

function TapIcon() {
  return (
    <svg viewBox="0 0 40 40" width="32" height="32" aria-hidden="true">
      <circle cx="20" cy="20" r="7" fill="none" stroke="#3B82F6" strokeWidth="2" />
      <circle cx="20" cy="20" r="13" fill="none" stroke="#22D3EE" strokeWidth="1.6" strokeDasharray="3 4" />
    </svg>
  );
}

const EXAMPLE_OBJECTS = [
  { shapeId: 'circle', colorId: 'blue' },
  { shapeId: 'star', colorId: 'green' },
  { shapeId: 'square', colorId: 'orange' },
  { shapeId: 'triangle', colorId: 'purple' },
  { shapeId: 'circle', colorId: 'red' },
];

/**
 * Shown once, right after the participant clicks "Start Assessment" on
 * Welcome, and before Practice.
 */
export default function PointClickInstructions({ onContinue, onBack }) {
  return (
    <div className="oddball-screen pc-screen pc-screen--instructions">
      <h1 className="oddball-heading">How It Works</h1>

      <div className="seq-stage-cards">
        <div className="seq-stage-card">
          <span className="seq-stage-icon">
            <FindIcon />
          </span>
          <span className="seq-stage-title">Find</span>
          <p className="seq-stage-desc">A target object is announced before each round.</p>
        </div>
        <div className="seq-stage-card">
          <span className="seq-stage-icon">
            <IdentifyIcon />
          </span>
          <span className="seq-stage-title">Identify</span>
          <p className="seq-stage-desc">Look for that exact object among the others on screen.</p>
        </div>
        <div className="seq-stage-card">
          <span className="seq-stage-icon">
            <TapIcon />
          </span>
          <span className="seq-stage-title">Tap</span>
          <p className="seq-stage-desc">Tap only the target, as quickly and accurately as you can.</p>
        </div>
      </div>

      <ul className="oddball-instruction-list">
        <li>Before each round, the target object is shown — for example, "Green Circle."</li>
        <li>The board then appears with several objects, only one of which matches the target.</li>
        <li>Tap the object that matches the target. Do not tap the other objects.</li>
        <li>On some rounds, the target will not appear at all — if so, simply do not tap anything.</li>
        <li>The target and the number of objects will change from round to round.</li>
      </ul>

      <div className="pc-example">
        <p className="pc-example-target">
          <span className="pc-example-target-label">Target:</span>
          <StimulusIcon shapeId="circle" colorId="blue" size={28} />
          <span className="pc-example-target-name">Blue Circle</span>
        </p>
        <div className="pc-example-board" aria-hidden="true">
          {EXAMPLE_OBJECTS.map((obj, i) => (
            <span key={i} className="pc-example-object">
              <StimulusIcon shapeId={obj.shapeId} colorId={obj.colorId} size={36} />
            </span>
          ))}
        </div>
        <p className="pc-example-caption">Only the blue circle is the target. Example — not scored.</p>
      </div>

      <div className="oddball-actions">
        <button className="seq-cs-btn seq-cs-btn--primary" onClick={onContinue}>
          Continue
        </button>
        {onBack && (
          <button className="seq-cs-btn seq-cs-btn--secondary" onClick={onBack}>
            Back
          </button>
        )}
      </div>
    </div>
  );
}
