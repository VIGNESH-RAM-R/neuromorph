// Cognitive-domain summary layer. Doctors read domains, not raw game names --
// this config is the single place that maps "which raw module metrics feed
// which domain, and how they're weighted" so DomainAggregationEngine has no
// hardcoded literals.
export const COGNITIVE_DOMAINS = [
  {
    key: 'visualMemory',
    label: 'Visual Memory',
    description: 'Ability to encode and later recognize visually presented material.',
    // 2026-08-11: as of the real Final-8 lineup, this domain's real source is
    // the Digital Lobar Function Assessment's own Visual Memory sub-task
    // (app_page/src/components/assessment/VisualMemoryTask.jsx), not a
    // separate connected app -- label kept broad since a standalone Visual
    // Memory Assessment app may still exist/connect later.
    sourceModules: ['Visual Memory Assessment', 'Digital Lobar Function Assessment', 'Delayed Recognition Assessment'],
  },
  {
    key: 'attention',
    label: 'Attention',
    description: 'Sustained and selective attention, working memory span.',
    sourceModules: ['Digital Lobar Function Assessment', 'Questionnaire'],
  },
  {
    key: 'executiveFunction',
    label: 'Executive Function',
    description: 'Planning, set-shifting, inhibition, and problem solving.',
    sourceModules: ['Digital Lobar Function Assessment'],
  },
  {
    key: 'language',
    label: 'Language',
    description: 'Naming, word retrieval, fluency, and verbal expression.',
    sourceModules: ['Speech Assessment'],
  },
  {
    key: 'processingSpeed',
    label: 'Processing Speed',
    description: 'Speed and consistency of response across timed tasks.',
    sourceModules: ['Digital Lobar Function Assessment', 'Visual Memory Assessment'],
  },
  {
    key: 'recognitionMemory',
    label: 'Recognition Memory',
    description: 'Ability to correctly recognize previously seen material after a delay.',
    // Same 2026-08-11 note as visualMemory above -- real source is now the
    // Digital Lobar Function Assessment's Delayed Recognition Memory
    // sub-task (app_page/src/components/assessment/DelayedRecognitionMemoryTask.jsx).
    sourceModules: ['Delayed Recognition Assessment', 'Digital Lobar Function Assessment'],
  },
];

export const DOMAIN_KEYS = COGNITIVE_DOMAINS.map((d) => d.key);
