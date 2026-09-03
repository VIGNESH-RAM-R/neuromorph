import ItemIllustration from './ItemIllustration.jsx';

const TYPE_LABEL = { object: 'Objects', figure: 'Figures', symbol: 'Symbols', face: 'Faces' };

export default function RecognitionScreen({ trial, categoryIndex, categoryTotal, selected, timeRemainingSec, onToggle, onSubmit }) {
  return (
    <div className="drt-screen">
      <div className="drt-topbar">
        <span className="drt-pill">
          Category {categoryIndex + 1} of {categoryTotal} • {TYPE_LABEL[trial.itemType] || trial.itemType} • from {trial.sourceModule}
        </span>
        <span className="drt-timer" aria-live="polite">{timeRemainingSec}s</span>
      </div>
      <p className="drt-instruction-line">Select every item you remember from earlier in the session.</p>
      <div className="drt-grid">
        {trial.grid.map((o) => {
          const isSelected = !!selected[o.id];
          return (
            <button
              type="button"
              key={o.id}
              className={`drt-tile drt-tile--selectable${isSelected ? ' drt-tile--selected' : ''}`}
              aria-pressed={isSelected}
              aria-label={o.id}
              onClick={() => onToggle(o.id)}
            >
              <ItemIllustration itemType={trial.itemType} id={o.id} face={o} />
            </button>
          );
        })}
      </div>
      <button className="drt-btn drt-btn--primary" onClick={onSubmit}>Submit</button>
    </div>
  );
}
