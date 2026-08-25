import iconEye from '../../assets/icons/oddball-howto/oddball-icon-eye.png';
import iconLightning from '../../assets/icons/oddball-howto/oddball-icon-lightning.png';
import iconTarget from '../../assets/icons/oddball-howto/oddball-icon-target.png';
import iconClock from '../../assets/icons/oddball-howto/oddball-icon-clock.png';
import iconBulb from '../../assets/icons/oddball-howto/oddball-icon-bulb.png';
import iconTapHand from '../../assets/icons/oddball-howto/oddball-icon-tap-hand.png';
import iconForbidden from '../../assets/icons/oddball-howto/oddball-icon-forbidden.png';
import iconPlay from '../../assets/icons/oddball-howto/oddball-icon-play.png';
import iconCalendar from '../../assets/icons/oddball-howto/oddball-icon-calendar.png';

/**
 * How To Play — Visual Oddball Assessment.
 *
 * Redesigned to match a provided reference image's visual language (neon
 * four-step tutorial + shape reference + Important panel + reminder strip),
 * while describing the ACTUAL game exactly as implemented in
 * config/oddballConfig.js / hooks/useOddballEngine.js: there are only two
 * shapes — a circle (STIMULI.standard, the non-target) and a triangle
 * (STIMULI.target) — shown one at a time. Tapping while a triangle is
 * showing scores a HIT; tapping while a circle is showing scores a FALSE
 * ALARM. No sequence, no memorization, no other shapes — confirmed against
 * the real trial/response logic before writing this copy.
 *
 * The circle/triangle illustrations below reuse the exact same shape
 * geometry OddballStimulus.jsx renders in the real game (circle r=80 in a
 * 200x200 viewBox; triangle points 100,20 180,170 20,170) so the tutorial
 * and the actual game show literally the same shapes — restyled here as
 * glowing neon outlines (per the reference) rather than the game's solid
 * fill, since this is instructional art, not the live stimulus.
 *
 * The eye/speed/target/clock/bulb/tap-hand/forbidden/play/calendar icons
 * below use the exact neon icon-sheet PNGs the user provided (background
 * already transparent), extracted into individual files under
 * src/assets/icons/oddball-howto/, replacing the earlier hand-drawn inline
 * SVG equivalents so this screen uses the exact provided artwork wherever
 * the reference image uses it. The step-connector chevron uses the same
 * sheet's arrow icon as a CSS background-image on a real sibling element
 * (.oddball-howto-step-arrow in index.css), rendered between step cards so
 * it can occupy its own column in the shared panel's grid. No matching
 * asset was provided for the circle/
 * triangle glyphs or the Back-button left arrow, so those remain the
 * existing inline SVG (unchanged).
 */

function CircleGlyph({ size = 64 }) {
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} aria-hidden="true" className="oddball-howto-glyph oddball-howto-glyph--circle">
      <circle cx="100" cy="100" r="72" fill="none" stroke="currentColor" strokeWidth="8" />
    </svg>
  );
}

function TriangleGlyph({ size = 64 }) {
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} aria-hidden="true" className="oddball-howto-glyph oddball-howto-glyph--triangle">
      <polygon points="100,24 178,168 22,168" fill="none" stroke="currentColor" strokeWidth="8" strokeLinejoin="round" />
    </svg>
  );
}

function TapCursorBadge() {
  return <img src={iconTapHand} alt="" className="oddball-howto-cursor-badge" />;
}

function ForbiddenBadge() {
  return <img src={iconForbidden} alt="" className="oddball-howto-forbidden-badge" />;
}

function PlayIcon() {
  return <img src={iconPlay} alt="" className="oddball-howto-play-icon" />;
}

function BackArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M11 6l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TitleFlourish({ side }) {
  return (
    <svg
      viewBox="0 0 90 20"
      width="90"
      height="20"
      aria-hidden="true"
      className={`oddball-howto-flourish oddball-howto-flourish--${side}`}
    >
      {side === 'left' ? (
        <>
          <path d="M4 10h30l8 -8h44" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="34" cy="10" r="3.5" fill="currentColor" />
        </>
      ) : (
        <>
          <path d="M86 10H56l-8 -8H4" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="56" cy="10" r="3.5" fill="currentColor" />
          <path d="M4 2l6 8-6 8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
    </svg>
  );
}

function EyeIcon() {
  return <img src={iconEye} alt="" className="oddball-howto-important-icon" />;
}

function SpeedIcon() {
  return <img src={iconLightning} alt="" className="oddball-howto-important-icon" />;
}

function TargetIcon() {
  return <img src={iconTarget} alt="" className="oddball-howto-important-icon" />;
}

function ClockIcon() {
  return <img src={iconClock} alt="" className="oddball-howto-important-icon" />;
}

function BulbIcon() {
  return <img src={iconBulb} alt="" className="oddball-howto-bulb-icon" />;
}

function CalendarIcon() {
  return <img src={iconCalendar} alt="" className="oddball-howto-calendar-icon" />;
}

const STEPS = [
  {
    n: 1,
    title: 'Watch',
    text: 'Watch the shape that appears on the screen.',
    visual: (
      <div className="oddball-howto-shape-box">
        <CircleGlyph />
      </div>
    ),
  },
  {
    n: 2,
    title: 'Identify Target',
    text: (
      <>
        If the shape is a <strong className="oddball-howto-kw--triangle">TRIANGLE</strong>, it is the target.
      </>
    ),
    visual: (
      <div className="oddball-howto-shape-box">
        <TriangleGlyph />
      </div>
    ),
  },
  {
    n: 3,
    title: 'Tap If Triangle',
    text: 'Tap as quickly and accurately as you can.',
    visual: (
      <div className="oddball-howto-shape-box">
        <TriangleGlyph />
        <span className="oddball-howto-shape-badge">
          <TapCursorBadge />
        </span>
      </div>
    ),
  },
  {
    n: 4,
    title: 'Do Not Tap If Circle',
    text: (
      <>
        If the shape is a <strong className="oddball-howto-kw--circle">CIRCLE</strong>, do not tap and wait for the next shape.
      </>
    ),
    visual: (
      <div className="oddball-howto-shape-box">
        <CircleGlyph />
        <span className="oddball-howto-shape-badge">
          <ForbiddenBadge />
        </span>
      </div>
    ),
  },
];

export default function OddballInstructions({ onStartPractice, onBack, onViewHistory }) {
  return (
    <div className="oddball-screen oddball-screen--instructions">
      <div className="oddball-howto-titlewrap">
        <TitleFlourish side="left" />
        <h1 className="oddball-heading">How To Play</h1>
        <TitleFlourish side="right" />
      </div>
      <p className="oddball-howto-subtitle">Visual Oddball Assessment</p>
      <p className="oddball-lead">
        This game measures your attention and response by detecting target shapes.
      </p>

      <div className="oddball-howto-steps">
        {STEPS.flatMap((step, i) => {
          const card = (
            <div className="oddball-howto-step-card" key={`step-${step.n}`}>
              <div className="oddball-howto-step-head">
                <span className="oddball-howto-step-num">{step.n}</span>
                <span className="oddball-howto-step-title">{step.title}</span>
              </div>
              <p className="oddball-howto-step-text">{step.text}</p>
              {step.visual}
            </div>
          );
          if (i === STEPS.length - 1) return [card];
          return [card, <span className="oddball-howto-step-arrow" aria-hidden="true" key={`arrow-${step.n}`} />];
        })}
      </div>

      <div className="oddball-howto-grid2">
        <div className="oddball-howto-panel">
          <h2 className="oddball-howto-panel-title">Shapes You Will See</h2>
          <div className="oddball-howto-shapes-row">
            <div className="oddball-howto-shape-card">
              <CircleGlyph size={64} />
              <span className="oddball-howto-shape-label oddball-howto-shape-label--circle">Circle</span>
              <span className="oddball-howto-shape-sub">(Do not tap)</span>
            </div>
            <div className="oddball-howto-shapes-divider" aria-hidden="true" />
            <div className="oddball-howto-shape-card oddball-howto-shape-card--target">
              <TriangleGlyph size={64} />
              <span className="oddball-howto-shape-label oddball-howto-shape-label--triangle">Triangle</span>
              <span className="oddball-howto-shape-sub">(Tap only this)</span>
            </div>
          </div>
        </div>

        <div className="oddball-howto-panel oddball-howto-panel--important">
          <h2 className="oddball-howto-panel-title oddball-howto-panel-title--cyan">Important</h2>
          <ul className="oddball-howto-important-list">
            <li>
              <EyeIcon />
              Your goal is to tap <strong className="oddball-howto-kw--cyan">ONLY</strong> when a triangle appears.
            </li>
            <li>
              <SpeedIcon />
              Respond as quickly and accurately as you can.
            </li>
            <li>
              <TargetIcon />
              Stay focused and avoid tapping when a circle appears.
            </li>
            <li>
              <ClockIcon />
              Each shape appears briefly — be ready.
            </li>
          </ul>
        </div>
      </div>

      <div className="oddball-howto-reminder">
        <span className="oddball-howto-reminder-icon">
          <BulbIcon />
        </span>
        <p>
          Triangles are the target — tap the triangle. When a circle appears, do nothing.
        </p>
      </div>

      <div className="seq-cs-actions">
        <button className="seq-cs-btn seq-cs-btn--primary" onClick={onStartPractice}>
          <span className="seq-cs-btn-arrow" aria-hidden="true">
            <PlayIcon />
          </span>
          Start Practice
        </button>
        {onBack && (
          <button className="seq-cs-btn seq-cs-btn--secondary" onClick={onBack}>
            <BackArrowIcon aria-hidden="true" />
            Back
          </button>
        )}
      </div>

      {onViewHistory && (
        <button className="seq-cs-history-link" onClick={onViewHistory}>
          <CalendarIcon />
          View past assessments
        </button>
      )}
    </div>
  );
}
