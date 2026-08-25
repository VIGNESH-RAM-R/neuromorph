// The "Daily Set" -- the minimum bundle that counts toward today's streak
// and Momentum Score. Deliberately soft-mandatory (streak-driven, not a
// hard lockout), per the earlier project decision to avoid punitive UX for
// a potentially cognitively-vulnerable user base.
//
// 2026-08-19 REDESIGN (per direct product spec): exactly 5 named items --
// Face, Speech, Memory, Reaction, Attention -- all 5 required to complete
// the day's mission, full stop. This replaces the earlier 4-item shape
// (a single "rotating-game" slot covering Memory/Reaction/Attention as ONE
// item, plus a separate "daily-questions" self-report item):
//   - The rotating-game slot is now split into 3 REAL slots (memory,
//     reaction, attention), each still "rotating" -- but the rotation now
//     happens WITHIN each category (2 sub-games per category, one played
//     per day -- see gamesConfig.js + DailyGameRotationEngine.js), not
//     across categories. So the patient sees all 3 cognitive domains every
//     single day, not just one of the three.
//   - 'daily-questions' is DROPPED from this mandatory template. It was
//     never named in the "5 things" spec, and it had zero real component
//     wired in anyway (GamesSection always showed it as "Coming soon"), so
//     removing it costs nothing real today. This is a deliberate judgment
//     call, flagged here and in the summary delivered alongside this
//     change -- easy to reintroduce as a 6th item later if wanted.
// Order below matches the order given in the spec: face, speech, memory,
// reaction, attention.
export const DAILY_TASK_TEMPLATE = [
  { id: 'facial-expressivity', label: 'Facial Expressivity Check-in', category: 'face', description: 'A short facial-expressivity exercise. Mandatory.' },
  { id: 'speech', label: 'Speech Check-in', category: 'speech', description: 'A short speech-based exercise. Mandatory.' },
  { id: 'memory', label: 'Memory Game', category: 'memory', description: "Today's Memory game -- rotates between 2 games." },
  { id: 'reaction', label: 'Reaction Game', category: 'reaction', description: "Today's Reaction game -- rotates between 2 games." },
  { id: 'attention', label: 'Attention Game', category: 'attention', description: "Today's Attention game -- rotates between 2 games." },
];

export const DAILY_TASK_KEYS = DAILY_TASK_TEMPLATE.map((t) => t.id);
