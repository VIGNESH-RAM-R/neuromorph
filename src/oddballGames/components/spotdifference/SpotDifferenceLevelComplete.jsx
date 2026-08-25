import { starString } from '../../utils/spotDifferenceMetrics';

/**
 * Shown after fully solving a level (both/all of its rounds). If another
 * level hasn't been completed yet this session, offers to continue
 * straight into it; once every level is complete, offers to view results
 * instead. "Choose another level" is always available regardless, matching
 * the source prototype's free level navigation.
 */
export default function SpotDifferenceLevelComplete({
  level,
  allLevelsCompleted,
  nextIncompleteLevel,
  onContinueToLevel,
  onViewResults,
  onChooseAnotherLevel,
}) {
  const headline = `${level.label} level complete!`;
  const text = allLevelsCompleted
    ? "You've now finished every level — Easy, Medium, and Hard. That takes real focus and attention. Wonderful work."
    : nextIncompleteLevel
    ? `You found every difference in the ${level.label} level. Ready for ${nextIncompleteLevel.label}, or would you like to pick a different level?`
    : `You found every difference in the ${level.label} level. Play it again, or pick a different level?`;

  return (
    <div className="oddball-screen sd-screen sd-screen--level-complete">
      <span className="oddball-tag sd-level-badge">Level Complete</span>
      <p className="sd-level-intro-stars">{starString(level.stars)}</p>
      <h1 className="oddball-heading">{headline}</h1>
      <p className="oddball-lead">{text}</p>

      <div className="oddball-actions">
        {allLevelsCompleted ? (
          <button className="seq-cs-btn seq-cs-btn--success" onClick={onViewResults}>
            View My Results
          </button>
        ) : nextIncompleteLevel ? (
          <button className="seq-cs-btn seq-cs-btn--primary" onClick={() => onContinueToLevel(nextIncompleteLevel)}>
            Continue to {nextIncompleteLevel.label} &rarr;
          </button>
        ) : null}
        <button className="seq-cs-btn seq-cs-btn--secondary" onClick={onChooseAnotherLevel}>
          Choose another level
        </button>
      </div>
    </div>
  );
}
