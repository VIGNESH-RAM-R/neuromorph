import { CAREGIVER_CORE_QUESTIONS, CAREGIVER_ROTATING_POOL, CAREGIVER_ROTATING_COUNT } from '../config/caregiverDailyConfig.js';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function epochDayNumber(dateIso) {
  return Math.floor(new Date(`${dateIso}T00:00:00Z`).getTime() / MS_PER_DAY);
}

// Deterministic (never Math.random) day-to-question-set picker, same
// philosophy as DailyGameRotationEngine.js: the same date always resolves
// to the same 10 rotating questions, so reloading mid-day never changes
// what's asked, and this stays trivially unit-testable.
//
// 2026-08-23 FIX: the previous version advanced the pool by a 1-item
// SLIDING WINDOW per day (offset = day % pool.length, then slice(0, N)).
// That meant two consecutive days shared N-1 of their N "rotating"
// questions -- effectively still asking almost the same thing every day,
// which is exactly what VR flagged ("need not repeat those questions").
// This version instead partitions the pool into disjoint CHUNKS of
// CAREGIVER_ROTATING_COUNT questions each (50 questions / 10 per day = 5
// whole chunks) and steps through one full chunk per day. Every day's 10
// rotating questions are therefore completely different from the
// previous day's, and the exact same 10 only come back around once every
// 5 days -- "very rarely" repeats, matching what was asked, while still
// giving a doctor full domain coverage (mobility, hygiene, cognition,
// mood, safety, and more) across roughly a week.
export const CaregiverDailyRotationEngine = {
  rotatingQuestionsFor(dateIso) {
    if (!dateIso) return [];
    const pool = CAREGIVER_ROTATING_POOL;
    const chunkCount = Math.max(1, Math.floor(pool.length / CAREGIVER_ROTATING_COUNT));
    const chunkIndex = epochDayNumber(dateIso) % chunkCount;
    const start = chunkIndex * CAREGIVER_ROTATING_COUNT;
    return pool.slice(start, start + CAREGIVER_ROTATING_COUNT);
  },

  // The full 15-question set for a given date -- 5 core questions first,
  // then that day's 10 rotating questions, in that order (matches how the
  // check-in UI renders them).
  questionsFor(dateIso) {
    return [...CAREGIVER_CORE_QUESTIONS, ...this.rotatingQuestionsFor(dateIso)];
  },
};
