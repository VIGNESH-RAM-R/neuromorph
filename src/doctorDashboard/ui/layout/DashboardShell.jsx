import TopBar from './TopBar.jsx';
import { DEFAULT_LANGUAGE } from '../../config/i18nConfig.js';
import { t } from '../../i18n/strings/common.js';

export default function DashboardShell({ theme, onToggleTheme, view, onNavigate, currentUser, onLogout, language = DEFAULT_LANGUAGE, onChangeLanguage, pendingRequestCount = 0, children }) {
  return (
    <div className="nmdd-shell">
      <TopBar
        theme={theme}
        onToggleTheme={onToggleTheme}
        view={view}
        onNavigate={onNavigate}
        currentUser={currentUser}
        onLogout={onLogout}
        language={language}
        onChangeLanguage={onChangeLanguage}
        pendingRequestCount={pendingRequestCount}
      />
      <main className="nmdd-shell__main">{children}</main>
      <footer className="nmdd-shell__footer">
        {t(language, 'footerDisclaimer')}
      </footer>
    </div>
  );
}
