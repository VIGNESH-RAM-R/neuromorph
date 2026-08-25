import { useState } from 'react';
import { CALCULATION_PROBLEMS } from '../../config/calculationConfig.js';
import { CalculationEngine } from '../../engines/CalculationEngine.js';

export default function CalculationTask({ onSubmit }) {
  const [problemIndex, setProblemIndex] = useState(0);
  const [responses, setResponses] = useState([]);
  const [draft, setDraft] = useState('');

  const problem = CALCULATION_PROBLEMS[problemIndex];

  function handleNext() {
    const nextResponses = [...responses, { problem, submittedAnswer: draft }];
    setDraft('');

    if (problemIndex + 1 >= CALCULATION_PROBLEMS.length) {
      const raw = CalculationEngine.score(nextResponses);
      onSubmit({ score: raw.score, raw });
    } else {
      setResponses(nextResponses);
      setProblemIndex((i) => i + 1);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleNext();
    }
  }

  return (
    <div className="nmpa-task">
      <p className="nmpa-task__instruction">{problem.prompt}</p>
      <p className="nmpa-task__progress">Question {problemIndex + 1} of {CALCULATION_PROBLEMS.length}</p>

      <div className="nmpa-fluency__input-row">
        <input type="text" inputMode="decimal" value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={handleKeyDown} autoFocus placeholder="Your answer" />
        <button type="button" className="nmpa-button nmpa-button--primary" onClick={handleNext}>
          {problemIndex + 1 >= CALCULATION_PROBLEMS.length ? 'Finish' : 'Next'}
        </button>
      </div>
    </div>
  );
}
