import { useEffect, useRef, useState } from 'react';
import { DEFAULT_LANGUAGE } from '../../config/i18nConfig.js';
import { ABOUT_WEBSITE_URL } from '../../config/externalLinksConfig.js';
import { t } from '../../i18n/strings/roleGate.js';
import BrandLogo from '../common/BrandLogo.jsx';
import { LANGUAGES, languageInfo } from '../../config/i18nConfig.js';
import { GlobeIcon, ChevronDownIcon } from '../icons/FormIcons.jsx';

// 2026-08-26 ADDITION -- premium motion pass on the cognitive score
// dashboard (VR: "Apple-level + Linear.app quality motion design"). Counts
// a number up from 0 to its real value using an eased requestAnimationFrame
// loop -- no animation library needed. Respects prefers-reduced-motion by
// jumping straight to the final value instead of animating.
function useCountUp(target, duration = 1200, delay = 0) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const reduced = typeof window !== 'undefined' && window.matchMedia
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) { setValue(target); return undefined; }
    let raf;
    let start;
    const tick = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setValue(target * eased);
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    const timer = setTimeout(() => { raf = requestAnimationFrame(tick); }, delay);
    return () => { clearTimeout(timer); if (raf) cancelAnimationFrame(raf); };
  }, [target, duration, delay]);
  return value;
}

const PARTICLES = Array.from({ length: 28 }, (_, index) => index);

function RoleCard({ className, icon, title, description, onClick }) {
  return (
    <button type="button" className={`nmpa-landing__role ${className}`} onClick={onClick}>
      <span className="nmpa-landing__role-icon" aria-hidden="true">{icon}</span>
      <span className="nmpa-landing__role-copy"><span className="nmpa-landing__role-title">{title}</span><span className="nmpa-landing__role-description">{description}</span></span>
      <span className="nmpa-landing__role-arrow" aria-hidden="true">→</span>
    </button>
  );
}

function FeatureIcon({ type }) {
  if (type === 'assessment') return <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M17 8h14v5h5v27H12V13h5V8Z" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round"/><path d="M19 8h10v6H19zM19 23h10M19 30h7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"/><path d="m28.5 33 2.5 2.5 5-6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>;
  if (type === 'activity') return <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 8a16 16 0 1 1-16 16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"/><path d="M24 14v10l7 4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/><circle cx="24" cy="24" r="3" fill="currentColor"/></svg>;
  if (type === 'context') return <svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="18" cy="18" r="5" fill="none" stroke="currentColor" strokeWidth="2.4"/><circle cx="32" cy="20" r="4" fill="none" stroke="currentColor" strokeWidth="2.4"/><path d="M8 38c1.5-7 6-10 10-10s8.5 3 10 10M27 30c5 0 8.5 2.7 10 8" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"/></svg>;
  // 04 -- Multimodal Analysis: a brain (two lobes) with a speech/behavioral
  // waveform running through it, plus small facial-landmark dots, so the
  // icon reads as "several signal types feeding one picture" at a glance.
  if (type === 'multimodal') return <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M18 10a7 7 0 0 0-6.5 9.5A6 6 0 0 0 12 31a6 6 0 0 0 6 6h1a5 5 0 0 0 5-5V15a5 5 0 0 0-5-5h-1Z" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round"/><path d="M30 10a7 7 0 0 1 6.5 9.5A6 6 0 0 1 36 31a6 6 0 0 1-6 6h-1a5 5 0 0 1-5-5V15a5 5 0 0 1 5-5h1Z" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round"/><path d="M6 24h5l2-5 3 9 3-7 2 3h18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="15" cy="17" r="1.4" fill="currentColor"/><circle cx="33" cy="17" r="1.4" fill="currentColor"/></svg>;
  // 05 -- Longitudinal Monitoring: a rising timeline/trend line with dated
  // checkpoints, echoing the weekly-trend chart used elsewhere on this page.
  if (type === 'longitudinal') return <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M6 38h36" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"/><path d="M6 30 16 20l7 6 9-12 10 9" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/><circle cx="16" cy="20" r="2.2" fill="currentColor"/><circle cx="23" cy="26" r="2.2" fill="currentColor"/><circle cx="32" cy="14" r="2.2" fill="currentColor"/><circle cx="42" cy="23" r="2.2" fill="currentColor"/></svg>;
  // 06 -- Personalized Cognitive Score: a circular progress ring around a
  // small radar/domain-plot shape, combining "score ring" + "radar chart".
  if (type === 'score') return <svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="15" fill="none" stroke="currentColor" strokeOpacity=".22" strokeWidth="2.6"/><path d="M24 9a15 15 0 0 1 10.6 25.6" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"/><path d="M24 15 30 22 27 31 21 31 18 22Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/><circle cx="24" cy="24" r="1.6" fill="currentColor"/></svg>;
  return null;
}

// 2026-08-24 ADDITION -- the hero's floating cognitive-domain badges (VR
// request: a frameless, 3D hero to replace the old boxed brain photo, see
// this section's own header comment on .nmpa-landing__hero-art in
// theme.css). Each icon is deliberately simple/geometric (a handful of
// basic shapes) rather than anything illustrative -- easy to keep looking
// clean at 22px inside a small hexagon badge, matching FeatureIcon's own
// restrained line-icon style just above.
function DomainIcon({ type }) {
  if (type === 'memory') return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 3a4 4 0 0 0-4 4c0 .7.16 1.36.44 1.95A3.5 3.5 0 0 0 4 12.5 3.5 3.5 0 0 0 6.5 15.8 3 3 0 0 0 9 20a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><path d="M15 3a4 4 0 0 1 4 4c0 .7-.16 1.36-.44 1.95A3.5 3.5 0 0 1 20 12.5a3.5 3.5 0 0 1-2.5 3.3A3 3 0 0 1 15 20a3 3 0 0 1-3-3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>;
  if (type === 'language') return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v9A1.5 1.5 0 0 1 18.5 16H9l-4 4v-4H5.5A1.5 1.5 0 0 1 4 14.5v-9Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><path d="M8 8.5h8M8 11.5h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>;
  if (type === 'attention') return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.6"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.6"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/></svg>;
  if (type === 'speed') return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 15a8 8 0 1 1 16 0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><path d="M12 15 16 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><circle cx="12" cy="15" r="1.3" fill="currentColor"/></svg>;
  if (type === 'executive') return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="6" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.6"/><circle cx="18" cy="6" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.6"/><circle cx="12" cy="18" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.6"/><path d="M7.8 7.3 10.5 16M16.2 7.3 13.5 16M8.2 6h7.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>;
  if (type === 'visuospatial') return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 20 7.5v9L12 21l-8-4.5v-9L12 3Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><path d="M12 3v18M4 7.5l8 4.5 8-4.5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>;
  // Speech -- an audio waveform (the cognitive-score dashboard's "Speech" card).
  if (type === 'waveform') return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12h2.4l1.6-5 2.4 10 2-13 2.4 15 2-9 1.6 4H22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>;
  // Facial Expression -- a simple smiling face.
  if (type === 'smiley') return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.6"/><circle cx="9" cy="10" r="1.1" fill="currentColor"/><circle cx="15" cy="10" r="1.1" fill="currentColor"/><path d="M8 14.5c1 1.4 2.4 2.1 4 2.1s3-.7 4-2.1" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>;
  // Executive Function -- an isometric cube (planning/structure).
  if (type === 'cube') return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 20 7.5v9L12 21l-8-4.5v-9L12 3Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><path d="M12 12v9M12 12 4 7.5M12 12l8-4.5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>;
  // Shield-check -- used by the dashboard's "early insights" banner.
  if (type === 'shield') return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 19 6v6c0 4.4-2.9 7.6-7 9-4.1-1.4-7-4.6-7-9V6l7-3Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><path d="m8.7 12.2 2.2 2.2 4.4-4.6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20V10M9.5 20V6M15 20v-8M20 20V4" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/></svg>;
}

// 2026-08-25 REDESIGN (VR: "change it to the image I sent -- lots of plots,
// icons, and all those given properly") -- replaces the old floating-orbit
// score visual (cramped/overlapping at real page width) with a clean,
// structured dashboard card: an icon + score + sublabel per cognitive
// domain, a center score ring, a real weekly trend chart with day labels,
// and a small "early insights" banner -- same data as before, laid out so
// nothing overlaps at any width.
const SCORE_DOMAINS = [
  { key: 'memory', icon: 'memory', title: 'Memory', sub: 'Recall & Recognition', score: 86 },
  { key: 'language', icon: 'language', title: 'Language', sub: 'Expression & Comprehension', score: 84 },
  { key: 'attention', icon: 'attention', title: 'Attention', sub: 'Focus & Sustained Attention', score: 79 },
  { key: 'speech', icon: 'waveform', title: 'Speech', sub: 'Fluency & Coherence', score: 78 },
  { key: 'facial', icon: 'smiley', title: 'Facial Expression', sub: 'Emotion & Expressivity', score: 81 },
  { key: 'executive', icon: 'cube', title: 'Executive Function', sub: 'Planning & Problem Solving', score: 77 },
];
const TREND_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TREND_POINTS = [
  { x: 20, y: 120 }, { x: 113, y: 95 }, { x: 207, y: 108 }, { x: 300, y: 75 },
  { x: 393, y: 90 }, { x: 487, y: 55 }, { x: 580, y: 25 },
];
const TREND_LINE_D = `M${TREND_POINTS.map((p) => `${p.x} ${p.y}`).join(' L')}`;
const TREND_AREA_D = `${TREND_LINE_D} L580 160 L20 160 Z`;

// 2026-08-27 ADDITION (VR: "the one with octopus is the representation i
// want in the landing page" -- picking the richer hero mockup over the
// plain one). Small per-domain trend sparklines (a tiny upward-leaning
// zigzag, distinct enough per card to not look copy-pasted) plus the data
// for the hero-only "Cognitive Trajectory" timeline that replaces the
// Weekly Trend chart in that variant.
const DOMAIN_SPARKS = {
  memory: 'M2 20 L14 16 L26 18 L38 10 L50 12 L62 5 L74 8 L86 2',
  language: 'M2 18 L14 19 L26 13 L38 15 L50 9 L62 11 L74 6 L86 4',
  attention: 'M2 16 L14 20 L26 17 L38 12 L50 14 L62 8 L74 10 L86 6',
  speech: 'M2 19 L14 14 L26 16 L38 11 L50 13 L62 7 L74 9 L86 3',
  facial: 'M2 17 L14 18 L26 12 L38 14 L50 8 L62 10 L74 5 L86 7',
  executive: 'M2 20 L14 15 L26 19 L38 13 L50 6 L62 9 L74 4 L86 5',
};
// FeatureIcon (not DomainIcon) types below -- 'assessment'/'activity'/
// 'longitudinal' already exist for exactly this kind of "process step" icon.
const TRAJECTORY_STEPS = [
  { key: 'detect', icon: 'assessment', title: 'Early Detection', sub: 'Identify subtle changes early' },
  { key: 'monitor', icon: 'activity', title: 'Daily Monitoring', sub: 'Consistent activities strengthen cognition' },
  { key: 'insights', icon: 'longitudinal', title: 'Longitudinal Insights', sub: 'Understand trends. Act with confidence.' },
];

function DomainScoreCard({ domain, index = 0, showSpark = false }) {
  const score = useCountUp(domain.score, 900, 420 + index * 120);
  return (
    <article className="nmpa-cscore__domain" style={{ '--card-delay': `${index * 0.12}s` }}>
      <span className="nmpa-cscore__domain-icon" aria-hidden="true"><DomainIcon type={domain.icon} /></span>
      <div className="nmpa-cscore__domain-copy">
        <div className="nmpa-cscore__domain-head">
          <strong>{domain.title}</strong>
          <span className="nmpa-cscore__domain-score">{Math.round(score)}</span>
          <span className="nmpa-cscore__domain-arrow" aria-hidden="true">↗</span>
        </div>
        <p className="nmpa-cscore__domain-sub">{domain.sub}</p>
        {showSpark && (
          <svg className="nmpa-cscore__domain-spark" viewBox="0 0 88 24" preserveAspectRatio="none" aria-hidden="true">
            <path d={DOMAIN_SPARKS[domain.key]} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
    </article>
  );
}

// 2026-08-27 ADDITION -- hero-variant-only timeline (replaces the Weekly
// Trend chart there, see CognitiveScoreDashboard below) and the Morphy
// footer card (replaces the plain shield banner there). Split out as their
// own small components purely to keep CognitiveScoreDashboard's return
// readable now that it branches on `variant`.
function CognitiveTrajectory() {
  return (
    <div className="nmpa-cscore__trajectory">
      <div className="nmpa-cscore__trajectory-head">
        <h4>COGNITIVE TRAJECTORY</h4>
        <p>Tracking your cognitive health over time</p>
      </div>
      <div className="nmpa-cscore__trajectory-row">
        {TRAJECTORY_STEPS.map((step) => (
          <div key={step.key} className="nmpa-cscore__trajectory-step">
            <span className="nmpa-cscore__trajectory-icon" aria-hidden="true"><FeatureIcon type={step.icon} /></span>
            <strong>{step.title}</strong>
            <span>{step.sub}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MorphyFooter() {
  return (
    <div className="nmpa-cscore__morphy">
      <span className="nmpa-cscore__morphy-copy">
        <strong>Multimodal Cognitive Intelligence for Early Detection and Continuous Monitoring</strong>
        <span>Supporting better decisions for patients, caregivers, and clinicians.</span>
      </span>
      <span className="nmpa-cscore__morphy-mascot">
        <img src="/morphy.png" alt="" />
        <span className="nmpa-cscore__morphy-name">Morphy<small>Your cognitive companion</small></span>
      </span>
    </div>
  );
}

function CognitiveScoreDashboard({ variant = 'section' }) {
  const [memory, language, attention, speech, facial, executive] = SCORE_DOMAINS;
  const wrapRef = useRef(null);
  const rafRef = useRef(null);
  const score = useCountUp(82, 1200, 300);
  const delta = useCountUp(4.2, 1500, 2600);

  // Mouse-driven parallax (VR: "mouse movement creates gentle parallax
  // effect... cards move independently based on cursor position"). Writes
  // directly to CSS custom properties via a ref instead of setState, so the
  // 60fps mousemove stream never triggers a React re-render -- only actual
  // data changes (the count-up hooks) do that.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return undefined;
    const reduced = typeof window !== 'undefined' && window.matchMedia
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return undefined;
    const handleMove = (e) => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        el.style.setProperty('--mx', x.toFixed(3));
        el.style.setProperty('--my', y.toFixed(3));
      });
    };
    const handleLeave = () => {
      el.style.setProperty('--mx', 0);
      el.style.setProperty('--my', 0);
    };
    el.addEventListener('mousemove', handleMove);
    el.addEventListener('mouseleave', handleLeave);
    return () => {
      el.removeEventListener('mousemove', handleMove);
      el.removeEventListener('mouseleave', handleLeave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const isHero = variant === 'hero';
  return (
    <div ref={wrapRef} className={`nmpa-cscore${isHero ? ' nmpa-cscore--hero' : ''}`} aria-hidden="true">
      <div className="nmpa-cscore__brain" aria-hidden="true" />
      <div className="nmpa-cscore__sweep" aria-hidden="true" />
      <div className="nmpa-cscore__grid">
        <DomainScoreCard domain={memory} index={0} showSpark={isHero} />
        <DomainScoreCard domain={language} index={1} showSpark={isHero} />
        <div className="nmpa-cscore__circle">
          <span className="nmpa-cscore__circle-ring nmpa-cscore__circle-ring--a" aria-hidden="true" />
          <span className="nmpa-cscore__circle-ring nmpa-cscore__circle-ring--b" aria-hidden="true" />
          <span className="nmpa-cscore__circle-sheen" aria-hidden="true" />
          <span>COGNITIVE<br />HEALTH SCORE</span>
          <strong>{Math.round(score)}</strong>
          <small>momentum score</small>
          <b>Good</b>
        </div>
        <DomainScoreCard domain={attention} index={2} showSpark={isHero} />
        <DomainScoreCard domain={speech} index={3} showSpark={isHero} />
      </div>
      <div className="nmpa-cscore__row-lower">
        <DomainScoreCard domain={facial} index={4} showSpark={isHero} />
        <DomainScoreCard domain={executive} index={5} showSpark={isHero} />
      </div>
      {isHero ? <CognitiveTrajectory /> : (
      <div className="nmpa-cscore__trend">
        <div className="nmpa-cscore__trend-head">
          <div><h4>WEEKLY TREND</h4><p>Your cognitive health is improving.</p></div>
          <div className="nmpa-cscore__trend-delta"><strong>{delta >= 0 ? '+' : ''}{delta.toFixed(1)}</strong><span>vs last week</span></div>
        </div>
        <div className="nmpa-cscore__trend-chart">
          <svg viewBox="0 0 600 160" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="nmpa-cscore-line" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#22d3ee" /><stop offset="100%" stopColor="#a78bfa" />
              </linearGradient>
              <linearGradient id="nmpa-cscore-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity=".38" /><stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={TREND_AREA_D} className="nmpa-cscore__trend-area" fill="url(#nmpa-cscore-fill)" stroke="none" />
            <path d={TREND_LINE_D} className="nmpa-cscore__trend-line" pathLength="100" fill="none" stroke="url(#nmpa-cscore-line)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            {TREND_POINTS.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r="4.5" className="nmpa-cscore__trend-dot" style={{ '--nmpa-dot-delay': `${0.3 + i * 0.18}s` }} fill="#e0e7ff" stroke="#8b5cf6" strokeWidth="2">
                <title>{`${TREND_DAYS[i]}`}</title>
              </circle>
            ))}
            <circle r="3.2" className="nmpa-cscore__trend-travel" fill="#67e8f9">
              <animateMotion dur="6s" begin="2.6s" repeatCount="indefinite" path={TREND_LINE_D} />
            </circle>
          </svg>
        </div>
        <div className="nmpa-cscore__trend-days">{TREND_DAYS.map((d) => <span key={d}>{d}</span>)}</div>
      </div>
      )}
      {isHero ? <MorphyFooter /> : (
      <div className="nmpa-cscore__banner">
        <span className="nmpa-cscore__banner-icon" aria-hidden="true"><DomainIcon type="shield" /></span>
        <div><strong>Early insights. Better outcomes.</strong><span>Consistent monitoring leads to proactive care.</span></div>
      </div>
      )}
    </div>
  );
}

// 2026-08-27 ADDITION (VR: "antha image oda intha boxes um add pannidu" --
// add these domain badges together with the hero image). These labels
// mirror the six cognitive domains scored by the assessment (see
// SCORE_DOMAINS above) plus a seventh "Insights" badge for the app's own
// value proposition, reusing DomainIcon's existing icon set (its
// 'shield'/insights-style glyph doubles as the Insights badge here so no
// new icon was needed). Purely decorative/aria-hidden, laid over the hero
// art as small static labels -- no data, no state, matches the plain
// "just show the representation" direction from the 2026-08-26 CSS note
// just below.
const DOMAIN_BADGES = [
  { key: 'memory', type: 'memory', title: 'Memory' },
  { key: 'language', type: 'language', title: 'Language' },
  { key: 'attention', type: 'attention', title: 'Attention' },
  { key: 'speed', type: 'speed', title: 'Processing Speed' },
  { key: 'executive', type: 'executive', title: 'Executive Function' },
  { key: 'visuospatial', type: 'visuospatial', title: 'Visuospatial' },
  { key: 'insights', type: 'shield', title: 'Insights' },
];

function HeroDomainBadges() {
  return (
    <div className="nmpa-landing__hero-badges" aria-hidden="true">
      {DOMAIN_BADGES.map((badge) => (
        <span key={badge.key} className={`nmpa-landing__badge nmpa-landing__badge--${badge.key}`}>
          <span className="nmpa-landing__badge-icon"><DomainIcon type={badge.type} /></span>
          <span className="nmpa-landing__badge-title">{badge.title}</span>
        </span>
      ))}
    </div>
  );
}

function HeroRepresentation() {
  return (
    <div className="nmpa-landing__representation" aria-hidden="true">
      <div className="nmpa-landing__profile">
        <svg viewBox="0 0 420 620" role="presentation"><path d="M207 596c-4-44-2-83-23-111-18-24-43-39-54-66-10-24-8-47 7-67 12-16 20-31 21-53 1-24-7-55 7-83 17-36 56-57 104-53 55 5 84 42 88 89 2 25-4 43-17 60-9 12-9 22 3 29 11 7 22 8 27 17 6 12-5 23-24 27-12 3-18 9-18 20 1 35-17 65-45 83-20 13-30 30-31 48l-2 60Z" fill="currentColor"/><path d="M264 210c24 7 40 26 43 49 2 17-3 31-13 43 14 0 25 5 31 14-12 9-24 12-37 8-9 18-21 31-38 39" fill="none" stroke="#09152e" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </div>
      <div className="nmpa-landing__octopus">
        <svg viewBox="0 0 560 370" role="presentation"><path d="M281 177c-17-61 4-116 65-126 62-10 91 43 77 94 55-25 102 2 99 47-3 41-45 54-84 44 46 34 33 79-4 88-40 10-67-22-76-56 0 53-36 79-72 58-31-19-25-56-5-83-39 32-84 19-90-17-7-38 32-59 78-49-35-30-30-68 4-83 33-14 61 11 68 43Z" fill="currentColor"/><circle cx="312" cy="112" r="8" fill="#d9c7ff"/><circle cx="348" cy="110" r="8" fill="#d9c7ff"/><path d="M326 125c13 12 26 12 39 0M282 198c-41 47-93 50-128 28M291 213c-20 61-72 91-120 76M314 216c8 65-24 108-69 120M347 210c33 53 23 105-13 131M370 190c54 35 98 22 123-10M385 162c53 5 92-17 98-55" fill="none" stroke="currentColor" strokeWidth="22" strokeLinecap="round"/></svg>
      </div>
      <span className="nmpa-landing__representation-node nmpa-landing__representation-node--one" /><span className="nmpa-landing__representation-node nmpa-landing__representation-node--two" /><span className="nmpa-landing__representation-node nmpa-landing__representation-node--three" />
    </div>
  );
}

// 2026-08-27 ADDITION (VR: "also i need the language preference option in
// the landing page too") -- a compact version of AuthTopBar.jsx's language
// dropdown (same LANGUAGES list, same click-outside/Escape-to-close
// behavior), sized to sit inside the nav pill instead of the auth brand
// panel. Only switches the app's language preference (used once a role is
// chosen and by returning visitors); this landing page's own marketing
// copy stays English for now -- a separate, larger translation pass, not
// covered by this addition.
function LandingLanguageSwitcher({ language, onChangeLanguage }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const current = languageInfo(language);

  useEffect(() => {
    if (!open) return undefined;
    function onDocClick(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    }
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="nmpa-landing__lang" ref={rootRef}>
      <button
        type="button"
        className="nmpa-landing__lang-btn"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <GlobeIcon />
        <span>{current.nativeLabel}</span>
        <ChevronDownIcon />
      </button>
      {open && (
        <ul className="nmpa-landing__lang-menu" role="listbox">
          {LANGUAGES.map((l) => (
            <li key={l.code}>
              <button
                type="button"
                className={`nmpa-landing__lang-item ${l.code === language ? 'is-active' : ''}`}
                role="option"
                aria-selected={l.code === language}
                onClick={() => { onChangeLanguage?.(l.code); setOpen(false); }}
              >
                <span>{l.nativeLabel}</span>
                <span className="nmpa-landing__lang-item-en">{l.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function RoleGateScreen({ onSelectRole, language = DEFAULT_LANGUAGE, onChangeLanguage }) {
  return (
    <main className="nmpa-landing">
      <div className="nmpa-landing__particles" aria-hidden="true">{PARTICLES.map((particle) => <i key={particle} style={{ '--particle': particle, '--x': `${(particle * 37) % 100}%`, '--y': `${(particle * 19) % 100}%`, '--dx': `${((particle % 5) - 2) * 20}px` }} />)}</div>
      <header className="nmpa-landing__nav">
        <a className="nmpa-landing__wordmark" href="#top" aria-label="NEUROMORPH home"><BrandLogo size="sm" /></a>
        <nav className="nmpa-landing__links" aria-label="Landing page"><a href="#signals">WHAT WE TRACK</a><a href="#for-you">FOR YOU</a><a href="#access">SIGN IN</a><a href={ABOUT_WEBSITE_URL} target="_blank" rel="noopener noreferrer">ABOUT</a></nav>
        <div className="nmpa-landing__nav-actions">
          {onChangeLanguage && <LandingLanguageSwitcher language={language} onChangeLanguage={onChangeLanguage} />}
          <a className="nmpa-landing__nav-cta" href="#access">Get started</a>
        </div>
      </header>

      <section className="nmpa-landing__hero" id="top">
        <div className="nmpa-landing__orb nmpa-landing__orb--one" aria-hidden="true" /><div className="nmpa-landing__orb nmpa-landing__orb--two" aria-hidden="true" />
        <div className="nmpa-landing__hero-copy">
          <p className="nmpa-landing__kicker"><span aria-hidden="true" /> Cognitive care, made clearer</p>
          <h1>Understand your cognitive health, <em>one step at a time, back to you.</em></h1>
          <p className="nmpa-landing__hero-lede">NEUROMORPH brings weekly check-ins, daily cognitive activities, and clear progress tracking into one considered experience for patients, caregivers, and clinicians.</p>
          <div className="nmpa-landing__hero-actions"><a className="nmpa-landing__primary-cta" href="#access">Choose your access <span aria-hidden="true">→</span></a><a className="nmpa-landing__text-cta" href="#how-it-works">See how it works <span aria-hidden="true">↓</span></a></div>
          <p className="nmpa-landing__hero-note">Designed to support awareness and conversations with your care team — not to provide a diagnosis.</p>
        </div>
        {/* 2026-08-28 (VR: "nee itha remove pannidu, need not include
           anything, apdiye vitru" -- remove the hero image, don't replace
           it with anything). Tried the brain+octopus image here, VR's call
           was to take it back out. Left empty on purpose: the hero is
           text-only, just .nmpa-landing__orb's existing ambient glow behind
           it. This is now the second time this exact image-vs-empty call
           has flip-flopped in this hero slot (see the removed comment this
           replaced) -- if it comes up again, check with VR before
           re-adding anything here rather than guessing. */}
      </section>

      <section className="nmpa-landing__access" id="access"><div className="nmpa-landing__access-heading"><p className="nmpa-landing__eyebrow">Secure access</p><h2>{t(language, 'lede')}</h2><p>Choose the space built for the role you have in care.</p></div><div className="nmpa-landing__roles" role="group" aria-label="Choose your access type">
        <RoleCard className="nmpa-landing__role--patient" icon="+" title={t(language, 'patientTitle')} description={t(language, 'patientSub')} onClick={() => onSelectRole('patient')} />
        <RoleCard className="nmpa-landing__role--caregiver" icon="♡" title={t(language, 'caregiverTitle')} description={t(language, 'caregiverSub')} onClick={() => onSelectRole('caregiver')} />
        <RoleCard className="nmpa-landing__role--doctor" icon="⌁" title={t(language, 'doctorTitle')} description={t(language, 'doctorSub')} onClick={() => onSelectRole('doctor')} />
      </div></section>

      <section className="nmpa-landing__section nmpa-landing__signals" id="signals">
        <div className="nmpa-landing__section-heading"><p className="nmpa-landing__eyebrow">See the whole picture</p><h2>Signals become easier to notice.</h2><p>NEUROMORPH brings everyday observations into one calm, understandable view so you can follow what is changing and what is staying steady.</p></div>
        <div className="nmpa-landing__signal-row">
          <article><span className="nmpa-landing__signal-index">01</span><h3>Memory &amp; language</h3><p>Recall, recognition, expression, and comprehension tracked together.</p></article>
          <article><span className="nmpa-landing__signal-index">02</span><h3>Attention &amp; pace</h3><p>Short activities reveal patterns in focus, processing, and consistency.</p></article>
          <article><span className="nmpa-landing__signal-index">03</span><h3>Progress over time</h3><p>Weekly context makes a single difficult day easier to place in perspective.</p></article>
        </div>
      </section>

      <section className="nmpa-landing__section nmpa-landing__people" id="for-you">
        <div className="nmpa-landing__people-intro"><p className="nmpa-landing__eyebrow">Designed around care</p><h2>One shared rhythm. The right view for every person.</h2></div>
        <div className="nmpa-landing__people-list">
          <article><span className="nmpa-landing__people-mark">P</span><div><h3>For patients</h3><p>A clear, low-pressure way to check in, stay engaged, and understand your own progress.</p></div></article>
          <article><span className="nmpa-landing__people-mark">C</span><div><h3>For caregivers</h3><p>Useful context for supportive conversations, without turning care into another burden.</p></div></article>
          <article><span className="nmpa-landing__people-mark">T</span><div><h3>For care teams</h3><p>Longitudinal signals that help make appointments and next steps more informed.</p></div></article>
        </div>
      </section>

      <section className="nmpa-landing__section nmpa-landing__approach" id="approach">
        <div className="nmpa-landing__section-heading"><p className="nmpa-landing__eyebrow">A connected approach</p><h2>Information that helps you notice the bigger picture.</h2><p>Each part of NEUROMORPH is designed to make ongoing cognitive tracking feel approachable, structured, and useful to the people involved in care.</p></div>
        <div className="nmpa-landing__feature-grid">
          <article className="nmpa-landing__feature-card"><span className="nmpa-landing__feature-number">01</span><span className="nmpa-landing__feature-icon"><FeatureIcon type="assessment" /></span><h3>Weekly assessment</h3><p>A structured check-in across memory, attention, language, processing speed, and related cognitive domains.</p></article>
          <article className="nmpa-landing__feature-card"><span className="nmpa-landing__feature-number">02</span><span className="nmpa-landing__feature-icon"><FeatureIcon type="activity" /></span><h3>Daily activities</h3><p>Short, guided activities create a clearer picture of day-to-day engagement and progress over time.</p></article>
          <article className="nmpa-landing__feature-card"><span className="nmpa-landing__feature-number">03</span><span className="nmpa-landing__feature-icon"><FeatureIcon type="context" /></span><h3>Shared context</h3><p>Caregivers and clinicians can use the right view for their role, keeping support more coordinated.</p></article>
          <article className="nmpa-landing__feature-card"><span className="nmpa-landing__feature-number">04</span><span className="nmpa-landing__feature-icon"><FeatureIcon type="multimodal" /></span><h3>Multimodal analysis</h3><p>Combines speech, facial, behavioral, and cognitive signals to build a richer picture of cognitive health.</p></article>
          <article className="nmpa-landing__feature-card"><span className="nmpa-landing__feature-number">05</span><span className="nmpa-landing__feature-icon"><FeatureIcon type="longitudinal" /></span><h3>Longitudinal monitoring</h3><p>Tracks subtle cognitive changes over weeks and months, helping identify meaningful trends earlier.</p></article>
          <article className="nmpa-landing__feature-card"><span className="nmpa-landing__feature-number">06</span><span className="nmpa-landing__feature-icon"><FeatureIcon type="score" /></span><h3>Personalized cognitive score</h3><p>Transforms complex assessment data into a clear, easy-to-understand cognitive health indicator.</p></article>
        </div>
      </section>

      <section className="nmpa-landing__section nmpa-landing__workflow nmpa-landing__workflow--dashboard" id="how-it-works">
        <CognitiveScoreDashboard />
        <div className="nmpa-landing__workflow-copy"><p className="nmpa-landing__eyebrow">Built around your routine</p><h2>A calmer way to stay engaged with cognitive care.</h2><p className="nmpa-landing__workflow-intro">NEUROMORPH turns small, regular moments into a clearer picture of how you are doing. Each step is designed to be understandable, useful, and easy to bring into an everyday care routine.</p><ol>
          <li><span>1</span><div><strong>Check in regularly</strong><p>Complete a structured weekly assessment across key cognitive areas, then use short daily activities to keep your routine active without making it feel overwhelming.</p></div></li>
          <li><span>2</span><div><strong>Follow meaningful patterns</strong><p>Review your activity, responses, and momentum over time. Looking across multiple check-ins helps separate a one-off difficult day from a pattern worth noticing.</p></div></li>
          <li><span>3</span><div><strong>Bring the right people in</strong><p>Share useful context with a caregiver or clinician when you choose. The goal is to support better conversations and informed next steps, not provide a diagnosis.</p></div></li>
        </ol></div>
      </section>

      <footer className="nmpa-landing__footer"><BrandLogo size="sm" /><p>Supportive cognitive tracking for patients, caregivers, and clinicians.</p><a href="#top">Back to top ↑</a></footer>
    </main>
  );
}
