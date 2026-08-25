import { useCallback, useEffect, useState } from 'react';
import { FirestoreCareRelationshipService } from '../../services/FirestoreCareRelationshipService.js';
import { isFirebaseConfigured } from '../../config/firebaseConfig.js';

// 2026-08-23 ADDITION -- the patient-side half of the caregiver connection
// redesign (see FirestoreCareRelationshipService.js's careRelationships
// section and CaregiverLinkPatientScreen.jsx). Mirrors
// ConnectionRequestsScreen.jsx (the doctor dashboard's inbox for pending
// PATIENT requests) but the other direction: a patient reviewing pending
// CAREGIVER requests -- someone who redeemed their invite code and is now
// waiting for approval before they can see/answer on the patient's behalf.
// Rendered on the patient's own Home, right next to the invite-code
// generator, so both halves of the caregiver connection (generate a code /
// approve who used it) live in one place.
export default function CaregiverRequestsPanel({ patientId }) {
  const [requests, setRequests] = useState([]);
  const [respondingId, setRespondingId] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const loadRequests = useCallback(async () => {
    if (!isFirebaseConfigured || !patientId) return;
    try {
      const list = await FirestoreCareRelationshipService.listPendingCaregiverRequestsForPatient(patientId);
      setRequests(list);
    } catch (err) {
      console.error('Could not load caregiver requests:', err);
    }
  }, [patientId]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleRespond = async (request, accept) => {
    setRespondingId(request.memberId);
    setFeedback(null);
    try {
      await FirestoreCareRelationshipService.respondToCaregiverRequest(patientId, request.memberId, accept);
      setFeedback({
        type: 'success',
        text: accept
          ? `${request.memberName || 'That caregiver'} is now linked to your account.`
          : `Declined ${request.memberName || 'that request'}.`,
      });
      await loadRequests();
    } catch (err) {
      setFeedback({ type: 'error', text: err?.message || 'Could not respond to that request right now.' });
    } finally {
      setRespondingId(null);
    }
  };

  if (!isFirebaseConfigured || !patientId || requests.length === 0) return null;

  return (
    <section className="nmpa-card nmpa-anim-fade-up" style={{ '--nmpa-anim-delay': '320ms' }}>
      <div className="nmpa-section__header">
        <h2 className="nmpa-card__title">Caregiver Requests</h2>
        <span className="nmpa-tag nmpa-tag--info">{requests.length} pending</span>
      </div>
      <p className="nmpa-muted">
        Someone used a caregiver invite code you shared. Approve them to let them see and answer your daily
        check-in questions -- your doctor will be able to review their answers alongside your own progress.
      </p>

      {feedback && (
        <p className={`nmpa-alert ${feedback.type === 'error' ? 'nmpa-alert--danger' : 'nmpa-alert--info'}`} style={{ marginTop: 10 }}>
          {feedback.text}
        </p>
      )}

      <ul className="nmpa-list" style={{ marginTop: 12 }}>
        {requests.map((req) => (
          <li key={req.id} className="nmpa-list__item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
            <div>
              <strong>{req.memberName || 'Unnamed caregiver'}</strong>
              <div className="nmpa-muted nmpa-muted--sm">Wants to be your caregiver</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                className="nmpa-button nmpa-button--secondary"
                disabled={respondingId === req.memberId}
                onClick={() => handleRespond(req, false)}
              >
                Decline
              </button>
              <button
                type="button"
                className="nmpa-button nmpa-button--primary"
                disabled={respondingId === req.memberId}
                onClick={() => handleRespond(req, true)}
              >
                {respondingId === req.memberId ? 'Saving...' : 'Accept'}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
