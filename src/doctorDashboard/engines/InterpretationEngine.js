import { bandFromScore, BAND_INTERPRETATION_TEMPLATES, DEFAULT_BAND_THRESHOLDS } from '../config/scoringBands.js';

// Single-responsibility: score -> { band, interpretation }. Every other
// engine that needs a band delegates here so wording never drifts between
// domain cards, lobe cards, and the overall summary.
export const InterpretationEngine = {
  interpret(score, thresholds = DEFAULT_BAND_THRESHOLDS) {
    const band = bandFromScore(score, thresholds);
    return { band, interpretation: BAND_INTERPRETATION_TEMPLATES[band] };
  },
};
