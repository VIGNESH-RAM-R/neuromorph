import { useEffect, useRef, useState } from 'react';
import MorphyAvatar from './MorphyAvatar.jsx';

// The persistent floating entry point into Morphy -- meant to be dropped
// into any module's App.jsx alongside its own content (see README's
// "Reusing Morphy in another module" section).
export default function ChatBubbleButton({ isOpen, onToggle, hasUnread }) {
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
      aria-label={isOpen ? 'Close Morphy chat' : 'Open Morphy chat, your NEUROMORPH assistant'}
    >
      <MorphyAvatar pose="idle" size={52} />
      {!isOpen && hasUnread && <span className="morphy-bubble-button__dot" aria-hidden="true" />}
    </button>
  );
}
