import { STIMULI } from '../../config/oddballConfig';

/**
 * Renders the central stimulus area. `stimulusType` is 'standard' | 'target'
 * | null (blank). The visible shape is intentionally simple, large, and
 * high-contrast, with no decorative motion.
 */
export default function OddballStimulus({ stimulusType, fixation, onRespond, interactive }) {
  const showShape = stimulusType === 'standard' || stimulusType === 'target';
  const stim = stimulusType === 'target' ? STIMULI.target : STIMULI.standard;

  const handleActivate = () => {
    if (interactive) onRespond?.();
  };

  return (
    <div
      className="oddball-stimulus-area"
      role="button"
      aria-label="Assessment response area"
      tabIndex={interactive ? 0 : -1}
      onPointerDown={handleActivate}
      onKeyDown={(e) => {
        if (interactive && (e.key === ' ' || e.key === 'Enter')) {
          e.preventDefault();
          handleActivate();
        }
      }}
    >
      {fixation && <span className="oddball-fixation" aria-hidden="true">+</span>}

      {showShape && (
        <svg
          className={`oddball-shape oddball-shape--${stim.shape}`}
          viewBox="0 0 200 200"
          width="180"
          height="180"
          aria-hidden="true"
        >
          {stim.shape === 'circle' && (
            <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="8" />
          )}
          {stim.shape === 'triangle' && (
            <polygon
              points="100,20 180,170 20,170"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinejoin="round"
            />
          )}
        </svg>
      )}
    </div>
  );
}
