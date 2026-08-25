import { SPOT_DIFFERENCE_STORAGE_KEY } from '../config/spotDifferenceConfig.js';
import { isBrowserStorageAvailable, getDeviceInfo } from './browserEnv.js';

/**
 * Local persistence for completed Spot the Difference sessions. Mirrors
 * oddballStorage.js — the single integration point to swap localStorage for
 * a real backend later without touching assessment/UI logic.
 */

function isValidAssessment(record) {
  return (
    record &&
    typeof record === 'object' &&
    record.completionStatus === 'COMPLETED' &&
    typeof record.timestamp === 'number' &&
    typeof record.levelsCompleted === 'number'
  );
}

/** Returns all validly-completed, stored sessions (never incomplete/corrupt entries). */
export function loadAssessments() {
  if (!isBrowserStorageAvailable()) return [];
  try {
    const raw = window.localStorage.getItem(SPOT_DIFFERENCE_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidAssessment).sort((a, b) => a.timestamp - b.timestamp);
  } catch {
    return [];
  }
}

/** Appends a completed session record and returns the updated list. */
export function saveAssessment(assessment) {
  if (!isBrowserStorageAvailable()) return loadAssessments();
  try {
    const existing = loadAssessments();
    const updated = [...existing, assessment];
    window.localStorage.setItem(SPOT_DIFFERENCE_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return loadAssessments();
  }
}

/** The earliest completed session is treated as the personal baseline. */
export function getBaseline(assessments) {
  if (!assessments || assessments.length === 0) return null;
  return assessments[0];
}

/** The most recent completed session before the current one, if any. */
export function getPrevious(assessments) {
  if (!assessments || assessments.length === 0) return null;
  return assessments[assessments.length - 1];
}

export { getDeviceInfo };
