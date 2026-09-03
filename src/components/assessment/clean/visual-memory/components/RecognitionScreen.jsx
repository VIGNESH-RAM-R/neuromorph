import ObjectIllustration from './ObjectIllustration.jsx';

export default function RecognitionScreen({ trial, selected, timeRemainingSec, onToggle, onSubmit }) {
  return (
    <div className="vmt-screen">
      <div className="vmt-topbar">
        <span className="vmt-pill">Select every object you remember</span>
        <span className="vmt-timer" aria-live="polite">{timeRemainingSec}s</span>
      </div>
      <div className="vmt-grid">
        {trial.grid.map((o) => {
          const isSelected = !!selected[o.id];
          return (
            <button
              type="button"
              key={o.id}
              className={`vmt-tile vmt-tile--selectable${isSelected ? ' vmt-tile--selected' : ''}`}
              aria-pressed={isSelected}
              aria-label={o.name}
              onClick={() => onToggle(o.id)}
            >
              <ObjectIllustration id={o.id} name={o.name} />
            </button>
          );
        })}
      </div>
      <button className="vmt-btn vmt-btn--primary" onClick={onSubmit}>Submit</button>
    </div>
  );
}
