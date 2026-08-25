import { SunIcon, MoonIcon } from '../icons/ThemeIcons.jsx';

// A track-and-thumb switch (not two buttons) so the current theme is
// legible at a glance, not just implied by which icon is highlighted.
export default function ThemeToggle({ theme, onToggle, size = 'md' }) {
  const isDark = theme === 'dark';
  return (
    <button
      type="button"
      className={`nmpa-theme-toggle nmpa-theme-toggle--${size}`}
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      onClick={onToggle}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      <span className="nmpa-theme-toggle__icon nmpa-theme-toggle__icon--sun"><SunIcon /></span>
      <span className="nmpa-theme-toggle__icon nmpa-theme-toggle__icon--moon"><MoonIcon /></span>
      <span className="nmpa-theme-toggle__thumb" />
    </button>
  );
}
