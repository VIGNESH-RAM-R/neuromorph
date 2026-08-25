import { useEffect, useState, useCallback } from 'react';
import { FirestoreDoctorService } from '../../services/FirestoreDoctorService.js';
import { FirestoreCareRelationshipService } from '../../services/FirestoreCareRelationshipService.js';
import { isFirebaseConfigured } from '../../config/firebaseConfig.js';

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
function statusLabel(status) {
  if (status === 'pending') return 'Request sent -- waiting for the doctor to respond';
  if (status === 'accepted') return 'Connected';
  if (status === 'declined') return 'Declined';
  if (status === 'revoked') return 'Removed';
  return status;
}

function statusTagClass(status) {
  if (status === 'accepted') return 'nmpa-tag--success';
  if (status === 'pending') return 'nmpa-tag--info';
  if (status === 'declined' || status === 'revoked') return 'nmpa-tag--neutral';
  return '';
}

export default function CareTeamSection({ patientId, patientName }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [relationships, setRelationships] = useState([]);
  const [sendingId, setSendingId] = useState(null);
  const [feedback, setFeedback] = useState(null);

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
      setSearchError('Doctor search needs a connected Firebase project.');
      return;
    }
    setIsSearching(true);
    setSearchError(null);
    setFeedback(null);
    try {
      const found = await FirestoreDoctorService.searchDoctors(query);
      setResults(found);
    } catch (err) {
      setSearchError(err?.message || 'Could not search for doctors right now.');
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
          ? { type: 'info', text: `You already have a ${result.relationship.status} connection with ${doctor.name}.` }
          : { type: 'success', text: `Request sent to ${doctor.name}.` },
      );
      await loadRelationships();
    } catch (err) {
      setFeedback({ type: 'error', text: err?.message || 'Could not send the request. Please try again.' });
    } finally {
      setSendingId(null);
    }
  };

  const alreadyRequestedIds = new Set(
    relationships.filter((r) => r.memberRole === 'doctor' && ['pending', 'accepted'].includes(r.status)).map((r) => r.memberId),
  );

  return (
    <section className="nmpa-card nmpa-anim-fade-up" style={{ '--nmpa-anim-delay': '90ms' }}>
      <h2 className="nmpa-card__title">Your Care Team</h2>
      <p className="nmpa-muted">
        Find a doctor by name or their ID (e.g. NMD-A1B2C3) and send them a request. Once they accept, they can
        review {patientName || 'this patient'}'s assessment scores and progress from their dashboard.
      </p>

      <form onSubmit={handleSearch} className="nmpa-inline-form" style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <input
          type="text"
          className="nmpa-input"
          placeholder="Search by doctor name or ID"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ flex: 1 }}
        />
        <button type="submit" className="nmpa-button nmpa-button--secondary" disabled={isSearching || !query.trim()}>
          {isSearching ? 'Searching...' : 'Search'}
        </button>
      </form>

      {searchError && <p className="nmpa-alert nmpa-alert--danger" style={{ marginTop: 10 }}>{searchError}</p>}
      {feedback && (
        <p className={`nmpa-alert ${feedback.type === 'error' ? 'nmpa-alert--danger' : 'nmpa-alert--info'}`} style={{ marginTop: 10 }}>
          {feedback.text}
        </p>
      )}

      {results.length > 0 && (
        <ul className="nmpa-list" style={{ marginTop: 12 }}>
          {results.map((doctor) => (
            <li key={doctor.uid} className="nmpa-list__item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
              <div>
                <strong>{doctor.name}</strong>
                {doctor.specialty && <span className="nmpa-muted nmpa-muted--sm"> -- {doctor.specialty}</span>}
                {doctor.licenseRegion && <div className="nmpa-muted nmpa-muted--sm">{doctor.licenseRegion}</div>}
              </div>
              <button
                type="button"
                className="nmpa-button nmpa-button--primary"
                disabled={sendingId === doctor.uid || alreadyRequestedIds.has(doctor.uid)}
                onClick={() => handleSendRequest(doctor)}
              >
                {alreadyRequestedIds.has(doctor.uid) ? 'Requested' : sendingId === doctor.uid ? 'Sending...' : 'Send Request'}
              </button>
            </li>
          ))}
        </ul>
      )}

      {relationships.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h3 className="nmpa-card__subtitle">Your connections</h3>
          <ul className="nmpa-list">
            {relationships.map((rel) => (
              <li key={rel.id} className="nmpa-list__item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{rel.memberName || 'Unnamed'}</strong>
                  <span className="nmpa-muted nmpa-muted--sm"> -- {rel.memberRole === 'doctor' ? 'Doctor' : 'Caregiver'}</span>
                </div>
                <span className={`nmpa-tag ${statusTagClass(rel.status)}`}>{statusLabel(rel.status)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
