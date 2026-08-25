import { useEffect, useState } from 'react';
import MorphyAvatar from '../chat/MorphyAvatar.jsx';

export default function MorphySection({ onOpenChat }) {
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
        <div className="nmpa-assistant-launch" aria-hidden="true">
          <span className="nmpa-assistant-launch__pulse" />
          <span className="nmpa-assistant-launch__particle nmpa-assistant-launch__particle--one" />
          <span className="nmpa-assistant-launch__particle nmpa-assistant-launch__particle--two" />
          <span className="nmpa-assistant-launch__particle nmpa-assistant-launch__particle--three" />
          <div className="nmpa-assistant-launch__morphy"><MorphyAvatar size={96} label="" /></div>
        </div>
      )}
      <section className="nmpa-card nmpa-assistant-hero">
        <div className="nmpa-assistant-hero__copy">
          <p className="nmpa-eyebrow">NEUROMORPH assistant</p>
          <h2 className="nmpa-card__title">Help, guidance, and report explanations</h2>
          <p className="nmpa-muted">Get clear help with your assessment, daily activities, and progress reports whenever you need it.</p>
        </div>
        <div className="nmpa-assistant-hero__action">
          <button type="button" className="nmpa-button nmpa-button--primary" onClick={launchAssistant} disabled={isLaunching}>Open Assistant</button>
          <span>Also available from the chat button in the bottom-right corner.</span>
        </div>
      </section>

      <div className="nmpa-assistant-grid">
        <article className="nmpa-card nmpa-assistant-card">
          <span className="nmpa-assistant-card__number">01</span>
          <h3>Understand your progress</h3>
          <p>Ask for a plain-language explanation of your cognitive scores, trends, and monthly report.</p>
          <span className="nmpa-assistant-card__prompt">Try: “Explain my latest report”</span>
        </article>
        <article className="nmpa-card nmpa-assistant-card">
          <span className="nmpa-assistant-card__number">02</span>
          <h3>Get activity support</h3>
          <p>Receive step-by-step guidance for games, assessments, and features anywhere in the app.</p>
          <span className="nmpa-assistant-card__prompt">Try: “How does this assessment work?”</span>
        </article>
        <article className="nmpa-card nmpa-assistant-card">
          <span className="nmpa-assistant-card__number">03</span>
          <h3>Review a PDF</h3>
          <p>Upload a NEUROMORPH report in the chat to have its contents explained in simpler language.</p>
          <span className="nmpa-assistant-card__prompt">Use the + button in chat to upload</span>
        </article>
      </div>

      <p className="nmpa-assistant-note">The assistant can explain app information, but it does not provide medical diagnoses. Discuss health concerns with a qualified clinician.</p>
    </div>
  );
}
