// Mirrors the ACTIVE task set from lobarTaskRegistryConfig.js -- display
// only here (this app doesn't compute lobe scores itself), but kept as its
// own config file rather than inline JSX so it's one edit if the active
// task list changes again.
//
// 2026-08-11: the real Final 8 lineup replaced the original 12-task
// catalogue's active set (see lobarTaskRegistryConfig.js's header comment
// for the full story). 2026-08-14: all 8 of 8 are now wired in. Same-day
// follow-up: Visual Memory and Face Recognition moved from Temporal to
// Occipital -- a real reclassification (both centrally involve occipital
// visual-processing circuits, not just temporal memory), not a fudge --
// which also fixes Occipital having no active task at all. Every lobe now
// shows exactly 2 tasks.
export const LOBES = [
  {
    key: 'frontal',
    label: 'Frontal Lobe',
    tasks: ['Stroop Task', 'Go / No-Go'],
  },
  {
    key: 'temporal',
    label: 'Temporal Lobe',
    tasks: ['Token Test', 'Delayed Recognition Memory'],
  },
  {
    key: 'parietal',
    label: 'Parietal Lobe',
    tasks: ['Matrix Reasoning', 'Geometric Shape Copy'],
  },
  {
    key: 'occipital',
    label: 'Occipital Lobe',
    tasks: ['Visual Memory', 'Face Recognition'],
  },
];

export const QUESTION_BANK_INFO = {
  totalQuestions: 10,
  sourcePoolSize: 100,
  rule: '2 questions per brain region, rotated each week so you rarely see the same set twice in a row.',
};
