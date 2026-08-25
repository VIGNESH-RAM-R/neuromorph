import { LANGUAGES } from '../../config/i18nConfig.js';
import { t } from '../../i18n/strings/common.js';

// Doctor_Dashboard's language switcher -- deliberately a plain native
// <select>, not app_page's fancier popover menu (AuthTopBar.jsx), to match
// this dashboard's own "clean clinical cards, no animation" design
// language (see theme.css's header comment) rather than importing
// app_page's consumer-app styling wholesale. Sits next to ThemeToggle
// wherever that already appears (the login screen, the top bar).
export default function LanguageSelector({ language, onChangeLanguage }) {
  return (
    <select
      className="nmdd-select nmdd-language-select"
      value={language}
      onChange={(e) => onChangeLanguage(e.target.value)}
      aria-label={t(language, 'languageSelectorAriaLabel')}
    >
      {LANGUAGES.map((l) => (
        <option key={l.code} value={l.code}>
          {l.nativeLabel}
        </option>
      ))}
    </select>
  );
}
