// 2026-08-18: dedicated backdrop for RoleGateScreen only (the very first
// screen, before either login form) -- built from a reference image the
// user sent (a glowing side-profile head/brain network with labeled
// callouts for cognitive domains: Memory, Language, Attention, Processing
// Speed, Executive Function, Visuospatial, Insights). Two honest notes on
// how this was adapted, not just copied:
//   1. No image-generation tool is available in this environment, so this
//      is a hand-built SVG interpretation of the reference's COMPOSITION
//      (a glowing network filling a side-profile head, with hexagon-icon
//      callouts pointing to labeled regions) -- not a pixel copy, and not
//      photorealistic. If a real generated image close to the reference
//      shows up later, swapping this SVG for a real background image
//      (`background-image` on .nmpa-rolegate) is a smaller change than
//      this file was to build, and will look better -- worth doing when
//      there's time.
//   2. The 6 labels use this app's REAL cognitive domains (from
//      domainInsightConfig.js -- Attention, Executive Function, Processing
//      Speed, Visual Memory, Language, Recognition Memory) rather than the
//      reference's generic set (which includes "Visuospatial"/"Insights",
//      neither of which this app actually measures) -- same "never label
//      something the product doesn't really do" rule used everywhere else
//      in this codebase.
// Separate component from AuthNeuralBackdrop.jsx (the login/signup brand
// panel's backdrop) on purpose -- this only changes the role-gate screen,
// not the two auth forms, which the user didn't ask to change here.
import { DOMAIN_LABELS } from '../../config/domainInsightConfig.js';

const VIEW_W = 900;
const VIEW_H = 700;
const HEAD = { x: 560, y: 350 };

function pt(dx, dy) {
  return { x: HEAD.x + dx, y: HEAD.y + dy };
}

// Hand-placed landmarks tracing a right-facing head silhouette (crown ->
// forehead -> nose -> lips -> chin -> jaw -> ear -> back of skull -> crown).
// Not anatomically exact -- a stylized, low-poly silhouette, same spirit as
// the brain-hemisphere shapes on the login screens (see
// AuthNeuralBackdrop.jsx), just aiming for "reads as a head in profile"
// rather than "reads as a brain from above."
const HEAD_POINTS = [
  pt(0, -180), pt(55, -165), pt(85, -125), pt(78, -105), pt(90, -80),
  pt(125, -50), pt(105, -35), pt(115, -25), pt(102, -15), pt(110, 5),
  pt(88, 30), pt(50, 40), pt(30, 20), pt(45, -10), pt(0, 5),
  pt(-80, -40), pt(-85, -120), pt(-40, -175),
];

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

const HEAD_PATH = smoothClosedPath(HEAD_POINTS);
const headNodes = HEAD_POINTS.map((p, i) => ({ id: `h${i}`, ...p, r: i % 3 === 0 ? 6 : 3.6 }));

// Interior "brain" nodes -- deterministic scatter (not random, so it's the
// same every load) concentrated in the upper 2/3 of the head, evoking the
// reference's dense glowing web sitting inside the skull, thinning out
// toward the jaw/face the way the reference's texture goes from network
// lines up top to soft dot-particles down near the face.
const BRAIN_SEED = [
  [-30, -140], [10, -150], [45, -120], [-10, -110], [30, -90], [-40, -80],
  [60, -60], [-55, -40], [10, -50], [-20, -20], [40, -20], [-70, -100],
];
const brainNodes = BRAIN_SEED.map(([dx, dy], i) => ({ id: `b${i}`, ...pt(dx, dy), r: 4.4 }));

function ringEdges(nodes) {
  return nodes.map((n, i) => [n.id, nodes[(i + 1) % nodes.length].id]);
}
const EDGES = [...ringEdges(headNodes)];
const byId = Object.fromEntries([...headNodes, ...brainNodes].map((n) => [n.id, n]));

// Interior nodes connect to their two nearest interior neighbours (by
// index, since BRAIN_SEED is already laid out roughly front-to-back) plus
// one nearby outline node, so the brain area reads as a filled mesh, not a
// loose scatter.
brainNodes.forEach((n, i) => {
  const next = brainNodes[(i + 1) % brainNodes.length];
  EDGES.push([n.id, next.id]);
  const outlineIdx = Math.round((i * headNodes.length) / brainNodes.length) % headNodes.length;
  EDGES.push([n.id, headNodes[outlineIdx].id]);
});

const SIGNAL_EDGES = [EDGES[0], EDGES[4], EDGES[9], EDGES[EDGES.length - 2], EDGES[EDGES.length - 6]];

// Face-area particles -- small static dots (no connecting lines) tracing
// the lower/front part of the head, matching the reference's dotted-
// texture face versus network-line brain.
const FACE_DOTS = [
  pt(95, -60), pt(115, -40), pt(100, -20), pt(112, 0), pt(90, 15),
  pt(65, 25), pt(40, 30), pt(70, -75), pt(55, -95), pt(80, 5), pt(60, 10), pt(45, 0),
];

// Ambient sparkles scattered around the wider canvas for depth (kept clear
// of the head/callout area).
const SPARKLES = [
  { x: 60, y: 70 }, { x: 830, y: 90 }, { x: 40, y: 340 }, { x: 40, y: 610 },
  { x: 200, y: 640 }, { x: 700, y: 640 }, { x: 850, y: 400 }, { x: 300, y: 40 },
  { x: 650, y: 60 }, { x: 150, y: 200 },
];

// Six real domains (domainInsightConfig.js), each with a small hexagon
// icon + a terse three-beat tagline in the reference's own style. Anchor
// = which head/brain node the callout line points to.
// `anchor` is just a node id, resolved against `byId` (already fully built
// above by module-eval time) via resolveAnchor() below.
const CALLOUTS = [
  { key: 'attention', tagline: 'Focus. Track. Sustain.', side: 'left', y: 190, icon: 'target', anchor: 'b5' },
  { key: 'visualMemory', tagline: 'See. Encode. Recall.', side: 'left', y: 350, icon: 'eye', anchor: 'b7' },
  { key: 'executiveFunction', tagline: 'Plan. Decide. Adapt.', side: 'left', y: 500, icon: 'tree', anchor: 'b9' },
  { key: 'language', tagline: 'Express. Understand. Connect.', side: 'right', y: 190, icon: 'speech', anchor: 'h5' },
  { key: 'processingSpeed', tagline: 'Think. Process. Respond.', side: 'right', y: 350, icon: 'gauge', anchor: 'h1' },
  { key: 'recognitionMemory', tagline: 'Recognize. Match. Recall.', side: 'right', y: 500, icon: 'face', anchor: 'h13' },
];

function resolveAnchor(id) {
  return byId[id] || HEAD;
}

function HexIcon({ type }) {
  // Simple, hand-drawn glyphs -- not a library -- each evokes its domain
  // the same way the reference's icon set does (target for attention,
  // speech bubble for language, gauge for speed, etc.).
  switch (type) {
    case 'target':
      return (<g><circle cx="0" cy="0" r="7" /><circle cx="0" cy="0" r="3.2" fill="currentColor" stroke="none" /></g>);
    case 'eye':
      return (<g><path d="M -8 0 Q 0 -6 8 0 Q 0 6 -8 0 Z" /><circle cx="0" cy="0" r="2.4" fill="currentColor" stroke="none" /></g>);
    case 'tree':
      return (<g><circle cx="0" cy="-6" r="2" fill="currentColor" stroke="none" /><circle cx="-6" cy="6" r="2" fill="currentColor" stroke="none" /><circle cx="6" cy="6" r="2" fill="currentColor" stroke="none" /><path d="M 0 -4 L 0 0 M 0 0 L -6 4 M 0 0 L 6 4" /></g>);
    case 'speech':
      return (<path d="M -8 -5 Q -8 -8 -5 -8 L 5 -8 Q 8 -8 8 -5 L 8 1 Q 8 4 5 4 L -2 4 L -6 8 L -5 4 L -5 4 Q -8 4 -8 1 Z" />);
    case 'gauge':
      return (<g><path d="M -8 4 A 8 8 0 0 1 8 4" /><line x1="0" y1="2" x2="4" y2="-4" /></g>);
    case 'face':
      return (<g><circle cx="0" cy="-2" r="4.5" /><path d="M -6 8 Q 0 2 6 8" /></g>);
    default:
      return null;
  }
}

export default function RoleGateBackdrop() {
  return (
    <>
      <div className="nmpa-auth-swirl" aria-hidden="true" />
      <svg
        className="nmpa-auth-neural nmpa-rolegate-brain"
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <g className="nmpa-auth-neural__sparkles">
          {SPARKLES.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={i % 2 ? 1.6 : 2.2} fill="currentColor" className="nmpa-auth-neural__sparkle" style={{ animationDelay: `${(i % 6) * 0.6}s` }} />
          ))}
          {FACE_DOTS.map((p, i) => (
            <circle key={`f${i}`} cx={p.x} cy={p.y} r="1.8" fill="currentColor" className="nmpa-auth-neural__sparkle" style={{ animationDelay: `${(i % 5) * 0.5}s`, opacity: 0.4 }} />
          ))}
        </g>

        <path d={HEAD_PATH} className="nmpa-auth-neural__outline" />

        <g className="nmpa-auth-neural__edges">
          {EDGES.map(([a, b], i) => {
            const from = byId[a];
            const to = byId[b];
            if (!from || !to) return null;
            return <line key={i} x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="currentColor" strokeWidth="1" className="nmpa-auth-neural__edge" />;
          })}
        </g>

        <g>
          {SIGNAL_EDGES.map(([a, b], i) => {
            const from = byId[a];
            const to = byId[b];
            if (!from || !to) return null;
            const pathId = `nmpa-rolegate-path-${i}`;
            return (
              <g key={pathId}>
                <path id={pathId} d={`M ${from.x} ${from.y} L ${to.x} ${to.y}`} fill="none" opacity="0" />
                <circle r="2.6" fill="currentColor" className="nmpa-auth-neural__signal">
                  <animateMotion dur={`${2.6 + (i % 3) * 0.5}s`} begin={`${(i * 0.5).toFixed(2)}s`} repeatCount="indefinite" rotate="auto">
                    <mpath href={`#${pathId}`} />
                  </animateMotion>
                </circle>
              </g>
            );
          })}
        </g>

        <g className="nmpa-auth-neural__nodes">
          {[...headNodes, ...brainNodes].map((n, i) => (
            <circle key={n.id} cx={n.x} cy={n.y} r={n.r} fill="currentColor" className="nmpa-auth-neural__node" style={{ animationDelay: `${(i % 7) * 0.3}s` }} />
          ))}
        </g>

        <g className="nmpa-auth-neural__callouts">
          {CALLOUTS.map((c) => {
            const anchor = resolveAnchor(c.anchor);
            const labelX = c.side === 'left' ? 40 : 860;
            const iconX = c.side === 'left' ? 70 : 800;
            return (
              <g key={c.key}>
                <line x1={anchor.x} y1={anchor.y} x2={iconX} y2={c.y} className="nmpa-auth-neural__label-line" />
                <circle cx={anchor.x} cy={anchor.y} r={4} className="nmpa-auth-neural__anchor" />
                <g transform={`translate(${iconX}, ${c.y})`}>
                  <path
                    d="M 12 0 L 6 10.4 L -6 10.4 L -12 0 L -6 -10.4 L 6 -10.4 Z"
                    fill="none" stroke="currentColor" strokeWidth="1.3" opacity="0.7"
                  />
                  <HexIcon type={c.icon} />
                </g>
                <text
                  x={c.side === 'left' ? iconX + 20 : iconX - 20}
                  y={c.y - 3}
                  textAnchor={c.side === 'left' ? 'start' : 'end'}
                  className="nmpa-auth-neural__label nmpa-rolegate-brain__label-title"
                >
                  {DOMAIN_LABELS[c.key]}
                </text>
                <text
                  x={c.side === 'left' ? iconX + 20 : iconX - 20}
                  y={c.y + 15}
                  textAnchor={c.side === 'left' ? 'start' : 'end'}
                  className="nmpa-auth-neural__label nmpa-rolegate-brain__label-tagline"
                >
                  {c.tagline}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </>
  );
}
