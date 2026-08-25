import { useState, useRef, useEffect } from 'react';
import { LANGUAGES, languageInfo } from '../../config/i18nConfig.js';
import { ABOUT_WEBSITE_URL } from '../../config/externalLinksConfig.js';
import { authString } from '../../i18n/authStrings.js';
import { GlobeIcon, InfoIcon, ChevronDownIcon } from '../icons/FormIcons.jsx';

// Sits at the top of the brand panel (2026-08-17, replaces the space the
// removed Morphy avatar used to sit above) -- a language switcher (all 7
// requested languages) on one side, an About link out to the project
// website on the other.
export default function AuthTopBar({ language, onChangeLanguage, showAbout = true, className = '' }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const current = languageInfo(language);

  useEffect(() => {
    if (!open) return undefined;
    function onDocClick(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    }
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const hasWebsite = Boolean(ABOUT_WEBSITE_URL);

  return (
    <div className={`nmpa-auth-topbar ${className}`.trim()} ref={rootRef}>
      <div className="nmpa-auth-topbar__lang-wrap">
        <button
          type="button"
          className="nmpa-auth-topbar__btn"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <GlobeIcon />
          <span>{current.nativeLabel}</span>
          <ChevronDownIcon />
        </button>

        {open && (
          <ul className="nmpa-auth-topbar__menu" role="listbox">
            {LANGUAGES.map((l) => (
              <li key={l.code}>
                <button
                  type="button"
                  className={`nmpa-auth-topbar__menu-item ${l.code === language ? 'is-active' : ''}`}
                  role="option"
                  aria-selected={l.code === language}
                  onClick={() => { onChangeLanguage(l.code); setOpen(false); }}
                >
                  <span className="nmpa-auth-topbar__menu-native">{l.nativeLabel}</span>
                  <span className="nmpa-auth-topbar__menu-en">{l.label}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {showAbout && hasWebsite ? (
        <a
          href={ABOUT_WEBSITE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="nmpa-auth-topbar__btn"
        >
          <InfoIcon />
          <span>{authString(language, 'about')}</span>
        </a>
      ) : showAbout ? (
        <button
          type="button"
          className="nmpa-auth-topbar__btn"
          disabled
          title="Website link coming soon"
        >
          <InfoIcon />
          <span>{authString(language, 'about')}</span>
        </button>
      ) : null}
    </div>
  );
}
