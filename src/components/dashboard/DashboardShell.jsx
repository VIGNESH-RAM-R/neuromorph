import { SECTIONS } from '../../config/sectionsConfig.js';
import SectionIcon from '../common/SectionIcon.jsx';
import ThemeToggle from '../common/ThemeToggle.jsx';
import BrandLogo from '../common/BrandLogo.jsx';
import AuthTopBar from '../auth/AuthTopBar.jsx';
import { t, tNav } from '../../i18n/strings/common.js';
import { DEFAULT_LANGUAGE } from '../../config/i18nConfig.js';

function initials(name) {
  if (!name) return '?';
  return name.trim().split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase();
}

// 2026-08-19/20: nav labels/descriptions and "Log out" now run through the
// common i18n string table (see src/i18n/strings/common.js) -- the first
// piece of app-wide (not just login/signup) translation. `language`
// defaults to English so every existing call site that hasn't been updated
// yet keeps working unchanged.
export default function DashboardShell({ activeSection, onSelectSection, userName, onLogout, theme, onToggleTheme, language = DEFAULT_LANGUAGE, onChangeLanguage, children }) {
  return (
    <div className="nmpa-shell">
      <header className="nmpa-topbar">
        <BrandLogo size="sm" />
        <div className="nmpa-topbar__user">
          {onChangeLanguage && <AuthTopBar language={language} onChangeLanguage={onChangeLanguage} showAbout={false} className="nmpa-topbar__language" />}
          {theme && onToggleTheme && <ThemeToggle theme={theme} onToggle={onToggleTheme} size="sm" />}
          <span className="nmpa-avatar" aria-hidden="true">{initials(userName)}</span>
          <span>{userName}</span>
          <button type="button" className="nmpa-link" onClick={onLogout}>{t(language, 'logOut')}</button>
        </div>
      </header>

      <div className="nmpa-shell__body">
        <nav className="nmpa-sidenav" aria-label="Sections">
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              type="button"
              className={`nmpa-sidenav__item ${activeSection === section.id ? 'is-active' : ''}`}
              onClick={() => onSelectSection(section.id)}
              aria-current={activeSection === section.id ? 'page' : undefined}
              title={tNav(language, section.id, 'description')}
            >
              <span className="nmpa-sidenav__icon"><SectionIcon id={section.id} /></span>
              <span>{tNav(language, section.id, 'label')}</span>
            </button>
          ))}
        </nav>

        <main className="nmpa-shell__main">{children}</main>
      </div>
    </div>
  );
}
