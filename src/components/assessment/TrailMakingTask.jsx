import { useState, useRef } from 'react';
import { TRAIL_NODES } from '../../config/trailMakingConfig.js';
import { TrailMakingEngine } from '../../engines/TrailMakingEngine.js';

export default function TrailMakingTask({ onSubmit }) {
  const [nextExpected, setNextExpected] = useState(1);
  const [errorCount, setErrorCount] = useState(0);
  const [completedNumbers, setCompletedNumbers] = useState([]);
  const startedAt = useRef(null);

  function handleNodeClick(number) {
    if (startedAt.current === null) startedAt.current = Date.now();

    if (number === nextExpected) {
      const done = [...completedNumbers, number];
      if (number === TRAIL_NODES.length) {
        const totalTimeMs = Date.now() - startedAt.current;
        const raw = TrailMakingEngine.score(totalTimeMs, errorCount);
        onSubmit({ score: raw.score, raw });
      } else {
        setCompletedNumbers(done);
        setNextExpected(number + 1);
      }
    } else {
      setErrorCount((c) => c + 1);
    }
  }

  return (
    <div className="nmpa-task">
      <p className="nmpa-task__instruction">Tap the circles in order, starting from 1 and going up to 13.</p>
      <p className="nmpa-task__progress">Next: {nextExpected}</p>

      <div className="nmpa-trail__canvas">
        {TRAIL_NODES.map((node) => {
          const done = completedNumbers.includes(node.number);
          return (
            <button
              key={node.number}
              type="button"
              className={`nmpa-trail__node ${done ? 'is-done' : ''}`}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
              onClick={() => handleNodeClick(node.number)}
              disabled={done}
              aria-label={`Node ${node.number}`}
            >
              {node.number}
            </button>
          );
        })}
      </div>
    </div>
  );
}
