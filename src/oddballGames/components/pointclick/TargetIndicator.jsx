import StimulusIcon from './StimulusIcon';

/**
 * Persistent reminder of the current trial's target identity, shown from
 * the moment the target is announced through to the end of the trial
 * (including while the board is active). Keeping it visible during search
 * means the task measures visual search / target-detection speed rather
 * than incidentally taxing short-term memory for the target's identity.
 * On no-target trials it still shows what to look for, since the
 * participant does not know in advance whether the target will appear.
 */
export default function TargetIndicator({ shapeId, colorId, label, compact }) {
  return (
    <div className={`pc-target-card${compact ? ' pc-target-card--compact' : ''}`}>
      <span className="pc-target-card-label">Find</span>
      <span className="pc-target-card-icon">
        <StimulusIcon shapeId={shapeId} colorId={colorId} size={compact ? 32 : 52} />
      </span>
      <span className="pc-target-card-name">{label}</span>
    </div>
  );
}
