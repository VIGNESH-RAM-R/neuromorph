import { useState } from 'react';
import SectionCard from '../shared/SectionCard.jsx';
import EmptyState from '../shared/EmptyState.jsx';
import { CAREGIVER_MICRO_QUESTIONS } from '../../../config/caregiverMicroCheckinConfig.js';
import { useCaregiverResponses } from '../../hooks/useCaregiverResponses.js';
import { formatCaregiverAnswer as formatAnswer, DEEP_STATUS_LABEL, buildCaregiverEntries } from '../../engines/CaregiverResponsesFormat.js';

// 2026-08-23 ADDITION -- closes a real, previously-disclosed gap: until
// now the doctor dashboard only showed a condensed one-line "Caregiver
// Concern" field (QuestionnaireSummaryCard.jsx) and a self-report-vs-
// caregiver concordance summary (CaregiverConcordancePanel.jsx), never
// the caregiver's actual answers to their real check-ins.
//
// 2026-08-24 REDESIGN (VR: "when the doctor clicks the specific patient...
// he should also be able to see the caregiver details and his response for
// the questions", plus the weekly-trigger + daily-pulse redesign): this now
// shows TWO separate histories instead of one daily list --
//   - Weekly Check-In: the 15-question set, one entry per patient
//     assessment (unlockedForDate), each question SNAPSHOTTED at unlock
//     time (see CaregiverProfileEngine.js) so this never needs to
//     reconstruct "which questions applied" from a rotation engine anymore.
//   - Quick Daily Check-In: the 2-question daily pulse, one entry per
//     calendar day -- these questions are fixed (no rotation), so they're
//     read straight from caregiverMicroCheckinConfig.js.
//
// Access: FirestoreCaregiverService.getCaregiverForPatient requires the
// signed-in doctor to have an ACCEPTED careRelationship with this exact
// patient (enforced in firestore.rules, not just here) -- a doctor who
// hasn't been accepted by this patient gets a clear, honest
// `permission-denied` message instead of silently seeing nothing.
function WeeklyEntry({ entry }) {
  const [expanded, setExpanded] = useState(false);
  const questions = entry.questions || [];
  const answeredCount = questions.filter((q) => entry.completion?.[q.id] !== undefined && entry.completion?.[q.id] !== null && entry.completion?.[q.id] !== '').length;

  return (
    <li className="nmdd-list__item">
      <button
        type="button"
        className="nmdd-link"
        onClick={() => setExpanded((v) => !v)}
        style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}
      >
        <span>Assessment on {entry.unlockedForDate} -- <span className="nmdd-muted">{DEEP_STATUS_LABEL[entry.status] || entry.status}</span></span>
        <span className="nmdd-muted">{answeredCount}/{questions.length} answered {expanded ? '▲' : '▼'}</span>
      </button>
      {expanded && (
        <dl style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr', gap: 6 }}>
          {questions.map((q) => (
            <div key={q.id} style={{ display: 'flex', flexDirection: 'column', paddingBottom: 6, borderBottom: '1px solid var(--nmdd-border)' }}>
              <dt className="nmdd-muted" style={{ fontSize: 12.5 }}>{q.label}</dt>
              <dd style={{ margin: 0, fontWeight: 500 }}>{formatAnswer(q, entry.completion?.[q.id])}</dd>
            </div>
          ))}
        </dl>
      )}
    </li>
  );
}

function MicroEntry({ day }) {
  const [expanded, setExpanded] = useState(false);
  const questions = CAREGIVER_MICRO_QUESTIONS;
  const answeredCount = questions.filter((q) => day.completion?.[q.id] !== undefined && day.completion?.[q.id] !== null && day.completion?.[q.id] !== '').length;

  return (
    <li className="nmdd-list__item">
      <button
        type="button"
        className="nmdd-link"
        onClick={() => setExpanded((v) => !v)}
        style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}
      >
        <span>{day.date}</span>
        <span className="nmdd-muted">{answeredCount}/{questions.length} answered {expanded ? '▲' : '▼'}</span>
      </button>
      {expanded && (
        <dl style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr', gap: 6 }}>
          {questions.map((q) => (
            <div key={q.id} style={{ display: 'flex', flexDirection: 'column', paddingBottom: 6, borderBottom: '1px solid var(--nmdd-border)' }}>
              <dt className="nmdd-muted" style={{ fontSize: 12.5 }}>{q.label}</dt>
              <dd style={{ margin: 0, fontWeight: 500 }}>{formatAnswer(q, day.completion?.[q.id])}</dd>
            </div>
          ))}
        </dl>
      )}
    </li>
  );
}

export default function CaregiverResponsesPanel({ patientId }) {
  const state = useCaregiverResponses(patientId);

  if (state.status === 'loading') {
    return (
      <SectionCard title="Caregiver Daily Responses">
        <p className="nmdd-muted">Loading...</p>
      </SectionCard>
    );
  }

  if (state.status === 'error') {
    return (
      <SectionCard title="Caregiver Daily Responses">
        <p className="nmdd-alert nmdd-alert--warn">{state.error}</p>
      </SectionCard>
    );
  }

  if (!state.caregiver) {
    return (
      <SectionCard title="Caregiver Daily Responses">
        <EmptyState title="No caregiver linked" message="This patient has not linked a caregiver account yet." />
      </SectionCard>
    );
  }

  const { caregiver } = state;
  const { weeklyEntries, microDays } = buildCaregiverEntries(caregiver);

  return (
    <SectionCard
      title="Caregiver Responses"
      subtitle={`${caregiver.name || 'Unnamed caregiver'} -- linked caregiver`}
    >
      <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 10px' }}>Weekly Check-In ({weeklyEntries.length})</h3>
      {weeklyEntries.length === 0 ? (
        <EmptyState title="No weekly check-ins yet" message="This unlocks for the caregiver once the patient completes a Detection Assessment." />
      ) : (
        <ul className="nmdd-list">
          {weeklyEntries.map((entry) => <WeeklyEntry key={entry.unlockedForDate} entry={entry} />)}
        </ul>
      )}

      <h3 style={{ fontSize: 14, fontWeight: 700, margin: '24px 0 10px' }}>Quick Daily Check-In ({microDays.length})</h3>
      {microDays.length === 0 ? (
        <EmptyState title="No daily check-ins yet" message="This caregiver hasn't completed a quick daily check-in yet." />
      ) : (
        <ul className="nmdd-list">
          {microDays.map((day) => <MicroEntry key={day.date} day={day} />)}
        </ul>
      )}
    </SectionCard>
  );
}
