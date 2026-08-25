import { useState } from 'react';
import { CUBE_COPY_ROUNDS } from '../../config/cubeCopyConfig.js';
import { CubeCopyEngine } from '../../engines/CubeCopyEngine.js';
import CubeIcon from './CubeIcon.jsx';

export default function CubeCopyTask({ onSubmit }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [responses, setResponses] = useState([]);

  const round = CUBE_COPY_ROUNDS[roundIndex];

  function handleChoice(selectedVariant) {
    const nextResponses = [...responses, { correctVariant: round.correctVariant, selectedVariant }];

    if (roundIndex + 1 >= CUBE_COPY_ROUNDS.length) {
      const raw = CubeCopyEngine.score(nextResponses);
      onSubmit({ score: raw.score, raw });
    } else {
      setResponses(nextResponses);
      setRoundIndex((i) => i + 1);
    }
  }

  return (
    <div className="nmpa-task">
      <p className="nmpa-task__instruction">Which of the shapes below matches the target cube exactly?</p>
      <p className="nmpa-task__progress">Round {roundIndex + 1} of {CUBE_COPY_ROUNDS.length}</p>

      <div className="nmpa-cube__target">
        <p className="nmpa-muted nmpa-muted--sm">Target</p>
        <CubeIcon variant={round.correctVariant} />
      </div>

      <div className="nmpa-cube__choices">
        {round.choiceOrder.map((variant) => (
          <button key={variant} type="button" className="nmpa-cube__choice" onClick={() => handleChoice(variant)}>
            <CubeIcon variant={variant} size={70} />
          </button>
        ))}
      </div>
    </div>
  );
}
