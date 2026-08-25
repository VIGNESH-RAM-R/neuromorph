import MorphyAvatar from './MorphyAvatar.jsx';

export default function ChatMessage({ role, text, pose = 'idle', suggestions = [], onSuggestionClick }) {
  const isMorphy = role === 'morphy';
  return (
    <div className={`morphy-message morphy-message--${role}`}>
      {isMorphy && <MorphyAvatar pose={pose} size={32} label="Morphy" />}
      <div className="morphy-message__body">
        <div className="morphy-message__bubble">{text}</div>
        {suggestions.length > 0 && (
          <div className="morphy-suggestions">
            {suggestions.map((entry) => (
              <button
                key={entry.id}
                type="button"
                className="morphy-suggestion-chip"
                onClick={() => onSuggestionClick && onSuggestionClick(entry)}
              >
                {entry.question}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
