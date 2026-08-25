import { useState, useRef, useCallback, useEffect } from 'react';
import { FACE_POOL, DIFFICULTY_TIERS, TRIAL_MODES, DEFAULT_TRIAL_MODE, RECOGNITION_TIMEOUT_MS, FACE_ASSET_PATH } from '../../config/faceRecognitionConfig.js';
import { FaceGenerationEngine, SceneEngine, RecognitionEngine, ValidationEngine, FaceRecognitionEngine } from '../../engines/FaceRecognitionEngine.js';
import { StudyItemRegistry } from '../../engines/StudyItemRegistry.js';
import TaskCountdown from './shared/TaskCountdown.jsx';
import { t, format } from '../../i18n/strings/assessmentTasks.js';
import { DEFAULT_LANGUAGE } from '../../config/i18nConfig.js';

// Face Recognition Test -- teammate's real project (face_recognition.zip,
// 2026-08-14 integration, part of the real Final 8: "Face Recognition").
// Restyled to this app's nmpa- theme, reusing the same object-grid tile
// styling Visual Memory Test and Delayed Recognition Memory Test already
// use (no new CSS needed). Flow: 1 unscored practice trial (observe -> brief
// delay -> recognize, with feedback) -> countdown -> 3 scored trials
// (easy/medium/hard: observe -> delay -> recognize) -> onSubmit.
//
// FIX (see FACE POOL SIZE NOTE in faceRecognitionConfig.js): the teammate's
// original hook excludes every face ever shown, accumulated across the
// WHOLE session -- with a 20-face pool that runs out mid-session under its
// own 'demo' mode. Here each trial instead draws fresh from the full pool
// (FaceGenerationEngine already guarantees no repeats WITHIN a trial), so a
// face may reappear across different trials. Scoring math itself
// (FaceGenerationEngine/ValidationEngine/MetricsEngine) is untouched.
//
// 2026-08-17 UPDATE -- real photos, same flow. FaceIllustration below always
// rendered a plain <img>, so swapping the underlying face*.svg illustrations
// for face*.jpg real (AI-generated, non-real-person) photos from a
// teammate's newer FACERE_3.JSX module required no change here at all -- see
// faceRecognitionConfig.js's header comment for the full story, including
// why that module's larger 8-trial/personalization redesign was NOT brought
// in (kept this task's practice + 3-trial pacing to protect the
// whole-assessment time budget).

const PROTOCOL = TRIAL_MODES[DEFAULT_TRIAL_MODE];

function FaceIllustration({ faceId, size = 72 }) {
  return <img src={FACE_ASSET_PATH(faceId)} alt={faceId} width={size} height={size} className="nmpa-task__object-icon" />;
}

export default function FaceRecognitionTask({ onSubmit, language = DEFAULT_LANGUAGE }) {
  const [phase, setPhase] = useState('practice-observation'); // see PHASES below
  const [currentTrial, setCurrentTrial] = useState(null);
  const [recognitionSet, setRecognitionSet] = useState([]);
  const [selections, setSelections] = useState([]); // [{ id, selectedAtMs }]
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [trialIndex, setTrialIndex] = useState(0);
  const [practiceFeedback, setPracticeFeedback] = useState(null);

  const timerRef = useRef(null);
  const trialResultsRef = useRef([]); // [{ difficulty, validation }] scored trials only
  const recognitionStartRef = useRef(null);
  const sessionIdRef = useRef('frt-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8));

  const clearTimer = useCallback(() => { if (timerRef.current) { clearInterval(timerRef.current); clearTimeout(timerRef.current); timerRef.current = null; } }, []);
  useEffect(() => () => clearTimer(), [clearTimer]);

  function generateTrial(difficulty) {
    // excludeIds is always [] -- see FIX note above.
    const trial = FaceGenerationEngine.buildTrial(FACE_POOL, difficulty, [], DIFFICULTY_TIERS);
    return trial;
  }

  // ---- practice: observe (unscored) ----
  useEffect(() => {
    if (phase !== 'practice-observation') return;
    const trial = generateTrial('easy');
    setCurrentTrial(trial);
    setSelections([]);
    let remaining = Math.round(trial.observationMs / 1000);
    setTimeRemaining(remaining);
    clearTimer();
    timerRef.current = setInterval(() => {
      remaining -= 1;
      setTimeRemaining(Math.max(0, remaining));
      if (remaining <= 0) { clearTimer(); setPhase('practice-delay'); }
    }, 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  useEffect(() => {
    if (phase !== 'practice-delay') return;
    clearTimer();
    timerRef.current = setTimeout(() => setPhase('practice-recognition'), 1500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  useEffect(() => {
    if (phase !== 'practice-recognition' || !currentTrial) return;
    const recSet = RecognitionEngine.buildRecognitionSet(currentTrial);
    setRecognitionSet(recSet);
    recognitionStartRef.current = Date.now();
    let remaining = Math.round(RECOGNITION_TIMEOUT_MS / 1000);
    setTimeRemaining(remaining);
    clearTimer();
    timerRef.current = setInterval(() => {
      remaining -= 1;
      setTimeRemaining(Math.max(0, remaining));
      if (remaining <= 0) { clearTimer(); finishPractice(true); }
    }, 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, currentTrial]);

  function finishPractice(timedOut) {
    clearTimer();
    const validation = ValidationEngine.score(recognitionSet, selections, timedOut ? RECOGNITION_TIMEOUT_MS : undefined);
    setPracticeFeedback(format(t(language, 'facePracticeFeedback'), {
      hits: validation.hits,
      totalTargets: validation.totalTargets,
      correctRejections: validation.correctRejections,
      totalDistractors: validation.totalDistractors,
    }));
    setTimeout(() => setPhase('countdown'), 1600);
  }

  // ---- scored: observe -> delay -> recognize ----
  useEffect(() => {
    if (phase !== 'scored-observation') return;
    const difficulty = PROTOCOL.scoredSequence[trialIndex];
    const trial = generateTrial(difficulty);
    setCurrentTrial(trial);
    setSelections([]);
    let remaining = Math.round(trial.observationMs / 1000);
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
    clearTimer();
    timerRef.current = setTimeout(() => setPhase('scored-recognition'), 1500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  useEffect(() => {
    if (phase !== 'scored-recognition' || !currentTrial) return;
    const recSet = RecognitionEngine.buildRecognitionSet(currentTrial);
    setRecognitionSet(recSet);
    recognitionStartRef.current = Date.now();
    let remaining = Math.round(RECOGNITION_TIMEOUT_MS / 1000);
    setTimeRemaining(remaining);
    clearTimer();
    timerRef.current = setInterval(() => {
      remaining -= 1;
      setTimeRemaining(Math.max(0, remaining));
      if (remaining <= 0) { clearTimer(); submitRecognition(true); }
    }, 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, currentTrial]);

  function submitRecognition(timedOut) {
    clearTimer();
    const validation = ValidationEngine.score(recognitionSet, selections, timedOut ? RECOGNITION_TIMEOUT_MS : undefined);
    const updated = [...trialResultsRef.current, { difficulty: currentTrial.difficulty, validation }];
    trialResultsRef.current = updated;

    if (updated.length >= PROTOCOL.scoredSequence.length) {
      // Register every studied (target) face across the 3 scored trials with
      // StudyItemRegistry, so Delayed Recognition Memory (later in the
      // battery) has real material to re-test -- same pattern Visual Memory
      // Test uses.
      const seen = new Map();
      updated.forEach((t) => {
        t.validation.targetOutcomes.filter((o) => o.isTarget).forEach((o) => {
          seen.set(o.id, { id: o.id, wasRecognizedAtEncoding: o.recognized });
        });
      });
      StudyItemRegistry.register({
        sourceModule: 'Face Recognition Test',
        itemType: 'face',
        items: Array.from(seen.values()),
      });

      const raw = FaceRecognitionEngine.score(updated, { sessionId: sessionIdRef.current });
      onSubmit({ score: raw.score, raw });
    } else {
      setTrialIndex(updated.length);
      setPhase('scored-observation');
    }
  }

  const toggleSelection = useCallback((faceId) => {
    setSelections((prev) => {
      const exists = prev.find((s) => s.id === faceId);
      if (exists) return prev.filter((s) => s.id !== faceId);
      const selectedAtMs = Date.now() - (recognitionStartRef.current || Date.now());
      return [...prev, { id: faceId, selectedAtMs }];
    });
  }, []);

  if (phase === 'countdown') return <TaskCountdown onDone={() => setPhase('scored-observation')} />;
  if (!currentTrial) return null;

  const isPractice = phase.startsWith('practice');
  const isObservation = phase.endsWith('observation');
  const isDelay = phase.endsWith('delay');
  const isRecognition = phase.endsWith('recognition');
  const studyScene = isObservation ? SceneEngine.buildStudyScene(currentTrial) : null;

  return (
    <div className="nmpa-task">
      <p className="nmpa-task__instruction">
        {isPractice ? t(language, 'practicePrefix') : ''}
        {isObservation && t(language, 'faceObserveInstruction')}
        {isDelay && t(language, 'delayHoldOnInstruction')}
        {isRecognition && t(language, 'faceRecognizeInstruction')}
      </p>
      <p className="nmpa-task__progress">
        {isPractice ? t(language, 'practiceTrialLabel') : format(t(language, 'trialProgress'), { current: trialIndex + 1, total: PROTOCOL.scoredSequence.length })}
      </p>
      <p className="nmpa-muted">
        {isObservation && format(t(language, 'memorizeLine'), { seconds: timeRemaining })}
        {isRecognition && format(t(language, 'timeRemainingLine'), { seconds: timeRemaining })}
      </p>

      {isObservation && studyScene && (
        <div className="nmpa-task__object-grid">
          {studyScene.items.map((f) => <FaceIllustration key={f.id} faceId={f.id} />)}
        </div>
      )}

      {isDelay && <div className="nmpa-task__countdown"><span className="nmpa-task__countdown-num">...</span></div>}

      {isRecognition && (
        <>
          <div className="nmpa-task__object-grid nmpa-task__object-grid--selectable">
            {recognitionSet.map((f) => {
              const isSelected = selections.some((s) => s.id === f.id);
              return (
                <button
                  key={f.id}
                  type="button"
                  className={`nmpa-task__object-option ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => toggleSelection(f.id)}
                  aria-pressed={isSelected}
                >
                  <FaceIllustration faceId={f.id} />
                </button>
              );
            })}
          </div>
          <button
            type="button"
            className="nmpa-button nmpa-button--primary"
            onClick={() => (isPractice ? finishPractice(false) : submitRecognition(false))}
          >
            {t(language, 'submitBtn')}
          </button>
        </>
      )}

      {practiceFeedback && <p className="nmpa-task__feedback is-ok">{practiceFeedback}</p>}
    </div>
  );
}
