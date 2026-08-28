import { useRef } from 'react';
import MorphyAvatar from '../chat/MorphyAvatar.jsx';
import ChatMessage from '../chat/ChatMessage.jsx';
import { AI_FALLBACK_CONFIG } from '../../config/aiFallbackConfig.js';
import { useVoiceInput } from '../../hooks/useVoiceInput.js';
import { DEFAULT_LANGUAGE } from '../../config/i18nConfig.js';
import { t } from '../../i18n/strings/doctorHome.js';

// The doctor counterpart to ChatPanel.jsx -- reuses the exact same
// morphy-panel/morphy-message CSS classes (already styled in theme.css) so
// no new styling was needed, just doctor-facing copy and props wired to
// useDoctorChat.js instead of useMorphyChat.js.
// 2026-08-27: this panel's copy is now translated across all 7 languages
// (src/i18n/strings/doctorHome.js), same pass as DoctorHomeSection.jsx.
export default function DoctorChatPanel({
  messages,
  inputValue,
  onInputChange,
  onSend,
  onSuggestionClick,
  onUploadReport,
  isThinking,
  onClose,
  language = DEFAULT_LANGUAGE,
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
    <div className="morphy-panel" role="dialog" aria-label={t(language, 'chatDialogLabel')}>
      <header className="morphy-panel__header">
        <MorphyAvatar pose="wave" size={40} />
        <div>
          <div className="morphy-panel__title">{t(language, 'chatTitle')}</div>
          <div className="morphy-panel__subtitle">{t(language, 'chatSubtitle')}</div>
        </div>
        <button type="button" className="morphy-panel__close" onClick={onClose} aria-label={t(language, 'chatCloseLabel')}>
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
              <div className="morphy-message__bubble morphy-message__bubble--thinking">{t(language, 'chatThinking')}</div>
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
          aria-label={t(language, 'chatUploadLabel')}
        />
        <button
          type="button"
          className="morphy-button morphy-button--secondary morphy-panel__upload-button"
          onClick={() => fileInputRef.current?.click()}
          title={t(language, 'chatUploadTitle')}
          aria-label={t(language, 'chatUploadTitle')}
        >
          +
        </button>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder={voice.isListening ? t(language, 'chatInputListening') : t(language, 'chatInputPlaceholder')}
          aria-label={t(language, 'chatInputLabel')}
        />
        {voice.isSupported && (
          <button
            type="button"
            className={`morphy-button morphy-button--secondary morphy-panel__mic-button ${voice.isListening ? 'is-listening' : ''}`}
            onClick={() => (voice.isListening ? voice.stop() : voice.start())}
            title={voice.isListening ? t(language, 'chatMicStop') : t(language, 'chatMicStart')}
            aria-label={voice.isListening ? t(language, 'chatMicStop') : t(language, 'chatMicStart')}
            aria-pressed={voice.isListening}
          >
            {voice.isListening ? '●' : '🎤'}
          </button>
        )}
        <button type="submit" className="morphy-button morphy-button--primary" disabled={!inputValue.trim() || isThinking}>
          {t(language, 'chatSendButton')}
        </button>
      </form>
      {voice.error && <p className="morphy-panel__voice-error" role="alert">{voice.error}</p>}
      <p className="morphy-panel__disclaimer">
        {t(language, 'chatDisclaimer')}
        {AI_FALLBACK_CONFIG.enabled && t(language, 'chatDisclaimerGemini')}
      </p>
    </div>
  );
}
