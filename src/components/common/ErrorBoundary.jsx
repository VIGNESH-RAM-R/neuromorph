import { Component } from 'react';
import BrandLogo from './BrandLogo.jsx';
import { LanguageEngine } from '../../engines/LanguageEngine.js';
import { LANGUAGE_STORAGE_KEY } from '../../config/i18nConfig.js';
import { t } from '../../i18n/strings/errorBoundary.js';

// 2026-08-21: the app's one and only React error boundary, wrapping <App />
// at the root (see main.jsx) so an uncaught render error ANYWHERE in the
// tree shows a calm, real fallback screen instead of a blank white page.
// React error boundaries MUST be class components -- there is no hooks
// equivalent (getDerivedStateFromError/componentDidCatch have no hook
// form as of React 18).
//
// Deliberately self-contained: this can render at the exact moment
// something else in the app has already broken, so it does NOT read
// language from React context/props (the thing that crashed might be
// exactly what would have supplied that) -- it resolves language the same
// way useLanguage.js does on first paint (read localStorage directly,
// same LanguageEngine.resolveInitialLanguage() used there), independent of
// any other component's state.
//
// Monitoring hook-in point: componentDidCatch is where a real error/crash
// reporting service (Sentry or equivalent -- see DEPLOYMENT_READINESS.md,
// not set up yet) would send this error upstream. Today it only
// console.errors so the info isn't lost during local dev/testing.
function resolveLanguageSafely() {
  try {
    return LanguageEngine.resolveInitialLanguage({ stored: window.localStorage.getItem(LANGUAGE_STORAGE_KEY) });
  } catch {
    return 'en';
  }
}

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('NEUROMORPH: uncaught render error', error, info?.componentStack);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const language = resolveLanguageSafely();
    return (
      <div className="nmpa-session-loading" role="alert">
        <BrandLogo size="lg" />
        <p className="nmpa-card__title" style={{ marginTop: 8 }}>{t(language, 'title')}</p>
        <p className="nmpa-muted" style={{ maxWidth: 420, textAlign: 'center' }}>{t(language, 'message')}</p>
        <button type="button" className="nmpa-button nmpa-button--primary" style={{ marginTop: 16 }} onClick={this.handleReload}>
          {t(language, 'reloadBtn')}
        </button>
      </div>
    );
  }
}
