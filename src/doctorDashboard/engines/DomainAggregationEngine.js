import { COGNITIVE_DOMAINS } from '../config/domainConfig.js';
import { InterpretationEngine } from './InterpretationEngine.js';

// Maps a session's raw per-domain scores into the clinician-facing domain
// cards. Deliberately does not touch lobarTaskScores -- that's
// LobarMappingEngine's job -- to keep the two summaries independently
// testable even though they're derived from related raw data.
export const DomainAggregationEngine = {
  aggregate(session) {
    const raw = session?.domainScoresRaw || {};
    return COGNITIVE_DOMAINS.map((domainDef) => {
      const score = raw[domainDef.key];
      // A domain this patient's connected modules never measured (score is
      // not a number) is clinically different from a domain that WAS
      // measured and came back low -- conflating the two by falling through
      // to InterpretationEngine's default ('Reduced' for any non-number) is
      // actively misleading in a clinical tool: a doctor would see a red
      // "Reduced" badge next to a domain that simply has no data yet. Every
      // real, partial patient (e.g. one whose app only runs the Lobar
      // Function + QB modules and not Visual Memory/Speech) needs this
      // distinction to render honestly.
      const { band, interpretation } = typeof score === 'number'
        ? InterpretationEngine.interpret(score)
        : { band: 'Not Measured', interpretation: 'No completed module currently feeds this domain.' };
      return {
        key: domainDef.key,
        label: domainDef.label,
        description: domainDef.description,
        score,
        band,
        interpretation,
        contributingModules: domainDef.sourceModules,
      };
    });
  },
};
