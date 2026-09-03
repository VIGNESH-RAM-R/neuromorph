import en from '../../../i18n/gameContent/en.json';
import es from '../../../i18n/gameContent/es.json';
import fr from '../../../i18n/gameContent/fr.json';
import hi from '../../../i18n/gameContent/hi.json';
import kn from '../../../i18n/gameContent/kn.json';
import ta from '../../../i18n/gameContent/ta.json';
import te from '../../../i18n/gameContent/te.json';
import ur from '../../../i18n/gameContent/ur.json';

const CONTENT = { en, hi, ta, te, ur, fr, es, kn };

// BCP-47 tags for matching a SpeechSynthesis voice — separate from
// src/i18n/languages.js's plain 2-letter codes, since the Web Speech API
// wants a real locale tag, not just a language code.
const SPEECH_LANG_TAG = { en: 'en-US', hi: 'hi-IN', ta: 'ta-IN', te: 'te-IN', ur: 'ur-PK', fr: 'fr-FR', es: 'es-ES', kn: 'kn-IN' };

function instructionsFor(gameId, language) {
  return CONTENT[language]?.[gameId]?.instructions ?? CONTENT.en[gameId]?.instructions ?? null;
}

/**
 * features/phase-7-multilingual-voice-nav.md Part B.1:
 *   1. Check for a pre-recorded audio asset (gameId + language) → play it
 *   2. Fall back to browser SpeechSynthesis with the matching voice/lang code
 *   3. If neither exists → show "audio unavailable in this language" instead of silently failing
 *
 * Step 1 is a stated, honest gap in this environment — no audio-recording
 * capability exists here to produce real human voice assets in 8
 * languages, and the doc itself specifically calls out Kannada, Telugu,
 * and Urdu as needing it because browser SpeechSynthesis voice coverage
 * for those three is meaningfully weaker than for Hindi/Spanish/French in
 * most current browsers (docs/phase-7/README.md states this too). This
 * function's own shape still has the exact slot a future asset lookup
 * would occupy — nothing about step 2/3's call sites would need to
 * change, only this one early check.
 */
export const GameInstructionEngine = {
  hasText(gameId, language) {
    return Boolean(instructionsFor(gameId, language));
  },

  /**
   * Speaks `gameId`'s instructions in `language`. Resolves once speech
   * genuinely starts; rejects (reason: 'unavailable') if there's no text
   * for this game, no SpeechSynthesis support at all, or the browser's
   * synthesis itself errors — callers show the Part B.1 rung-3 message on
   * rejection, never silently do nothing. `onEnd` (optional) fires once
   * speech finishes naturally, so a caller's "speaking…" UI state can
   * reset itself without polling `speechSynthesis.speaking`.
   */
  speak(gameId, language, { onEnd } = {}) {
    return new Promise((resolve, reject) => {
      // Step 1 (pre-recorded audio) — no asset store exists; see this
      // function's own doc comment above.

      // Step 2: browser SpeechSynthesis.
      if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') {
        reject(new Error('unavailable'));
        return;
      }
      const text = instructionsFor(gameId, language);
      if (!text) {
        reject(new Error('unavailable'));
        return;
      }

      // Never let a previous game's still-speaking (or queued) utterance
      // bleed into this one — each task's instructions are independent.
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = SPEECH_LANG_TAG[language] ?? SPEECH_LANG_TAG.en;
      utterance.onstart = () => resolve();
      utterance.onerror = () => reject(new Error('unavailable'));
      utterance.onend = () => onEnd?.();
      window.speechSynthesis.speak(utterance);
    });
  },

  stop() {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  },
};
