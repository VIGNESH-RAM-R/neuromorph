import { useState } from 'react';
import { QuestionBankEngine } from '../../engines/QuestionBankEngine.js';
import { t, format } from '../../i18n/strings/assessmentTasks.js';
import { questionText } from '../../i18n/strings/questionBank.js';
import { DEFAULT_LANGUAGE } from '../../config/i18nConfig.js';

// Selects its 10 questions once per run (on first render), then steps
// through them one at a time -- same choice-based, no-typing pattern as
// every other multiple-choice task in this assessment.
//
// 2026-08-27: question.prompt/choices are now translated via
// questionText(id, language) (src/i18n/strings/questionBank.js), which
// covers all 100 items in all 7 languages. `question` itself (from
// QuestionBankEngine.selectQuestions(), backed by the English
// questionBankConfig.js) still carries `correctIndex` -- scoring stays
// entirely on the English config's data and is unaffected by which
// language is displayed.
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

  const localized = questionText(question.id, language);
  const prompt = localized?.prompt ?? question.prompt;
  const choices = localized?.choices ?? question.choices;

  return (
    <div className="nmpa-task">
      <p className="nmpa-task__instruction">{prompt}</p>
      <p className="nmpa-task__progress">{format(t(language, 'questionProgress'), { current: index + 1, total: questions.length })}</p>

      <div className="nmpa-naming__choices">
        {choices.map((choice, choiceIndex) => (
          <button key={choiceIndex} type="button" className="nmpa-button nmpa-button--secondary" onClick={() => handleChoice(choiceIndex)}>
            {choice}
          </button>
        ))}
      </div>
    </div>
  );
}
