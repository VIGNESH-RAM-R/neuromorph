// 2026-08-25 ADDITION -- shared, pure formatting/shaping helpers for the
// caregiver's weekly deep + daily micro check-in history, used by BOTH
// CaregiverResponsesPanel.jsx (on-screen) and PrintableReport.jsx (the
// exported PDF), so "the doctor should see the caregiver's responses in the
// same PDF" (VR) reads from the exact same logic as the live screen instead
// of a second, driftable copy.
export function formatCaregiverAnswer(question, value) {
  if (value === undefined || value === null || value === '') return '—'; // em dash: not answered
  if (question.type === 'yesno') return value === true ? 'Yes' : value === false ? 'No' : String(value);
  if (question.type === 'scale' && question.scaleLabels?.[value - 1]) return `${value} -- ${question.scaleLabels[value - 1]}`;
  return String(value);
}

export const DEEP_STATUS_LABEL = { available: 'In progress', completed: 'Completed', expired: 'Expired, unanswered' };

// The current in-progress set is only surfaced separately if it hasn't
// already landed in history (a 'completed' set is pushed into history the
// instant it's finished -- see CaregiverProfileEngine.applyDeepCheckinAnswer
// -- so only an 'available'/unanswered current set is still live-only).
export function buildCaregiverEntries(caregiver) {
  const weeklyEntries = [
    ...(caregiver?.deepCheckin?.status === 'available' ? [caregiver.deepCheckin] : []),
    ...([...(caregiver?.deepCheckinHistory || [])].reverse()),
  ];
  const microDays = [
    ...(caregiver?.microToday?.date ? [caregiver.microToday] : []),
    ...([...(caregiver?.microDailyHistory || [])].reverse()),
  ];
  return { weeklyEntries, microDays };
}
