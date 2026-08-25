import { useState } from 'react';
import SectionCard from '../shared/SectionCard.jsx';

// 2026-08-20: notes now persist for real patients (see
// usePatientReport.js/FirestorePatientService.js) -- this panel surfaces
// both failure modes honestly instead of silently swallowing them:
// `notesLoadError` (the existing notes list couldn't be fetched, e.g. the
// doctorNotes security rule isn't deployed yet) and `saveError` (a new note
// failed to write). Neither ever shows a fake success.
export default function ClinicalObservationsPanel({ notes, onAddNote, notesLoadError, isSaving, saveError }) {
  const [draft, setDraft] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!draft.trim() || isSaving) return;
    const text = draft;
    setDraft('');
    onAddNote(text);
  };

  return (
    <SectionCard title="Clinical Observations" subtitle="Editable, stored notes for continuity of care">
      {notesLoadError && (
        <p className="nmdd-alert nmdd-alert--warn" role="alert">{notesLoadError}</p>
      )}
      <ul className="nmdd-notes-list">
        {notes.length === 0 && !notesLoadError && <li className="nmdd-muted">No clinical notes recorded yet.</li>}
        {notes.map((n) => (
          <li key={n.id} className="nmdd-note">
            <div className="nmdd-note__meta">
              <strong>{n.author}</strong>
              <span>{new Date(n.timestamp).toLocaleString()}</span>
            </div>
            <p>{n.text}</p>
          </li>
        ))}
      </ul>
      {saveError && (
        <p className="nmdd-alert nmdd-alert--danger" role="alert">{saveError}</p>
      )}
      <form className="nmdd-note-form" onSubmit={submit}>
        <textarea
          className="nmdd-textarea"
          rows={3}
          placeholder="e.g. Observed mild word-finding difficulty. Recommend repeat assessment in 3 months."
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          aria-label="Add a clinical observation"
          disabled={isSaving}
        />
        <button type="submit" className="nmdd-button nmdd-button--secondary" disabled={isSaving}>
          {isSaving ? 'Saving…' : 'Add note'}
        </button>
      </form>
    </SectionCard>
  );
}
