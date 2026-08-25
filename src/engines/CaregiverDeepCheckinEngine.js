import { CAREGIVER_CORE_QUESTIONS, CAREGIVER_ROTATING_POOL, CAREGIVER_ROTATING_COUNT } from '../config/caregiverDailyConfig.js';

// 2026-08-24 REDESIGN (VR: "we shall make this question set once in a
// week -- not daily... once after the patient completes the detection
// assessment -- the caregiver need to be there, he observes and then also
// he answers those 15 questions"). Replaces CaregiverDailyRotationEngine.js
// + CaregiverDailyTaskEngine.js's date-driven design.
//
// The 15-question set (5 fixed core + 10 rotating) is UNCHANGED in
// content -- caregiverDailyConfig.js is untouched. What changed is WHEN a
// set is generated and which 10 rotating questions it uses:
//   - OLD: a new set every calendar day, picked from the pool by date.
//   - NEW: a new set only when the linked patient completes their weekly
//     Detection Assessment (see CaregiverWeeklyUnlockEngine.js, which
//     decides WHEN to call pickQuestionSet below) -- picked by CYCLE
//     INDEX (how many times a set has been unlocked so far), not by date,
//     since the trigger is no longer calendar-based at all.
//
// Everything a caregiver actually answers is stored as a full QUESTION
// SNAPSHOT alongside the answers (see CaregiverProfileEngine.js's
// deepCheckin/deepCheckinHistory shape) rather than being reconstructed
// later from "what date was it" -- this is what lets history stay correct
// and readable forever, even if the rotating pool or chunk size changes
// down the line.
export const CaregiverDeepCheckinEngine = {
  // Deterministic (never Math.random): the same cycle index always
  // resolves to the same 10 questions, so this stays trivially testable.
  // Same non-overlapping CHUNK approach as before (50 questions / 10 per
  // set = 5 whole chunks) -- consecutive unlocks get completely different
  // rotating questions, and the exact same 10 only come back around once
  // every 5 unlocks.
  rotatingQuestionsForCycle(cycleIndex) {
    const pool = CAREGIVER_ROTATING_POOL;
    const chunkCount = Math.max(1, Math.floor(pool.length / CAREGIVER_ROTATING_COUNT));
    const safeIndex = ((cycleIndex % chunkCount) + chunkCount) % chunkCount; // handles negative input defensively
    const start = safeIndex * CAREGIVER_ROTATING_COUNT;
    return pool.slice(start, start + CAREGIVER_ROTATING_COUNT);
  },

  // The full 15-question set for a given unlock cycle -- 5 core questions
  // first, then that cycle's 10 rotating questions, in that order (matches
  // how the check-in UI renders them). This is what gets snapshotted into
  // deepCheckin.questions at unlock time.
  questionSetForCycle(cycleIndex) {
    return [...CAREGIVER_CORE_QUESTIONS, ...this.rotatingQuestionsForCycle(cycleIndex)];
  },

  buildChecklist(questions = [], completion = {}) {
    return questions.map((q) => ({
      ...q,
      completed: this._isAnswered(completion[q.id]),
    }));
  },

  isFullyComplete(questions = [], completion = {}) {
    return questions.filter((q) => q.type !== 'text').every((q) => this._isAnswered(completion[q.id]));
  },

  completionCount(questions = [], completion = {}) {
    const required = questions.filter((q) => q.type !== 'text');
    const done = required.filter((q) => this._isAnswered(completion[q.id])).length;
    return { done, total: required.length };
  },

  _isAnswered(value) {
    return value !== undefined && value !== null && value !== '';
  },
};
