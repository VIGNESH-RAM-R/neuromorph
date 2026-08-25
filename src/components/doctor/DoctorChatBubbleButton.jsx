import MorphyAvatar from '../chat/MorphyAvatar.jsx';

// The doctor counterpart to ChatBubbleButton.jsx -- identical structure and
// CSS classes, just a clinician-facing aria-label.
export default function DoctorChatBubbleButton({ isOpen, onToggle, hasUnread }) {
  return (
    <button
      type="button"
      className="morphy-bubble-button"
      onClick={onToggle}
      aria-expanded={isOpen}
      aria-label={isOpen ? 'Close Morphy for Clinicians' : 'Open Morphy for Clinicians, the NEUROMORPH doctor assistant'}
    >
      <MorphyAvatar pose="idle" size={52} />
      {!isOpen && hasUnread && <span className="morphy-bubble-button__dot" aria-hidden="true" />}
    </button>
  );
}
