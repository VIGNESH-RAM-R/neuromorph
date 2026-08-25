import { useState, useRef, useCallback, useEffect } from 'react';
import { MATRIX_SESSION_PLAN, MATRIX_PRACTICE_TIME_LIMIT_SEC, MATRIX_SCORED_TIME_LIMIT_SEC } from '../../config/matrixReasoningConfig.js';
import { MatrixReasoningEngine } from '../../engines/MatrixReasoningEngine.js';
import TaskCountdown from './shared/TaskCountdown.jsx';
import { t, format } from '../../i18n/strings/assessmentTasks.js';
import { DEFAULT_LANGUAGE } from '../../config/i18nConfig.js';

// Matrix Reasoning / Raven's-style pattern completion (teammate's real
// matrices_game project, 2026-08-11 integration -- part of the real Final 8:
// "Raven's Matrices"). Restyled to this app's nmpa- theme; the original's
// own instructions/results screens are dropped (AssessmentIntro + the
// shared results view already cover that at the battery level). Flow: 1
// unscored practice item -> countdown -> 6 scored items (2 easy, 2 medium,
// 2 hard) -> onSubmit.

function MatrixCell({ shapes, isMissing }) {
  if (isMissing) {
    return <div className="nmpa-task__matrix-cell nmpa-task__matrix-cell--missing">?</div>;
  }
  return (
    <div className="nmpa-task__matrix-cell">
      <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">
        {(shapes || []).map((s, i) => s.kind === 'circle'
          ? <circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill={s.fill} />
          : <polygon key={i} points={s.points} fill={s.fill} />)}
      </svg>
    </div>
  );
}

export default function MatrixReasoningTask({ onSubmit, language = DEFAULT_LANGUAGE }) {
  const [stage, setStage] = useState('practice'); // 'practice' | 'countdown' | 'scored'
  const [item, setItem] = useState(null);
  const [planIndex, setPlanIndex] = useState(1); // index into MATRIX_SESSION_PLAN, 0 is practice
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [timeLimit, setTimeLimit] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [feedback, setFeedback] = useState(null); // 'correct' | 'incorrect' | 'timeout' | null

  const itemStartRef = useRef(null);
  const timerRef = useRef(null);
  const resolvedRef = useRef(false);
  const scoredResultsRef = useRef([]);
  const sessionIdRef = useRef('sess_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8));

  const clearTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  useEffect(() => () => clearTimer(), [clearTimer]);

  const loadItem = useCallback((difficulty, limitSec) => {
    resolvedRef.current = false;
    setAnswered(false);
    setFeedback(null);
    setItem(MatrixReasoningEngine.generateItem(difficulty));
    itemStartRef.current = Date.now();
    setTimeLimit(limitSec);
    setTimeRemaining(limitSec);
    clearTimer();
    timerRef.current = setInterval(() => {
      const elapsed = (Date.now() - itemStartRef.current) / 1000;
      const remaining = Math.max(0, limitSec - elapsed);
      setTimeRemaining(remaining);
      if (remaining <= 0) { clearTimer(); handleAnswer(null); }
    }, 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearTimer]);

  // ---- practice (1 unscored item) ----
  useEffect(() => {
    if (stage !== 'practice') return;
    loadItem('easy', MATRIX_PRACTICE_TIME_LIMIT_SEC);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  // ---- scored sequence ----
  useEffect(() => {
    if (stage !== 'scored') return;
    scoredResultsRef.current = [];
    loadItem(MATRIX_SESSION_PLAN[planIndex], MATRIX_SCORED_TIME_LIMIT_SEC);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  function handleAnswer(selectedOption) {
    if (resolvedRef.current) return;
    resolvedRef.current = true;
    clearTimer();
    setAnswered(true);
    const responseTimeMs = Date.now() - itemStartRef.current;
    let correct = false, errorType = null;
    if (selectedOption === null) { errorType = 'no_response'; }
    else { correct = !!selectedOption._isCorrect; errorType = correct ? null : (selectedOption._errorType || 'random_choice'); }

    const isPractice = stage === 'practice';
    if (!isPractice) {
      scoredResultsRef.current = [...scoredResultsRef.current, {
        correct, responseTimeMs, errorType, difficulty: MATRIX_SESSION_PLAN[planIndex],
      }];
    }
    setFeedback(isPractice ? (correct ? 'correct' : 'incorrect') : (errorType === 'no_response' ? 'timeout' : (correct ? 'correct' : 'incorrect')));

    setTimeout(() => {
      if (isPractice) { setStage('countdown'); return; }
      const nextIndex = planIndex + 1;
      if (nextIndex >= MATRIX_SESSION_PLAN.length) {
        const raw = MatrixReasoningEngine.score(scoredResultsRef.current, { sessionId: sessionIdRef.current });
        onSubmit({ score: raw.score, raw });
      } else {
        setPlanIndex(nextIndex);
        loadItem(MATRIX_SESSION_PLAN[nextIndex], MATRIX_SCORED_TIME_LIMIT_SEC);
      }
    }, 900);
  }

  if (stage === 'countdown') {
    return <TaskCountdown onDone={() => setStage('scored')} />;
  }
  if (!item) return null;

  const isPractice = stage === 'practice';
  const total = MATRIX_SESSION_PLAN.length - 1; // excluding practice
  const current = isPractice ? 0 : planIndex; // planIndex 1..6 for scored

  return (
    <div className="nmpa-task">
      <p className="nmpa-task__instruction">
        {isPractice ? t(language, 'practicePrefix') : ''}{t(language, 'matrixInstruction')}
      </p>
      <p className="nmpa-task__progress">{isPractice ? t(language, 'practiceRoundLabel') : format(t(language, 'itemProgress'), { current, total })}</p>

      <div className="nmpa-task__timerbar">
        <div className="nmpa-task__timerbar-fill" style={{ width: `${timeLimit ? (timeRemaining / timeLimit) * 100 : 0}%` }} />
      </div>

      <div className="nmpa-task__matrix-grid">
        {item.grid.flat().map((attrs, i) => (
          <MatrixCell key={i} shapes={MatrixReasoningEngine.cellShapes(attrs)} isMissing={attrs === null} />
        ))}
      </div>

      <p className="nmpa-task__matrix-options-label">{t(language, 'matrixChooseLabel')}</p>
      <div className="nmpa-task__matrix-options">
        {item.options.map((opt, i) => (
          <button
            key={i}
            type="button"
            className="nmpa-task__matrix-option"
            disabled={answered}
            onClick={() => handleAnswer(opt)}
          >
            <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">
              {MatrixReasoningEngine.cellShapes(opt).map((s, j) => s.kind === 'circle'
                ? <circle key={j} cx={s.cx} cy={s.cy} r={s.r} fill={s.fill} />
                : <polygon key={j} points={s.points} fill={s.fill} />)}
            </svg>
          </button>
        ))}
      </div>

      {feedback && (
        <p className={`nmpa-task__feedback ${feedback === 'incorrect' || feedback === 'timeout' ? 'is-bad' : 'is-ok'}`}>
          {feedback === 'correct' ? (isPractice ? t(language, 'matrixCorrectPracticeFeedback') : t(language, 'correct'))
            : feedback === 'timeout' ? t(language, 'timeIsUp') : (isPractice ? t(language, 'matrixIncorrectPracticeFeedback') : t(language, 'incorrect'))}
        </p>
      )}
    </div>
  );
}
