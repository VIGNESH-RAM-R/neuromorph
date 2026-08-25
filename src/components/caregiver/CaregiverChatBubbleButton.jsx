import MorphyAvatar from '../chat/MorphyAvatar.jsx';

// The caregiver counterpart to ChatBubbleButton.jsx/DoctorChatBubbleButton.jsx
// -- identical structure and CSS classes, just caregiver-facing aria-label.
export default function CaregiverChatBubbleButton({ isOpen, onToggle, hasUnread }) {
  return (
    <button
      type="button"
      className="morphy-bubble-button"
      onClick={onToggle}
      aria-expanded={isOpen}
      aria-label={isOpen ? 'Close Morphy for Caregivers' : 'Open Morphy for Caregivers, the NEUROMORPH caregiver assistant'}
    >
      <MorphyAvatar pose="idle" size={52} />
      {!isOpen && hasUnread && <span className="morphy-bubble-button__dot" aria-hidden="true" />}
    </button>
  );
}
