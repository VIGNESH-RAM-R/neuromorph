import { average, round1 } from './mathUtils.js';
import { LOBAR_TASKS } from '../config/lobarTaskRegistryConfig.js';
import { ALL_COGNITIVE_DOMAIN_KEYS } from '../config/domainScoringConfig.js';

// The single assembler for a completed Detection Assessment: takes the raw
// per-task results collected during the session and produces the exact
// {lobarTaskScores, domainScoresRaw, overallRawScore} shape the Doctor
// Dashboard's ReportModel/LobarMappingEngine/DomainAggregationEngine
// already expect -- so a session built here is a drop-in real replacement
// for a mock session over there, no format translation needed.
export const AssessmentSessionModel = {
  // taskResults: [{ taskId, score, raw, durationMs }], any order, need not
  // be complete (a partially-finished assessment still produces a valid,
  // honestly-partial result rather than throwing).
  //
  // qbScore: the Question Bank block's single aggregate score (0-100), or
  // undefined if it wasn't administered/completed. Folded into the
  // 'attention' domain group (not averaged in as a 9th flat contributor
  // anymore -- see the overallRawScore comment below) -- this mirrors the
  // Doctor Dashboard's own domainConfig.js, which already documents
  // "attention" as fed by both the Digital Lobar Function Assessment AND
  // the Questionnaire -- this is that second source module, finally wired
  // in.
  build(taskResults = [], qbScore, registry = LOBAR_TASKS) {
    const lobarTaskScores = {};
    for (const r of taskResults) {
      if (typeof r.score === 'number') lobarTaskScores[r.taskId] = r.score;
    }

    const scoresByDomain = {};
    for (const task of registry) {
      const result = taskResults.find((r) => r.taskId === task.id);
      if (!result || typeof result.score !== 'number') continue;
      (scoresByDomain[task.domain] ||= []).push(result.score);
    }
    const hasQbScore = typeof qbScore === 'number' && !Number.isNaN(qbScore);
    if (hasQbScore) {
      (scoresByDomain.attention ||= []).push(qbScore);
    }
    const domainScoresRaw = {};
    for (const domain of Object.keys(scoresByDomain)) {
      domainScoresRaw[domain] = average(scoresByDomain[domain]);
    }

    // 2026-08-20 REVISION -- overallRawScore now averages DOMAINS, not raw
    // tasks. It used to flat-average every individual task score (+
    // qbScore) together in one list, which meant a domain built from more
    // tasks silently spoke louder in the composite than a domain built from
    // fewer -- purely an artifact of how many teammate modules happened to
    // land in each domain, never a real decision that one construct
    // matters more. Concretely, with all 8 active tasks + the question
    // bank completed: executiveFunction (stroop, matrixReasoning,
    // geometricShapeCopy -- 3 tasks) was outweighing visualMemory
    // (visualMemory alone -- 1 task) 3-to-1 in the old math, and attention
    // (goNoGo, tokenTest, qbScore -- 3 contributors) was outweighing it
    // similarly, with nobody having chosen that on purpose.
    //
    // Averaging domainScoresRaw instead gives every MEASURED cognitive
    // construct equal say in the composite, regardless of how many
    // mini-games happen to feed it today -- the honest choice for a
    // screening composite, and it stays correct automatically as more
    // tasks get added to under-covered domains later (face module /
    // speech module integration will add processingSpeed/language
    // coverage without needing this formula touched again).
    const overallRawScore = average(Object.values(domainScoresRaw));

    const totalDurationMs = taskResults.reduce((sum, r) => sum + (r.durationMs || 0), 0);
    const completedCount = taskResults.filter((r) => typeof r.score === 'number').length;

    // Coverage/confidence signal, added alongside the reweighting above so
    // the new "domain-equal" score doesn't quietly read as more
    // comprehensive than it is. Two different numbers on purpose: a session
    // can complete every active task today and still only cover 4 of the 6
    // real cognitive domains (language and processingSpeed have no active
    // source task yet -- see lobarTaskRegistryConfig.js's header comment),
    // so "8 of 8 tasks done" and "4 of 6 domains measured" are both true and
    // both worth showing, not collapsed into one misleading percentage.
    const measuredDomainKeys = Object.keys(domainScoresRaw);
    const domainCoverage = {
      measuredDomainKeys,
      measuredDomainCount: measuredDomainKeys.length,
      totalDomainCount: ALL_COGNITIVE_DOMAIN_KEYS.length,
    };

    return {
      lobarTaskScores,
      domainScoresRaw,
      overallRawScore: overallRawScore === undefined ? undefined : round1(overallRawScore),
      questionBankScore: hasQbScore ? round1(qbScore) : undefined,
      taskResults,
      completedCount,
      totalCount: registry.length,
      durationMs: totalDurationMs,
      domainCoverage,
    };
  },
};
