import { starString } from '../../utils/spotDifferenceMetrics';

/**
 * Levels are always freely selectable, in any order, at any time — matching
 * the untimed, no-pressure nature of the source prototype. A level's card
 * shows a "Completed" mark once it has been fully solved this session, and
 * "Finish & View Results" appears as soon as at least one level has been
 * completed, so a participant can end their session after any number of
 * levels rather than being forced through all three.
 */
export default function SpotDifferenceLevelSelect({ levels, levelResults, onSelectLevel, onFinishSession, onBack }) {
  const hasAnyCompleted = Object.keys(levelResults || {}).length > 0;

  return (
    <div className="oddball-screen sd-screen sd-screen--level-select">
      <h1 className="oddball-heading">Choose a Level</h1>
      <p className="oddball-subheading-muted">Pick any level you&rsquo;d like — you can switch levels at any time.</p>

      <div className="sd-level-cards-row">
        {levels.map((lvl) => {
          const result = levelResults?.[lvl.id];
          const diffCount = lvl.rounds[0].diffs.length;
          return (
            <button
              key={lvl.id}
              type="button"
              className={`sd-level-card${result?.completed ? ' sd-level-card--done' : ''}`}
              onClick={() => onSelectLevel(lvl)}
            >
              <span className="sd-level-card-stars">{starString(lvl.stars)}</span>
              <span className="sd-level-card-title">{lvl.label}</span>
              <span className="sd-level-card-sub">
                {diffCount} differences &middot; {lvl.rounds.length} picture{lvl.rounds.length > 1 ? 's' : ''}
              </span>
              <span className="sd-level-card-tagline">{lvl.tagline}</span>
              {result?.completed && <span className="sd-level-card-done-badge">&#10003; Completed</span>}
              <span className="sd-level-card-play">Play &rarr;</span>
            </button>
          );
        })}
      </div>

      <div className="seq-cs-actions">
        {hasAnyCompleted && (
          <button className="seq-cs-btn seq-cs-btn--success" onClick={onFinishSession}>
            Finish &amp; View Results
          </button>
        )}
        <button className="seq-cs-btn seq-cs-btn--secondary" onClick={onBack}>
          Back
        </button>
      </div>
    </div>
  );
}
