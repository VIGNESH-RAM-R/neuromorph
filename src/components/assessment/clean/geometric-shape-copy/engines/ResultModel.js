// ResultModel
// -----------------------------------------------------------------------------
// Single responsibility: assemble the final, exact-schema result object for
// the Geometric Shape Copying Test. This is the only file that touches
// InterpretationEngine's output and the aggregate metrics together -- nothing
// upstream of this should know about severity bands.

import { InterpretationEngine } from './InterpretationEngine.js';

export function buildResultModel({ sessionId, testVersion, clickHistory, aggregateMetrics }) {
  const { severity, interpretation } = InterpretationEngine.interpret(aggregateMetrics.cognitiveScore);

  return {
    sessionId,
    testVersion,
    testName: 'Geometric Shape Copying Test',
    lobe: 'parietal',
    timestamp: new Date().toISOString(),

    figuresPresented: aggregateMetrics.figuresPresented,
    figuresCompleted: aggregateMetrics.figuresCompleted,
    figuresTimedOut: aggregateMetrics.figuresTimedOut,
    figuresNotAdministered: aggregateMetrics.figuresNotAdministered,

    easyTierAccuracy: aggregateMetrics.easyTierAccuracy,
    mediumTierAccuracy: aggregateMetrics.mediumTierAccuracy,
    hardTierAccuracy: aggregateMetrics.hardTierAccuracy,

    avgOverallDrawingAccuracy: aggregateMetrics.avgOverallDrawingAccuracy,
    avgShapeSimilarity: aggregateMetrics.avgShapeSimilarity,
    avgAngleAccuracy: aggregateMetrics.avgAngleAccuracy,
    avgLineLengthAccuracy: aggregateMetrics.avgLineLengthAccuracy,
    avgSpatialOrganization: aggregateMetrics.avgSpatialOrganization,
    avgSymmetryScore: aggregateMetrics.avgSymmetryScore,
    avgProportionScore: aggregateMetrics.avgProportionScore,

    avgResponseTimeMs: aggregateMetrics.avgResponseTimeMs,
    avgPlanningTimeMs: aggregateMetrics.avgPlanningTimeMs,

    constructionalPraxisScore: aggregateMetrics.constructionalPraxisScore,
    visuospatialScore: aggregateMetrics.visuospatialScore,
    motorPlanningScore: aggregateMetrics.motorPlanningScore,
    processingSpeedScore: aggregateMetrics.processingSpeedScore,

    rawScore: aggregateMetrics.rawScore,
    normalizedScore: aggregateMetrics.normalizedScore,
    cognitiveScore: aggregateMetrics.cognitiveScore,

    severity,
    interpretation,

    clickHistory
  };
}
