// MetricsEngine
// -----------------------------------------------------------------------------
// Single responsibility: aggregate the 12 per-figure results (each already
// scored by GeometryAnalysisEngine + timed by DrawingEngine) into the
// session-level metrics required by the ResultModel. Pure aggregation --
// no interpretation/severity labeling (that's InterpretationEngine's job).

const clamp = (v, lo = 0, hi = 100) => {
  if (v === null || v === undefined || Number.isNaN(v)) return 0;
  return Math.max(lo, Math.min(hi, v));
};

const avg = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);

// perFigureResults: array of, per scored figure (practice figures excluded
// upstream by the hook before calling this):
// {
//   figureId, difficulty, timeLimitSec,
//   status: 'completed' | 'timed_out' | 'not_administered',
//   responseTimeMs, planningTimeMs,
//   drawingMetrics: <output of GeometryAnalysisEngine.analyzeDrawing, or null>
// }
export const MetricsEngine = {
  computeAssessmentMetrics(perFigureResults) {
    const administered = perFigureResults.filter((r) => r.status !== 'not_administered');
    const notAdministeredCount = perFigureResults.length - administered.length;
    const timedOutCount = administered.filter((r) => r.status === 'timed_out').length;
    const completedCount = administered.filter((r) => r.status === 'completed').length;

    const scored = administered.filter((r) => r.drawingMetrics);
    const overallScores = scored.map((r) => clamp(r.drawingMetrics.overallDrawingAccuracy));
    const shapeScores = scored.map((r) => clamp(r.drawingMetrics.shapeSimilarity));
    const angleScores = scored.map((r) => clamp(r.drawingMetrics.angleAccuracy));
    const lineScores = scored.map((r) => clamp(r.drawingMetrics.lineLengthAccuracy));
    const spatialScores = scored.map((r) => clamp(r.drawingMetrics.spatialOrganization));
    const symmetryScores = scored.map((r) => clamp(r.drawingMetrics.symmetryScore));
    const proportionScores = scored.map((r) => clamp(r.drawingMetrics.proportionScore));

    const byDifficulty = (difficulty) => scored.filter((r) => r.difficulty === difficulty);
    const tierAvg = (difficulty) => {
      const tier = byDifficulty(difficulty);
      return tier.length ? avg(tier.map((r) => clamp(r.drawingMetrics.overallDrawingAccuracy))) : null;
    };

    const responseTimes = administered.filter((r) => r.responseTimeMs != null).map((r) => r.responseTimeMs);
    const planningTimes = administered.filter((r) => r.planningTimeMs != null).map((r) => r.planningTimeMs);

    // Composite scores -- each documented as an illustrative weighting,
    // pending clinical validation (same placeholder discipline used
    // throughout NeuroTrack's other lobe modules).
    const constructionalPraxisScore = clamp(
      0.4 * avg(shapeScores) + 0.3 * avg(angleScores) + 0.3 * avg(lineScores)
    );
    const visuospatialScore = clamp(
      0.5 * avg(proportionScores) + 0.3 * avg(spatialScores) + 0.2 * avg(symmetryScores)
    );
    const motorPlanningScore = clamp(
      100 - clamp((avg(planningTimes) / 5000) * 100) // faster, decisive planning -> higher score; 5s+ planning treated as low
    );
    const processingSpeedScore = clamp(
      100 - clamp((avg(responseTimes) / 60000) * 100) // relative to a 60s nominal figure budget
    );

    const rawScore = avg(overallScores);
    const normalizedScore = clamp(rawScore);
    const cognitiveScore = clamp(
      0.35 * constructionalPraxisScore +
      0.30 * visuospatialScore +
      0.20 * motorPlanningScore +
      0.15 * processingSpeedScore
    );

    return {
      figuresPresented: perFigureResults.length,
      figuresCompleted: completedCount,
      figuresTimedOut: timedOutCount,
      figuresNotAdministered: notAdministeredCount,
      easyTierAccuracy: tierAvg('easy'),
      mediumTierAccuracy: tierAvg('medium'),
      hardTierAccuracy: tierAvg('hard'),
      avgOverallDrawingAccuracy: clamp(avg(overallScores)),
      avgShapeSimilarity: clamp(avg(shapeScores)),
      avgAngleAccuracy: clamp(avg(angleScores)),
      avgLineLengthAccuracy: clamp(avg(lineScores)),
      avgSpatialOrganization: clamp(avg(spatialScores)),
      avgSymmetryScore: clamp(avg(symmetryScores)),
      avgProportionScore: clamp(avg(proportionScores)),
      avgResponseTimeMs: responseTimes.length ? avg(responseTimes) : null,
      avgPlanningTimeMs: planningTimes.length ? avg(planningTimes) : null,
      constructionalPraxisScore,
      visuospatialScore,
      motorPlanningScore,
      processingSpeedScore,
      rawScore: clamp(rawScore),
      normalizedScore,
      cognitiveScore
    };
  }
};
