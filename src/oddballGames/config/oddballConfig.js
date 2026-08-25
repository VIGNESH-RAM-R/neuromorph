/**
 * Visual Oddball Assessment — configuration
 *
 * IMPORTANT: All values below are engineering / prototype parameters chosen
 * to produce a stable, controlled behavioural task. They are NOT clinically
 * validated thresholds and must not be presented to users as diagnostic
 * cut-offs. They are centralized here so they can be tuned later during
 * formal validation without touching task logic.
 */

export const ODDBALL_VERSION = 'oddball-v1.1';

export const ODDBALL_CONFIG = {
  // Trial composition (actual assessment)
  totalTrials: 25,
  targetTrials: 5,
  nonTargetTrials: 20,
  targetProbability: 0.2,

  // Randomization
  minTargetSpacing: 2, // minimum number of standard trials between two targets

  // Practice
  practiceTrials: 8,
  practiceTargetTrials: 2,
  practiceMinTargetSpacing: 1,

  // Trial timing (ms)
  fixationMinMs: 300,
  fixationMaxMs: 500,
  stimulusDurationMs: 600,
  responseWindowMs: 1200, // measured from stimulus onset, includes stimulusDurationMs
  itiMinMs: 500,
  itiMaxMs: 1000,

  // Countdown before the actual assessment
  countdownSeconds: 3,

  // Analysis
  lapseThresholdMs: 1000, // configurable "slow response" marker, not a clinical cutoff

  // Below ~100ms a response cannot reflect genuine stimulus discrimination —
  // this convention is used by standard CPT instruments (e.g. Conners CPT-3)
  // to flag anticipatory / random responses, separate from true hits.
  perseverationThresholdMs: 100,
};

// Stimulus definitions. Architected so shape/color/orientation can vary later
// without touching trial-engine or response-classification logic.
export const STIMULI = {
  standard: {
    id: 'circle',
    shape: 'circle',
    color: '#2563EB', // blue
    label: 'Standard shape',
  },
  target: {
    id: 'triangle',
    shape: 'triangle',
    color: '#DC2626', // red
    label: 'Target shape',
  },
};

export const STORAGE_KEY = 'neuromorph_oddball_assessments';
