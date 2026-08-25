import { useState, useRef, useCallback, useEffect } from 'react';
import { TOKEN_COLOR_HEX } from '../../config/tokenTestConfig.js';
import { CommandEngine, TokenEngine, ValidationEngine, TokenTestEngine } from '../../engines/TokenTestEngine.js';
import TaskCountdown from './shared/TaskCountdown.jsx';
import { t, format } from '../../i18n/strings/assessmentTasks.js';
import { DEFAULT_LANGUAGE } from '../../config/i18nConfig.js';

// Teammate's Token Test (2026-08-11 integration, a new task type -- not
// part of the original 12-task catalogue). Restyled to this app's own
// nmpa- theme instead of its original Tailwind-based markup (this project
// doesn't have Tailwind configured, so those utility classes would have
// rendered unstyled). Flow: 1 unscored practice item -> countdown -> 9
// scored commands (3 easy, 3 medium, 3 hard) -> onSubmit. Each instruction
// is spoken aloud once via the browser's built-in speech synthesis; the
// written instruction is never shown while responding, so the participant
// has to listen.

const FEMALE_VOICE_HINTS = [
  'female', 'samantha', 'victoria', 'zira', 'susan', 'karen', 'moira',
  'tessa', 'fiona', 'allison', 'ava', 'serena', 'amy', 'joanna', 'salli',
  'kimberly', 'ivy', 'emma', 'olivia', 'zoe', 'google us english',
];

function loadVoices() {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) { resolve([]); return; }
    const existing = window.speechSynthesis.getVoices();
    if (existing.length) { resolve(existing); return; }
    window.speechSynthesis.onvoiceschanged = () => resolve(window.speechSynthesis.getVoices());
    setTimeout(() => resolve(window.speechSynthesis.getVoices()), 500);
  });
}
function pickFemaleVoice(voices) {
  const englishVoices = voices.filter((v) => v.lang && v.lang.toLowerCase().startsWith('en'));
  const pool = englishVoices.length ? englishVoices : voices;
  const byHint = pool.find((v) => FEMALE_VOICE_HINTS.some((hint) => v.name.toLowerCase().includes(hint)));
  return byHint || pool[0] || voices[0] || null;
}
let cachedVoice = null;
function speak(text) {
  return new Promise(async (resolve) => {
    if (!('speechSynthesis' in window)) { resolve(); return; }
    window.speechSynthesis.cancel();
    if (!cachedVoice) {
      const voices = await loadVoices();
      cachedVoice = pickFemaleVoice(voices);
    }
    const utterance = new SpeechSynthesisUtterance(text);
    if (cachedVoice) utterance.voice = cachedVoice;
    utterance.rate = 0.85;
    utterance.pitch = 1.05;
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    window.speechSynthesis.speak(utterance);
  });
}
function cancelSpeech() {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}

function TokenGlyph({ color, shape, size }) {
  const dimension = size === 'large' ? 48 : 30;
  const fill = TOKEN_COLOR_HEX[color] || '#999';
  const stroke = color === 'white' ? '#c7cfd8' : 'rgba(0,0,0,0.08)';
  return (
    <svg width={dimension} height={dimension} viewBox="0 0 100 100" aria-hidden="true">
      {shape === 'circle'
        ? <circle cx="50" cy="50" r="46" fill={fill} stroke={stroke} strokeWidth="3" />
        : <rect x="6" y="6" width="88" height="88" rx="14" fill={fill} stroke={stroke} strokeWidth="3" />}
    </svg>
  );
}

function TokenBoard({ board, selections, onSelect, disabled }) {
  const sorted = [...board].sort((a, b) => a.position - b.position);
  const selectedIds = new Set(selections.map((t) => t.id));
  return (
    <div className="nmpa-task__token-grid">
      {sorted.map((token) => (
        <button
          key={token.id}
          type="button"
          className={`nmpa-task__token ${selectedIds.has(token.id) ? 'is-selected' : ''}`}
          onClick={() => onSelect(token)}
          disabled={disabled}
          aria-label={`${token.size} ${token.color} ${token.shape}`}
          aria-pressed={selectedIds.has(token.id)}
        >
          <TokenGlyph color={token.color} shape={token.shape} size={token.size} />
        </button>
      ))}
    </div>
  );
}

export default function TokenTestTask({ onSubmit, language = DEFAULT_LANGUAGE }) {
  const [stage, setStage] = useState('practice'); // 'practice' | 'countdown' | 'scored'
  const [subPhase, setSubPhase] = useState('speaking'); // 'speaking' | 'responding' | 'feedback'
  const [board, setBoard] = useState([]);
  const [selections, setSelections] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [timeLimit, setTimeLimit] = useState(0);
  const [trialIndex, setTrialIndex] = useState(0);
  const [practiceFeedback, setPracticeFeedback] = useState(null);

  const sessionCommandsRef = useRef([]);
  const currentCommandRef = useRef(null);
  const trialStartRef = useRef(null);
  const selectionsRef = useRef([]);
  const timerIntervalRef = useRef(null);
  const resolvedRef = useRef(false);
  const historyRef = useRef([]);

  useEffect(() => () => { cancelSpeech(); if (timerIntervalRef.current) clearInterval(timerIntervalRef.current); }, []);

  const clearTimer = useCallback(() => {
    if (timerIntervalRef.current) { clearInterval(timerIntervalRef.current); timerIntervalRef.current = null; }
  }, []);

  const startResponseTimer = useCallback((limitMs, onExpire) => {
    clearTimer();
    trialStartRef.current = Date.now();
    setTimeLimit(limitMs);
    setTimeRemaining(limitMs);
    timerIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - trialStartRef.current;
      const remaining = Math.max(0, limitMs - elapsed);
      setTimeRemaining(remaining);
      if (remaining <= 0) { clearTimer(); onExpire(); }
    }, 100);
  }, [clearTimer]);

  const presentCommand = useCallback(async (command, onExpire) => {
    resolvedRef.current = false;
    selectionsRef.current = [];
    setSelections([]);
    const { board: newBoard, resolvedStep } = TokenEngine.generateBoard(command);
    currentCommandRef.current = resolvedStep ? { ...command, resolvedStep } : command;
    setBoard(newBoard);
    setSubPhase('speaking');
    await speak(command.text);
    setSubPhase('responding');
    startResponseTimer(command.timeLimitMs, onExpire);
  }, [startResponseTimer]);

  // ---- practice (1 unscored item) ----
  useEffect(() => {
    if (stage !== 'practice') return;
    const command = CommandEngine.generatePracticeItem();
    presentCommand(command, () => finalizePractice([], false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  function finalizePractice(finalSelections, attempted) {
    if (resolvedRef.current) return;
    resolvedRef.current = true;
    clearTimer();
    const validation = ValidationEngine.validateResponse(currentCommandRef.current, finalSelections, attempted);
    setPracticeFeedback(validation.correct ? 'correct' : 'incorrect');
    setSubPhase('feedback');
    setTimeout(() => setStage('countdown'), 1100);
  }

  // ---- scored (9 commands) ----
  useEffect(() => {
    if (stage !== 'scored' || sessionCommandsRef.current.length) return;
    sessionCommandsRef.current = CommandEngine.generateSessionCommands();
    historyRef.current = [];
    setTrialIndex(0);
    runScoredTrial(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  function runScoredTrial(index) {
    const sequence = sessionCommandsRef.current;
    if (index >= sequence.length) return;
    presentCommand(sequence[index], () => finalizeScoredTrial(index, [], false));
  }

  function finalizeScoredTrial(index, finalSelections, attempted) {
    if (resolvedRef.current) return;
    resolvedRef.current = true;
    clearTimer();
    const reactionMs = Date.now() - trialStartRef.current;
    const validation = ValidationEngine.validateResponse(currentCommandRef.current, finalSelections, attempted);

    historyRef.current = [...historyRef.current, {
      level: currentCommandRef.current.level,
      type: currentCommandRef.current.type,
      reactionMs,
      attempted,
      correct: validation.correct,
      errorType: validation.errorType,
    }];

    const nextIndex = index + 1;
    if (nextIndex >= sessionCommandsRef.current.length) {
      const raw = TokenTestEngine.score(historyRef.current);
      onSubmit({ score: raw.score, raw });
    } else {
      setTrialIndex(nextIndex);
      runScoredTrial(nextIndex);
    }
  }

  const selectToken = useCallback((token) => {
    if (subPhase !== 'responding' || resolvedRef.current) return;
    const command = currentCommandRef.current;
    const updated = [...selectionsRef.current, token];
    selectionsRef.current = updated;
    setSelections(updated);
    if (updated.length >= command.requiredSelections) {
      if (stage === 'practice') finalizePractice(updated, true);
      else finalizeScoredTrial(trialIndex, updated, true);
    }
  }, [subPhase, stage, trialIndex]);

  if (stage === 'countdown') {
    return <TaskCountdown onDone={() => setStage('scored')} />;
  }

  const isPractice = stage === 'practice';
  const isSpeaking = subPhase === 'speaking';
  const isResponding = subPhase === 'responding';
  const total = isPractice ? 1 : sessionCommandsRef.current.length || 9;
  const current = isPractice ? 1 : trialIndex + 1;

  return (
    <div className="nmpa-task">
      <p className="nmpa-task__instruction">
        {isPractice ? t(language, 'practicePrefix') : ''}{t(language, 'tokenTestInstruction')}
      </p>
      <p className="nmpa-task__progress">{isPractice ? t(language, 'practiceItemLabel') : format(t(language, 'itemProgress'), { current, total })}</p>

      {isSpeaking && (
        <div className="nmpa-task__speaking" role="status" aria-live="polite">
          <span className="nmpa-task__speaking-dot" aria-hidden="true" />
          {t(language, 'tokenTestListeningStatus')}
        </div>
      )}

      {isResponding && (
        <>
          <div className="nmpa-task__timerbar">
            <div className="nmpa-task__timerbar-fill" style={{ width: `${timeLimit ? (timeRemaining / timeLimit) * 100 : 0}%` }} />
          </div>
          <TokenBoard board={board} selections={selections} onSelect={selectToken} disabled={!isResponding} />
        </>
      )}

      {practiceFeedback && subPhase === 'feedback' && (
        <p className={`nmpa-task__feedback ${practiceFeedback === 'correct' ? 'is-ok' : 'is-bad'}`}>
          {practiceFeedback === 'correct' ? t(language, 'correct') : t(language, 'tokenTestNotQuiteFeedback')}
        </p>
      )}
    </div>
  );
}
