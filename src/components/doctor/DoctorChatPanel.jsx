import { useRef } from 'react';
import MorphyAvatar from '../chat/MorphyAvatar.jsx';
import ChatMessage from '../chat/ChatMessage.jsx';
import { AI_FALLBACK_CONFIG } from '../../config/aiFallbackConfig.js';
import { useVoiceInput } from '../../hooks/useVoiceInput.js';

// The doctor counterpart to ChatPanel.jsx -- reuses the exact same
// morphy-panel/morphy-message CSS classes (already styled in theme.css) so
// no new styling was needed, just doctor-facing copy and props wired to
// useDoctorChat.js instead of useMorphyChat.js.
export default function DoctorChatPanel({
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
  const voice = useVoiceInput({ language, onResult: (transcript) => onSend(transcript) });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSend();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && onUploadReport) onUploadReport(file);
    e.target.value = '';
  };

  return (
    <div className="morphy-panel" role="dialog" aria-label="Morphy for Clinicians, the NEUROMORPH doctor assistant">
      <header className="morphy-panel__header">
        <MorphyAvatar pose="wave" size={40} />
        <div>
          <div className="morphy-panel__title">Morphy for Clinicians</div>
          <div className="morphy-panel__subtitle">Scoring, methodology &amp; patient summaries</div>
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
          aria-label="Upload a patient report PDF for Morphy to explain"
        />
        <button
          type="button"
          className="morphy-button morphy-button--secondary morphy-panel__upload-button"
          onClick={() => fileInputRef.current?.click()}
          title="Upload a patient report PDF"
          aria-label="Upload a patient report PDF"
        >
          +
        </button>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder={voice.isListening ? 'Listening...' : 'Ask about scoring, tasks, or say "summarize [patient name]"...'}
          aria-label="Type a question for Morphy for Clinicians"
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
        NEUROMORPH is a non-diagnostic screening tool. Summaries here support, but do not replace, clinical judgment.
        {AI_FALLBACK_CONFIG.enabled && ' Answers may be generated using Google Gemini.'}
      </p>
    </div>
  );
}
