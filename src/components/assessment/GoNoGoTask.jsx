import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { GO_NO_GO_CONFIG } from '../../config/goNoGoConfig.js';
import { GoNoGoEngine } from '../../engines/GoNoGoEngine.js';
import TaskCountdown from './shared/TaskCountdown.jsx';
import { t, format } from '../../i18n/strings/assessmentTasks.js';
import { DEFAULT_LANGUAGE } from '../../config/i18nConfig.js';

// Teammate's richer Go/No-Go Test (2026-08-11 integration), restyled to
// this app's own nmpa- theme. Practice (16 GO / 4 NO-GO, unscored, with
// correct/incorrect feedback) -> countdown -> scored run (13 GO / 7 NO-GO,
// no feedback) -> onSubmit. Response is a single button tap or the
// Spacebar; only one response is accepted per trial.

// Shared timing engine for practice and scored runs: stimulus display
// window, response capture (tap or Spacebar, one response per trial),
// fixed-duration response window, randomized ITI, auto-advance.
function useGoNoGoTrialLoop({ trials, onEachTrial, onComplete, stimulusDisplayMs, responseWindowMs }) {
  const [index, setIndex] = useState(0);
  const [stimulusVisible, setStimulusVisible] = useState(false);
  const respondedRef = useRef(false);
  const pendingRef = useRef({ responded: false, responseTimeMs: null });
  const onsetRef = useRef(0);
  const timersRef = useRef([]);

  useEffect(() => {
    const trial = trials[index];
    if (!trial) return undefined;

    respondedRef.current = false;
    pendingRef.current = { responded: false, responseTimeMs: null };
    onsetRef.current = performance.now();
    setStimulusVisible(true);

    const displayTimer = setTimeout(() => setStimulusVisible(false), stimulusDisplayMs);
    const windowTimer = setTimeout(() => {
      const response = pendingRef.current;
      const outcome = GoNoGoEngine.classifyOutcome(trial, response.responded, response.responseTimeMs, responseWindowMs);
      onEachTrial({
        trialNumber: trial.trialNumber,
        stimulusType: trial.stimulusType,
        responded: response.responded,
        reactionTime: response.responseTimeMs,
        outcome,
      });

      const itiMs = Math.round(GO_NO_GO_CONFIG.ITI_MIN_MS + Math.random() * (GO_NO_GO_CONFIG.ITI_MAX_MS - GO_NO_GO_CONFIG.ITI_MIN_MS));
      const itiTimer = setTimeout(() => {
        if (index + 1 < trials.length) setIndex((i) => i + 1);
        else onComplete();
      }, itiMs);
      timersRef.current.push(itiTimer);
    }, responseWindowMs);

    timersRef.current.push(displayTimer, windowTimer);
    return () => {
      clearTimeout(displayTimer);
      clearTimeout(windowTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, trials]);

  useEffect(() => {
    const timers = timersRef.current;
    return () => timers.forEach((id) => clearTimeout(id));
  }, []);

  const respond = useCallback(() => {
    if (respondedRef.current) return; // one response per trial
    respondedRef.current = true;
    pendingRef.current = { responded: true, responseTimeMs: Math.round(performance.now() - onsetRef.current) };
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        respond();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [respond]);

  return { currentTrial: trials[index], stimulusVisible, index, respond };
}

function GoNoGoRun({ phase, onComplete, language = DEFAULT_LANGUAGE }) {
  const isPractice = phase === 'practice';
  const trials = useMemo(
    () => (isPractice
      ? GoNoGoEngine.generateTrials(GO_NO_GO_CONFIG.PRACTICE_TRIAL_COUNT, GO_NO_GO_CONFIG.PRACTICE_NOGO_COUNT, GO_NO_GO_CONFIG.PRACTICE_MAX_RUN_LENGTH, false)
      : GoNoGoEngine.generateTrials(GO_NO_GO_CONFIG.SCORED_TRIAL_COUNT, GO_NO_GO_CONFIG.SCORED_NOGO_COUNT, GO_NO_GO_CONFIG.SCORED_MAX_RUN_LENGTH, GO_NO_GO_CONFIG.SCORED_ALLOW_REPEAT_NOGO)),
    [isPractice]
  );
  const [feedback, setFeedback] = useState(null);
  const historyRef = useRef([]);
  const doneRef = useRef(false);

  const handleEachTrial = useCallback((record) => {
    if (isPractice) {
      setFeedback({ correct: record.outcome === 'HIT' || record.outcome === 'CORRECT_INHIBITION' });
    } else {
      historyRef.current = [...historyRef.current, record];
    }
  }, [isPractice]);

  const handleComplete = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    onComplete(historyRef.current);
  }, [onComplete]);

  const { currentTrial, stimulusVisible, index, respond } = useGoNoGoTrialLoop({
    trials,
    onEachTrial: handleEachTrial,
    onComplete: handleComplete,
    stimulusDisplayMs: isPractice ? GO_NO_GO_CONFIG.PRACTICE_STIMULUS_DISPLAY_MS : GO_NO_GO_CONFIG.STIMULUS_DISPLAY_MS,
    responseWindowMs: isPractice ? GO_NO_GO_CONFIG.PRACTICE_RESPONSE_WINDOW_MS : GO_NO_GO_CONFIG.RESPONSE_WINDOW_MS,
  });

  useEffect(() => {
    if (stimulusVisible) setFeedback(null);
  }, [stimulusVisible, index]);

  return (
    <div className="nmpa-task">
      <p className="nmpa-task__instruction">
        {isPractice ? t(language, 'practicePrefix') : ''}{t(language, 'goNoGoInstruction')}
      </p>
      <p className="nmpa-task__progress">{isPractice ? t(language, 'practiceTrialLabel') : format(t(language, 'trialProgress'), { current: index + 1, total: trials.length })}</p>

      <div className="nmpa-task__stage">
        {currentTrial && stimulusVisible ? (
          <div className={`nmpa-task__circle ${currentTrial.stimulusType === 'GO' ? 'is-go' : 'is-nogo'}`} />
        ) : (
          <div className="nmpa-task__fixation" aria-hidden="true">+</div>
        )}
      </div>

      {feedback && (
        <p className={`nmpa-task__feedback ${feedback.correct ? 'is-ok' : 'is-bad'}`}>
          {feedback.correct ? t(language, 'correct') : t(language, 'incorrect')}
        </p>
      )}

      <button type="button" className="nmpa-button nmpa-button--primary nmpa-task__respond-btn" onClick={respond}>
        {t(language, 'goNoGoRespondBtn')}
      </button>
    </div>
  );
}

export default function GoNoGoTask({ onSubmit, language = DEFAULT_LANGUAGE }) {
  const [stage, setStage] = useState('practice'); // 'practice' | 'countdown' | 'scored'

  if (stage === 'practice') {
    return <GoNoGoRun phase="practice" onComplete={() => setStage('countdown')} language={language} />;
  }
  if (stage === 'countdown') {
    return <TaskCountdown onDone={() => setStage('scored')} />;
  }
  return (
    <GoNoGoRun
      phase="scored"
      onComplete={(scoredTrials) => {
        const raw = GoNoGoEngine.score(scoredTrials);
        onSubmit({ score: raw.score, raw });
      }}
      language={language}
    />
  );
}
