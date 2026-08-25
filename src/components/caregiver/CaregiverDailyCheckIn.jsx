import { useState } from 'react';

// Renders the caregiver's 15-question daily check-in (see
// caregiverDailyConfig.js / CaregiverDailyRotationEngine.js). Each answer
// commits immediately when picked (scale/yes-no) or on blur (text) --
// same "no separate submit step, each item completes itself" pattern
// GamesSection.jsx already uses for the patient's Daily Set, so partial
// progress is never lost if the caregiver closes the app mid-way.
function ScaleControl({ question, value, onAnswer }) {
  return (
    <div className="nmpa-scale">
      {question.scaleLabels.map((label, i) => {
        const score = i + 1;
        return (
          <button
            key={score}
            type="button"
            className={`nmpa-scale__option ${value === score ? 'is-selected' : ''}`}
            onClick={() => onAnswer(question.id, score)}
            aria-pressed={value === score}
            title={label}
          >
            {score}
          </button>
        );
      })}
      {value && <span className="nmpa-muted nmpa-muted--sm">{question.scaleLabels[value - 1]}</span>}
    </div>
  );
}

function YesNoControl({ question, value, onAnswer }) {
  return (
    <div className="nmpa-button-row">
      <button type="button" className={`nmpa-button ${value === true ? 'nmpa-button--primary' : 'nmpa-button--secondary'}`} onClick={() => onAnswer(question.id, true)}>Yes</button>
      <button type="button" className={`nmpa-button ${value === false ? 'nmpa-button--primary' : 'nmpa-button--secondary'}`} onClick={() => onAnswer(question.id, false)}>No</button>
    </div>
  );
}

function TextControl({ question, value, onAnswer }) {
  const [draft, setDraft] = useState(value || '');
  return (
    <textarea
      className="nmpa-textarea"
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => { if (draft !== (value || '')) onAnswer(question.id, draft); }}
      rows={2}
      placeholder="Optional -- write as much or as little as you'd like"
    />
  );
}

export default function CaregiverDailyCheckIn({ checklist, answers, onAnswer }) {
  return (
    <div className="nmpa-checklist" style={{ gap: 18 }}>
      {checklist.map((q) => (
        <div key={q.id} className={`nmpa-checklist__item ${q.completed ? 'is-done' : ''}`} style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span className="nmpa-checklist__mark">{q.completed ? '✓' : '○'}</span>
            <span className="nmpa-checklist__label">{q.label}</span>
          </div>
          <div style={{ marginLeft: 32, marginTop: 6 }}>
            {q.type === 'scale' && <ScaleControl question={q} value={answers?.[q.id]} onAnswer={onAnswer} />}
            {q.type === 'yesno' && <YesNoControl question={q} value={answers?.[q.id]} onAnswer={onAnswer} />}
            {q.type === 'text' && <TextControl question={q} value={answers?.[q.id]} onAnswer={onAnswer} />}
          </div>
        </div>
      ))}
    </div>
  );
}
