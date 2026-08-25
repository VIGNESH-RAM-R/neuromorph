import { LogoBrainIcon } from './icons';

/**
 * Top bar: NEUROMORPH branding on the left, the currently authenticated
 * user's account chip on the right. `user` is a plain `{ name }` object
 * (see Dashboard.jsx for where it comes from) — this component never reads
 * or stores auth state itself, it only displays whatever it's given.
 */
export default function DashboardHeader({ user }) {
  const name = user?.name?.trim() || 'Guest';
  const initial = name.charAt(0).toUpperCase();

  return (
    <header className="dash-header">
      <div className="dash-header-inner">
        <div className="dash-brand">
          <span className="dash-brand-icon">
            <LogoBrainIcon size={30} />
          </span>
          <div className="dash-brand-text">
            <span className="dash-brand-mark">NEUROMORPH</span>
            <span className="dash-brand-sub">Cognitive Screening &amp; Longitudinal Monitoring</span>
          </div>
        </div>

        <div className="dash-account">
          <span className="dash-account-avatar" aria-hidden="true">
            {initial}
          </span>
          <span className="dash-account-name">{name}</span>
          <span className="dash-account-chevron" aria-hidden="true">
            &#8964;
          </span>
        </div>
      </div>
    </header>
  );
}
