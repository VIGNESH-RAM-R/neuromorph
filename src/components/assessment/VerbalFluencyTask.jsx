import { useState, useEffect, useRef } from 'react';
import { VERBAL_FLUENCY_CATEGORIES, VERBAL_FLUENCY_CONFIG } from '../../config/verbalFluencyConfig.js';
import { VerbalFluencyEngine } from '../../engines/VerbalFluencyEngine.js';

// One category is picked per session -- deterministic-ish (based on the
// day) so this isn't literally Math.random() inside a component, keeping
// behavior predictable within a single day.
function categoryForToday() {
  const dayIndex = new Date().getDate() % VERBAL_FLUENCY_CATEGORIES.length;
  return VERBAL_FLUENCY_CATEGORIES[dayIndex];
}

export default function VerbalFluencyTask({ onSubmit }) {
  const [category] = useState(categoryForToday);
  const [words, setWords] = useState([]);
  const [draft, setDraft] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(VERBAL_FLUENCY_CONFIG.timeLimitSeconds);
  const submittedRef = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(interval);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (secondsLeft === 0 && !submittedRef.current) {
      submittedRef.current = true;
      const raw = VerbalFluencyEngine.score(words);
      onSubmit({ score: raw.score, raw });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft]);

  function addWord() {
    const trimmed = draft.trim();
    if (trimmed) setWords((w) => [...w, trimmed]);
    setDraft('');
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      addWord();
    }
  }

  return (
    <div className="nmpa-task">
      <p className="nmpa-task__instruction">Name as many <strong>{category.toLowerCase()}</strong> as you can. Type one, press Enter, repeat.</p>
      <p className="nmpa-task__progress">Time left: {secondsLeft}s &middot; {words.length} words so far</p>

      <div className="nmpa-fluency__input-row">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          placeholder={`Type a ${category.slice(0, -1).toLowerCase()}...`}
        />
        <button type="button" className="nmpa-button nmpa-button--secondary" onClick={addWord}>Add</button>
      </div>

      <ul className="nmpa-fluency__words">
        {words.map((w, i) => <li key={i}>{w}</li>)}
      </ul>
    </div>
  );
}
