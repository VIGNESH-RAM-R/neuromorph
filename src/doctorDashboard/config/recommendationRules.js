// Rule-based, non-diagnostic recommendation engine config.
// Every string here is pre-approved clinical-adjacent language. The engine
// only ever selects from this list -- it never free-generates text -- so a
// medication suggestion or a diagnostic phrase can never reach the UI.
export const RECOMMENDATION_TEXT = {
  REPEAT_SIX_MONTHS: 'Repeat cognitive screening in six months.',
  REPEAT_THREE_MONTHS: 'Repeat cognitive screening sooner than usual (approximately three months), given the observed change.',
  FORMAL_NEUROPSYCH: 'Formal neuropsychological assessment recommended for a comprehensive, diagnostic-grade evaluation.',
  NEUROLOGY_CONSULT: 'Consider a neurology consultation to evaluate the observed findings further.',
  LIFESTYLE: 'Discuss general brain-health lifestyle measures (physical activity, sleep, cardiovascular risk management, social engagement).',
  GATHER_COLLATERAL: 'Consider gathering additional collateral history from a caregiver or family member, given the gap between self-reported and caregiver-reported concern.',
  CONTINUE_ROUTINE: 'Continue routine periodic screening; no change in clinical pathway suggested by this assessment alone.',
  CONSISTENCY_MONITORING: 'Consider closer-interval monitoring: session-to-session consistency has declined even though the average score has not, which the trend engine flags as worth watching in its own right.',
};

// Rule table: evaluated in order, first-match-per-trigger, engine may return
// more than one recommendation per session (e.g. NEUROLOGY_CONSULT together
// with FORMAL_NEUROPSYCH). Never includes a medication or diagnostic rule.
export const RECOMMENDATION_RULES = [
  { id: 'reduced_and_declining', when: (ctx) => ctx.overallBand === 'Reduced' && ctx.trend === 'declining', gives: ['NEUROLOGY_CONSULT', 'FORMAL_NEUROPSYCH', 'REPEAT_THREE_MONTHS'] },
  { id: 'reduced_stable_or_unknown', when: (ctx) => ctx.overallBand === 'Reduced' && ctx.trend !== 'declining', gives: ['FORMAL_NEUROPSYCH', 'REPEAT_THREE_MONTHS'] },
  { id: 'mildly_reduced_declining', when: (ctx) => ctx.overallBand === 'Mildly Reduced' && ctx.trend === 'declining', gives: ['REPEAT_THREE_MONTHS', 'FORMAL_NEUROPSYCH'] },
  { id: 'mildly_reduced_stable', when: (ctx) => ctx.overallBand === 'Mildly Reduced' && ctx.trend !== 'declining', gives: ['REPEAT_SIX_MONTHS', 'LIFESTYLE'] },
  { id: 'risk_alert_flagged', when: (ctx) => ctx.riskAlertFlagged === true, gives: ['NEUROLOGY_CONSULT'] },
  { id: 'concordance_discordant', when: (ctx) => ctx.concordanceDiscordant === true, gives: ['GATHER_COLLATERAL'] },
  { id: 'rising_variability', when: (ctx) => ctx.trendVolatile === true, gives: ['CONSISTENCY_MONITORING'] },
  { id: 'normal_or_excellent_stable', when: (ctx) => (ctx.overallBand === 'Normal' || ctx.overallBand === 'Excellent') && ctx.trend !== 'declining', gives: ['CONTINUE_ROUTINE', 'LIFESTYLE'] },
  { id: 'normal_or_excellent_declining', when: (ctx) => (ctx.overallBand === 'Normal' || ctx.overallBand === 'Excellent') && ctx.trend === 'declining', gives: ['REPEAT_THREE_MONTHS'] },
];
