import ThemeToggle from './ThemeToggle.jsx';
import LanguageSelector from './LanguageSelector.jsx';
import BrandLogo from '../../../components/common/BrandLogo.jsx';
import { DEFAULT_LANGUAGE } from '../../config/i18nConfig.js';
import { t } from '../../i18n/strings/common.js';

export default function TopBar({ theme, onToggleTheme, view, onNavigate, currentUser, onLogout, language = DEFAULT_LANGUAGE, onChangeLanguage, pendingRequestCount = 0 }) {
  return (
    <header className="nmdd-topbar">
      <div className="nmdd-topbar__brand">
        <BrandLogo size="sm" />
        <div className="nmdd-topbar__subtitle">{t(language, 'brandSubtitle')}</div>
      </div>
      <nav className="nmdd-topbar__nav" aria-label="Primary">
        <button
          type="button"
          className={`nmdd-topbar__navitem ${view === 'list' ? 'is-active' : ''}`}
          onClick={() => onNavigate('list')}
        >
          {t(language, 'nav.patients')}
        </button>
        <button
          type="button"
          className={`nmdd-topbar__navitem ${view === 'requests' ? 'is-active' : ''}`}
          onClick={() => onNavigate('requests')}
        >
          {t(language, 'nav.requests')}
          {pendingRequestCount > 0 && <span className="nmdd-badge">{pendingRequestCount}</span>}
        </button>
        <button
          type="button"
          className={`nmdd-topbar__navitem ${view === 'report' ? 'is-active' : ''}`}
          onClick={() => onNavigate('report')}
        >
          {t(language, 'nav.report')}
        </button>
      </nav>
      <div className="nmdd-topbar__actions" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {currentUser && <span className="nmdd-muted" title={currentUser.email}>{currentUser.name || currentUser.email}</span>}
        <LanguageSelector language={language} onChangeLanguage={onChangeLanguage} />
        <ThemeToggle theme={theme} onToggle={onToggleTheme} language={language} />
        {onLogout && (
          <button type="button" className="nmdd-button nmdd-button--secondary" onClick={onLogout}>
            {t(language, 'signOut')}
          </button>
        )}
      </div>
    </header>
  );
}
