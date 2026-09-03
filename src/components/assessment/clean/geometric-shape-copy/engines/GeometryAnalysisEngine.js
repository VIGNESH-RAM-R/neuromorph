// GeometryAnalysisEngine
// -----------------------------------------------------------------------------
// Pure, framework-agnostic computational-geometry comparison of a participant's
// freehand drawing against an original reference figure. No image processing,
// no OCR, no ML shape recognition -- everything here is closed-form coordinate
// math (polyline simplification, centroid/rotation alignment, nearest-neighbor
// vertex correspondence, angle/edge/symmetry residuals).
//
// IMPORTANT (bug avoided by design): several hard-tier figures (pinwheels) have
// multiple polygon components that share an *identical* coordinate, e.g. every
// blade of the four-blade pinwheel starts at [50, 50]. A naive
// `refVertices.findIndex(v => v[0]===x && v[1]===y)` lookup would resolve to
// the SAME index for every shared vertex, silently corrupting correspondence.
// extractReferenceVertexEntries() instead tags every vertex with a stable
// {componentIdx, localIdx, globalIdx}, so vertices are matched by structural
// position, never by coordinate equality.

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

// ---------------------------------------------------------------------------
// Reference vertex extraction (structural indexing, never coordinate lookup)
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Douglas-Peucker polyline simplification (reduces a raw freehand stroke to
// its structurally significant vertices).
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Rotation alignment: centroid + farthest-point heuristic (closed-form,
// correspondence-free -- appropriate before vertex matching has happened).
// ---------------------------------------------------------------------------
function farthestPointAngle(points, c) {
  let best = null, bestDist = -1;
  for (const p of points) {
    const d = dist(p, c);
    if (d > bestDist) { bestDist = d; best = p; }
  }
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

// ---------------------------------------------------------------------------
// Greedy nearest-neighbor vertex correspondence.
// ---------------------------------------------------------------------------
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
    if (bestIdx !== -1 && bestDist <= tolerance) {
      used[bestIdx] = true;
      matches[ri] = drawPoints[bestIdx];
      matchDistances[ri] = bestDist;
    }
  });

  const missingCount = matches.filter((m) => m === null).length;
  const extraCount = used.filter((u) => !u).length === used.length - used.filter(Boolean).length
    ? drawPoints.length - used.filter(Boolean).length
    : drawPoints.length - used.filter(Boolean).length;

  return { matches, matchDistances, missingCount, extraCount, tolerance };
}

// ---------------------------------------------------------------------------
// Interior angle at index i of a closed point loop (degrees), via dot product.
// ---------------------------------------------------------------------------
export function interiorAngle(points, i) {
  const n = points.length;
  if (n < 3) return null;
  const prev = points[(i - 1 + n) % n];
  const curr = points[i];
  const next = points[(i + 1) % n];
  const v1 = [prev[0] - curr[0], prev[1] - curr[1]];
  const v2 = [next[0] - curr[0], next[1] - curr[1]];
  const len1 = Math.hypot(...v1), len2 = Math.hypot(...v2);
  if (len1 === 0 || len2 === 0) return null;
  const cos = clamp((v1[0] * v2[0] + v1[1] * v2[1]) / (len1 * len2), -1, 1);
  return (Math.acos(cos) * 180) / Math.PI;
}

export function edgeLengths(points, closed = true) {
  const n = points.length;
  const lengths = [];
  const count = closed ? n : n - 1;
  for (let i = 0; i < count; i++) {
    lengths.push(dist(points[i], points[(i + 1) % n]));
  }
  return lengths;
}

// ---------------------------------------------------------------------------
// Symmetry residual: reflect (mirror axes) or rotate (radial) the drawn
// points about the reference centroid and measure nearest-neighbor residual
// against the original drawn point set. Lower residual = more self-symmetric.
// ---------------------------------------------------------------------------
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
      const rotated = points.map((p) => rotatePoint(p, c, angle));
      total += residualsFor(rotated);
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
  for (const theta of axesThetas) {
    const reflected = points.map((p) => reflectAcrossAngle(p, c, theta));
    total += residualsFor(reflected);
  }
  return total / axesThetas.length;
}

// ---------------------------------------------------------------------------
// Fallback metrics when nothing (or nothing usable) was drawn -- e.g. the
// master session timer expired before the participant produced any strokes.
// ---------------------------------------------------------------------------
export function emptyMetrics(expectedVertexCount) {
  return {
    overallDrawingAccuracy: 0,
    shapeSimilarity: 0,
    angleAccuracy: 0,
    lineLengthAccuracy: 0,
    spatialOrganization: 0,
    symmetryScore: 0,
    proportionScore: 0,
    rotationError: null,
    missingElements: expectedVertexCount,
    extraElements: 0
  };
}

// ---------------------------------------------------------------------------
// Main entry point.
// strokes: array of stroke arrays of {x, y, t} in raw canvas pixel space.
// canvasToFigureScale: number (uniform multiplier) OR {scale, offsetX, offsetY}
//   mapping raw canvas pixel coordinates into the figure's 0-100 space.
// ---------------------------------------------------------------------------
export function analyzeDrawing(figure, strokes, canvasToFigureScale = 1) {
  const refEntries = extractReferenceVertexEntries(figure);
  const refPoints = refEntries.map((e) => e.point);

  const toFigureSpace = (pt) => {
    if (typeof canvasToFigureScale === 'number') {
      return [pt.x * canvasToFigureScale, pt.y * canvasToFigureScale];
    }
    const { scale = 1, offsetX = 0, offsetY = 0 } = canvasToFigureScale || {};
    return [(pt.x - offsetX) * scale, (pt.y - offsetY) * scale];
  };

  const simplifiedStrokes = (strokes || [])
    .filter((s) => s && s.length)
    .map((s) => simplifyPolyline(s.map(toFigureSpace), 4));
  const drawPointsRaw = simplifiedStrokes.flat();

  if (!drawPointsRaw.length) return emptyMetrics(refPoints.length);

  const refC = centroid(refPoints);
  const drawCRaw = centroid(drawPointsRaw);

  // 1. translate draw centroid onto ref centroid
  const translated = drawPointsRaw.map((p) => [p[0] - drawCRaw[0] + refC[0], p[1] - drawCRaw[1] + refC[1]]);

  // 2. size-normalize (uniform scale) so shape/angle comparisons aren't
  //    penalized purely for drawing bigger/smaller than the reference.
  const refAvgR = refPoints.reduce((s, p) => s + dist(p, refC), 0) / refPoints.length || 1;
  const drawAvgR = translated.reduce((s, p) => s + dist(p, refC), 0) / translated.length || 1;
  const sizeScale = drawAvgR > 0 ? refAvgR / drawAvgR : 1;
  const rescaled = translated.map((p) => [refC[0] + (p[0] - refC[0]) * sizeScale, refC[1] + (p[1] - refC[1]) * sizeScale]);

  // 3. rotation alignment about the shared centroid
  const rotationRad = bestFitRotationRad(refPoints, rescaled);
  const aligned = rescaled.map((p) => rotatePoint(p, refC, rotationRad));

  // 4. structural vertex correspondence
  const { matches, matchDistances, missingCount, extraCount } = matchVertices(refPoints, aligned, 0.35, 1);

  const matchedDistances = matchDistances.filter((d) => d !== null);
  const refBbox = boundingBox(refPoints);
  const shapeSimilarity = matchedDistances.length
    ? clamp(100 * (1 - matchedDistances.reduce((a, b) => a + b, 0) / matchedDistances.length / (refBbox.diagonal || 1)))
    : 0;

  // angle accuracy: compare interior angles per polygon component where all
  // three relevant (prev, curr, next) reference vertices were matched
  const angleDiffs = [];
  refEntries.forEach((entry) => {
    if (entry.type !== 'polygon' || entry.componentSize < 3) return;
    const compEntries = refEntries.filter((e) => e.componentIdx === entry.componentIdx);
    const n = compEntries.length;
    const localPos = compEntries.findIndex((e) => e.globalIdx === entry.globalIdx);
    const prevEntry = compEntries[(localPos - 1 + n) % n];
    const nextEntry = compEntries[(localPos + 1) % n];
    const curMatch = matches[entry.globalIdx];
    const prevMatch = matches[prevEntry.globalIdx];
    const nextMatch = matches[nextEntry.globalIdx];
    if (!curMatch || !prevMatch || !nextMatch) return;
    const refAngle = interiorAngle([prevEntry.point, entry.point, nextEntry.point], 1);
    const drawAngle = interiorAngle([prevMatch, curMatch, nextMatch], 1);
    if (refAngle === null || drawAngle === null) return;
    angleDiffs.push(Math.abs(refAngle - drawAngle));
  });
  const angleAccuracy = angleDiffs.length
    ? clamp(100 * (1 - angleDiffs.reduce((a, b) => a + b, 0) / angleDiffs.length / 180))
    : (matchedDistances.length ? 70 : 0); // neutral fallback for figures with no measurable angles (e.g. all lines/circle)

  // line-length accuracy: polygon edges (wraparound) + open line segments
  const lengthRatios = [];
  const componentGroups = new Map();
  refEntries.forEach((e) => {
    if (!componentGroups.has(e.componentIdx)) componentGroups.set(e.componentIdx, []);
    componentGroups.get(e.componentIdx).push(e);
  });
  componentGroups.forEach((entries) => {
    const closed = entries[0].closed;
    const n = entries.length;
    const edgeCount = closed ? n : n - 1;
    for (let i = 0; i < edgeCount; i++) {
      const a = entries[i], b = entries[(i + 1) % n];
      const am = matches[a.globalIdx], bm = matches[b.globalIdx];
      if (!am || !bm) continue;
      const refLen = dist(a.point, b.point);
      const drawLen = dist(am, bm);
      if (refLen === 0) continue;
      lengthRatios.push(Math.min(drawLen, refLen) / Math.max(drawLen, refLen));
    }
  });
  const lineLengthAccuracy = lengthRatios.length
    ? clamp(100 * (lengthRatios.reduce((a, b) => a + b, 0) / lengthRatios.length))
    : 0;

  // proportion: bounding-box aspect ratio closeness (computed on aligned draw
  // points vs reference, independent of the uniform size normalization above
  // since aspect ratio is scale-invariant)
  const drawBbox = boundingBox(aligned);
  const refAspect = refBbox.height > 0 ? refBbox.width / refBbox.height : 1;
  const drawAspect = drawBbox.height > 0 ? drawBbox.width / drawBbox.height : 1;
  const aspectRatioCloseness = Math.min(refAspect, drawAspect) / Math.max(refAspect, drawAspect) || 0;
  const proportionScore = clamp(100 * aspectRatioCloseness);

  // symmetry: residual of the aligned drawing against its own expected
  // self-symmetry, normalized against the reference figure's scale
  const rawResidual = symmetryResidual(aligned, figure.symmetry, refC);
  const symmetryScore = clamp(100 * (1 - rawResidual / (refBbox.diagonal || 1)));

  // spatial organization: consistency (low variance) of matched-vertex
  // placement error -- a proxy for controlled, deliberate placement rather
  // than scattered/erratic drawing
  let spatialOrganization = 0;
  if (matchedDistances.length > 1) {
    const mean = matchedDistances.reduce((a, b) => a + b, 0) / matchedDistances.length;
    const variance = matchedDistances.reduce((a, b) => a + (b - mean) ** 2, 0) / matchedDistances.length;
    const cv = mean > 0 ? Math.sqrt(variance) / mean : 0;
    spatialOrganization = clamp(100 * (1 - Math.min(cv, 1)));
  } else if (matchedDistances.length === 1) {
    spatialOrganization = 60; // insufficient data for variance; neutral-ish
  }

  const rotationError = Math.abs((rotationRad * 180) / Math.PI);

  const overallDrawingAccuracy = clamp(
    0.35 * shapeSimilarity +
    0.25 * angleAccuracy +
    0.20 * lineLengthAccuracy +
    0.10 * proportionScore +
    0.10 * symmetryScore
  );

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
    extraElements: extraCount
  };
}
