import { useState } from 'react';
import SectionCard from '../shared/SectionCard.jsx';
import EmptyState from '../shared/EmptyState.jsx';
import { CAREGIVER_MICRO_QUESTIONS } from '../../../config/caregiverMicroCheckinConfig.js';
import { useCaregiverResponses } from '../../hooks/useCaregiverResponses.js';
import { formatCaregiverAnswer as formatAnswer, DEEP_STATUS_LABEL, buildCaregiverEntries } from '../../engines/CaregiverResponsesFormat.js';
import { DEFAULT_LANGUAGE } from '../../config/i18nConfig.js';
import { t, format } from '../../i18n/strings/report.js';

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
//
// 2026-08-26 i18n scope note: this panel's own chrome (title, headings,
// empty/loading states, "answered" counter) is translated below. The
// caregiver CONTENT it displays -- q.label (question text), formatAnswer()
// output, DEEP_STATUS_LABEL -- comes from CaregiverResponsesFormat.js and
// the caregiver question configs, which are explicitly out of scope for
// this pass (VR: caregiver-side translation is a separate, later task) --
// left as-is here so the two don't drift apart before that work happens.
function WeeklyEntry({ entry, language }) {
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
        <span>{format(t(language, 'assessmentOnDate'), { date: entry.unlockedForDate })} -- <span className="nmdd-muted">{DEEP_STATUS_LABEL[entry.status] || entry.status}</span></span>
        <span className="nmdd-muted">{format(t(language, 'answeredCount'), { answered: answeredCount, total: questions.length })} {expanded ? '▲' : '▼'}</span>
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

function MicroEntry({ day, language }) {
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
        <span className="nmdd-muted">{format(t(language, 'answeredCount'), { answered: answeredCount, total: questions.length })} {expanded ? '▲' : '▼'}</span>
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

export default function CaregiverResponsesPanel({ patientId, language = DEFAULT_LANGUAGE }) {
  const state = useCaregiverResponses(patientId);

  if (state.status === 'loading') {
    return (
      <SectionCard title={t(language, 'caregiverDailyResponsesTitle')}>
        <p className="nmdd-muted">{t(language, 'loadingEllipsis')}</p>
      </SectionCard>
    );
  }

  if (state.status === 'error') {
    return (
      <SectionCard title={t(language, 'caregiverDailyResponsesTitle')}>
        <p className="nmdd-alert nmdd-alert--warn">{state.error}</p>
      </SectionCard>
    );
  }

  if (!state.caregiver) {
    return (
      <SectionCard title={t(language, 'caregiverDailyResponsesTitle')}>
        <EmptyState title={t(language, 'noCaregiverLinkedTitle')} message={t(language, 'noCaregiverLinkedMessage')} />
      </SectionCard>
    );
  }

  const { caregiver } = state;
  const { weeklyEntries, microDays } = buildCaregiverEntries(caregiver);

  return (
    <SectionCard
      title={t(language, 'caregiverResponsesTitle')}
      subtitle={format(t(language, 'caregiverResponsesSubtitle'), { name: caregiver.name || t(language, 'unnamedCaregiver') })}
    >
      <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 10px' }}>{format(t(language, 'weeklyCheckinHeading'), { count: weeklyEntries.length })}</h3>
      {weeklyEntries.length === 0 ? (
        <EmptyState title={t(language, 'noWeeklyCheckinsTitle')} message={t(language, 'noWeeklyCheckinsMessage')} />
      ) : (
        <ul className="nmdd-list">
          {weeklyEntries.map((entry) => <WeeklyEntry key={entry.unlockedForDate} entry={entry} language={language} />)}
        </ul>
      )}

      <h3 style={{ fontSize: 14, fontWeight: 700, margin: '24px 0 10px' }}>{format(t(language, 'quickDailyCheckinHeading'), { count: microDays.length })}</h3>
      {microDays.length === 0 ? (
        <EmptyState title={t(language, 'noDailyCheckinsTitle')} message={t(language, 'noDailyCheckinsMessage')} />
      ) : (
        <ul className="nmdd-list">
          {microDays.map((day) => <MicroEntry key={day.date} day={day} language={language} />)}
        </ul>
      )}
    </SectionCard>
  );
}
