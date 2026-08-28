import { useEffect, useState } from 'react';
import MorphyLaunchOverlay from '../chat/MorphyLaunchOverlay.jsx';
import { DEFAULT_LANGUAGE } from '../../config/i18nConfig.js';
import { t } from '../../i18n/strings/dashboard.js';

// 2026-08-26: full i18n pass (see src/i18n/strings/dashboard.js). The
// "Try: ..." example prompts stay as illustrative English-style quoted
// phrases translated in full -- Morphy itself (the chat backend) is not
// changed by this pass, only this launcher screen's own copy.
export default function MorphySection({ onOpenChat, language = DEFAULT_LANGUAGE }) {
  const [isLaunching, setIsLaunching] = useState(false);

  useEffect(() => {
    if (!isLaunching) return undefined;
    const openTimer = window.setTimeout(onOpenChat, 610);
    const resetTimer = window.setTimeout(() => setIsLaunching(false), 760);
    return () => {
      window.clearTimeout(openTimer);
      window.clearTimeout(resetTimer);
    };
  }, [isLaunching, onOpenChat]);

  function launchAssistant() {
    if (!isLaunching) setIsLaunching(true);
  }

  return (
    <div className="nmpa-section nmpa-assistant-page">
      {isLaunching && (
        <MorphyLaunchOverlay />
      )}
      <section className="nmpa-card nmpa-assistant-hero">
        <div className="nmpa-assistant-hero__copy">
          <p className="nmpa-eyebrow">{t(language, 'assistantEyebrow')}</p>
          <h2 className="nmpa-card__title">{t(language, 'assistantHeroTitle')}</h2>
          <p className="nmpa-muted">{t(language, 'assistantHeroBody')}</p>
        </div>
        <div className="nmpa-assistant-hero__action">
          <button type="button" className="nmpa-button nmpa-button--primary" onClick={launchAssistant} disabled={isLaunching}>{t(language, 'openAssistantButton')}</button>
          <span>{t(language, 'alsoAvailableCaption')}</span>
        </div>
      </section>

      <div className="nmpa-assistant-grid">
        <article className="nmpa-card nmpa-assistant-card">
          <span className="nmpa-assistant-card__number">01</span>
          <h3>{t(language, 'card1Title')}</h3>
          <p>{t(language, 'card1Body')}</p>
          <span className="nmpa-assistant-card__prompt">{t(language, 'card1Prompt')}</span>
        </article>
        <article className="nmpa-card nmpa-assistant-card">
          <span className="nmpa-assistant-card__number">02</span>
          <h3>{t(language, 'card2Title')}</h3>
          <p>{t(language, 'card2Body')}</p>
          <span className="nmpa-assistant-card__prompt">{t(language, 'card2Prompt')}</span>
        </article>
        <article className="nmpa-card nmpa-assistant-card">
          <span className="nmpa-assistant-card__number">03</span>
          <h3>{t(language, 'card3Title')}</h3>
          <p>{t(language, 'card3Body')}</p>
          <span className="nmpa-assistant-card__prompt">{t(language, 'card3Prompt')}</span>
        </article>
      </div>

      <p className="nmpa-assistant-note">{t(language, 'assistantDisclaimer')}</p>
    </div>
  );
}
