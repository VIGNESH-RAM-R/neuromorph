import {
  PRIVACY_POLICY_SECTIONS,
  PRIVACY_POLICY_VERSION,
  PRIVACY_POLICY_LAST_UPDATED,
} from '../../config/privacyPolicyConfig.js';
import BrandLogo from '../common/BrandLogo.jsx';

// 2026-08-21: reachable from all 3 signup screens (SignupScreen.jsx,
// DoctorSignupScreen.jsx, CaregiverSignupScreen.jsx) via a "Privacy Policy"
// link next to the required consent checkbox. Deliberately plain block
// layout (not the .nmpa-session-loading flex-center pattern used
// elsewhere) -- that pattern vertically centers with flexbox, which can
// clip the top of content taller than the viewport in some browsers; a
// simple margin-auto column scrolls correctly no matter how long the
// policy text gets.
export default function PrivacyPolicyScreen({ onBack }) {
  return (
    <div className="nmpa-privacy-policy" style={{ minHeight: '100vh', background: 'var(--nmpa-bg)', padding: '32px 16px 64px' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <button type="button" className="nmpa-link nmpa-auth__back-link" onClick={onBack}>&larr; Back</button>

        <div style={{ marginTop: 12 }}><BrandLogo size="sm" /></div>
        <h1 className="nmpa-card__title" style={{ fontSize: 22, margin: '4px 0 4px' }}>Privacy Policy</h1>
        <p className="nmpa-muted nmpa-muted--sm" style={{ marginBottom: 4 }}>
          Version {PRIVACY_POLICY_VERSION} &middot; last updated {PRIVACY_POLICY_LAST_UPDATED}
        </p>
        <p className="nmpa-muted nmpa-muted--sm" style={{ marginBottom: 20 }}>
          Written in plain language, in good faith, from exactly what this app does -- not lawyer-reviewed, and
          English is the authoritative version of this document.
        </p>

        {PRIVACY_POLICY_SECTIONS.map((section) => (
          <div key={section.title} className="nmpa-card">
            <h2 className="nmpa-card__title" style={{ fontSize: 15 }}>{section.title}</h2>
            {section.body.split('\n\n').map((paragraph, i) => (
              <p key={i} className="nmpa-muted" style={{ whiteSpace: 'pre-line', marginBottom: 8 }}>{paragraph}</p>
            ))}
          </div>
        ))}

        <button type="button" className="nmpa-button nmpa-button--secondary" onClick={onBack}>Back to sign up</button>
      </div>
    </div>
  );
}
