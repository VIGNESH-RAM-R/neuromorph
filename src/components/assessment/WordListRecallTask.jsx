import { useState, useEffect, useRef } from 'react';
import { STUDY_WORDS, STUDY_TIME_SECONDS } from '../../config/wordListConfig.js';
import { WordListRecallEngine } from '../../engines/WordListRecallEngine.js';

const RECALL_TIME_LIMIT_SECONDS = 60;

export default function WordListRecallTask({ onSubmit }) {
  const [phase, setPhase] = useState('study'); // 'study' | 'recall'
  const [studySecondsLeft, setStudySecondsLeft] = useState(STUDY_TIME_SECONDS);
  const [recallSecondsLeft, setRecallSecondsLeft] = useState(RECALL_TIME_LIMIT_SECONDS);
  const [words, setWords] = useState([]);
  const [draft, setDraft] = useState('');
  const submittedRef = useRef(false);

  useEffect(() => {
    if (phase !== 'study') return;
    const interval = setInterval(() => {
      setStudySecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(interval);
          setPhase('recall');
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'recall') return;
    const interval = setInterval(() => {
      setRecallSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(interval);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase]);

  useEffect(() => {
    if (phase === 'recall' && recallSecondsLeft === 0 && !submittedRef.current) {
      finishRecall();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recallSecondsLeft, phase]);

  function finishRecall() {
    if (submittedRef.current) return;
    submittedRef.current = true;
    const raw = WordListRecallEngine.score(words);
    onSubmit({ score: raw.score, raw });
  }

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

  if (phase === 'study') {
    return (
      <div className="nmpa-task">
        <p className="nmpa-task__instruction">Study this list of words. You'll be asked to recall them shortly.</p>
        <p className="nmpa-task__progress">{studySecondsLeft}s remaining</p>
        <ul className="nmpa-wordlist__study">
          {STUDY_WORDS.map((w) => <li key={w}>{w}</li>)}
        </ul>
      </div>
    );
  }

  return (
    <div className="nmpa-task">
      <p className="nmpa-task__instruction">Type as many of the words as you remember, in any order.</p>
      <p className="nmpa-task__progress">Time left: {recallSecondsLeft}s &middot; {words.length} recalled so far</p>

      <div className="nmpa-fluency__input-row">
        <input type="text" value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={handleKeyDown} autoFocus placeholder="Type a word..." />
        <button type="button" className="nmpa-button nmpa-button--secondary" onClick={addWord}>Add</button>
      </div>

      <ul className="nmpa-fluency__words">
        {words.map((w, i) => <li key={i}>{w}</li>)}
      </ul>

      <button type="button" className="nmpa-button nmpa-button--primary" onClick={finishRecall}>I'm Done</button>
    </div>
  );
}
