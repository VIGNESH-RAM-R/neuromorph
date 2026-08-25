import { BAND_RANK } from '../config/scoringBands.js';
import { CONCORDANCE_CONFIG } from '../config/operationalConfig.js';

const CONCERN_TO_BAND_RANK = { Low: 3, Moderate: 2, High: 1 };

// Compares caregiver-reported concern level for a session against the
// patient's own task-performance band. A large gap (caregiver much more
// worried than performance suggests) is clinically useful: it can indicate
// the patient is under-reporting their own difficulties, or that the
// caregiver is picking up on functional changes the screening doesn't
// capture. This never labels the gap itself as a diagnosis of anything --
// it only surfaces the discrepancy for the clinician to interpret.
export const CaregiverConcordanceEngine = {
  evaluate(session, overallBand, config = CONCORDANCE_CONFIG) {
    const caregiverConcern = session?.caregiverConcern;
    if (!caregiverConcern || !overallBand) {
      return { evaluated: false };
    }
    const caregiverRank = CONCERN_TO_BAND_RANK[caregiverConcern];
    const performanceRank = BAND_RANK[overallBand];
    const gap = performanceRank - caregiverRank; // positive: performance better than caregiver concern implies
    const discordant = gap >= config.discordanceGap;
    return {
      evaluated: true,
      caregiverConcern,
      overallBand,
      discordant,
      note: discordant
        ? 'Caregiver-reported concern is notably higher than task-based performance suggests. Consider gathering additional collateral history.'
        : 'Caregiver-reported concern is broadly consistent with task-based performance.',
    };
  },
};
