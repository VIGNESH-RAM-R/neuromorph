import { IMAGE_PAIRS_STORAGE_KEY } from '../config/imagePairsConfig.js';
import { isBrowserStorageAvailable, getDeviceInfo } from './browserEnv.js';

/**
 * Local persistence for completed Image Pairs assessments. As with the
 * other Neuromorph modules, this is a frontend-prototype storage layer —
 * if a backend or an existing patient/user system is added later, this
 * file is the single integration point to swap localStorage for API calls
 * without touching assessment/UI logic (spec section 56).
 */

function isValidAssessment(record) {
  return (
    record &&
    typeof record === 'object' &&
    record.completionStatus === 'COMPLETED' &&
    typeof record.timestamp === 'number' &&
    record.summary &&
    typeof record.summary === 'object'
  );
}

/** Returns all validly-completed, stored assessments (never incomplete/corrupt entries). */
export function loadAssessments() {
  if (!isBrowserStorageAvailable()) return [];
  try {
    const raw = window.localStorage.getItem(IMAGE_PAIRS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidAssessment).sort((a, b) => a.timestamp - b.timestamp);
  } catch {
    return [];
  }
}

/** Appends a completed assessment record and returns the updated list. */
export function saveAssessment(assessment) {
  if (!isBrowserStorageAvailable()) return loadAssessments();
  try {
    const existing = loadAssessments();
    const updated = [...existing, assessment];
    window.localStorage.setItem(IMAGE_PAIRS_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return loadAssessments();
  }
}

/** The earliest completed assessment is treated as the personal baseline. */
export function getBaseline(assessments) {
  if (!assessments || assessments.length === 0) return null;
  return assessments[0];
}

export { getDeviceInfo };
