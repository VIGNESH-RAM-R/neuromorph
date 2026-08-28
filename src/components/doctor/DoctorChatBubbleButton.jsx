import { useEffect, useRef, useState } from 'react';
import MorphyAvatar from '../chat/MorphyAvatar.jsx';
import { DEFAULT_LANGUAGE } from '../../config/i18nConfig.js';
import { t } from '../../i18n/strings/doctorHome.js';

// The doctor counterpart to ChatBubbleButton.jsx -- identical structure and
// CSS classes, just a clinician-facing aria-label.
export default function DoctorChatBubbleButton({ isOpen, onToggle, hasUnread, language = DEFAULT_LANGUAGE }) {
  // 2026-08-27 ADDITION -- brief pulse ring (see .morphy-bubble-button--pulse
  // in theme.css) whenever this bubble opens Morphy, so the "Morphy
  // animation" plays from the floating icon too, not only the dedicated
  // Open Assistant/Open Companion pages.
  const [pulsing, setPulsing] = useState(false);
  const wasOpen = useRef(isOpen);
  useEffect(() => {
    if (isOpen && !wasOpen.current) {
      setPulsing(true);
      const timer = window.setTimeout(() => setPulsing(false), 650);
      wasOpen.current = isOpen;
      return () => window.clearTimeout(timer);
    }
    wasOpen.current = isOpen;
    return undefined;
  }, [isOpen]);

  return (
    <button
      type="button"
      className={`morphy-bubble-button${pulsing ? ' morphy-bubble-button--pulse' : ''}`}
      onClick={onToggle}
      aria-expanded={isOpen}
      aria-label={isOpen ? t(language, 'bubbleCloseLabel') : t(language, 'bubbleOpenLabel')}
    >
      <MorphyAvatar pose="idle" size={52} />
      {!isOpen && hasUnread && <span className="morphy-bubble-button__dot" aria-hidden="true" />}
    </button>
  );
}
