// The six cognitive games below are embedded in this app's Games Suite.
// Daily Set cards route to the appropriate domain in that suite.
//
// 2026-08-14 correction: this file previously (incorrectly) listed Visual
// Memory Test / Delayed Recognition Test / Face Recognition Test as the
// daily "Memory" category's sub-games. Confirmed with the product owner:
// those three are part of the WEEKLY Detection Assessment (Final 8, tracks
// lobe function) and are a completely separate thing from the daily
// Memory/Reaction/Attention rotating games, which use their own, different
// game content (2 games per category, not yet sent). Removed the stale
// cross-reference so a patient never sees what looks like the same memory
// test counted twice under two different scores.
//
// Memory, Reaction, and Attention each rotate between the two embedded
// games that measure that domain. Speech remains a Daily Set category, but
// no speech-specific game is part of the suite yet.
export const GAME_CATEGORIES = [
  {
    id: 'memory',
    label: 'Memory',
    subGames: [
      { id: 'sequence', label: 'Sequence Memory' },
      { id: 'imagepairs', label: 'Image Pairs' },
    ],
    status: 'ready',
  },
  {
    id: 'reaction',
    label: 'Reaction',
    subGames: [
      { id: 'pointclick', label: 'Point & Click' },
      { id: 'whackmole', label: 'Whack the Mole' },
    ],
    status: 'ready',
  },
  {
    id: 'attention',
    label: 'Attention',
    subGames: [
      { id: 'oddball', label: 'Visual Oddball' },
      { id: 'spotdifference', label: 'Spot the Difference' },
    ],
    status: 'ready',
  },
];

// Games currently embedded in the app. Facial Expressivity is played
// directly in the Daily Set; the other six are available through the
// integrated Games Suite.
export const CONNECTED_GAMES = [
  {
    id: 'facial-expressivity',
    label: 'Facial Expressivity Test',
    category: 'Facial Expressivity',
    description: 'A short, camera-based check-in -- follow on-screen prompts while your facial expressivity is measured. No video is ever recorded or stored.',
  },
  { id: 'sequence', label: 'Sequence Memory', category: 'Memory' },
  { id: 'imagepairs', label: 'Image Pairs', category: 'Memory' },
  { id: 'pointclick', label: 'Point & Click', category: 'Reaction' },
  { id: 'whackmole', label: 'Whack the Mole', category: 'Reaction' },
  { id: 'oddball', label: 'Visual Oddball', category: 'Attention' },
  { id: 'spotdifference', label: 'Spot the Difference', category: 'Attention' },
];
