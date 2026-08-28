import { useEffect, useState, useCallback } from 'react';
import { FirestoreDoctorService } from '../../services/FirestoreDoctorService.js';
import { FirestoreCareRelationshipService } from '../../services/FirestoreCareRelationshipService.js';
import { isFirebaseConfigured } from '../../config/firebaseConfig.js';
import { DEFAULT_LANGUAGE } from '../../config/i18nConfig.js';
import { t, format } from '../../i18n/strings/dashboard.js';

// 2026-08-23 ADDITION -- the doctor-connection half of the connection
// system (see CARE_CONNECTION_PROMPT.md): search for a doctor by name OR
// their NMD- ID, send a connection request, and see the status of every
// doctor/caregiver relationship for this patient.
//
// 2026-08-23 WIDENED: this used to assume it was always rendered for the
// signed-in PATIENT (`currentUser`). It's now rendered on BOTH the
// patient's own Reports section AND the caregiver's Home page (VR
// feedback: "in the patient dashboard and caregiver login both the
// pages, i want the search bar") -- a caregiver can search for and
// request a doctor connection on behalf of the patient they're linked to,
// without the patient having to do it themselves. `patientId`/
// `patientName` identify WHOSE care team this is (the signed-in patient's
// own uid/name, or the caregiver's `linkedPatientUid`/`linkedPatientName`)
// -- separate from whoever is actually signed in and clicking the button.
//
// 2026-08-26: full i18n pass (see src/i18n/strings/dashboard.js). The
// English `status` values from FirestoreCareRelationshipService
// (pending/accepted/declined/revoked) stay untouched -- they're what
// statusTagClass keys off. Only the on-screen label is translated, via
// STATUS_LABEL_KEY, same precedent as StatusBadge.jsx's BAND_LABEL_KEY on
// the doctor dashboard.
const STATUS_LABEL_KEY = {
  pending: 'statusPending',
  accepted: 'statusAccepted',
  declined: 'statusDeclined',
  revoked: 'statusRevoked',
};

function statusLabel(status, language) {
  return STATUS_LABEL_KEY[status] ? t(language, STATUS_LABEL_KEY[status]) : status;
}

function statusTagClass(status) {
  if (status === 'accepted') return 'nmpa-tag--success';
  if (status === 'pending') return 'nmpa-tag--info';
  if (status === 'declined' || status === 'revoked') return 'nmpa-tag--neutral';
  return '';
}

export default function CareTeamSection({ patientId, patientName, language = DEFAULT_LANGUAGE }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [relationships, setRelationships] = useState([]);
  const [sendingId, setSendingId] = useState(null);
  const [feedback, setFeedback] = useState(null);
  // 2026-08-27 ADDITION (VR: "if not exist na - give me no search found,
  // illa some typo mistakes iruntha - give similar profiles"). `lastQuery`
  // is what the user actually searched (captured at submit time, not the
  // live `query` state, so the empty-state message doesn't change out from
  // under them if they start typing the next search before this one's
  // results render).
  const [hasSearched, setHasSearched] = useState(false);
  const [lastQuery, setLastQuery] = useState('');

  const loadRelationships = useCallback(async () => {
    if (!isFirebaseConfigured || !patientId) return;
    try {
      const list = await FirestoreCareRelationshipService.listRelationshipsForPatient(patientId);
      setRelationships(list);
    } catch (err) {
      // Non-fatal -- the search/send flow below still works even if the
      // status list fails to load.
      console.error('Could not load care relationships:', err);
    }
  }, [patientId]);

  useEffect(() => {
    loadRelationships();
  }, [loadRelationships]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!isFirebaseConfigured) {
      setSearchError(t(language, 'doctorSearchNeedsFirebase'));
      return;
    }
    const trimmed = query.trim();
    setIsSearching(true);
    setSearchError(null);
    setFeedback(null);
    setLastQuery(trimmed);
    try {
      const found = await FirestoreDoctorService.searchDoctors(trimmed);
      setResults(found);
      setHasSearched(true);
    } catch (err) {
      setSearchError(err?.message || t(language, 'couldNotSearchDoctors'));
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendRequest = async (doctor) => {
    if (!patientId) return;
    setSendingId(doctor.uid);
    setFeedback(null);
    try {
      const result = await FirestoreCareRelationshipService.sendDoctorRequest(
        patientId, patientName, doctor.uid, doctor.name,
      );
      setFeedback(
        result.alreadyExists
          ? { type: 'info', text: format(t(language, 'alreadyConnectedFeedback'), { doctorName: doctor.name, statusLabel: statusLabel(result.relationship.status, language) }) }
          : { type: 'success', text: format(t(language, 'requestSentFeedback'), { doctorName: doctor.name }) },
      );
      await loadRelationships();
    } catch (err) {
      setFeedback({ type: 'error', text: err?.message || t(language, 'couldNotSendRequest') });
    } finally {
      setSendingId(null);
    }
  };

  const alreadyRequestedIds = new Set(
    relationships.filter((r) => r.memberRole === 'doctor' && ['pending', 'accepted'].includes(r.status)).map((r) => r.memberId),
  );

  return (
    <section className="nmpa-card nmpa-anim-fade-up" style={{ '--nmpa-anim-delay': '90ms' }}>
      <h2 className="nmpa-card__title">{t(language, 'careTeamTitle')}</h2>
      <p className="nmpa-muted">
        {format(t(language, 'careTeamDescription'), { patientName: patientName || t(language, 'thisPatientFallback') })}
      </p>

      <form onSubmit={handleSearch} className="nmpa-inline-form" style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <input
          type="text"
          className="nmpa-input"
          placeholder={t(language, 'searchPlaceholder')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ flex: 1 }}
        />
        <button type="submit" className="nmpa-button nmpa-button--secondary" disabled={isSearching || !query.trim()}>
          {isSearching ? t(language, 'searchingButton') : t(language, 'searchButton')}
        </button>
      </form>

      {searchError && <p className="nmpa-alert nmpa-alert--danger" style={{ marginTop: 10 }}>{searchError}</p>}
      {feedback && (
        <p className={`nmpa-alert ${feedback.type === 'error' ? 'nmpa-alert--danger' : 'nmpa-alert--info'}`} style={{ marginTop: 10 }}>
          {feedback.text}
        </p>
      )}

      {!isSearching && !searchError && hasSearched && results.length === 0 && (
        <p className="nmpa-alert nmpa-alert--info" style={{ marginTop: 10 }}>
          {format(t(language, 'noDoctorsFoundLabel'), { query: lastQuery })}
        </p>
      )}

      {results.length > 0 && results[0].fuzzy && (
        <p className="nmpa-muted nmpa-muted--sm" style={{ marginTop: 10 }}>
          {format(t(language, 'similarProfilesLabel'), { query: lastQuery })}
        </p>
      )}

      {results.length > 0 && (
        <ul className="nmpa-list" style={{ marginTop: 12 }}>
          {results.map((doctor) => (
            <li key={doctor.uid} className="nmpa-list__item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
              <div>
                <strong>{doctor.name}</strong>
                {doctor.specialty && <span className="nmpa-muted nmpa-muted--sm"> -- {doctor.specialty}</span>}
                {doctor.doctorId && <div className="nmpa-muted nmpa-muted--sm">{doctor.doctorId}</div>}
                {doctor.licenseRegion && <div className="nmpa-muted nmpa-muted--sm">{doctor.licenseRegion}</div>}
              </div>
              <button
                type="button"
                className="nmpa-button nmpa-button--primary"
                disabled={sendingId === doctor.uid || alreadyRequestedIds.has(doctor.uid)}
                onClick={() => handleSendRequest(doctor)}
              >
                {alreadyRequestedIds.has(doctor.uid) ? t(language, 'requestedButton') : sendingId === doctor.uid ? t(language, 'sendingButton') : t(language, 'sendRequestButton')}
              </button>
            </li>
          ))}
        </ul>
      )}

      {relationships.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h3 className="nmpa-card__subtitle">{t(language, 'yourConnectionsTitle')}</h3>
          <ul className="nmpa-list">
            {relationships.map((rel) => (
              <li key={rel.id} className="nmpa-list__item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{rel.memberName || t(language, 'unnamedConnection')}</strong>
                  <span className="nmpa-muted nmpa-muted--sm"> -- {rel.memberRole === 'doctor' ? t(language, 'roleDoctor') : t(language, 'roleCaregiver')}</span>
                </div>
                <span className={`nmpa-tag ${statusTagClass(rel.status)}`}>{statusLabel(rel.status, language)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
