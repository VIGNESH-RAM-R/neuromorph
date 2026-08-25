// Non-clinical operational thresholds (adherence windows, risk-alert
// sensitivity, trend-stability band). Kept separate from scoringBands.js
// because these tune workflow behavior, not clinical interpretation.
export const ASSESSMENT_INTERVAL_DAYS = 7; // NEUROMORPH's standard weekly cadence

export const RISK_ALERT_CONFIG = {
  scoreDropThreshold: 10, // overall cognitive score points, session-over-session
  domainDropThreshold: 12,
  // Self-review finding (neurologist read): a slow, gradual decline can move
  // less than scoreDropThreshold at every single step and never trip the
  // session-over-session check above, even though the patient has declined
  // substantially over their history on record. cumulativeDropThreshold
  // compares the latest session against the FIRST session on record (when
  // 3+ sessions exist) to catch that pattern too.
  cumulativeDropThreshold: 15,
  cumulativeMinSessions: 3,
};

export const TREND_CONFIG = {
  stableBandPoints: 5, // |delta| <= this => "stable"
};

export const CONCORDANCE_CONFIG = {
  // caregiver concern band vs self/task-performance band gap (in BAND_RANK units)
  discordanceGap: 2,
};
