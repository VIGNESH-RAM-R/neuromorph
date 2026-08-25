// Config for the Network Coherence Indicator -- a RESEARCH-PREVIEW, honest
// proxy for the idea a clinician raised: that in 10-15 years, connectivity
// between brain regions/networks may matter more for early detection than
// which single lobe underperforms (a real, active research direction --
// see README "Network Coherence" section for the grounding studies).
//
// This is NOT real neural connectivity. There is no EEG/fMRI signal here --
// it is a statistical proxy computed from the same longitudinal cognitive
// DOMAIN scores already collected everywhere else in this dashboard: do two
// domains' score trajectories move together over time, or independently?
// That is the honest, buildable-today version of the question; real
// connectivity data is the documented future swap-in.
export const NETWORK_COHERENCE_CONFIG = {
  // Need at least this many sessions before attempting any correlation --
  // fewer than this and a correlation coefficient is just noise dressed up
  // as a number.
  minSessionsForCoherence: 4,
  // |r| at or above this counts two domains as "moving together" for this
  // preview. Deliberately a high bar (most real-world pairs will land well
  // below it) so a "distributed" classification means something.
  couplingThreshold: 0.7,
};
