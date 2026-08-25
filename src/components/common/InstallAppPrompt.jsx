import { useInstallPrompt } from '../../hooks/useInstallPrompt.js';
import { t } from '../../i18n/strings/pwa.js';
import { DEFAULT_LANGUAGE } from '../../config/i18nConfig.js';

// A small, dismissible install banner -- only ever renders on browsers that
// actually fired `beforeinstallprompt` (so never a dead button on iOS
// Safari or an already-installed session) and only until the person either
// installs or dismisses it once. Rendered once at the top level in App.jsx,
// visible regardless of which role/screen is currently showing, same as
// the always-present Morphy bubble.
export default function InstallAppPrompt({ language = DEFAULT_LANGUAGE }) {
  const { canPrompt, promptInstall, dismiss } = useInstallPrompt();

  if (!canPrompt) return null;

  return (
    <div className="nmpa-install-prompt nmpa-anim-fade-up" role="complementary" aria-label={t(language, 'installTitle')}>
      <div className="nmpa-install-prompt__body">
        <p className="nmpa-install-prompt__title">{t(language, 'installTitle')}</p>
        <p className="nmpa-install-prompt__blurb">{t(language, 'installBlurb')}</p>
      </div>
      <div className="nmpa-install-prompt__actions">
        <button type="button" className="nmpa-button nmpa-button--secondary" onClick={dismiss}>
          {t(language, 'notNow')}
        </button>
        <button type="button" className="nmpa-button nmpa-button--primary" onClick={promptInstall}>
          {t(language, 'install')}
        </button>
      </div>
    </div>
  );
}
