import { useCallback, useRef, useState } from 'react';
import { CAREGIVER_FAQ_ENTRIES } from '../config/caregiverFaqConfig.js';
import { MATCHER_CONFIG, STOPWORDS } from '../config/matcherConfig.js';
import { AI_FALLBACK_CONFIG } from '../config/aiFallbackConfig.js';
import { CAREGIVER_SYSTEM_PROMPT, CAREGIVER_SYSTEM_PROMPT_VERSION } from '../config/caregiverSystemPromptConfig.js';
import { ConversationEngine } from '../engines/ConversationEngine.js';
import { AiFallbackService } from '../engines/AiFallbackService.js';
import { UnansweredQuestionLog } from '../engines/UnansweredQuestionLog.js';
import { ReportExtractionEngine } from '../engines/ReportExtractionEngine.js';
import { ReportExplanationEngine } from '../engines/ReportExplanationEngine.js';
import { PdfReportService } from '../services/PdfReportService.js';
import { LanguageEngine } from '../engines/LanguageEngine.js';

const GREETING_TEXT =
  "Hi, I'm Morphy for Caregivers! I can help with your daily check-in, answer general caregiving questions, or explain an uploaded report. What can I help with?";

const MATCHABLE_ENTRIES = [...CAREGIVER_FAQ_ENTRIES];
const CONTEXT_WINDOW = 8;

let messageIdCounter = 0;
function nextId() {
  messageIdCounter += 1;
  return `caregiver-morphy-msg-${messageIdCounter}`;
}

// The caregiver counterpart to useMorphyChat.js/useDoctorChat.js -- same
// "hook is the seam" convention, same routing order (local FAQ -> LLM
// fallback), no assessment-mode gating (that's a patient-only concept).
export function useCaregiverChat(language = 'en') {
  const [isOpen, setIsOpen] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  const appendMessage = useCallback((msg) => {
    setMessages((prev) => [...prev, { id: nextId(), ...msg }]);
    return msg;
  }, []);

  const greet = useCallback(() => {
    if (hasGreeted) return;
    setHasGreeted(true);
    appendMessage({ role: 'morphy', pose: 'wave', text: GREETING_TEXT });
  }, [hasGreeted, appendMessage]);

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
      appendMessage({ role: 'morphy', pose: 'idle', text: entry.answer });
    },
    [appendMessage]
  );

  const recentHistory = useCallback(
    (upToMessages) => upToMessages.slice(-CONTEXT_WINDOW).map((m) => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text })),
    []
  );

  const send = useCallback(async (overrideText) => {
    const text = (typeof overrideText === 'string' ? overrideText : inputValue).trim();
    if (!text) return;
    // 2026-08-21: same double-submit guard as useMorphyChat.js -- see that
    // file's comment.
    if (isThinking) return;
    setInputValue('');
    appendMessage({ role: 'user', text });

    const isTranslated = language && language !== 'en';
    const response = isTranslated
      ? { source: 'no_match', text: null, matchedEntry: null, suggestions: [], needsFallback: true }
      : ConversationEngine.getResponse(text, MATCHABLE_ENTRIES, MATCHER_CONFIG, STOPWORDS);

    if (response.source === 'faq') {
      appendMessage({ role: 'morphy', pose: 'idle', text: response.text });
      return;
    }

    UnansweredQuestionLog.log(text, { suggestionIds: response.suggestions.map((s) => s.id) });
    setIsThinking(true);
    try {
      const fallback = await AiFallbackService.ask(
        {
          question: text,
          recentMessages: recentHistory(messages),
          systemPrompt: CAREGIVER_SYSTEM_PROMPT + LanguageEngine.promptInstruction(language),
          systemPromptVersion: CAREGIVER_SYSTEM_PROMPT_VERSION,
        },
        AI_FALLBACK_CONFIG
      );
      appendMessage({ role: 'morphy', pose: 'thinking', text: fallback.text });
    } finally {
      setIsThinking(false);
    }
  }, [inputValue, appendMessage, messages, recentHistory, language, isThinking]);

  // Same two-pass pattern as useMorphyChat.js's uploadReport: real local
  // extraction/explanation always runs first (never fabricated even with
  // the AI fallback disabled), then a richer LLM pass follows using the
  // SAME extracted data if the fallback is enabled.
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
            question: 'Please explain this uploaded report in plain, caregiver-friendly language.',
            recentMessages: recentHistory(messages),
            mode: 'pdf-analysis',
            reportData: extracted,
            systemPrompt: CAREGIVER_SYSTEM_PROMPT + LanguageEngine.promptInstruction(language),
            systemPromptVersion: CAREGIVER_SYSTEM_PROMPT_VERSION,
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
