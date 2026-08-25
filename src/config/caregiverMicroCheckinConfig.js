// 2026-08-24 ADDITION (VR: "as the caregiver play a major role in the
// patient's life -- can we give them some simpler tasks on day to day
// basis... so it again enhances the doctor's overall views and conclusion
// on the patient"). This is a SEPARATE, much lighter check-in from the
// 15-question deep one in caregiverDailyConfig.js -- two questions, every
// day, no rotation, answerable in a few seconds. Its point isn't clinical
// depth (the deep check-in still owns that) -- it's continuity: a daily
// signal for the doctor to look at BETWEEN the weekly deep check-ins,
// instead of the app going quiet for up to a week between them.
//
// Deliberately fixed (not drawn from a pool) -- with only two questions,
// rotating them would just mean "a different one of two questions today",
// which reads as arbitrary rather than useful. A caregiver seeing the same
// two questions every day, answered in seconds, is the intended UX here,
// not a design gap.
export const CAREGIVER_MICRO_QUESTIONS = [
  {
    id: 'microOverallToday',
    type: 'scale',
    label: "In one word: how was today for them overall?",
    scaleLabels: ['Very poor', 'Poor', 'Okay', 'Good', 'Very good'],
  },
  {
    id: 'microAnythingUnusual',
    type: 'yesno',
    label: 'Anything unusual or concerning today, even something small?',
  },
];
