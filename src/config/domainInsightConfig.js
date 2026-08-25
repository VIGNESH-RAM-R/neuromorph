// Display config for the "My Progress" dashboard's domain breakdown --
// mirrors the label vocabulary already used by Doctor Dashboard's
// domainConfig.js (same 6 domain keys) so a domain name on this screen
// means the same thing a doctor sees on theirs. Kept as its own config file
// (not inlined in the engine or component) so adding a domain later, or
// changing a label, is a one-line edit -- same philosophy as
// lobarConfig.js/scoringBands.js being mirrored/config-driven.
export const DOMAIN_LABELS = {
  attention: 'Attention',
  executiveFunction: 'Executive Function',
  processingSpeed: 'Processing Speed',
  visualMemory: 'Visual Memory',
  language: 'Language',
  recognitionMemory: 'Recognition Memory',
};

export const DOMAIN_SHORT_DESCRIPTIONS = {
  attention: 'Sustained focus, working memory span.',
  executiveFunction: 'Planning, problem solving, mental flexibility.',
  processingSpeed: 'How quickly tasks are completed.',
  visualMemory: 'Encoding and recalling visual material.',
  language: 'Comprehension and verbal expression.',
  recognitionMemory: 'Recognizing previously seen material.',
};

// Only domains actually fed by an ACTIVE task right now (see
// lobarTaskRegistryConfig.js) get a real number on the dashboard --
// processingSpeed and language currently have no active source task, so
// showing a score for them would be fabricated. The UI shows these as
// "not yet available" instead of a number.
export const ACTIVE_INSIGHT_DOMAINS = ['attention', 'executiveFunction', 'visualMemory', 'recognitionMemory'];
export const PENDING_INSIGHT_DOMAINS = ['processingSpeed', 'language'];

export const DOMAIN_ORDER = [...ACTIVE_INSIGHT_DOMAINS, ...PENDING_INSIGHT_DOMAINS];

// A change smaller than this is treated as "flat" (noise), not a real
// trend -- keeps the +8%/-13% style callouts meaningful rather than
// reacting to every 1-2% wobble.
export const FLAT_CHANGE_THRESHOLD_PCT = 3;

// A decline at or beyond this magnitude is surfaced as a clinical insight
// worth a caregiver/doctor's attention (still non-diagnostic language).
export const NOTABLE_DECLINE_THRESHOLD_PCT = 10;
