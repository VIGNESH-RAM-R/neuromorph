import { starString } from '../../utils/spotDifferenceMetrics';

function describeDiffCount(level) {
  const perRound = level.rounds[0].diffs.length;
  if (level.rounds.length > 1) {
    return `${perRound} differences to find in each picture · ${level.rounds.length} pictures`;
  }
  return `${perRound} differences to find`;
}

export default function SpotDifferenceLevelIntro({ level, onStart, onBack }) {
  return (
    <div className="oddball-screen sd-screen sd-screen--level-intro">
      <span className="oddball-tag sd-level-badge">{level.badge}</span>
      <p className="sd-level-intro-stars">{starString(level.stars)}</p>
      <h1 className="oddball-heading">{level.label}</h1>
      <p className="oddball-lead">{level.intro}</p>
      <div className="sd-hint-box">{level.hint}</div>
      <p className="sd-diff-count">{describeDiffCount(level)}</p>

      <div className="oddball-actions">
        <button className="seq-cs-btn seq-cs-btn--primary" onClick={onStart}>
          Start
        </button>
        <button className="seq-cs-btn seq-cs-btn--secondary" onClick={onBack}>
          &larr; Back to level selection
        </button>
      </div>
    </div>
  );
}
