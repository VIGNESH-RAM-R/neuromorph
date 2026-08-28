import { useState } from 'react';
import SectionCard from '../shared/SectionCard.jsx';
import { DEFAULT_LANGUAGE } from '../../config/i18nConfig.js';
import { t } from '../../i18n/strings/report.js';

// 2026-08-20: notes now persist for real patients (see
// usePatientReport.js/FirestorePatientService.js) -- this panel surfaces
// both failure modes honestly instead of silently swallowing them:
// `notesLoadError` (the existing notes list couldn't be fetched, e.g. the
// doctorNotes security rule isn't deployed yet) and `saveError` (a new note
// failed to write). Neither ever shows a fake success.
//
// notesLoadError/saveError themselves are raw error messages (from
// Firestore/the service layer, not a fixed template pool) -- same as
// elsewhere in this codebase, an error string is shown as-is rather than
// guessed at a translation for, since misrepresenting the actual failure
// reason to a clinician would be worse than leaving it in English.
export default function ClinicalObservationsPanel({ notes, onAddNote, notesLoadError, isSaving, saveError, language = DEFAULT_LANGUAGE }) {
  const [draft, setDraft] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!draft.trim() || isSaving) return;
    const text = draft;
    setDraft('');
    onAddNote(text);
  };

  return (
    <SectionCard title={t(language, 'clinicalObservationsTitle')} subtitle={t(language, 'clinicalObservationsSubtitle')}>
      {notesLoadError && (
        <p className="nmdd-alert nmdd-alert--warn" role="alert">{notesLoadError}</p>
      )}
      <ul className="nmdd-notes-list">
        {notes.length === 0 && !notesLoadError && <li className="nmdd-muted">{t(language, 'noClinicalNotesYet')}</li>}
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
          placeholder={t(language, 'addNotePlaceholder')}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          aria-label={t(language, 'addNoteAriaLabel')}
          disabled={isSaving}
        />
        <button type="submit" className="nmdd-button nmdd-button--secondary" disabled={isSaving}>
          {t(language, isSaving ? 'savingEllipsis' : 'addNoteButton')}
        </button>
      </form>
    </SectionCard>
  );
}
