import ObjectIllustration from './ObjectIllustration.jsx';

// Used to also show "• Easy/Medium/Hard difficulty" here — dropped per
// feedback: the tier still drives targets/options/viewSec internally
// (see config/difficultyConfig.js), it's just never announced to the
// patient, the same way none of the other 7 weekly games label their own
// internal difficulty progression either.
export default function ObservationScreen({ trial, trialIndex, trialTotal, timeRemainingSec }) {
  const label = trial.practice ? 'Practice trial' : `Trial ${trialIndex + 1} of ${trialTotal}`;

  return (
    <div className="vmt-screen">
      <div className="vmt-topbar">
        <span className="vmt-pill">{label}</span>
        <span className="vmt-timer" aria-live="polite">{timeRemainingSec}s</span>
      </div>
      <p className="vmt-instruction-line">Study these objects.</p>
      <div className="vmt-grid">
        {trial.targets.map((o) => (
          <div className="vmt-tile vmt-tile--readonly" key={o.id} aria-label={o.name}>
            <ObjectIllustration id={o.id} name={o.name} />
          </div>
        ))}
      </div>
    </div>
  );
}
