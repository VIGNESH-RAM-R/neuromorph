import MorphyAvatar from './MorphyAvatar.jsx';

// The persistent floating entry point into Morphy -- meant to be dropped
// into any module's App.jsx alongside its own content (see README's
// "Reusing Morphy in another module" section).
export default function ChatBubbleButton({ isOpen, onToggle, hasUnread }) {
  return (
    <button
      type="button"
      className="morphy-bubble-button"
      onClick={onToggle}
      aria-expanded={isOpen}
      aria-label={isOpen ? 'Close Morphy chat' : 'Open Morphy chat, your NEUROMORPH assistant'}
    >
      <MorphyAvatar pose="idle" size={52} />
      {!isOpen && hasUnread && <span className="morphy-bubble-button__dot" aria-hidden="true" />}
    </button>
  );
}
