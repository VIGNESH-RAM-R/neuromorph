import { useState, useRef, useCallback, useEffect } from 'react';
import { DIFFICULTY_CONFIG, DELAY_SEC, RECOGNITION_MAX_SEC, PROTOCOL, OBJECT_ASSET_PATH } from '../../config/visualMemoryConfig.js';
import { ObjectGenerationEngine, SceneEngine, RecognitionEngine, ValidationEngine, VisualMemoryEngine } from '../../engines/VisualMemoryEngine.js';
import { StudyItemRegistry } from '../../engines/StudyItemRegistry.js';
import TaskCountdown from './shared/TaskCountdown.jsx';
import { t, format } from '../../i18n/strings/assessmentTasks.js';
import { DEFAULT_LANGUAGE } from '../../config/i18nConfig.js';

// Visual Memory Test -- teammate's real project (visual_memory.zip,
// 2026-08-11 integration, part of the real Final 8: "Visual Memory").
// Restyled to this app's nmpa- theme. Flow: 1 unscored practice trial (with
// feedback) -> countdown -> 3 scored trials (easy/medium/hard), each
// observe -> 10s delay -> recognize.
//
// BRIDGE NOTE: this task's own file, as delivered, does not call
// StudyItemRegistry.register() -- the teammate's Delayed Recognition Memory
// project's own README explicitly names that as "the next concrete
// integration step." That call is added here (at the end of the scored
// sequence, once real hit/miss outcomes are known) so Delayed Recognition
// Memory -- which runs later in the battery -- has real study items to
// retrieve instead of falling back to its demo mock log.

function ObjectIllustration({ id, name, size = 64 }) {
  return <img src={OBJECT_ASSET_PATH(id)} alt={name} width={size} height={size} className="nmpa-task__object-icon" />;
}

export default function VisualMemoryTask({ onSubmit, language = DEFAULT_LANGUAGE }) {
  const [phase, setPhase] = useState('practice-observation'); // see PHASES below
  const [currentTrial, setCurrentTrial] = useState(null);
  const [selected, setSelected] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [trialIndex, setTrialIndex] = useState(0);
  const [practiceFeedback, setPracticeFeedback] = useState(null);

  const timerRef = useRef(null);
  const trialResultsRef = useRef([]);
  const sessionIdRef = useRef('vmt-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8));

  const clearTimer = useCallback(() => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } }, []);
  useEffect(() => () => clearTimer(), [clearTimer]);

  function generateTrial(difficulty) {
    const { targets, distractors } = ObjectGenerationEngine.generateTrial(difficulty);
    const arranged = SceneEngine.arrange(targets);
    const grid = RecognitionEngine.buildGrid(targets, distractors);
    return { targets: arranged, distractors, difficulty, grid };
  }

  // ---- practice: observe (unscored) ----
  useEffect(() => {
    if (phase !== 'practice-observation') return;
    const trial = generateTrial('easy');
    setCurrentTrial(trial);
    setSelected({});
    let remaining = DIFFICULTY_CONFIG.easy.viewSec;
    setTimeRemaining(remaining);
    clearTimer();
    timerRef.current = setInterval(() => {
      remaining -= 1;
      setTimeRemaining(Math.max(0, remaining));
      if (remaining <= 0) { clearTimer(); setPhase('practice-recognition'); }
    }, 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  useEffect(() => {
    if (phase !== 'practice-recognition') return;
    let remaining = RECOGNITION_MAX_SEC;
    setTimeRemaining(remaining);
    clearTimer();
    timerRef.current = setInterval(() => {
      remaining -= 1;
      setTimeRemaining(Math.max(0, remaining));
      if (remaining <= 0) { clearTimer(); finishPractice(); }
    }, 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  function finishPractice() {
    clearTimer();
    const selectedIds = Object.keys(selected);
    const result = ValidationEngine.validate(selectedIds, currentTrial.grid);
    setPracticeFeedback(result.hits === result.totalTargets && result.falsePositives === 0 ? t(language, 'visualMemoryAllCorrectFeedback') : format(t(language, 'visualMemoryPartialFeedback'), { hits: result.hits, total: result.totalTargets }));
    setTimeout(() => setPhase('countdown'), 1400);
  }

  // ---- scored: observe -> delay -> recognize ----
  useEffect(() => {
    if (phase !== 'scored-observation') return;
    const difficulty = PROTOCOL.scoredSequence[trialIndex];
    const trial = generateTrial(difficulty);
    setCurrentTrial(trial);
    setSelected({});
    let remaining = DIFFICULTY_CONFIG[difficulty].viewSec;
    setTimeRemaining(remaining);
    clearTimer();
    timerRef.current = setInterval(() => {
      remaining -= 1;
      setTimeRemaining(Math.max(0, remaining));
      if (remaining <= 0) { clearTimer(); setPhase('scored-delay'); }
    }, 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, trialIndex]);

  useEffect(() => {
    if (phase !== 'scored-delay') return;
    let remaining = DELAY_SEC;
    setTimeRemaining(remaining);
    clearTimer();
    timerRef.current = setInterval(() => {
      remaining -= 1;
      setTimeRemaining(Math.max(0, remaining));
      if (remaining <= 0) { clearTimer(); setPhase('scored-recognition'); }
    }, 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const recognitionStartRef = useRef(null);
  useEffect(() => {
    if (phase !== 'scored-recognition') return;
    recognitionStartRef.current = Date.now();
    let remaining = RECOGNITION_MAX_SEC;
    setTimeRemaining(remaining);
    clearTimer();
    timerRef.current = setInterval(() => {
      remaining -= 1;
      setTimeRemaining(Math.max(0, remaining));
      if (remaining <= 0) { clearTimer(); submitRecognition(true); }
    }, 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  function submitRecognition(timedOut) {
    clearTimer();
    const reactionTimeMs = Date.now() - (recognitionStartRef.current || Date.now());
    const selectedIds = Object.keys(selected);
    const result = ValidationEngine.validate(selectedIds, currentTrial.grid);
    const record = { difficulty: currentTrial.difficulty, reactionTimeMs, timedOut, ...result, targets: currentTrial.targets, selectedIds };
    const updated = [...trialResultsRef.current, record];
    trialResultsRef.current = updated;

    if (updated.length >= PROTOCOL.scoredSequence.length) {
      // Register every target object shown across the 3 scored trials with
      // StudyItemRegistry, so Delayed Recognition Memory (later in the
      // battery) has real material to re-test -- see BRIDGE NOTE above.
      const seen = new Map();
      updated.forEach((trial) => {
        trial.targets.forEach((t) => {
          seen.set(t.id, { id: t.id, wasRecognizedAtEncoding: trial.selectedIds.includes(t.id) });
        });
      });
      StudyItemRegistry.register({
        sourceModule: 'Visual Memory Test',
        itemType: 'object',
        items: Array.from(seen.values()),
      });

      const raw = VisualMemoryEngine.score(updated, { sessionId: sessionIdRef.current });
      onSubmit({ score: raw.score, raw });
    } else {
      setTrialIndex(updated.length);
      setPhase('scored-observation');
    }
  }

  const toggleSelect = useCallback((id) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[id]) delete next[id]; else next[id] = true;
      return next;
    });
  }, []);

  if (phase === 'countdown') return <TaskCountdown onDone={() => setPhase('scored-observation')} />;
  if (!currentTrial) return null;

  const isPractice = phase.startsWith('practice');
  const isObservation = phase.endsWith('observation');
  const isDelay = phase.endsWith('delay');
  const isRecognition = phase.endsWith('recognition');

  return (
    <div className="nmpa-task">
      <p className="nmpa-task__instruction">
        {isPractice ? t(language, 'practicePrefix') : ''}
        {isObservation && t(language, 'visualMemoryObserveInstruction')}
        {isDelay && t(language, 'delayHoldOnInstruction')}
        {isRecognition && t(language, 'visualMemoryRecognizeInstruction')}
      </p>
      <p className="nmpa-task__progress">
        {isPractice ? t(language, 'practiceTrialLabel') : format(t(language, 'trialProgress'), { current: trialIndex + 1, total: PROTOCOL.scoredSequence.length })}
      </p>
      <p className="nmpa-muted">
        {isObservation && format(t(language, 'memorizeLine'), { seconds: timeRemaining })}
        {isDelay && format(t(language, 'delayLine'), { seconds: timeRemaining })}
        {isRecognition && format(t(language, 'timeRemainingLine'), { seconds: timeRemaining })}
      </p>

      {isObservation && (
        <div className="nmpa-task__object-grid">
          {currentTrial.targets.map((o) => <ObjectIllustration key={o.id} id={o.id} name={o.name} />)}
        </div>
      )}

      {isDelay && <div className="nmpa-task__countdown"><span className="nmpa-task__countdown-num">...</span></div>}

      {isRecognition && (
        <>
          <div className="nmpa-task__object-grid nmpa-task__object-grid--selectable">
            {currentTrial.grid.map((o) => (
              <button
                key={o.id}
                type="button"
                className={`nmpa-task__object-option ${selected[o.id] ? 'is-selected' : ''}`}
                onClick={() => toggleSelect(o.id)}
                aria-pressed={!!selected[o.id]}
              >
                <ObjectIllustration id={o.id} name={o.name} />
              </button>
            ))}
          </div>
          <button
            type="button"
            className="nmpa-button nmpa-button--primary"
            onClick={() => (isPractice ? finishPractice() : submitRecognition(false))}
          >
            {t(language, 'submitBtn')}
          </button>
        </>
      )}

      {practiceFeedback && <p className="nmpa-task__feedback is-ok">{practiceFeedback}</p>}
    </div>
  );
}
