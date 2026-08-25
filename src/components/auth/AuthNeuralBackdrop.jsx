import { authString } from '../../i18n/authStrings.js';

// Animated backdrop for the brand panel -- v3 (2026-08-18). v2's node
// cluster was an abstract rounded "sphere" ("looked like a constellation,
// not a brain" per feedback); this version builds an actual brain-shaped
// constellation instead: two lumpy hemisphere outlines (a top-down brain
// silhouette -- the classic paired-lobe shape with a visible midline
// fissure), a small cerebellum bump + brainstem underneath, and four
// callout labels connecting the shape to this project's real specialities
// (same copy already used in the trust-list/chips below, via
// authString()). Still dependency-free (inline SVG + CSS keyframes, no
// library), still respects prefers-reduced-motion (see theme.css).
//
// Every coordinate below is COMPUTED, not hand-typed bezier points --
// hemisphereOutline() generates a lumpy ring of points around a center
// using a couple of sine harmonics (for gyri-like bumps) plus a cosine
// "compression" term that flattens each hemisphere's inward-facing edge so
// the two lobes nest together with a real gap at the midline, then
// smoothClosedPath() threads a smooth curve through those same points --
// so the outline, the constellation nodes, and the edges are all built
// from ONE shared set of points instead of three hand-tuned ones.
const VIEW_W = 600;
const VIEW_H = 800;

function polar(cx, cy, r, angleDeg, yScale = 1) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) * yScale };
}

// A smooth, closed organic ring: `count` points around (cx, cy), each
// pushed out/in from `baseR` by two sine harmonics (gyri-like lumps) and
// compressed near `inwardDeg` (so a hemisphere's medial edge, facing the
// midline, reads as flattened rather than round).
function hemisphereOutline(cx, cy, baseR, inwardDeg, count, seed, yScale = 0.86) {
  const inwardRad = (inwardDeg * Math.PI) / 180;
  const pts = [];
  for (let i = 0; i < count; i++) {
    const theta = (360 / count) * i;
    const rad = (theta * Math.PI) / 180;
    const lump = 1 + 0.09 * Math.sin(3 * rad + seed) + 0.05 * Math.sin(7 * rad + seed * 1.7);
    const align = Math.cos(rad - inwardRad); // 1 = pointing straight at the midline
    const compress = 1 - 0.34 * Math.max(0, align);
    const r = baseR * lump * compress;
    pts.push(polar(cx, cy, r, theta, yScale));
  }
  return pts;
}

function ringPoints(cx, cy, r, count, seedOffsetDeg = 0, yScale = 0.86) {
  const pts = [];
  for (let i = 0; i < count; i++) {
    pts.push(polar(cx, cy, r, (360 / count) * i + seedOffsetDeg, yScale));
  }
  return pts;
}

// Index of the outline point closest to a given compass angle -- used to
// pick "the upper-left point" etc. by direction instead of guessing array
// indices by hand.
function nearestIndexForAngle(count, targetDeg) {
  return ((Math.round((count * targetDeg) / 360) % count) + count) % count;
}

// Smooth CLOSED curve through a ring of points (quadratic-through-
// midpoints technique: each point is a curve control, the midpoint to the
// next point is the curve's end -- guarantees a smooth, non-jagged closed
// shape without needing hand-authored bezier handles).
function smoothClosedPath(points) {
  const mid = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
  const start = mid(points[points.length - 1], points[0]);
  let d = `M ${start.x.toFixed(1)} ${start.y.toFixed(1)} `;
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const next = points[(i + 1) % points.length];
    const m = mid(p, next);
    d += `Q ${p.x.toFixed(1)} ${p.y.toFixed(1)} ${m.x.toFixed(1)} ${m.y.toFixed(1)} `;
  }
  return `${d}Z`;
}

// Smooth OPEN curve through a short chain of points -- used for the single
// squiggly longitudinal-fissure line down the middle.
function smoothOpenPath(points) {
  let d = `M ${points[0].x} ${points[0].y} `;
  for (let i = 1; i < points.length - 1; i++) {
    const p = points[i];
    const next = points[i + 1];
    d += `Q ${p.x} ${p.y} ${((p.x + next.x) / 2).toFixed(1)} ${((p.y + next.y) / 2).toFixed(1)} `;
  }
  const last = points[points.length - 1];
  return `${d}L ${last.x} ${last.y}`;
}

// Centers are far enough apart, relative to HEMI_R and the 0.34 medial
// compression above, that the two hemispheres actually stop short of each
// other at the midline (a real ~16px gap at their closest point) instead of
// overlapping into one blob -- that gap is where the fissure line and the
// corpus-callosum bridge edges (below) live.
const LEFT = { x: 205, y: 335 };
const RIGHT = { x: 395, y: 335 };
const HEMI_R = 132;
const OUTLINE_COUNT = 16;
const INNER_COUNT = 5;
const CEREBELLUM = { x: 300, y: 495, r: 46, count: 10 };

// Left hemisphere's inward (medial) direction is 0deg (east, toward the
// right hemisphere); the right hemisphere's is 180deg (west, toward the
// left) -- this is what makes the two lobes flatten toward each other and
// nest with a real gap, the single biggest thing that makes this actually
// read as "a brain" rather than two random blobs.
const leftOutline = hemisphereOutline(LEFT.x, LEFT.y, HEMI_R, 0, OUTLINE_COUNT, 0.4);
const rightOutline = hemisphereOutline(RIGHT.x, RIGHT.y, HEMI_R, 180, OUTLINE_COUNT, 1.3);
const leftInner = ringPoints(LEFT.x, LEFT.y, 60, INNER_COUNT, 12);
const rightInner = ringPoints(RIGHT.x, RIGHT.y, 60, INNER_COUNT, 40);
const cerebellumOutline = hemisphereOutline(CEREBELLUM.x, CEREBELLUM.y, CEREBELLUM.r, 270, CEREBELLUM.count, 2.1, 0.8);
const stem = [{ x: 300, y: 543 }, { x: 300, y: 573 }];
const core = { x: 300, y: 335 };

function withIds(points, prefix, bigEvery = 3) {
  return points.map((p, i) => ({ id: `${prefix}${i}`, ...p, r: i % bigEvery === 0 ? 6.5 : 4 }));
}

const leftOutlineNodes = withIds(leftOutline, 'lo');
const rightOutlineNodes = withIds(rightOutline, 'ro');
const leftInnerNodes = withIds(leftInner, 'li', 2).map((n) => ({ ...n, r: 4.5 }));
const rightInnerNodes = withIds(rightInner, 'ri', 2).map((n) => ({ ...n, r: 4.5 }));
const cerebellumNodes = withIds(cerebellumOutline, 'ce', 4).map((n) => ({ ...n, r: 3.6 }));
const stemNodes = stem.map((p, i) => ({ id: `st${i}`, ...p, r: 3.6 }));
const coreNode = { id: 'core', ...core, r: 7 };

const NODES = [...leftOutlineNodes, ...rightOutlineNodes, ...leftInnerNodes, ...rightInnerNodes, ...cerebellumNodes, ...stemNodes, coreNode];
const byId = Object.fromEntries(NODES.map((n) => [n.id, n]));

function ringEdges(nodes) {
  return nodes.map((n, i) => [n.id, nodes[(i + 1) % nodes.length].id]);
}

const EDGES = [
  ...ringEdges(leftOutlineNodes),
  ...ringEdges(rightOutlineNodes),
  ...ringEdges(leftInnerNodes),
  ...ringEdges(rightInnerNodes),
  ...ringEdges(cerebellumNodes),
];

// Spokes: each inner-ring node reaches out to its nearest outline node, so
// the hemisphere reads as a filled network, not just a hollow ring.
leftInnerNodes.forEach((n, i) => {
  const targetIdx = Math.round((i * OUTLINE_COUNT) / INNER_COUNT) % OUTLINE_COUNT;
  EDGES.push([n.id, leftOutlineNodes[targetIdx].id]);
});
rightInnerNodes.forEach((n, i) => {
  const targetIdx = Math.round((i * OUTLINE_COUNT) / INNER_COUNT) % OUTLINE_COUNT;
  EDGES.push([n.id, rightOutlineNodes[targetIdx].id]);
});

// The "corpus callosum" -- the one real bridge between the two hemispheres,
// routed through the shared core node at the midline.
const leftMedialIdx = nearestIndexForAngle(OUTLINE_COUNT, 0);
const rightMedialIdx = nearestIndexForAngle(OUTLINE_COUNT, 180);
EDGES.push([leftOutlineNodes[leftMedialIdx].id, 'core']);
EDGES.push([rightOutlineNodes[rightMedialIdx].id, 'core']);
EDGES.push([leftOutlineNodes[leftMedialIdx].id, rightOutlineNodes[rightMedialIdx].id]);

// Cerebellum tucked under both hemispheres, plus a short brainstem below it
// -- the detail that makes the silhouette read as a brain at a glance
// rather than a generic paired-blob shape.
const leftBottomIdx = nearestIndexForAngle(OUTLINE_COUNT, 90);
const rightBottomIdx = nearestIndexForAngle(OUTLINE_COUNT, 90);
const cerebellumTopIdx = nearestIndexForAngle(CEREBELLUM.count, 270);
const cerebellumBottomIdx = nearestIndexForAngle(CEREBELLUM.count, 90);
EDGES.push([leftOutlineNodes[leftBottomIdx].id, cerebellumNodes[cerebellumTopIdx].id]);
EDGES.push([rightOutlineNodes[rightBottomIdx].id, cerebellumNodes[(cerebellumTopIdx + 1) % CEREBELLUM.count].id]);
EDGES.push([cerebellumNodes[cerebellumBottomIdx].id, 'st0']);
EDGES.push(['st0', 'st1']);

// A subset of edges get a traveling "signal" pulse -- kept sparse so the
// scene reads as calm and alive, not busy.
const SIGNAL_EDGES = [
  EDGES[0], EDGES[Math.floor(OUTLINE_COUNT / 2)],
  EDGES[OUTLINE_COUNT], EDGES[OUTLINE_COUNT + Math.floor(OUTLINE_COUNT / 2)],
  EDGES[EDGES.length - 3], EDGES[EDGES.length - 5],
];

const SPARKLES = [
  { x: 60, y: 90, r: 2.2 }, { x: 540, y: 65, r: 1.8 }, { x: 45, y: 610, r: 2 },
  { x: 555, y: 690, r: 2.4 }, { x: 35, y: 380, r: 1.6 }, { x: 565, y: 300, r: 2 },
  { x: 150, y: 730, r: 1.8 }, { x: 460, y: 110, r: 2.2 }, { x: 300, y: 45, r: 1.6 },
  { x: 300, y: 745, r: 2 }, { x: 505, y: 470, r: 1.8 }, { x: 95, y: 190, r: 2 },
];

// Four callout points connecting this literal brain graphic to the
// project's real specialities (same copy as the chips/trust list below --
// see doctorFaqConfig.js-style precedent of never inventing separate
// marketing copy for a second surface). Anchors are picked by direction
// (upper/lower, left/right) via nearestIndexForAngle so they land on
// clean, unflattened lateral bumps of each hemisphere.
const upperLeftIdx = nearestIndexForAngle(OUTLINE_COUNT, 315);
const lowerLeftIdx = nearestIndexForAngle(OUTLINE_COUNT, 135);
const upperRightIdx = nearestIndexForAngle(OUTLINE_COUNT, 315);
const lowerRightIdx = nearestIndexForAngle(OUTLINE_COUNT, 45);

function buildCallouts(language) {
  const anchor = (node, side, labelY) => ({ node, side, labelY });
  return [
    { key: 'specialityExplainableAI', ...anchor(leftOutlineNodes[upperLeftIdx], 'left', leftOutlineNodes[upperLeftIdx].y) },
    { key: 'specialityContinuousMonitoring', ...anchor(leftOutlineNodes[lowerLeftIdx], 'left', leftOutlineNodes[lowerLeftIdx].y) },
    { key: 'specialityClinicalGrade', ...anchor(rightOutlineNodes[upperRightIdx], 'right', rightOutlineNodes[upperRightIdx].y) },
    { key: 'specialityMultimodal', ...anchor(rightOutlineNodes[lowerRightIdx], 'right', rightOutlineNodes[lowerRightIdx].y) },
  ].map((c) => ({ ...c, text: authString(language, c.key) }));
}

const FISSURE_PATH = smoothOpenPath([
  { x: 300, y: 208 }, { x: 295, y: 250 }, { x: 304, y: 292 }, { x: 297, y: 334 },
  { x: 302, y: 376 }, { x: 296, y: 418 }, { x: 301, y: 452 },
]);
const LEFT_OUTLINE_PATH = smoothClosedPath(leftOutline);
const RIGHT_OUTLINE_PATH = smoothClosedPath(rightOutline);
const CEREBELLUM_PATH = smoothClosedPath(cerebellumOutline);

export default function AuthNeuralBackdrop({ language }) {
  const callouts = buildCallouts(language);
  const LABEL_MARGIN_LEFT = 30;
  const LABEL_MARGIN_RIGHT = VIEW_W - 30;

  return (
    <>
      <div className="nmpa-auth-swirl" aria-hidden="true" />
      <svg
        className="nmpa-auth-neural"
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <g className="nmpa-auth-neural__sparkles">
          {SPARKLES.map((s, i) => (
            <circle
              key={i} cx={s.x} cy={s.y} r={s.r} fill="currentColor"
              className="nmpa-auth-neural__sparkle"
              style={{ animationDelay: `${(i % 6) * 0.6}s` }}
            />
          ))}
        </g>

        {/* The brain silhouette itself -- a faint smooth outline so the
            constellation of nodes/edges below reads unmistakably as "a
            brain shape" even before you trace the individual connections. */}
        <g className="nmpa-auth-neural__outlines">
          <path d={LEFT_OUTLINE_PATH} className="nmpa-auth-neural__outline" />
          <path d={RIGHT_OUTLINE_PATH} className="nmpa-auth-neural__outline" />
          <path d={CEREBELLUM_PATH} className="nmpa-auth-neural__outline" />
          <path d={FISSURE_PATH} className="nmpa-auth-neural__fissure" />
        </g>

        <g className="nmpa-auth-neural__edges">
          {EDGES.map(([a, b], i) => {
            const from = byId[a];
            const to = byId[b];
            return (
              <line
                key={i}
                x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                stroke="currentColor" strokeWidth="1.1"
                className="nmpa-auth-neural__edge"
              />
            );
          })}
        </g>

        <g>
          {SIGNAL_EDGES.map(([a, b], i) => {
            const from = byId[a];
            const to = byId[b];
            const pathId = `nmpa-neural-path-${i}`;
            const dur = `${2.4 + (i % 3) * 0.6}s`;
            const begin = `${(i * 0.55).toFixed(2)}s`;
            return (
              <g key={pathId}>
                <path id={pathId} d={`M ${from.x} ${from.y} L ${to.x} ${to.y}`} fill="none" opacity="0" />
                <circle r="3" fill="currentColor" className="nmpa-auth-neural__signal">
                  <animateMotion dur={dur} begin={begin} repeatCount="indefinite" rotate="auto">
                    <mpath href={`#${pathId}`} />
                  </animateMotion>
                </circle>
              </g>
            );
          })}
        </g>

        <g className="nmpa-auth-neural__nodes">
          {NODES.map((n, i) => (
            <circle
              key={n.id}
              cx={n.x} cy={n.y} r={n.r}
              fill="currentColor"
              className="nmpa-auth-neural__node"
              style={{ animationDelay: `${(i % 7) * 0.3}s` }}
            />
          ))}
        </g>

        {/* Callouts -- connect the brain graphic to this project's real
            specialities (same strings as the chips below AuthNeuralBackdrop
            in AuthBrandPanel.jsx, via authString()), so the visual isn't
            just decorative -- it's labeled. */}
        <g className="nmpa-auth-neural__callouts">
          {callouts.map((c) => {
            const labelX = c.side === 'left' ? LABEL_MARGIN_LEFT : LABEL_MARGIN_RIGHT;
            return (
              <g key={c.key}>
                <line
                  x1={c.node.x} y1={c.node.y} x2={labelX} y2={c.labelY}
                  className="nmpa-auth-neural__label-line"
                />
                <circle cx={c.node.x} cy={c.node.y} r={4.5} className="nmpa-auth-neural__anchor" />
                <text
                  x={labelX} y={c.labelY}
                  textAnchor={c.side === 'left' ? 'end' : 'start'}
                  dominantBaseline="middle"
                  className="nmpa-auth-neural__label"
                >
                  {c.text}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </>
  );
}
