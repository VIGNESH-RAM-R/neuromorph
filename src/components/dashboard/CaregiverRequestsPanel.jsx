import { useCallback, useEffect, useState } from 'react';
import { FirestoreCareRelationshipService } from '../../services/FirestoreCareRelationshipService.js';
import { isFirebaseConfigured } from '../../config/firebaseConfig.js';
import { DEFAULT_LANGUAGE } from '../../config/i18nConfig.js';
import { t, format } from '../../i18n/strings/dashboard.js';

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
//
// 2026-08-26: full i18n pass (see src/i18n/strings/dashboard.js). This is
// PATIENT-facing chrome around a caregiver relationship, not the
// caregiver's own check-in UI, so it's in scope per VR's "skip caregiver
// for now" instruction (that instruction covers src/components/caregiver/**
// and caregiver question content only).
export default function CaregiverRequestsPanel({ patientId, language = DEFAULT_LANGUAGE }) {
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
          ? format(t(language, 'caregiverNowLinked'), { name: request.memberName || t(language, 'thatCaregiverFallback') })
          : format(t(language, 'declinedFeedback'), { name: request.memberName || t(language, 'thatRequestFallback') }),
      });
      await loadRequests();
    } catch (err) {
      setFeedback({ type: 'error', text: err?.message || t(language, 'couldNotRespond') });
    } finally {
      setRespondingId(null);
    }
  };

  if (!isFirebaseConfigured || !patientId || requests.length === 0) return null;

  return (
    <section className="nmpa-card nmpa-anim-fade-up" style={{ '--nmpa-anim-delay': '320ms' }}>
      <div className="nmpa-section__header">
        <h2 className="nmpa-card__title">{t(language, 'caregiverRequestsTitle')}</h2>
        <span className="nmpa-tag nmpa-tag--info">{format(t(language, 'pendingCountTag'), { count: requests.length })}</span>
      </div>
      <p className="nmpa-muted">
        {t(language, 'caregiverRequestsDescription')}
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
              <strong>{req.memberName || t(language, 'unnamedCaregiverFallback')}</strong>
              <div className="nmpa-muted nmpa-muted--sm">{t(language, 'wantsToBeCaregiver')}</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                className="nmpa-button nmpa-button--secondary"
                disabled={respondingId === req.memberId}
                onClick={() => handleRespond(req, false)}
              >
                {t(language, 'declineButton')}
              </button>
              <button
                type="button"
                className="nmpa-button nmpa-button--primary"
                disabled={respondingId === req.memberId}
                onClick={() => handleRespond(req, true)}
              >
                {respondingId === req.memberId ? t(language, 'savingButton') : t(language, 'acceptButton')}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
