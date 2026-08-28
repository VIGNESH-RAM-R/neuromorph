import { MORPHY_COMPANION_EVENTS, MOMENTUM_IMPROVEMENT_THRESHOLD } from '../config/morphyCompanionConfig.js';

// Pure, framework-free, Node-testable -- same split as every other engine
// in this app (MilestoneEngine, AssessmentModeGuard, etc.): this decides
// WHAT happened, MorphyCompanion.jsx only renders the result. Never
// touches React state, refs, or timers itself.
export const MorphyCompanionEngine = {
  // `todayScore`: self.today.momentum.score when revealed, else null/undefined.
  // `priorScores`: self.momentumHistory's score values for days BEFORE
  // today (caller filters today's own entry out, if present, before
  // calling this -- this function doesn't know today's date).
  // Returns true only when there IS a most-recent prior day to compare
  // against and today beats it by at least the configured threshold --
  // never celebrates a "first ever day" (nothing to compare to) as an
  // improvement.
  isMomentumImprovement(todayScore, priorScores = [], threshold = MOMENTUM_IMPROVEMENT_THRESHOLD) {
    if (typeof todayScore !== 'number' || !priorScores.length) return false;
    const previous = priorScores[priorScores.length - 1];
    if (typeof previous !== 'number') return false;
    return todayScore - previous >= threshold;
  },

  // Builds the flat snapshot MorphyCompanion.jsx diffs render-to-render.
  // `self`: the SelfModel.build() result. `momentumImprovedToday`: the
  // isMomentumImprovement() result above, computed by the caller (needs
  // self.momentumHistory filtered to "before today", which is the
  // caller's job since it also knows today's date).
  buildSnapshot(self, momentumImprovedToday) {
    return {
      milestoneDays: self?.milestone?.current?.days ?? null,
      milestoneLabel: self?.milestone?.current?.label ?? null,
      dailySetFullyComplete: !!self?.today?.fullyComplete,
      momentumImprovedToday: !!momentumImprovedToday,
      weeklyDue: self?.weeklyAssessment?.status === 'due-today' || self?.weeklyAssessment?.status === 'overdue',
    };
  },

  // Diffs a previous snapshot against the current one and returns the
  // single highest-priority NEWLY-true event (per MORPHY_COMPANION_EVENTS'
  // order), or null if nothing new happened. "Newly true" (not just
  // "true") is what stops this from re-firing the same reaction on every
  // render while a state stays true -- e.g. dailySetFullyComplete stays
  // true all evening after it's first reached; only the render where it
  // flips false -> true should react.
  decideEvent(prev, next) {
    if (!prev || !next) return null;

    if (next.milestoneDays != null && next.milestoneDays !== prev.milestoneDays) {
      return { ...MORPHY_COMPANION_EVENTS.find((e) => e.id === 'milestone'), milestoneLabel: next.milestoneLabel };
    }
    if (next.dailySetFullyComplete && !prev.dailySetFullyComplete) {
      return MORPHY_COMPANION_EVENTS.find((e) => e.id === 'dailySetComplete');
    }
    if (next.momentumImprovedToday && !prev.momentumImprovedToday) {
      return MORPHY_COMPANION_EVENTS.find((e) => e.id === 'momentumImprovement');
    }
    if (next.weeklyDue && !prev.weeklyDue) {
      return MORPHY_COMPANION_EVENTS.find((e) => e.id === 'weeklyDue');
    }
    return null;
  },
};
