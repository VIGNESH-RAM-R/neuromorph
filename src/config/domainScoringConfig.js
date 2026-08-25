// Mirrored byte-for-byte from the Doctor Dashboard's domainConfig.js
// (COGNITIVE_DOMAINS/DOMAIN_KEYS) -- same reasoning as scoringBands.js and
// lobarConfig.js being kept in sync across the two apps: this app needs to
// know the full 6-domain model (not just the domains it currently measures)
// to honestly report coverage -- "4 of 6 domains measured" only means
// anything if both apps agree on what 6 is. Doctor_Dashboard's
// domainConfig.js remains the source of truth; if a domain is ever added or
// renamed there, mirror the change here too.
export const ALL_COGNITIVE_DOMAINS = [
  { key: 'visualMemory', label: 'Visual Memory' },
  { key: 'attention', label: 'Attention' },
  { key: 'executiveFunction', label: 'Executive Function' },
  { key: 'language', label: 'Language' },
  { key: 'processingSpeed', label: 'Processing Speed' },
  { key: 'recognitionMemory', label: 'Recognition Memory' },
];

export const ALL_COGNITIVE_DOMAIN_KEYS = ALL_COGNITIVE_DOMAINS.map((d) => d.key);
