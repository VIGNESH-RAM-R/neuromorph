import { useState, useRef } from 'react';
import { OBJECT_NAMING_ITEMS } from '../../config/objectNamingConfig.js';
import { NamingEngine } from '../../engines/NamingEngine.js';
import ObjectIcon from './ObjectIcon.jsx';

// Same scoring engine as the temporal Naming Task (NamingEngine is shared
// by design -- see its file header) -- what differs is the item set and
// the silhouette rendering, which is what actually shifts this from a
// language/retrieval task to a basic-visual-recognition one.
export default function ObjectNamingTask({ onSubmit }) {
  const [itemIndex, setItemIndex] = useState(0);
  const [responses, setResponses] = useState([]);
  const shownAt = useRef(Date.now());

  const item = OBJECT_NAMING_ITEMS[itemIndex];

  function handleChoice(selectedLabel) {
    const reactionTimeMs = Date.now() - shownAt.current;
    const nextResponses = [...responses, { item, selectedLabel, reactionTimeMs }];

    if (itemIndex + 1 >= OBJECT_NAMING_ITEMS.length) {
      const raw = NamingEngine.score(nextResponses);
      onSubmit({ score: raw.score, raw });
    } else {
      setResponses(nextResponses);
      setItemIndex((i) => i + 1);
      shownAt.current = Date.now();
    }
  }

  return (
    <div className="nmpa-task">
      <p className="nmpa-task__instruction">What is this?</p>
      <p className="nmpa-task__progress">Item {itemIndex + 1} of {OBJECT_NAMING_ITEMS.length}</p>

      <div className="nmpa-naming__icon"><ObjectIcon id={item.id} variant="silhouette" /></div>

      <div className="nmpa-naming__choices">
        {item.choices.map((choice) => (
          <button key={choice} type="button" className="nmpa-button nmpa-button--secondary" onClick={() => handleChoice(choice)}>
            {choice}
          </button>
        ))}
      </div>
    </div>
  );
}
