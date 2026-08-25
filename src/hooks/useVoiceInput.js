import { useCallback, useEffect, useRef, useState } from 'react';
import { SPEECH_RECOGNITION_LOCALE } from '../config/i18nConfig.js';

// Web Speech API's SpeechRecognition is vendor-prefixed in Chrome/Edge
// (webkitSpeechRecognition) and simply doesn't exist in Firefox or Safari
// as of writing -- this is a real, disclosed browser-support gap, not a
// bug. Read once at module load (not per-render) since it never changes
// during a session.
const SpeechRecognitionCtor =
  typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null;

// Mic-button voice input for Morphy's chat (patient and doctor). Speech is
// transcribed entirely in the browser via the Web Speech API -- no audio is
// ever sent anywhere by this hook, no server, no extra API key. The
// transcript is handed to the caller as plain text; this hook has no idea
// what happens to it next (same "hook decides nothing, just wires the
// browser API" convention as FaceTrackingService.js).
//
// `language` should be one of i18nConfig.js's LANGUAGES codes (e.g. 'en',
// 'hi') -- mapped to the BCP-47 locale SpeechRecognition actually wants via
// SPEECH_RECOGNITION_LOCALE.
export function useVoiceInput({ language = 'en', onResult } = {}) {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);
  const isSupported = !!SpeechRecognitionCtor;

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const start = useCallback(() => {
    if (!isSupported || isListening) return;
    setError(null);
    const recognition = new SpeechRecognitionCtor();
    recognition.lang = SPEECH_RECOGNITION_LOCALE[language] || 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim();
      if (transcript && onResult) onResult(transcript);
    };
    // 'no-speech' (silence/timeout) is expected and not worth alarming the
    // user about -- anything else (mic permission denied, no mic present,
    // network issue on some browsers) gets a real, honest message.
    recognition.onerror = (event) => {
      if (event.error !== 'no-speech') {
        setError(
          event.error === 'not-allowed' || event.error === 'permission-denied'
            ? 'Microphone access was blocked. Allow microphone access in your browser to use voice input.'
            : "Couldn't hear that -- please try again."
        );
      }
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    try {
      recognition.start();
      setIsListening(true);
    } catch {
      // start() throws if called while an existing instance is still
      // wrapping up -- fail quietly rather than crash the chat panel.
      setIsListening(false);
    }
  }, [isSupported, isListening, language, onResult]);

  // Stop cleanly if the component unmounts (or the chat panel closes)
  // while still listening -- otherwise the browser's mic indicator can be
  // left on.
  useEffect(() => () => recognitionRef.current?.stop(), []);

  return { isSupported, isListening, error, start, stop };
}
