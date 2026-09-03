import ObjectIllustration from './ObjectIllustration.jsx';

function tagFor(isTarget, wasSelected) {
  if (isTarget && wasSelected) return { label: 'Correct', className: 'vmt-tag--correct' };
  if (isTarget && !wasSelected) return { label: 'Missed', className: 'vmt-tag--incorrect' };
  if (!isTarget && wasSelected) return { label: 'Incorrect', className: 'vmt-tag--incorrect' };
  return { label: 'Skipped', className: 'vmt-tag--neutral' };
}

export default function PracticeFeedbackScreen({ trial, feedback, onContinue }) {
  const selectedIds = feedback.selectedIds;
  return (
    <div className="vmt-screen">
      <h2>Practice feedback</h2>
      <p className="vmt-body">
        {feedback.result.hits} of {feedback.result.totalTargets} objects correctly recognized.
        Practice trials are not scored.
      </p>
      <div className="vmt-grid">
        {trial.grid.map((o) => {
          const wasSelected = selectedIds.includes(o.id);
          const tag = tagFor(o.isTarget, wasSelected);
          return (
            <div className="vmt-tile vmt-tile--readonly" key={o.id} aria-label={`${o.name}: ${tag.label}`}>
              <ObjectIllustration id={o.id} name={o.name} />
              <span className={`vmt-tag ${tag.className}`}>{tag.label}</span>
            </div>
          );
        })}
      </div>
      <button className="vmt-btn vmt-btn--primary" onClick={onContinue}>Continue to assessment</button>
    </div>
  );
}
