import { useState } from 'react';
import AuthNeuralBackdrop from './AuthNeuralBackdrop.jsx';
import AuthTopBar from './AuthTopBar.jsx';
import BrandLogo from '../common/BrandLogo.jsx';
import { CheckCircleIcon } from '../icons/FormIcons.jsx';
import { authString } from '../../i18n/authStrings.js';
import { languageInfo } from '../../config/i18nConfig.js';
import { SIGNUP_COVER_IMAGE_URL } from '../../config/brandAssetsConfig.js';

// 2026-08-17: Morphy avatar + static blob backdrop removed per user
// request -- replaced with AuthNeuralBackdrop (animated) and a top bar
// (language switcher + About link) where the avatar used to sit. tagline/
// sublede are no longer passed in as props (they were English-only
// hardcoded strings in LoginScreen/SignupScreen) -- this panel now looks
// them up itself via authString() so the same component works for whichever
// of the 7 languages is active. `subledeKey` picks which of the two
// sublede variants (login vs signup) to show.
// 2026-08-17 (later same-day pass): expanded from 3 to 6 instructional
// bullets, plus a new "Project Specialities" chip row underneath -- pulled
// from the REAL neurotrack-ai-hcmg.vercel.app marketing site copy (hero
// badges: Explainable AI / Continuous Monitoring / Clinical-Grade Insights,
// plus "Multimodal" from its Who We Are section), not invented. Kept short
// (labels only, no descriptions) since this panel has limited real estate --
// the full detail lives on the actual website, which About now links to.
const TRUST_KEYS = ['trust1', 'trust2', 'trust3', 'trust4', 'trust5', 'trust6'];
const SPECIALITY_KEYS = ['specialityExplainableAI', 'specialityContinuousMonitoring', 'specialityClinicalGrade', 'specialityMultimodal'];

// subledeOverride/roleBadge (2026-08-17, doctor login): let a caller show
// different brand-panel copy without needing a translated key for it --
// used by the Doctor login/signup screens, which are English-only for now
// (see DoctorLoginScreen.jsx). Patient screens never pass these, so their
// behavior (fully translated via authString) is unchanged.
//
// `coverImage` (2026-08-18): signup screens only (see SignupScreen.jsx /
// DoctorSignupScreen.jsx) -- tries to show a real image
// (brandAssetsConfig.js) covering the whole panel instead of the animated
// network, since a rich reference infographic was requested there. If the
// image file doesn't exist yet (it doesn't, out of the box -- see that
// config file's comment) or fails to load for any reason, this falls back
// to the exact same AuthNeuralBackdrop the login screens use -- there is
// no broken-image state, ever. When the cover image IS showing, the
// tagline/trust-list/specialities text is hidden underneath it (the image
// already carries that information visually) -- only the role badge, top
// bar, and the actual login/signup form on the other panel stay.
export default function AuthBrandPanel({ language, onChangeLanguage, subledeKey = 'subledeLogin', subledeOverride, roleBadge, coverImage = false }) {
  const dir = languageInfo(language).dir;
  const [imageFailed, setImageFailed] = useState(false);
  const showCover = coverImage && !imageFailed;

  if (showCover) {
    return (
      <div className="nmpa-auth__panel nmpa-auth__panel--brand" dir={dir}>
        <img
          src={SIGNUP_COVER_IMAGE_URL}
          alt=""
          className="nmpa-auth__cover-image"
          onError={() => setImageFailed(true)}
        />
        <AuthTopBar language={language} onChangeLanguage={onChangeLanguage} />
        {/* 2026-08-22 bug fix: this used to be `roleBadge && !showCover`
            (inverted) -- on a login screen (showCover always false) that
            made this AND the full-content block below both render at once,
            showing the role badge twice ("Caregiver" "Caregiver"). On a
            signup screen (showCover true) it meant NEITHER block ever
            rendered, so the badge was silently missing there instead. This
            branch only exists for the cover-image (signup) case now, so the
            condition is simply `roleBadge`. */}
        {roleBadge && (
          <div className="nmpa-auth__brand-content nmpa-auth__brand-content--badge-only">
            <span className="nmpa-auth__role-badge">{roleBadge}</span>
          </div>
        )}
      </div>
    );
  }

  // 2026-08-22 (VR request): the animated backdrop + all the instructional
  // copy (tagline, sublede, 6-item checklist, speciality chips) used to
  // share one full-height layer, with the text floating directly on top of
  // the busy brain-network lines -- readable at a glance but genuinely
  // cluttered/overlapping at panel widths below ~500px (a 2-column auth
  // layout's brand panel is often exactly that narrow). Split into two
  // clearly separated horizontal bands instead: a shorter top band that's
  // just the animation + brand mark + role badge + one-line tagline (little
  // enough text that overlapping the network reads as intentional, not
  // messy), a divider, then a plain-surface bottom band that holds
  // everything else with zero competition from the animation behind it.
  return (
    <div className="nmpa-auth__panel nmpa-auth__panel--brand nmpa-auth__panel--brand-split" dir={dir}>
      <AuthTopBar language={language} onChangeLanguage={onChangeLanguage} />

      <div className="nmpa-auth__brand-top">
        <AuthNeuralBackdrop language={language} />
        <div className="nmpa-auth__brand-top-content">
          {roleBadge && <span className="nmpa-auth__role-badge">{roleBadge}</span>}
          <BrandLogo size="lg" />
          <p className="nmpa-auth__tagline">{authString(language, 'tagline')}</p>
        </div>
      </div>

      <div className="nmpa-auth__brand-divider" aria-hidden="true" />

      {/* 2026-08-22 (VR feedback): this bottom band used to render fully
          static -- every line appearing at once the instant the animated
          brain above it was already mid-motion, which read as flat/dead by
          comparison. Reuses the same .nmpa-anim-fade-up + --nmpa-anim-delay
          stagger convention already used everywhere else in this app
          (HomeSection cards, DomainBreakdownChart rows, etc.) rather than
          inventing a new animation just for this panel -- so the whole
          brand panel now has one continuous, cascading entrance instead of
          "animated top, inert bottom." Reduced-motion is already handled
          globally by that same utility class (see theme.css). */}
      <div className="nmpa-auth__brand-bottom">
        <p className="nmpa-auth__sublede nmpa-anim-fade-up" style={{ '--nmpa-anim-delay': '80ms' }}>
          {subledeOverride || authString(language, subledeKey)}
        </p>

        <ul className="nmpa-auth__trust-list">
          {TRUST_KEYS.map((key, i) => (
            <li key={key} className="nmpa-anim-fade-up" style={{ '--nmpa-anim-delay': `${160 + i * 70}ms` }}>
              <CheckCircleIcon />
              <span>{authString(language, key)}</span>
            </li>
          ))}
        </ul>

        <div className="nmpa-auth__specialities nmpa-anim-fade-up" style={{ '--nmpa-anim-delay': `${160 + TRUST_KEYS.length * 70 + 60}ms` }}>
          <p className="nmpa-auth__specialities-label">{authString(language, 'specialitiesLabel')}</p>
          <div className="nmpa-auth__speciality-chips">
            {SPECIALITY_KEYS.map((key) => (
              <span key={key} className="nmpa-auth__speciality-chip">{authString(language, key)}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
