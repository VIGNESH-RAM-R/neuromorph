import { DEFAULT_LANGUAGE } from '../../config/i18nConfig.js';
import { t } from '../../i18n/strings/roleGate.js';
import BrandLogo from '../common/BrandLogo.jsx';

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

function DomainScoreCard({ domain }) {
  return (
    <article className="nmpa-cscore__domain">
      <span className="nmpa-cscore__domain-icon" aria-hidden="true"><DomainIcon type={domain.icon} /></span>
      <div className="nmpa-cscore__domain-copy">
        <div className="nmpa-cscore__domain-head">
          <strong>{domain.title}</strong>
          <span className="nmpa-cscore__domain-score">{domain.score}</span>
          <span className="nmpa-cscore__domain-arrow" aria-hidden="true">↗</span>
        </div>
        <p className="nmpa-cscore__domain-sub">{domain.sub}</p>
      </div>
    </article>
  );
}

function CognitiveScoreDashboard() {
  const [memory, language, attention, speech, facial, executive] = SCORE_DOMAINS;
  return (
    <div className="nmpa-cscore" aria-hidden="true">
      <div className="nmpa-cscore__brain" aria-hidden="true" />
      <div className="nmpa-cscore__grid">
        <DomainScoreCard domain={memory} />
        <DomainScoreCard domain={language} />
        <div className="nmpa-cscore__circle">
          <span>COGNITIVE<br />HEALTH SCORE</span>
          <strong>82</strong>
          <small>momentum score</small>
          <b>Good</b>
        </div>
        <DomainScoreCard domain={attention} />
        <DomainScoreCard domain={speech} />
      </div>
      <div className="nmpa-cscore__row-lower">
        <DomainScoreCard domain={facial} />
        <DomainScoreCard domain={executive} />
      </div>
      <div className="nmpa-cscore__trend">
        <div className="nmpa-cscore__trend-head">
          <div><h4>WEEKLY TREND</h4><p>Your cognitive health is improving.</p></div>
          <div className="nmpa-cscore__trend-delta"><strong>+4.2</strong><span>vs last week</span></div>
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
            <path d={TREND_AREA_D} fill="url(#nmpa-cscore-fill)" stroke="none" />
            <path d={TREND_LINE_D} fill="none" stroke="url(#nmpa-cscore-line)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            {TREND_POINTS.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="4.5" fill="#e0e7ff" stroke="#8b5cf6" strokeWidth="2" />)}
          </svg>
        </div>
        <div className="nmpa-cscore__trend-days">{TREND_DAYS.map((d) => <span key={d}>{d}</span>)}</div>
      </div>
      <div className="nmpa-cscore__banner">
        <span className="nmpa-cscore__banner-icon" aria-hidden="true"><DomainIcon type="shield" /></span>
        <div><strong>Early insights. Better outcomes.</strong><span>Consistent monitoring leads to proactive care.</span></div>
      </div>
    </div>
  );
}

const DOMAIN_BADGES = [
  { key: 'memory', type: 'memory', title: 'Memory', sub: 'Recall. Retain. Reconnect.' },
  { key: 'language', type: 'language', title: 'Language', sub: 'Express. Understand. Connect.' },
  { key: 'attention', type: 'attention', title: 'Attention', sub: 'Focus. Track. Stay present.' },
  { key: 'speed', type: 'speed', title: 'Processing Speed', sub: 'Think. Process. Respond.' },
  { key: 'executive', type: 'executive', title: 'Executive Function', sub: 'Plan. Decide. Solve. Adapt.' },
  { key: 'visuospatial', type: 'visuospatial', title: 'Visuospatial', sub: 'See. Perceive. Navigate.' },
  { key: 'insights', type: 'insights', title: 'Insights', sub: 'Data. Intelligence. Better tomorrows.' },
];
const SPHERE_NODES = Array.from({ length: 12 }, (_, index) => index);

export default function RoleGateScreen({ onSelectRole, language = DEFAULT_LANGUAGE }) {
  return (
    <main className="nmpa-landing">
      <div className="nmpa-landing__particles" aria-hidden="true">{PARTICLES.map((particle) => <i key={particle} style={{ '--particle': particle, '--x': `${(particle * 37) % 100}%`, '--y': `${(particle * 19) % 100}%`, '--dx': `${((particle % 5) - 2) * 20}px` }} />)}</div>
      <header className="nmpa-landing__nav">
        <a className="nmpa-landing__wordmark" href="#top" aria-label="NEUROMORPH home"><BrandLogo size="sm" /></a>
        <nav className="nmpa-landing__links" aria-label="Landing page"><a href="#approach">OUR APPROACH</a><a href="#how-it-works">How it works</a><a href="#access">SIGN IN</a></nav>
        <div className="nmpa-landing__nav-actions"><a className="nmpa-landing__nav-cta" href="#access">Get started</a></div>
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
        <div className="nmpa-landing__hero-art" aria-hidden="true">
          <div className="nmpa-landing__hero-plane nmpa-landing__hero-plane--back" />
          <div className="nmpa-landing__hero-orbit nmpa-landing__hero-orbit--one" />
          <div className="nmpa-landing__hero-orbit nmpa-landing__hero-orbit--two" />
          <div className="nmpa-landing__hero-core-glow" />
          <div className="nmpa-landing__brain-image" />
          <div className="nmpa-landing__hero-scan" />
          <span className="nmpa-landing__signal nmpa-landing__signal--one" />
          <span className="nmpa-landing__signal nmpa-landing__signal--two" />
          <span className="nmpa-landing__signal nmpa-landing__signal--three" />
          <span className="nmpa-landing__hero-label nmpa-landing__hero-label--top">LIVE COGNITIVE SIGNAL</span>
          <span className="nmpa-landing__hero-label nmpa-landing__hero-label--bottom">MEMORY · FOCUS · MOMENTUM</span>
          <div className="nmpa-landing__hero-nodes">{SPHERE_NODES.map((n) => <i key={n} className={`nmpa-landing__hero-node nmpa-landing__hero-node--${n}`} />)}</div>
          {DOMAIN_BADGES.map((badge, index) => (
            <div key={badge.key} className={`nmpa-landing__badge nmpa-landing__badge--${badge.key}`} style={{ '--nmpa-badge-delay': `${index * 0.4}s` }}>
              <span className="nmpa-landing__badge-icon"><DomainIcon type={badge.type} /></span>
              <div className="nmpa-landing__badge-copy"><b>{badge.title.toUpperCase()}</b><p>{badge.sub.toUpperCase()}</p></div>
            </div>
          ))}
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
        <div className="nmpa-landing__workflow-copy"><p className="nmpa-landing__eyebrow">Built around your routine</p><h2>A calmer way to stay engaged with cognitive care.</h2><ol>
          <li><span>1</span><div><strong>Check in regularly</strong><p>Complete the weekly assessment and any daily activities that fit your day.</p></div></li>
          <li><span>2</span><div><strong>Follow meaningful patterns</strong><p>See your activity and momentum in one simple, understandable place.</p></div></li>
          <li><span>3</span><div><strong>Bring the right people in</strong><p>Share context with a caregiver or clinician whenever it is helpful.</p></div></li>
        </ol></div>
      </section>

      <section className="nmpa-landing__access" id="access"><div className="nmpa-landing__access-heading"><p className="nmpa-landing__eyebrow">Secure access</p><h2>{t(language, 'lede')}</h2><p>Choose the space built for the role you have in care.</p></div><div className="nmpa-landing__roles" role="group" aria-label="Choose your access type">
        <RoleCard className="nmpa-landing__role--patient" icon="+" title={t(language, 'patientTitle')} description={t(language, 'patientSub')} onClick={() => onSelectRole('patient')} />
        <RoleCard className="nmpa-landing__role--caregiver" icon="♡" title={t(language, 'caregiverTitle')} description={t(language, 'caregiverSub')} onClick={() => onSelectRole('caregiver')} />
        <RoleCard className="nmpa-landing__role--doctor" icon="⌁" title={t(language, 'doctorTitle')} description={t(language, 'doctorSub')} onClick={() => onSelectRole('doctor')} />
      </div></section>
      <footer className="nmpa-landing__footer"><BrandLogo size="sm" /><p>Supportive cognitive tracking for patients, caregivers, and clinicians.</p><a href="#top">Back to top ↑</a></footer>
    </main>
  );
}
