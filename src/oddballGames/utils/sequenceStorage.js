import { SEQUENCE_STORAGE_KEY } from '../config/sequenceConfig.js';
import { isBrowserStorageAvailable, getDeviceInfo } from './browserEnv.js';

/**
 * Local persistence for completed Sequence Memory assessments.
 *
 * This is a frontend-prototype storage layer. If Neuromorph later gains a
 * backend or an existing patient/user system, this module is the single
 * integration point to swap localStorage for API calls without touching
 * assessment/UI logic.
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
    const raw = window.localStorage.getItem(SEQUENCE_STORAGE_KEY);
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
    window.localStorage.setItem(SEQUENCE_STORAGE_KEY, JSON.stringify(updated));
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

/** The most recently completed assessment, if any. */
export function getLatestAssessment(assessments) {
  if (!assessments || assessments.length === 0) return null;
  return assessments[assessments.length - 1];
}

export { getDeviceInfo };
