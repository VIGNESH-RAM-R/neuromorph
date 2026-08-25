import { useRef } from 'react';
import MorphyAvatar from './MorphyAvatar.jsx';
import ChatMessage from './ChatMessage.jsx';
import { AI_FALLBACK_CONFIG } from '../../config/aiFallbackConfig.js';
import { useVoiceInput } from '../../hooks/useVoiceInput.js';

export default function ChatPanel({
  messages,
  inputValue,
  onInputChange,
  onSend,
  onSuggestionClick,
  onUploadReport,
  isThinking,
  onClose,
  language = 'en',
}) {
  const fileInputRef = useRef(null);
  // A voice question is sent immediately on transcript (not just dropped
  // into the composer) -- see useMorphyChat.js's send(overrideText).
  const voice = useVoiceInput({ language, onResult: (transcript) => onSend(transcript) });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSend();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && onUploadReport) onUploadReport(file);
    e.target.value = ''; // allow re-uploading the same file name later
  };

  return (
    <div className="morphy-panel" role="dialog" aria-label="Morphy, the NEUROMORPH assistant">
      <header className="morphy-panel__header">
        <MorphyAvatar pose="wave" size={40} />
        <div>
          <div className="morphy-panel__title">Morphy</div>
          <div className="morphy-panel__subtitle">Your NEUROMORPH assistant</div>
        </div>
        <button type="button" className="morphy-panel__close" onClick={onClose} aria-label="Close chat">
          &times;
        </button>
      </header>

      <div className="morphy-panel__messages">
        {messages.map((m) => (
          <ChatMessage
            key={m.id}
            role={m.role}
            text={m.text}
            pose={m.pose}
            suggestions={m.suggestions || []}
            onSuggestionClick={onSuggestionClick}
          />
        ))}
        {isThinking && (
          <div className="morphy-message morphy-message--morphy">
            <MorphyAvatar pose="thinking" size={32} />
            <div className="morphy-message__body">
              <div className="morphy-message__bubble morphy-message__bubble--thinking">Thinking...</div>
            </div>
          </div>
        )}
      </div>

      <form className="morphy-panel__input-row" onSubmit={handleSubmit}>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="morphy-panel__file-input"
          aria-label="Upload a NEUROMORPH report PDF for Morphy to explain"
        />
        <button
          type="button"
          className="morphy-button morphy-button--secondary morphy-panel__upload-button"
          onClick={() => fileInputRef.current?.click()}
          title="Upload a report PDF"
          aria-label="Upload a report PDF"
        >
          +
        </button>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder={voice.isListening ? 'Listening...' : 'Ask Morphy anything about NEUROMORPH...'}
          aria-label="Type a question for Morphy"
        />
        {voice.isSupported && (
          <button
            type="button"
            className={`morphy-button morphy-button--secondary morphy-panel__mic-button ${voice.isListening ? 'is-listening' : ''}`}
            onClick={() => (voice.isListening ? voice.stop() : voice.start())}
            title={voice.isListening ? 'Stop listening' : 'Ask by voice'}
            aria-label={voice.isListening ? 'Stop listening' : 'Ask by voice'}
            aria-pressed={voice.isListening}
          >
            {voice.isListening ? '●' : '🎤'}
          </button>
        )}
        <button type="submit" className="morphy-button morphy-button--primary" disabled={!inputValue.trim() || isThinking}>
          Send
        </button>
      </form>
      {voice.error && <p className="morphy-panel__voice-error" role="alert">{voice.error}</p>}
      <p className="morphy-panel__disclaimer">
        Morphy can help with how the app works. For anything about your health, please talk to your doctor.
        {AI_FALLBACK_CONFIG.enabled && ' Answers may be generated using Google Gemini.'}
      </p>
    </div>
  );
}
