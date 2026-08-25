import { ODDBALL_CONFIG, STIMULI } from '../config/oddballConfig.js';

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** True if no two 'target' entries are closer than minSpacing standard trials apart. */
function respectsSpacing(sequence, minSpacing) {
  let sinceLastTarget = Infinity;
  for (const kind of sequence) {
    if (kind === 'target') {
      if (sinceLastTarget < minSpacing) return false;
      sinceLastTarget = 0;
    } else {
      sinceLastTarget += 1;
    }
  }
  return true;
}

/**
 * Deterministic fallback: evenly distributes targets across the sequence
 * respecting minSpacing. Used only if random shuffling repeatedly fails
 * (extremely unlikely for the configured trial counts/spacing).
 */
function evenlySpacedSequence(totalCount, targetCount, minSpacing) {
  const sequence = new Array(totalCount).fill('standard');
  if (targetCount === 0) return sequence;
  const step = Math.max(minSpacing + 1, Math.floor(totalCount / targetCount));
  let placed = 0;
  let idx = Math.floor(step / 2);
  while (placed < targetCount && idx < totalCount) {
    sequence[idx] = 'target';
    placed += 1;
    idx += step;
  }
  // Place any remaining targets (rounding shortfall) into the first
  // available slots that still satisfy spacing.
  idx = 0;
  while (placed < targetCount && idx < totalCount) {
    if (sequence[idx] === 'standard') {
      const trial = [...sequence];
      trial[idx] = 'target';
      if (respectsSpacing(trial, minSpacing)) {
        sequence[idx] = 'target';
        placed += 1;
      }
    }
    idx += 1;
  }
  return sequence;
}

function buildTrials(sequence) {
  return sequence.map((stimulusType, index) => ({
    trialNumber: index + 1,
    stimulusType, // 'standard' | 'target'
    stimulusId: stimulusType === 'target' ? STIMULI.target.id : STIMULI.standard.id,
  }));
}

/**
 * Generates a randomized, non-predictable trial sequence for the actual
 * assessment. Re-shuffles until minimum target spacing is satisfied, with a
 * deterministic fallback to guarantee termination.
 */
export function generateTrialSequence({
  totalTrials = ODDBALL_CONFIG.totalTrials,
  targetTrials = ODDBALL_CONFIG.targetTrials,
  minSpacing = ODDBALL_CONFIG.minTargetSpacing,
} = {}) {
  const nonTargetTrials = totalTrials - targetTrials;
  const base = [
    ...Array(targetTrials).fill('target'),
    ...Array(nonTargetTrials).fill('standard'),
  ];

  const maxAttempts = 500;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const candidate = shuffle(base);
    // Also avoid a target on the very first trial so the participant has at
    // least one standard stimulus to orient on before any target appears.
    if (candidate[0] !== 'target' && respectsSpacing(candidate, minSpacing)) {
      return buildTrials(candidate);
    }
  }

  return buildTrials(evenlySpacedSequence(totalTrials, targetTrials, minSpacing));
}

/** Generates a short, separate practice sequence. Never mixed into real metrics. */
export function generatePracticeSequence({
  totalTrials = ODDBALL_CONFIG.practiceTrials,
  targetTrials = ODDBALL_CONFIG.practiceTargetTrials,
  minSpacing = ODDBALL_CONFIG.practiceMinTargetSpacing,
} = {}) {
  return generateTrialSequence({ totalTrials, targetTrials, minSpacing });
}
