import StimulusIcon from './StimulusIcon';

/**
 * The game board itself: every object is absolutely positioned by its
 * pre-computed percentage coordinates (see pointClickTrialGenerator.js),
 * so placement is decided once per trial and stays stable across renders.
 * `interactive` gates whether taps are accepted at all (only true during
 * the BOARD phase) — FEEDBACK still renders the same objects, frozen.
 */
export default function PointClickBoard({ objects, interactive, onRespond, feedback }) {
  const respondedId = feedback?.respondedObjectId ?? null;
  const responseType = feedback?.responseType ?? null;

  return (
    <div className="pc-board" role="group" aria-label="Assessment game board">
      {(objects || []).map((obj) => {
        const isRespondedTo = respondedId && obj.id === respondedId;
        let feedbackClass = '';
        if (isRespondedTo) {
          if (responseType === 'HIT') feedbackClass = ' pc-object--correct';
          else if (responseType === 'FALSE_ALARM') feedbackClass = ' pc-object--incorrect';
        } else if (feedback && obj.isTarget && responseType === 'MISS') {
          feedbackClass = ' pc-object--missed-target';
        }

        return (
          <button
            key={obj.id}
            type="button"
            className={`pc-object${feedbackClass}`}
            style={{ left: `${obj.leftPct}%`, top: `${obj.topPct}%` }}
            onClick={() => interactive && onRespond(obj.id)}
            disabled={!interactive}
            aria-label={`Object: ${obj.colorId} ${obj.shapeId}`}
          >
            <StimulusIcon shapeId={obj.shapeId} colorId={obj.colorId} size={44} />
          </button>
        );
      })}
    </div>
  );
}
