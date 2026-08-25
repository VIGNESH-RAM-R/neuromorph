import { DEFAULT_LANGUAGE } from '../../config/i18nConfig.js';
import { t } from '../../i18n/strings/common.js';

export default function ThemeToggle({ theme, onToggle, language = DEFAULT_LANGUAGE }) {
  return (
    <button type="button" className="nmdd-theme-toggle" onClick={onToggle} aria-label={t(language, 'themeToggleAriaLabel')}>
      {theme === 'dark' ? t(language, 'themeToggleLight') : t(language, 'themeToggleDark')}
    </button>
  );
}
