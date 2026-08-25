import { useEffect, useState, useCallback } from 'react';
import SectionCard from '../shared/SectionCard.jsx';
import EmptyState from '../shared/EmptyState.jsx';
import { FirestoreCareRelationshipService } from '../../../services/FirestoreCareRelationshipService.js';

// 2026-08-23 ADDITION -- the doctor-side inbox for the connection system
// (see CARE_CONNECTION_PROMPT.md). A patient search-and-request from
// app_page's CareTeamSection.jsx lands here as a pending
// /careRelationships doc; accepting is what actually grants this doctor
// account access to that patient's report (see
// FirestorePatientService.listPatientRecords, which now only returns
// patients with an ACCEPTED relationship to the signed-in doctor).
export default function ConnectionRequestsScreen({ doctorUid, onRespond }) {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [respondingId, setRespondingId] = useState(null);

  const load = useCallback(async () => {
    if (!doctorUid) return;
    setIsLoading(true);
    setError(null);
    try {
      const list = await FirestoreCareRelationshipService.listPendingRequestsForDoctor(doctorUid);
      setRequests(list);
    } catch (err) {
      setError(err?.message || 'Could not load connection requests.');
    } finally {
      setIsLoading(false);
    }
  }, [doctorUid]);

  useEffect(() => {
    load();
  }, [load]);

  const respond = async (request, accept) => {
    setRespondingId(request.id);
    try {
      await FirestoreCareRelationshipService.respondToDoctorRequest(request.patientId, doctorUid, accept);
      setRequests((prev) => prev.filter((r) => r.id !== request.id));
      if (accept && onRespond) onRespond(); // let the caller reload the patient roster
    } catch (err) {
      setError(err?.message || 'Could not respond to this request.');
    } finally {
      setRespondingId(null);
    }
  };

  return (
    <SectionCard title="Connection Requests" subtitle="Patients who have asked to share their progress with you">
      {isLoading && <p className="nmdd-muted">Loading requests...</p>}
      {error && <p className="nmdd-alert nmdd-alert--warn">{error}</p>}
      {!isLoading && !error && requests.length === 0 && (
        <EmptyState title="No pending requests" message="When a patient searches for you and sends a request, it will show up here." />
      )}
      {requests.length > 0 && (
        <ul className="nmdd-list">
          {requests.map((req) => (
            <li key={req.id} className="nmdd-list__item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <div>
                <strong>{req.patientName || 'Unnamed patient'}</strong>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  className="nmdd-button nmdd-button--primary"
                  disabled={respondingId === req.id}
                  onClick={() => respond(req, true)}
                >
                  Accept
                </button>
                <button
                  type="button"
                  className="nmdd-button nmdd-button--secondary"
                  disabled={respondingId === req.id}
                  onClick={() => respond(req, false)}
                >
                  Decline
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
