import { useState } from 'react';
import { EMBEDDED_FIGURE_ROUNDS } from '../../config/embeddedFigureConfig.js';
import { EmbeddedFigureEngine } from '../../engines/EmbeddedFigureEngine.js';
import EmbeddedFigureIcon, { SimpleShapeIcon } from './EmbeddedFigureIcon.jsx';

export default function EmbeddedFigureTask({ onSubmit }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [responses, setResponses] = useState([]);

  const round = EMBEDDED_FIGURE_ROUNDS[roundIndex];

  function handleChoice(selectedShapeId) {
    const nextResponses = [...responses, { correctShapeId: round.correctShapeId, selectedShapeId }];

    if (roundIndex + 1 >= EMBEDDED_FIGURE_ROUNDS.length) {
      const raw = EmbeddedFigureEngine.score(nextResponses);
      onSubmit({ score: raw.score, raw });
    } else {
      setResponses(nextResponses);
      setRoundIndex((i) => i + 1);
    }
  }

  return (
    <div className="nmpa-task">
      <p className="nmpa-task__instruction">One of the four shapes below is hidden in the figure. Which one is it?</p>
      <p className="nmpa-task__progress">Round {roundIndex + 1} of {EMBEDDED_FIGURE_ROUNDS.length}</p>

      <div className="nmpa-cube__target">
        <EmbeddedFigureIcon variant={round.complexFigureId} />
      </div>

      <div className="nmpa-cube__choices">
        {round.choiceOrder.map((shapeId) => (
          <button key={shapeId} type="button" className="nmpa-cube__choice" onClick={() => handleChoice(shapeId)}>
            <SimpleShapeIcon id={shapeId} size={70} />
          </button>
        ))}
      </div>
    </div>
  );
}
