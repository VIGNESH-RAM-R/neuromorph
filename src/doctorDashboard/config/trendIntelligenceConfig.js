// Tuning for the Trend Intelligence Engine -- the longitudinal layer on top
// of TrendAnalysisEngine/RiskAlertEngine's session-over-session and
// first-vs-latest checks. This is what catches a real, sustained drift
// across MANY sessions (using the full history, not just two points) and,
// separately, catches a patient becoming more INCONSISTENT session to
// session even if their average score looks unchanged.
//
// Everything here is a plain statistical threshold (least-squares slope,
// coefficient of variation) -- no black-box model, so every flag this
// engine raises can be explained in one sentence to a doctor.
export const DRIFT_CONFIG = {
  // Need at least this many sessions before attempting a slope fit at all --
  // a "trend" from 2 points is just TrendAnalysisEngine's delta again.
  minSessionsForDrift: 3,
  // |slope| / slopeStdError must exceed this to call a slope "significant"
  // rather than plausibly just noise around a flat line. ~1.5 is a
  // deliberately modest bar (not the classic 1.96/p<0.05) because these are
  // short, noisy real-world series where waiting for textbook significance
  // would mean waiting for a decline to become obvious anyway -- the whole
  // point of early detection is catching it before that.
  significanceRatio: 1.5,
  // Even a "significant" slope is ignored if the total projected change
  // over the observed window is trivial -- avoids flagging a technically-real
  // but clinically-meaningless 1-point drift over 10 weeks.
  minTotalChangePoints: 6,
};

export const VARIABILITY_CONFIG = {
  // Need at least this many sessions total (split into an earlier and a
  // later half) to compare variability across time at all.
  minSessionsForVariability: 4,
  // "Later half" coefficient of variation must be at least this many times
  // the "earlier half" CV to flag rising inconsistency. Grounded in the
  // intra-individual reaction-time-variability research finding used
  // elsewhere in this project: rising variability is a risk signal in its
  // own right, independent of whether the mean score has moved at all.
  riseRatioThreshold: 1.5,
  // A later-half CV below this is treated as "not meaningfully variable"
  // regardless of ratio, so tiny rounding-level noise on an already-flat
  // series never trips the flag.
  minLaterCv: 0.04,
};

export const TREND_INTELLIGENCE_CONFIG = {
  // A domain only appears in "domains to watch" if its drift is both
  // statistically significant AND declining (never for improving trends --
  // this list is specifically for clinical attention).
  maxDomainsToWatch: 3,
};
