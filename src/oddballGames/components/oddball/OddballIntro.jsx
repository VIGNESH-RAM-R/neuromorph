import { LogoBrainIcon } from '../dashboard/icons';
import iconClock from '../../assets/icons/oddball-intro/oddball-icon-clock.png';
import iconCursorTap from '../../assets/icons/oddball-intro/oddball-icon-cursor-tap.png';
import iconEye from '../../assets/icons/oddball-intro/oddball-icon-eye.png';
import iconGraph from '../../assets/icons/oddball-intro/oddball-icon-graph.png';
import iconTarget from '../../assets/icons/oddball-intro/oddball-icon-target.png';
import iconShieldCheck from '../../assets/icons/oddball-intro/oddball-icon-shield-check.png';

/**
 * Duration/Input info-card icons and domain-tag icons below are the exact
 * neon icon images provided by the user (a 3x2 sheet: clock, tap/cursor,
 * eye, target/crosshair, shield-check, trend graph) — extracted into
 * individual transparent PNGs under
 * src/assets/icons/oddball-intro/, replacing the earlier hand-drawn inline
 * SVG equivalents so this screen uses the exact provided artwork.
 */

/**
 * Small decorative angled accent line flanking the brain badge, matching
 * the reference image's "shoulder" notch lines. Pure SVG (same technique
 * already used for the How To Play title flourish) — no external asset
 * needed.
 */
function BadgeFlourish({ side }) {
  return (
    <svg
      viewBox="0 0 70 24"
      width="70"
      height="24"
      aria-hidden="true"
      className={`oddball-intro-badge-flourish oddball-intro-badge-flourish--${side}`}
    >
      {side === 'left' ? (
        <path d="M2 12h28l10 -9h28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      ) : (
        <path d="M68 12H40l-10 -9H2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      )}
    </svg>
  );
}

const DOMAIN_TAGS = [
  { label: 'Attention', icon: iconEye },
  { label: 'Processing speed', icon: iconGraph },
  { label: 'Target detection', icon: iconTarget },
  { label: 'Response inhibition', icon: iconShieldCheck },
];

export default function OddballIntro({ onStart, onBack, onViewHistory }) {
  return (
    <div className="oddball-screen oddball-screen--intro">
      <div className="oddball-intro-badge-row" aria-hidden="true">
        <BadgeFlourish side="left" />
        <div className="oddball-intro-badge">
          <LogoBrainIcon size={40} />
        </div>
        <BadgeFlourish side="right" />
      </div>

      <p className="oddball-eyebrow">NEUROMORPH</p>
      <h1 className="oddball-title">Visual Oddball Assessment</h1>
      <p className="oddball-lead">
        An attention and response assessment designed to measure how quickly and
        accurately you detect rare visual targets.
      </p>

      <div className="oddball-info-grid">
        <div className="oddball-info-card">
          <span className="oddball-info-label">
            <img src={iconClock} alt="" className="oddball-icon-img" /> Duration
          </span>
          <span className="oddball-info-value">~1.5 minutes</span>
        </div>
        <div className="oddball-info-card">
          <span className="oddball-info-label">
            <img src={iconCursorTap} alt="" className="oddball-icon-img" /> Input
          </span>
          <span className="oddball-info-value">Touch or mouse</span>
        </div>
      </div>

      <div className="oddball-domains">
        <span className="oddball-domains-label">This assessment relates to:</span>
        <div className="oddball-domain-tags">
          {DOMAIN_TAGS.map(({ label, icon }) => (
            <span className="oddball-tag" key={label}>
              <img src={icon} alt="" className="oddball-icon-img oddball-icon-img--tag" />
              {label}
            </span>
          ))}
        </div>
      </div>

      <div className="seq-cs-actions">
        <button className="seq-cs-btn seq-cs-btn--primary" onClick={onStart}>
          Start Assessment
          <span className="seq-cs-btn-arrow" aria-hidden="true">
            &rarr;
          </span>
        </button>
        {onBack && (
          <button className="seq-cs-btn seq-cs-btn--secondary" onClick={onBack}>
            Back
          </button>
        )}
      </div>

      {onViewHistory && (
        <button className="seq-cs-history-link" onClick={onViewHistory}>
          View past assessments
          <span aria-hidden="true">&rsaquo;</span>
        </button>
      )}
    </div>
  );
}
