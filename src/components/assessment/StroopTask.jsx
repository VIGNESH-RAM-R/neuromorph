import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  STROOP_COLORS,
  STROOP_PRACTICE_COUNT,
  STROOP_SCORED_TRIAL_COUNT,
  STROOP_TRIAL_TIMEOUT_MS,
  STROOP_PRACTICE_TRIAL_TIMEOUT_MS,
} from '../../config/stroopConfig.js';
import { buildStroopTrialSet, StroopEngine } from '../../engines/StroopEngine.js';
import TaskCountdown from './shared/TaskCountdown.jsx';
import { t, format } from '../../i18n/strings/assessmentTasks.js';
import { DEFAULT_LANGUAGE } from '../../config/i18nConfig.js';

// Teammate's richer Stroop Test (2026-08-11 integration), restyled to this
// app's own nmpa- theme instead of its original standalone CSS bundle, and
// trimmed to fit this app's one-task-at-a-time shell: practice (with
// feedback) -> a brief countdown -> scored trials -> onSubmit. The original
// version's own top-level instructions/results screens are intentionally
// dropped here -- AssessmentIntro already covers instructions for the whole
// battery, and results surface later in the shared Progress/Doctor
// Dashboard views rather than mid-assessment.

function StroopTrialScreen({ phase, trialCount, onComplete, language = DEFAULT_LANGUAGE }) {
  const trials = useMemo(() => buildStroopTrialSet(trialCount), [trialCount]);
  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [locked, setLocked] = useState(false);
  const responsesRef = useRef([]);
  const startRef = useRef(performance.now());
  const timerRef = useRef(null);
  const finishedRef = useRef(false);

  const trial = trials[index];
  const trialTimeoutMs = phase === 'practice' ? STROOP_PRACTICE_TRIAL_TIMEOUT_MS : STROOP_TRIAL_TIMEOUT_MS;

  useEffect(() => {
    if (!trial || finishedRef.current) return undefined;
    setLocked(false);
    setFeedback(null);
    startRef.current = performance.now();
    timerRef.current = setTimeout(() => handleAnswer(null, true), trialTimeoutMs);
    return () => clearTimeout(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const handleAnswer = useCallback(
    (colorId, isTimeout) => {
      if (finishedRef.current || locked || !trial) return;
      setLocked(true);
      clearTimeout(timerRef.current);

      const rt = isTimeout ? trialTimeoutMs : Math.round(performance.now() - startRef.current);
      const correct = !isTimeout && colorId === trial.inkId;
      responsesRef.current = [
        ...responsesRef.current,
        {
          trialNumber: index + 1,
          word: trial.word,
          inkColor: trial.inkId,
          trialType: trial.trialType,
          selectedAnswer: isTimeout ? null : colorId,
          correctAnswer: trial.inkId,
          reactionTime: rt,
          correct,
          timeout: isTimeout,
        },
      ];

      if (phase === 'practice') setFeedback({ ok: correct, inkId: trial.inkId, isTimeout });

      const delay = phase === 'practice' ? 650 : 150;
      setTimeout(() => {
        const nextIndex = index + 1;
        if (nextIndex >= trials.length) {
          finishedRef.current = true;
          onComplete(responsesRef.current);
        } else {
          setIndex(nextIndex);
        }
      }, delay);
    },
    [locked, trial, index, phase, trials.length, onComplete, trialTimeoutMs]
  );

  if (!trial) return null;
  const inkColor = STROOP_COLORS.find((c) => c.id === trial.inkId);

  return (
    <div className="nmpa-task">
      <p className="nmpa-task__instruction">
        {phase === 'practice' ? t(language, 'practicePrefix') : ''}{t(language, 'stroopInstruction')}
      </p>
      <p className="nmpa-task__progress">
        {phase === 'practice' ? t(language, 'practiceTrialLabel') : format(t(language, 'trialProgress'), { current: index + 1, total: trials.length })}
      </p>

      <div className="nmpa-task__stimulus" style={{ color: inkColor.hex }}>{trial.word}</div>

      {feedback && (
        <p className={`nmpa-task__feedback ${feedback.ok ? 'is-ok' : 'is-bad'}`}>
          {feedback.isTimeout ? t(language, 'timeIsUp') : feedback.ok ? t(language, 'correct') : t(language, 'incorrect')}
        </p>
      )}

      <div className="nmpa-task__choices">
        {trial.buttonOrder.map((colorId) => {
          const c = STROOP_COLORS.find((x) => x.id === colorId);
          return (
            <button key={colorId} type="button" className="nmpa-button nmpa-button--secondary" disabled={locked} onClick={() => handleAnswer(colorId, false)}>
              {c.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function StroopTask({ onSubmit, language = DEFAULT_LANGUAGE }) {
  const [stage, setStage] = useState('practice'); // 'practice' | 'countdown' | 'scored'

  if (stage === 'practice') {
    return <StroopTrialScreen phase="practice" trialCount={STROOP_PRACTICE_COUNT} onComplete={() => setStage('countdown')} language={language} />;
  }
  if (stage === 'countdown') {
    return <TaskCountdown onDone={() => setStage('scored')} />;
  }
  return (
    <StroopTrialScreen
      phase="scored"
      trialCount={STROOP_SCORED_TRIAL_COUNT}
      onComplete={(responses) => {
        const raw = StroopEngine.score(responses);
        onSubmit({ score: raw.score, raw });
      }}
      language={language}
    />
  );
}
