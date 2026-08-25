import { useCallback, useRef, useState } from 'react';
import { DOCTOR_FAQ_ENTRIES } from '../config/doctorFaqConfig.js';
import { MATCHER_CONFIG, STOPWORDS } from '../config/matcherConfig.js';
import { AI_FALLBACK_CONFIG } from '../config/aiFallbackConfig.js';
import { DOCTOR_SYSTEM_PROMPT, DOCTOR_SYSTEM_PROMPT_VERSION } from '../config/doctorSystemPromptConfig.js';
import { ConversationEngine } from '../engines/ConversationEngine.js';
import { AiFallbackService } from '../engines/AiFallbackService.js';
import { UnansweredQuestionLog } from '../engines/UnansweredQuestionLog.js';
import { ReportExtractionEngine } from '../engines/ReportExtractionEngine.js';
import { ReportExplanationEngine } from '../engines/ReportExplanationEngine.js';
import { PdfReportService } from '../services/PdfReportService.js';
import { LanguageEngine } from '../engines/LanguageEngine.js';
import { DOCTOR_MOCK_PATIENTS } from '../data/doctorMockPatients.js';
import {
  findPatientsMentionedInMessage,
  messageRequestsPatientSummary,
  buildSummaryText,
} from '../engines/DoctorPatientLookupEngine.js';

const GREETING_TEXT =
  "Hi, I'm Morphy for Clinicians. Ask me about NEUROMORPH's scoring, task or domain methodology, or say a patient's name (e.g. \"summarize Eleanor Whitfield\") for a quick summary you can turn into a PDF. What can I help with?";

// Doctor-only knowledge pool -- deliberately NOT merged with the patient
// FAQ_ENTRIES, so a clinician never sees a patient-phrased suggestion chip
// (or vice versa).
const MATCHABLE_ENTRIES = [...DOCTOR_FAQ_ENTRIES];

const CONTEXT_WINDOW = 8;

let messageIdCounter = 0;
function nextId() {
  messageIdCounter += 1;
  return `doctor-morphy-msg-${messageIdCounter}`;
}

// The doctor counterpart to useMorphyChat.js -- same "hook is the seam"
// convention, same routing shape, but with an extra FIRST step: a named-
// patient lookup pre-check, since arbitrary patient names can't be
// pre-enumerated as fixed keyword phrases the way DOCTOR_FAQ_ENTRIES can.
//
// Routing order for every text message:
//   1. Named-patient summary request (message mentions a known patient AND
//      a summary/report/pdf-ish word) -> answered locally and instantly
//      from DOCTOR_MOCK_PATIENTS, and offers to open the print dialog.
//   2. Local FAQ match (DOCTOR_FAQ_ENTRIES).
//   3. LLM fallback (DOCTOR_SYSTEM_PROMPT, only reached if enabled -- see
//      aiFallbackConfig.js; dormant by default, same honest "not configured
//      yet" message as the patient assistant).
//
// There is no assessment-mode concept here -- that's a patient-only idea
// (Morphy goes quiet during a running Detection Assessment); a doctor's
// chat is never gated that way.
export function useDoctorChat(language = 'en') {
  const [isOpen, setIsOpen] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [patientToPrint, setPatientToPrint] = useState(null);

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

  // Replies with the matched patient's summary text and, if exactly one
  // patient matched, offers a "print/PDF" follow-up by setting
  // patientToPrint -- the App shell (see PrintableDoctorPatientReport.jsx)
  // watches this and opens the browser print dialog.
  const handlePatientLookup = useCallback(
    (matches) => {
      if (matches.length === 0) {
        appendMessage({
          role: 'morphy',
          pose: 'idle',
          text: "I couldn't find that patient in the sample roster. Try a full name (e.g. \"Eleanor Whitfield\") or a patient ID (e.g. \"NMX-1001\").",
        });
        return;
      }
      if (matches.length > 1) {
        const list = matches.map((p) => `${p.name} (${p.patientId})`).join(', ');
        appendMessage({ role: 'morphy', pose: 'idle', text: `That matches more than one patient: ${list}. Could you be more specific?` });
        return;
      }
      const patient = matches[0];
      appendMessage({ role: 'morphy', pose: 'idle', text: buildSummaryText(patient) });
      setPatientToPrint(patient);
    },
    [appendMessage]
  );

  const clearPrintRequest = useCallback(() => setPatientToPrint(null), []);

  // overrideText: see useMorphyChat.js's send() comment -- same reasoning,
  // used by the mic button's voice transcript.
  const send = useCallback(async (overrideText) => {
    const text = (typeof overrideText === 'string' ? overrideText : inputValue).trim();
    if (!text) return;
    // 2026-08-21: same double-submit guard as useMorphyChat.js -- see that
    // file's comment.
    if (isThinking) return;
    setInputValue('');
    appendMessage({ role: 'user', text });

    // Step 1: named-patient summary/report request.
    if (messageRequestsPatientSummary(text)) {
      const matches = findPatientsMentionedInMessage(text, DOCTOR_MOCK_PATIENTS);
      if (matches.length) {
        handlePatientLookup(matches);
        return;
      }
      // Had a summary-ish keyword but no recognizable patient name -- fall
      // through to the normal FAQ/fallback path rather than assuming.
    }

    // Step 2: local doctor FAQ match -- skipped when a non-English
    // language is active, same reasoning as useMorphyChat.js (the local
    // FAQ text is English-only; Gemini can actually answer in the
    // selected language, the local pool can't).
    const isTranslated = language && language !== 'en';
    const response = isTranslated
      ? { source: 'no_match', text: null, matchedEntry: null, suggestions: [], needsFallback: true }
      : ConversationEngine.getResponse(text, MATCHABLE_ENTRIES, MATCHER_CONFIG, STOPWORDS);

    if (response.source === 'faq') {
      appendMessage({ role: 'morphy', pose: 'idle', text: response.text });
      return;
    }

    // Step 3: LLM fallback (dormant by default).
    UnansweredQuestionLog.log(text, { suggestionIds: response.suggestions.map((s) => s.id) });
    setIsThinking(true);
    try {
      const fallback = await AiFallbackService.ask(
        {
          question: text,
          recentMessages: recentHistory(messages),
          systemPrompt: DOCTOR_SYSTEM_PROMPT + LanguageEngine.promptInstruction(language),
          systemPromptVersion: DOCTOR_SYSTEM_PROMPT_VERSION,
        },
        AI_FALLBACK_CONFIG
      );
      appendMessage({ role: 'morphy', pose: 'thinking', text: fallback.text });
    } finally {
      setIsThinking(false);
    }
  }, [inputValue, appendMessage, messages, recentHistory, handlePatientLookup, language, isThinking]);

  // A doctor can also upload a patient-provided PDF report directly (not
  // the by-name lookup path) -- reuses the exact same, already-generic
  // PdfReportService/ReportExtractionEngine/ReportExplanationEngine trio
  // the patient assistant uses, since none of those three are
  // patient-vs-doctor specific.
  const uploadReport = useCallback(
    async (file) => {
      appendMessage({ role: 'user', text: `Uploaded: ${file?.name || 'report.pdf'}` });
      setIsThinking(true);
      try {
        const text = await PdfReportService.extractText(file);
        const extracted = ReportExtractionEngine.extract(text);
        const localExplanation = ReportExplanationEngine.explain(extracted);
        appendMessage({ role: 'morphy', pose: 'idle', text: localExplanation });
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
    [appendMessage]
  );

  const restart = useCallback(() => {
    setMessages([]);
    setHasGreeted(false);
    setInputValue('');
    setPatientToPrint(null);
  }, []);

  return {
    isOpen,
    messages,
    inputValue,
    setInputValue,
    isThinking,
    patientToPrint,
    clearPrintRequest,
    open,
    close,
    toggle,
    send,
    selectSuggestion,
    uploadReport,
    restart,
  };
}
