import SectionCard from '../shared/SectionCard.jsx';
import { DEFAULT_LANGUAGE } from '../../config/i18nConfig.js';
import { t, format } from '../../i18n/strings/report.js';

// 2026-08-26: session.status is a small, finite value set ('completed' /
// 'partial' -- see ReportModel.js / DoctorDashboardExportEngine.js), same
// display-only-translation precedent as StatusBadge.jsx's BAND_LABEL_KEY --
// the underlying English value is untouched, only the on-screen label
// translates. An unrecognized future status falls back to the raw value
// rather than rendering blank.
const SESSION_STATUS_KEY = {
  completed: 'sessionStatusCompleted',
  partial: 'sessionStatusPartial',
};

function formatDuration(ms, language) {
  if (typeof ms !== 'number') return '—';
  const minutes = Math.round(ms / 60000);
  return format(t(language, 'durationMinutes'), { minutes });
}

export default function PatientOverviewCard({ report, language = DEFAULT_LANGUAGE }) {
  const { patient, session, adherence } = report;
  const statusLabel = SESSION_STATUS_KEY[session.status] ? t(language, SESSION_STATUS_KEY[session.status]) : session.status;
  return (
    <SectionCard title={t(language, 'patientOverviewTitle')} className="nmdd-overview">
      <div className="nmdd-overview__grid">
        <div><span className="nmdd-kv__label">{t(language, 'labelName')}</span><span className="nmdd-kv__value">{patient.name}</span></div>
        <div><span className="nmdd-kv__label">{t(language, 'labelAge')}</span><span className="nmdd-kv__value">{patient.age}</span></div>
        <div><span className="nmdd-kv__label">{t(language, 'labelGender')}</span><span className="nmdd-kv__value">{patient.gender}</span></div>
        <div><span className="nmdd-kv__label">{t(language, 'labelPatientId')}</span><span className="nmdd-kv__value">{patient.patientId}</span></div>
        <div><span className="nmdd-kv__label">{t(language, 'labelAssessmentDate')}</span><span className="nmdd-kv__value">{session.date}</span></div>
        <div><span className="nmdd-kv__label">{t(language, 'labelDuration')}</span><span className="nmdd-kv__value">{formatDuration(session.durationMs, language)}</span></div>
        <div><span className="nmdd-kv__label">{t(language, 'labelStatus')}</span><span className="nmdd-kv__value">{statusLabel}</span></div>
        <div><span className="nmdd-kv__label">{t(language, 'labelPreviousAssessments')}</span><span className="nmdd-kv__value">{session.sessionCount - 1}</span></div>
        {/* 2026-08-27 ADDITION (VR: "antha specific patient ah click panna
            - caregiver pathi yum varanum") -- only rendered when this
            patient actually has an accepted caregiver (see
            FirestorePatientService.getPatientRecord); silently absent
            otherwise, never a fabricated "None" row. */}
        {patient.caregiverName && (
          <div><span className="nmdd-kv__label">{t(language, 'labelCaregiver')}</span><span className="nmdd-kv__value">{patient.caregiverName}</span></div>
        )}
        <div>
          <span className="nmdd-kv__label">{t(language, 'labelAdherence')}</span>
          <span className="nmdd-kv__value">
            {adherence.overdue
              ? format(t(language, 'adherenceOverdue'), { days: adherence.daysSinceLast })
              : format(t(language, 'adherenceOnTrack'), { date: adherence.nextDueDate })}
          </span>
        </div>
      </div>
      {patient.riskFactors?.length > 0 && (
        <div className="nmdd-overview__risks">
          <span className="nmdd-kv__label">{t(language, 'labelRiskFactors')}</span>
          <ul className="nmdd-taglist">
            {patient.riskFactors.map((rf) => (
              <li key={rf} className="nmdd-tag">{rf}</li>
            ))}
          </ul>
        </div>
      )}
    </SectionCard>
  );
}
