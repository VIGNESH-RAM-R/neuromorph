import { useCallback, useRef, useState } from 'react';
import { FAQ_ENTRIES } from '../config/faqConfig.js';
import { BACKEND_ACTION_INTENTS } from '../config/backendActionIntentsConfig.js';
import { MATCHER_CONFIG, STOPWORDS } from '../config/matcherConfig.js';
import { AI_FALLBACK_CONFIG } from '../config/aiFallbackConfig.js';
import { ASSESSMENT_MODE_GREETING, ASSESSMENT_MODE_DEFERRAL, ASSESSMENT_COMPLETE_OFFER } from '../config/assessmentModeConfig.js';
import { AssessmentModeGuard } from '../engines/AssessmentModeGuard.js';
import { ConversationEngine } from '../engines/ConversationEngine.js';
import { AiFallbackService } from '../engines/AiFallbackService.js';
import { UnansweredQuestionLog } from '../engines/UnansweredQuestionLog.js';
import { BackendActionEngine } from '../engines/BackendActionEngine.js';
import { ReportExtractionEngine } from '../engines/ReportExtractionEngine.js';
import { ReportExplanationEngine } from '../engines/ReportExplanationEngine.js';
import { PdfReportService } from '../services/PdfReportService.js';
import { LanguageEngine } from '../engines/LanguageEngine.js';
import { SYSTEM_PROMPT, SYSTEM_PROMPT_VERSION } from '../config/systemPromptConfig.js';

const GREETING_TEXT =
  "Hi, I'm Morphy! I can explain how any part of NEUROMORPH works, help if something's broken, or point you in the right direction. What can I help with?";

// Everything Morphy can match locally, instantly, and for free -- plain
// FAQ answers plus data-driven backend-action intents. The LLM fallback
// (AiFallbackService, carrying the full system prompt) only runs when
// nothing in this combined pool matches confidently.
const MATCHABLE_ENTRIES = [...FAQ_ENTRIES, ...BACKEND_ACTION_INTENTS];

// How many recent turns are sent to the LLM fallback for context memory
// (pronoun/reference resolution per the system prompt's CONTEXT MEMORY
// rules). Kept small -- this is context, not a full transcript.
const CONTEXT_WINDOW = 8;

let messageIdCounter = 0;
function nextId() {
  messageIdCounter += 1;
  return `morphy-msg-${messageIdCounter}`;
}

// The single orchestrating hook for Morphy -- the ONLY place
// ConversationEngine, BackendActionEngine, AiFallbackService, and
// PdfReportService are called from, matching the same "hook is the seam"
// convention used by every other NEUROMORPH module.
//
// Routing order for every text message: local FAQ match -> local backend
// action (mock data, still instant/offline) -> LLM fallback (system
// prompt + recent conversation history, only reached if enabled).
//
// `assessmentPhase` ('intro' | 'running' | 'complete' | undefined) comes
// from the single shared useDetectionAssessment() instance in App.jsx.
// While it's 'running', Morphy switches into Mode 1 (Cognitive Assessment
// Mode) behavior per the master prompt: no hints or content explanations,
// only genuinely unrelated help stays answerable -- see
// assessmentModeConfig.js for exactly which categories remain safe.
export function useMorphyChat(assessmentPhase, language = 'en') {
  const [isOpen, setIsOpen] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const hasShownAssessmentNotice = useRef(false);
  const hasShownCompletionOffer = useRef(false);

  const isAssessmentActive = assessmentPhase === 'running';

  const appendMessage = useCallback((msg) => {
    setMessages((prev) => [...prev, { id: nextId(), ...msg }]);
    return msg;
  }, []);

  const greet = useCallback(() => {
    // These two are one-shot per phase, independent of the normal
    // hasGreeted flag, so they still surface even mid-conversation the
    // first time the user opens Morphy during (or right after) an
    // assessment -- but never repeat on every reopen.
    if (isAssessmentActive && !hasShownAssessmentNotice.current) {
      hasShownAssessmentNotice.current = true;
      appendMessage({ role: 'morphy', pose: 'idle', text: ASSESSMENT_MODE_GREETING });
      return;
    }
    if (assessmentPhase === 'complete' && !hasShownCompletionOffer.current) {
      hasShownCompletionOffer.current = true;
      appendMessage({ role: 'morphy', pose: 'idle', text: ASSESSMENT_COMPLETE_OFFER });
      return;
    }
    if (hasGreeted) return;
    setHasGreeted(true);
    appendMessage({ role: 'morphy', pose: 'wave', text: GREETING_TEXT });
  }, [hasGreeted, appendMessage, isAssessmentActive, assessmentPhase]);

  const open = useCallback(() => {
    setIsOpen(true);
    greet();
  }, [greet]);

  const close = useCallback(() => setIsOpen(false), []);

  const toggle = useCallback(() => {
    setIsOpen((wasOpen) => {
      if (!wasOpen) greet();
      return !wasOpen;
    });
  }, [greet]);

  const selectSuggestion = useCallback(
    (entry) => {
      appendMessage({ role: 'user', text: entry.question });
      if (entry.action) {
        const { text } = BackendActionEngine.execute(entry.action);
        appendMessage({ role: 'morphy', pose: 'idle', text });
        return;
      }
      if (AssessmentModeGuard.shouldDefer(assessmentPhase, entry.category)) {
        appendMessage({ role: 'morphy', pose: 'idle', text: ASSESSMENT_MODE_DEFERRAL });
        return;
      }
      appendMessage({ role: 'morphy', pose: 'idle', text: entry.answer });
    },
    [appendMessage, assessmentPhase]
  );

  // Builds the { role, text } history AiFallbackService sends for context
  // memory -- taken from React state, so it always reflects what the user
  // actually saw, not an internal log.
  const recentHistory = useCallback(
    (upToMessages) => upToMessages.slice(-CONTEXT_WINDOW).map((m) => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text })),
    []
  );

  // `overrideText`: optional -- lets a caller (the mic button's voice
  // transcript, see useVoiceInput.js) send a specific string directly
  // without a stale-closure race against setInputValue('') + calling send()
  // in the same tick. Normal form-submit calls send() with no argument, so
  // it falls back to the composer's own inputValue as before.
  const send = useCallback(async (overrideText) => {
    const text = (typeof overrideText === 'string' ? overrideText : inputValue).trim();
    if (!text) return;
    // 2026-08-21: guards against a double-click/Enter-spam/voice-overlap
    // firing a second request while one is still pending -- the Send
    // button already disables visually (see ChatPanel.jsx), but Enter-to-
    // submit on the text field bypasses a disabled button, so the real
    // guard has to live here, not just in the UI. Silently drops the
    // duplicate rather than queuing it, same "ignore, don't error" posture
    // as the empty-text check right above.
    if (isThinking) return;
    setInputValue('');
    appendMessage({ role: 'user', text });

    const smallTalkResponse = ConversationEngine.getSmallTalkResponse(text);
    if (smallTalkResponse) {
      appendMessage({ role: 'morphy', pose: 'wave', text: smallTalkResponse });
      return;
    }

    // A non-English language is selected: the local FAQ text is English-
    // only (translating it is the separate, bigger "translate the whole
    // app" task -- see LanguageEngine.promptInstruction's comment), so
    // matching against it would answer in the wrong language. Skip
    // straight to Gemini, which can genuinely reply in the selected
    // language, EXCEPT during an active assessment, which still defers
    // regardless of language (a real safety rule, not a language matter).
    const isTranslated = language && language !== 'en';

    const response = isTranslated
      ? { source: 'no_match', text: null, matchedEntry: null, suggestions: [], needsFallback: true }
      : ConversationEngine.getResponse(text, MATCHABLE_ENTRIES, MATCHER_CONFIG, STOPWORDS);

    if (response.source === 'action') {
      const { text: actionText } = BackendActionEngine.execute(response.action);
      appendMessage({ role: 'morphy', pose: 'idle', text: actionText });
      return;
    }

    if (response.source === 'faq') {
      if (AssessmentModeGuard.shouldDefer(assessmentPhase, response.matchedEntry?.category)) {
        appendMessage({ role: 'morphy', pose: 'idle', text: ASSESSMENT_MODE_DEFERRAL });
        return;
      }
      appendMessage({ role: 'morphy', pose: 'idle', text: response.text });
      return;
    }

    // No confident local match. During an active assessment, skip the LLM
    // fallback entirely and give the same calm deferral -- Mode 1 means no
    // open-ended content help right now, not just no FAQ hints. (A `null`
    // category never appears in ASSESSMENT_MODE_SAFE_CATEGORIES, so this
    // reuses the same guard rather than a separate isAssessmentActive check.)
    if (AssessmentModeGuard.shouldDefer(assessmentPhase, null)) {
      appendMessage({ role: 'morphy', pose: 'idle', text: ASSESSMENT_MODE_DEFERRAL });
      return;
    }

    // Log it (so the team can grow the FAQ), then try the live AI fallback
    // -- dormant by default, so this normally just returns the honest "not
    // configured yet" message instantly.
    UnansweredQuestionLog.log(text, { suggestionIds: response.suggestions.map((s) => s.id) });
    setIsThinking(true);
    try {
      const fallback = await AiFallbackService.ask(
        {
          question: text,
          recentMessages: recentHistory(messages),
          systemPrompt: SYSTEM_PROMPT + LanguageEngine.promptInstruction(language),
          systemPromptVersion: SYSTEM_PROMPT_VERSION,
        },
        AI_FALLBACK_CONFIG
      );
      appendMessage({ role: 'morphy', pose: 'thinking', text: fallback.text });
    } finally {
      setIsThinking(false);
    }
  }, [inputValue, appendMessage, messages, recentHistory, assessmentPhase, language, isThinking]);

  // PDF Analysis Mode: extraction and the default explanation both run
  // locally (ReportExtractionEngine + ReportExplanationEngine), so
  // uploading a report always produces a real, non-fabricated explanation
  // even with the AI fallback disabled. If the fallback IS enabled, a
  // second, richer LLM-generated pass follows using the same extracted
  // data -- never re-reading the PDF, never inventing new values.
  const uploadReport = useCallback(
    async (file) => {
      appendMessage({ role: 'user', text: `Uploaded: ${file?.name || 'report.pdf'}` });
      setIsThinking(true);
      try {
        const text = await PdfReportService.extractText(file);
        const extracted = ReportExtractionEngine.extract(text);
        const localExplanation = ReportExplanationEngine.explain(extracted);
        appendMessage({ role: 'morphy', pose: 'idle', text: localExplanation });

        if (AI_FALLBACK_CONFIG.enabled && AI_FALLBACK_CONFIG.endpoint) {
          setIsThinking(true);
          const fallback = await AiFallbackService.ask({
            question: 'Please explain this uploaded report.',
            recentMessages: recentHistory(messages),
            mode: 'pdf-analysis',
            reportData: extracted,
            systemPrompt: SYSTEM_PROMPT + LanguageEngine.promptInstruction(language),
            systemPromptVersion: SYSTEM_PROMPT_VERSION,
          });
          if (fallback.ok) {
            appendMessage({ role: 'morphy', pose: 'idle', text: fallback.text });
          }
        }
      } catch (err) {
        appendMessage({
          role: 'morphy',
          pose: 'idle',
          text: `I couldn't read that file: ${err?.message || 'an unexpected error occurred'}. Please make sure it's a valid PDF and try again.`,
        });
      } finally {
        setIsThinking(false);
      }
    },
    [appendMessage, messages, recentHistory, language]
  );

  const restart = useCallback(() => {
    setMessages([]);
    setHasGreeted(false);
    setInputValue('');
    hasShownAssessmentNotice.current = false;
    hasShownCompletionOffer.current = false;
  }, []);

  return {
    isOpen,
    messages,
    inputValue,
    setInputValue,
    isThinking,
    open,
    close,
    toggle,
    send,
    selectSuggestion,
    uploadReport,
    restart,
  };
}
