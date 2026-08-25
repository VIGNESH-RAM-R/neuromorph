import { useState } from 'react';
import { QuestionBankEngine } from '../../engines/QuestionBankEngine.js';
import { t, format } from '../../i18n/strings/assessmentTasks.js';
import { DEFAULT_LANGUAGE } from '../../config/i18nConfig.js';

// Selects its 10 questions once per run (on first render), then steps
// through them one at a time -- same choice-based, no-typing pattern as
// every other multiple-choice task in this assessment.
//
// NOTE: question.prompt/choices themselves are NOT translated here -- they
// come from QuestionBankEngine's own bank config, a separate (higher-
// stakes, "translate clinical wording carefully") i18n item. Only this
// screen's own progress-line chrome is covered.
export default function QuestionBankTask({ onSubmit, language = DEFAULT_LANGUAGE }) {
  const [questions] = useState(() => QuestionBankEngine.selectQuestions());
  const [index, setIndex] = useState(0);
  const [responses, setResponses] = useState([]);

  const question = questions[index];

  function handleChoice(selectedIndex) {
    const nextResponses = [...responses, { question, selectedIndex }];

    if (index + 1 >= questions.length) {
      const raw = QuestionBankEngine.score(nextResponses);
      onSubmit({ score: raw.score, raw });
    } else {
      setResponses(nextResponses);
      setIndex((i) => i + 1);
    }
  }

  if (!question) return null;

  return (
    <div className="nmpa-task">
      <p className="nmpa-task__instruction">{question.prompt}</p>
      <p className="nmpa-task__progress">{format(t(language, 'questionProgress'), { current: index + 1, total: questions.length })}</p>

      <div className="nmpa-naming__choices">
        {question.choices.map((choice, choiceIndex) => (
          <button key={choice} type="button" className="nmpa-button nmpa-button--secondary" onClick={() => handleChoice(choiceIndex)}>
            {choice}
          </button>
        ))}
      </div>
    </div>
  );
}
