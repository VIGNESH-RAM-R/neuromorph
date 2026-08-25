// GeometricShapeCopyEngine
// -----------------------------------------------------------------------------
// Ported near-verbatim from the teammate's geometry_game project (DrawingEngine
// + GeometryAnalysisEngine + ValidationEngine + MetricsEngine + ResultModel +
// InterpretationEngine), combined into one file the way this app's other
// multi-part engines (e.g. StroopEngine, GoNoGoEngine) already are. No scoring
// math was changed -- only re-exported as one module instead of six files.

// ---------------------------------------------------------------------------
// DrawingEngine: captures freehand stroke input. No scoring here.
// ---------------------------------------------------------------------------
export class DrawingEngine {
  constructor() { this.reset(); }
  reset() {
    this.strokes = [];
    this.currentStroke = null;
    this.figureStartTime = null;
    this.firstStrokeTime = null;
  }
  startFigure() {
    this.reset();
    this.figureStartTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
  }
  beginStroke(x, y) {
    const t = typeof performance !== 'undefined' ? performance.now() : Date.now();
    if (this.firstStrokeTime === null) this.firstStrokeTime = t;
    this.currentStroke = [{ x, y, t }];
  }
  extendStroke(x, y) {
    if (!this.currentStroke) return;
    this.currentStroke.push({ x, y, t: typeof performance !== 'undefined' ? performance.now() : Date.now() });
  }
  endStroke() {
    if (!this.currentStroke) return;
    if (this.currentStroke.length > 1) this.strokes.push(this.currentStroke);
    this.currentStroke = null;
  }
  getStrokes() { return this.currentStroke ? [...this.strokes, this.currentStroke] : this.strokes; }
  getPlanningTimeMs() {
    if (this.firstStrokeTime === null || this.figureStartTime === null) return null;
    return this.firstStrokeTime - this.figureStartTime;
  }
}

// ---------------------------------------------------------------------------
// GeometryAnalysisEngine: pure computational-geometry comparison.
// ---------------------------------------------------------------------------
const clamp = (v, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v));
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

function centroid(points) {
  if (!points.length) return [0, 0];
  let sx = 0, sy = 0;
  for (const p of points) { sx += p[0]; sy += p[1]; }
  return [sx / points.length, sy / points.length];
}
function boundingBox(points) {
  if (!points.length) return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0, diagonal: 0 };
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const [x, y] of points) {
    if (x < minX) minX = x; if (x > maxX) maxX = x;
    if (y < minY) minY = y; if (y > maxY) maxY = y;
  }
  const width = maxX - minX, height = maxY - minY;
  return { minX, minY, maxX, maxY, width, height, diagonal: Math.hypot(width, height) };
}
export function extractReferenceVertexEntries(figure) {
  const entries = [];
  let globalIdx = 0;
  figure.components.forEach((comp, componentIdx) => {
    if (comp.type === 'polygon') {
      comp.vertices.forEach((v, localIdx) => {
        entries.push({ point: [v[0], v[1]], componentIdx, localIdx, globalIdx, type: 'polygon', closed: true, componentSize: comp.vertices.length });
        globalIdx++;
      });
    } else if (comp.type === 'line') {
      comp.points.forEach((v, localIdx) => {
        entries.push({ point: [v[0], v[1]], componentIdx, localIdx, globalIdx, type: 'line', closed: false, componentSize: comp.points.length });
        globalIdx++;
      });
    } else if (comp.type === 'circle') {
      const SAMPLES = 8;
      for (let k = 0; k < SAMPLES; k++) {
        const theta = (2 * Math.PI * k) / SAMPLES;
        const point = [comp.cx + comp.r * Math.cos(theta), comp.cy + comp.r * Math.sin(theta)];
        entries.push({ point, componentIdx, localIdx: k, globalIdx, type: 'circle', closed: true, componentSize: SAMPLES });
        globalIdx++;
      }
    }
  });
  return entries;
}
function perpendicularDistance(p, a, b) {
  const [x, y] = p, [x1, y1] = a, [x2, y2] = b;
  const dx = x2 - x1, dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return dist(p, a);
  const t = ((x - x1) * dx + (y - y1) * dy) / lenSq;
  const projX = x1 + t * dx, projY = y1 + t * dy;
  return Math.hypot(x - projX, y - projY);
}
export function simplifyPolyline(points, epsilon = 4) {
  if (points.length < 3) return points.slice();
  let maxDist = 0, index = 0;
  const end = points.length - 1;
  for (let i = 1; i < end; i++) {
    const d = perpendicularDistance(points[i], points[0], points[end]);
    if (d > maxDist) { maxDist = d; index = i; }
  }
  if (maxDist > epsilon) {
    const left = simplifyPolyline(points.slice(0, index + 1), epsilon);
    const right = simplifyPolyline(points.slice(index), epsilon);
    return left.slice(0, -1).concat(right);
  }
  return [points[0], points[end]];
}
function farthestPointAngle(points, c) {
  let best = null, bestDist = -1;
  for (const p of points) { const d = dist(p, c); if (d > bestDist) { bestDist = d; best = p; } }
  if (!best) return 0;
  return Math.atan2(best[1] - c[1], best[0] - c[0]);
}
export function bestFitRotationRad(refPoints, drawPoints) {
  if (!refPoints.length || !drawPoints.length) return 0;
  const refC = centroid(refPoints);
  const drawC = centroid(drawPoints);
  const refAngle = farthestPointAngle(refPoints, refC);
  const drawAngle = farthestPointAngle(drawPoints, drawC);
  let delta = refAngle - drawAngle;
  while (delta > Math.PI) delta -= 2 * Math.PI;
  while (delta < -Math.PI) delta += 2 * Math.PI;
  return delta;
}
function rotatePoint([x, y], c, angleRad) {
  const dx = x - c[0], dy = y - c[1];
  const cos = Math.cos(angleRad), sin = Math.sin(angleRad);
  return [c[0] + dx * cos - dy * sin, c[1] + dx * sin + dy * cos];
}
export function matchVertices(refPoints, drawPoints, toleranceRatio = 0.35, scale = 1) {
  const bbox = boundingBox(refPoints);
  const tolerance = Math.max(bbox.diagonal * toleranceRatio, 6) * scale;
  const used = new Array(drawPoints.length).fill(false);
  const matches = new Array(refPoints.length).fill(null);
  const matchDistances = new Array(refPoints.length).fill(null);
  refPoints.forEach((rp, ri) => {
    let bestIdx = -1, bestDist = Infinity;
    drawPoints.forEach((dp, di) => {
      if (used[di]) return;
      const d = dist(rp, dp);
      if (d < bestDist) { bestDist = d; bestIdx = di; }
    });
    if (bestIdx !== -1 && bestDist <= tolerance) { used[bestIdx] = true; matches[ri] = drawPoints[bestIdx]; matchDistances[ri] = bestDist; }
  });
  const missingCount = matches.filter((m) => m === null).length;
  const extraCount = drawPoints.length - used.filter(Boolean).length;
  return { matches, matchDistances, missingCount, extraCount, tolerance };
}
export function interiorAngle(points, i) {
  const n = points.length;
  if (n < 3) return null;
  const prev = points[(i - 1 + n) % n], curr = points[i], next = points[(i + 1) % n];
  const v1 = [prev[0] - curr[0], prev[1] - curr[1]], v2 = [next[0] - curr[0], next[1] - curr[1]];
  const len1 = Math.hypot(...v1), len2 = Math.hypot(...v2);
  if (len1 === 0 || len2 === 0) return null;
  const cos = clamp((v1[0] * v2[0] + v1[1] * v2[1]) / (len1 * len2), -1, 1);
  return (Math.acos(cos) * 180) / Math.PI;
}
function reflectAcrossAngle([x, y], c, thetaRad) {
  const dx = x - c[0], dy = y - c[1];
  const cos2 = Math.cos(2 * thetaRad), sin2 = Math.sin(2 * thetaRad);
  return [c[0] + dx * cos2 + dy * sin2, c[1] + dx * sin2 - dy * cos2];
}
function nearestDist(p, points) {
  let best = Infinity;
  for (const q of points) { const d = dist(p, q); if (d < best) best = d; }
  return best === Infinity ? 0 : best;
}
export function symmetryResidual(points, symmetry, c) {
  if (!points.length || !symmetry) return 0;
  const residualsFor = (transformed) => {
    let sum = 0;
    for (const p of transformed) sum += nearestDist(p, points);
    return sum / transformed.length;
  };
  if (symmetry.axis === 'radial' && symmetry.order > 1) {
    let total = 0, count = 0;
    for (let k = 1; k < symmetry.order; k++) {
      const angle = (2 * Math.PI * k) / symmetry.order;
      total += residualsFor(points.map((p) => rotatePoint(p, c, angle)));
      count++;
    }
    return count ? total / count : 0;
  }
  const axesThetas = [];
  if (symmetry.axis === 'vertical') axesThetas.push(Math.PI / 2);
  else if (symmetry.axis === 'horizontal') axesThetas.push(0);
  else if (symmetry.axis === 'diagonal') axesThetas.push(Math.PI / 4);
  else if (symmetry.axis === 'both') axesThetas.push(Math.PI / 2, 0);
  if (!axesThetas.length) return 0;
  let total = 0;
  for (const theta of axesThetas) total += residualsFor(points.map((p) => reflectAcrossAngle(p, c, theta)));
  return total / axesThetas.length;
}
export function emptyMetrics(expectedVertexCount) {
  return {
    overallDrawingAccuracy: 0, shapeSimilarity: 0, angleAccuracy: 0, lineLengthAccuracy: 0,
    spatialOrganization: 0, symmetryScore: 0, proportionScore: 0, rotationError: null,
    missingElements: expectedVertexCount, extraElements: 0,
  };
}
export function analyzeDrawing(figure, strokes, canvasToFigureScale = 1) {
  const refEntries = extractReferenceVertexEntries(figure);
  const refPoints = refEntries.map((e) => e.point);
  const toFigureSpace = (pt) => {
    if (typeof canvasToFigureScale === 'number') return [pt.x * canvasToFigureScale, pt.y * canvasToFigureScale];
    const { scale = 1, offsetX = 0, offsetY = 0 } = canvasToFigureScale || {};
    return [(pt.x - offsetX) * scale, (pt.y - offsetY) * scale];
  };
  const simplifiedStrokes = (strokes || []).filter((s) => s && s.length).map((s) => simplifyPolyline(s.map(toFigureSpace), 4));
  const drawPointsRaw = simplifiedStrokes.flat();
  if (!drawPointsRaw.length) return emptyMetrics(refPoints.length);

  const refC = centroid(refPoints);
  const drawCRaw = centroid(drawPointsRaw);
  const translated = drawPointsRaw.map((p) => [p[0] - drawCRaw[0] + refC[0], p[1] - drawCRaw[1] + refC[1]]);
  const refAvgR = refPoints.reduce((s, p) => s + dist(p, refC), 0) / refPoints.length || 1;
  const drawAvgR = translated.reduce((s, p) => s + dist(p, refC), 0) / translated.length || 1;
  const sizeScale = drawAvgR > 0 ? refAvgR / drawAvgR : 1;
  const rescaled = translated.map((p) => [refC[0] + (p[0] - refC[0]) * sizeScale, refC[1] + (p[1] - refC[1]) * sizeScale]);
  const rotationRad = bestFitRotationRad(refPoints, rescaled);
  const aligned = rescaled.map((p) => rotatePoint(p, refC, rotationRad));
  const { matches, matchDistances, missingCount, extraCount } = matchVertices(refPoints, aligned, 0.35, 1);
  const matchedDistances = matchDistances.filter((d) => d !== null);
  const refBbox = boundingBox(refPoints);
  const shapeSimilarity = matchedDistances.length
    ? clamp(100 * (1 - matchedDistances.reduce((a, b) => a + b, 0) / matchedDistances.length / (refBbox.diagonal || 1)))
    : 0;

  const angleDiffs = [];
  refEntries.forEach((entry) => {
    if (entry.type !== 'polygon' || entry.componentSize < 3) return;
    const compEntries = refEntries.filter((e) => e.componentIdx === entry.componentIdx);
    const n = compEntries.length;
    const localPos = compEntries.findIndex((e) => e.globalIdx === entry.globalIdx);
    const prevEntry = compEntries[(localPos - 1 + n) % n], nextEntry = compEntries[(localPos + 1) % n];
    const curMatch = matches[entry.globalIdx], prevMatch = matches[prevEntry.globalIdx], nextMatch = matches[nextEntry.globalIdx];
    if (!curMatch || !prevMatch || !nextMatch) return;
    const refAngle = interiorAngle([prevEntry.point, entry.point, nextEntry.point], 1);
    const drawAngle = interiorAngle([prevMatch, curMatch, nextMatch], 1);
    if (refAngle === null || drawAngle === null) return;
    angleDiffs.push(Math.abs(refAngle - drawAngle));
  });
  const angleAccuracy = angleDiffs.length
    ? clamp(100 * (1 - angleDiffs.reduce((a, b) => a + b, 0) / angleDiffs.length / 180))
    : (matchedDistances.length ? 70 : 0);

  const lengthRatios = [];
  const componentGroups = new Map();
  refEntries.forEach((e) => { if (!componentGroups.has(e.componentIdx)) componentGroups.set(e.componentIdx, []); componentGroups.get(e.componentIdx).push(e); });
  componentGroups.forEach((entries) => {
    const closed = entries[0].closed;
    const n = entries.length;
    const edgeCount = closed ? n : n - 1;
    for (let i = 0; i < edgeCount; i++) {
      const a = entries[i], b = entries[(i + 1) % n];
      const am = matches[a.globalIdx], bm = matches[b.globalIdx];
      if (!am || !bm) continue;
      const refLen = dist(a.point, b.point), drawLen = dist(am, bm);
      if (refLen === 0) continue;
      lengthRatios.push(Math.min(drawLen, refLen) / Math.max(drawLen, refLen));
    }
  });
  const lineLengthAccuracy = lengthRatios.length ? clamp(100 * (lengthRatios.reduce((a, b) => a + b, 0) / lengthRatios.length)) : 0;

  const drawBbox = boundingBox(aligned);
  const refAspect = refBbox.height > 0 ? refBbox.width / refBbox.height : 1;
  const drawAspect = drawBbox.height > 0 ? drawBbox.width / drawBbox.height : 1;
  const aspectRatioCloseness = Math.min(refAspect, drawAspect) / Math.max(refAspect, drawAspect) || 0;
  const proportionScore = clamp(100 * aspectRatioCloseness);

  const rawResidual = symmetryResidual(aligned, figure.symmetry, refC);
  const symmetryScore = clamp(100 * (1 - rawResidual / (refBbox.diagonal || 1)));

  let spatialOrganization = 0;
  if (matchedDistances.length > 1) {
    const mean = matchedDistances.reduce((a, b) => a + b, 0) / matchedDistances.length;
    const variance = matchedDistances.reduce((a, b) => a + (b - mean) ** 2, 0) / matchedDistances.length;
    const cv = mean > 0 ? Math.sqrt(variance) / mean : 0;
    spatialOrganization = clamp(100 * (1 - Math.min(cv, 1)));
  } else if (matchedDistances.length === 1) spatialOrganization = 60;

  const rotationError = Math.abs((rotationRad * 180) / Math.PI);
  const overallDrawingAccuracy = clamp(0.35 * shapeSimilarity + 0.25 * angleAccuracy + 0.20 * lineLengthAccuracy + 0.10 * proportionScore + 0.10 * symmetryScore);

  return {
    overallDrawingAccuracy: Math.round(overallDrawingAccuracy * 10) / 10,
    shapeSimilarity: Math.round(shapeSimilarity * 10) / 10,
    angleAccuracy: Math.round(angleAccuracy * 10) / 10,
    lineLengthAccuracy: Math.round(lineLengthAccuracy * 10) / 10,
    spatialOrganization: Math.round(spatialOrganization * 10) / 10,
    symmetryScore: Math.round(symmetryScore * 10) / 10,
    proportionScore: Math.round(proportionScore * 10) / 10,
    rotationError: Math.round(rotationError * 10) / 10,
    missingElements: missingCount,
    extraElements: extraCount,
  };
}

// ---------------------------------------------------------------------------
// ValidationEngine: is this a scoreable attempt?
// ---------------------------------------------------------------------------
const MIN_TOTAL_POINTS = 3;
export const ValidationEngine = {
  validateAttempt(strokes, timedOut) {
    const totalPoints = (strokes || []).reduce((sum, s) => sum + (s ? s.length : 0), 0);
    const hasAnyStroke = (strokes || []).some((s) => s && s.length > 1);
    if (!hasAnyStroke && timedOut) return { valid: false, timedOut: true, reason: 'not_administered_or_no_response' };
    if (!hasAnyStroke) return { valid: false, timedOut: false, reason: 'no_strokes_submitted' };
    if (totalPoints < MIN_TOTAL_POINTS) return { valid: false, timedOut: !!timedOut, reason: 'insufficient_input' };
    return { valid: true, timedOut: !!timedOut, reason: null };
  },
};

// ---------------------------------------------------------------------------
// MetricsEngine: aggregate per-figure results into session-level metrics.
// ---------------------------------------------------------------------------
const clamp0 = (v) => (v === null || v === undefined || Number.isNaN(v) ? 0 : clamp(v));
const avg = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);

export const MetricsEngine = {
  computeAssessmentMetrics(perFigureResults) {
    const administered = perFigureResults.filter((r) => r.status !== 'not_administered');
    const notAdministeredCount = perFigureResults.length - administered.length;
    const timedOutCount = administered.filter((r) => r.status === 'timed_out').length;
    const completedCount = administered.filter((r) => r.status === 'completed').length;
    const scored = administered.filter((r) => r.drawingMetrics);
    const overallScores = scored.map((r) => clamp0(r.drawingMetrics.overallDrawingAccuracy));
    const shapeScores = scored.map((r) => clamp0(r.drawingMetrics.shapeSimilarity));
    const angleScores = scored.map((r) => clamp0(r.drawingMetrics.angleAccuracy));
    const lineScores = scored.map((r) => clamp0(r.drawingMetrics.lineLengthAccuracy));
    const spatialScores = scored.map((r) => clamp0(r.drawingMetrics.spatialOrganization));
    const symmetryScores = scored.map((r) => clamp0(r.drawingMetrics.symmetryScore));
    const proportionScores = scored.map((r) => clamp0(r.drawingMetrics.proportionScore));
    const byDifficulty = (d) => scored.filter((r) => r.difficulty === d);
    const tierAvg = (d) => { const tier = byDifficulty(d); return tier.length ? avg(tier.map((r) => clamp0(r.drawingMetrics.overallDrawingAccuracy))) : null; };
    const responseTimes = administered.filter((r) => r.responseTimeMs != null).map((r) => r.responseTimeMs);
    const planningTimes = administered.filter((r) => r.planningTimeMs != null).map((r) => r.planningTimeMs);

    const constructionalPraxisScore = clamp0(0.4 * avg(shapeScores) + 0.3 * avg(angleScores) + 0.3 * avg(lineScores));
    const visuospatialScore = clamp0(0.5 * avg(proportionScores) + 0.3 * avg(spatialScores) + 0.2 * avg(symmetryScores));
    const motorPlanningScore = clamp0(100 - clamp0((avg(planningTimes) / 5000) * 100));
    const processingSpeedScore = clamp0(100 - clamp0((avg(responseTimes) / 60000) * 100));
    const rawScore = avg(overallScores);
    const normalizedScore = clamp0(rawScore);
    const cognitiveScore = clamp0(0.35 * constructionalPraxisScore + 0.30 * visuospatialScore + 0.20 * motorPlanningScore + 0.15 * processingSpeedScore);

    return {
      figuresPresented: perFigureResults.length, figuresCompleted: completedCount, figuresTimedOut: timedOutCount, figuresNotAdministered: notAdministeredCount,
      easyTierAccuracy: tierAvg('easy'), mediumTierAccuracy: tierAvg('medium'), hardTierAccuracy: tierAvg('hard'),
      avgOverallDrawingAccuracy: clamp0(avg(overallScores)), avgShapeSimilarity: clamp0(avg(shapeScores)), avgAngleAccuracy: clamp0(avg(angleScores)),
      avgLineLengthAccuracy: clamp0(avg(lineScores)), avgSpatialOrganization: clamp0(avg(spatialScores)), avgSymmetryScore: clamp0(avg(symmetryScores)),
      avgProportionScore: clamp0(avg(proportionScores)), avgResponseTimeMs: responseTimes.length ? avg(responseTimes) : null, avgPlanningTimeMs: planningTimes.length ? avg(planningTimes) : null,
      constructionalPraxisScore, visuospatialScore, motorPlanningScore, processingSpeedScore, rawScore: clamp0(rawScore), normalizedScore, cognitiveScore,
    };
  },
};

// ---------------------------------------------------------------------------
// InterpretationEngine + top-level score() (replaces ResultModel).
// ---------------------------------------------------------------------------
export const InterpretationEngine = {
  interpret(cognitiveScore) {
    if (cognitiveScore >= 85) return { severity: 'TYPICAL', interpretation: 'Constructional and visuospatial performance within the typical range for this task.' };
    if (cognitiveScore >= 65) return { severity: 'MILD', interpretation: 'Mild deviations in shape reproduction, spatial organization, or motor planning observed.' };
    if (cognitiveScore >= 45) return { severity: 'MODERATE', interpretation: 'Moderate visuoconstructional difficulty -- distortions, omissions, or planning delays across multiple figures.' };
    return { severity: 'SIGNIFICANT', interpretation: 'Significant visuoconstructional impairment -- marked shape distortion, missing elements, or non-completion across figures.' };
  },
};

export const GeometricShapeCopyEngine = {
  score(perFigureResults, { sessionId } = {}) {
    const aggregateMetrics = MetricsEngine.computeAssessmentMetrics(perFigureResults);
    const { severity, interpretation } = InterpretationEngine.interpret(aggregateMetrics.cognitiveScore);
    return {
      sessionId,
      testName: 'Geometric Shape Copying Test',
      lobe: 'parietal',
      timestamp: new Date().toISOString(),
      score: Math.round(aggregateMetrics.cognitiveScore),
      ...aggregateMetrics,
      severity,
      interpretation,
      perFigureResults,
    };
  },
};
