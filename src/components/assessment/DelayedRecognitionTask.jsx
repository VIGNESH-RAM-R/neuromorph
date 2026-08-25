import { useState } from 'react';
import { RECOGNITION_ITEMS } from '../../config/wordListConfig.js';
import { DelayedRecognitionEngine } from '../../engines/DelayedRecognitionEngine.js';

export default function DelayedRecognitionTask({ onSubmit }) {
  const [itemIndex, setItemIndex] = useState(0);
  const [responses, setResponses] = useState([]);

  const item = RECOGNITION_ITEMS[itemIndex];

  function handleAnswer(markedAsSeen) {
    const nextResponses = [...responses, { word: item.word, isStudyWord: item.isStudyWord, markedAsSeen }];

    if (itemIndex + 1 >= RECOGNITION_ITEMS.length) {
      const raw = DelayedRecognitionEngine.score(nextResponses);
      onSubmit({ score: raw.score, raw });
    } else {
      setResponses(nextResponses);
      setItemIndex((i) => i + 1);
    }
  }

  return (
    <div className="nmpa-task">
      <p className="nmpa-task__instruction">Earlier in this assessment, you studied a list of words. Was this word on that list?</p>
      <p className="nmpa-task__progress">Word {itemIndex + 1} of {RECOGNITION_ITEMS.length}</p>

      <div className="nmpa-recognition__word">{item.word}</div>

      <div className="nmpa-recognition__choices">
        <button type="button" className="nmpa-button nmpa-button--primary" onClick={() => handleAnswer(true)}>Yes, I saw this</button>
        <button type="button" className="nmpa-button nmpa-button--secondary" onClick={() => handleAnswer(false)}>No, this is new</button>
      </div>
    </div>
  );
}
