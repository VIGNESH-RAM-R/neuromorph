// InterpretationEngine
// -----------------------------------------------------------------------------
// Single responsibility: map a numeric cognitiveScore onto a human-readable
// severity band and short interpretation string. Thresholds below are
// explicitly ILLUSTRATIVE PLACEHOLDERS -- consistent with every other lobe
// module in NeuroTrack -- and require clinical validation against normative
// data before any real diagnostic use.

export const InterpretationEngine = {
  interpret(cognitiveScore) {
    if (cognitiveScore >= 85) {
      return {
        severity: 'TYPICAL',
        interpretation: 'Constructional and visuospatial performance within the typical range for this task.'
      };
    }
    if (cognitiveScore >= 65) {
      return {
        severity: 'MILD',
        interpretation: 'Mild deviations in shape reproduction, spatial organization, or motor planning observed.'
      };
    }
    if (cognitiveScore >= 45) {
      return {
        severity: 'MODERATE',
        interpretation: 'Moderate visuoconstructional difficulty -- distortions, omissions, or planning delays across multiple figures.'
      };
    }
    return {
      severity: 'SIGNIFICANT',
      interpretation: 'Significant visuoconstructional impairment -- marked shape distortion, missing elements, or non-completion across figures.'
    };
  }
};
