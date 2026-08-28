import { useState, useEffect } from 'react';
import { LOBES, QUESTION_BANK_INFO } from '../../config/lobarConfig.js';
import { LOBAR_TASKS, taskDefinition } from '../../config/lobarTaskRegistryConfig.js';
import { CognitiveScoreEngine } from '../../engines/CognitiveScoreEngine.js';
import { DEFAULT_LANGUAGE } from '../../config/i18nConfig.js';
import { t, format } from '../../i18n/strings/assessment.js';
import { t as tc } from '../../i18n/strings/common.js';
import { estimateAssessmentMinutes } from '../../config/assessmentTimeEstimateConfig.js';
import { FullscreenEngine } from '../../engines/FullscreenEngine.js';

import AssessmentIntro from '../assessment/AssessmentIntro.jsx';
import AssessmentComplete from '../assessment/AssessmentComplete.jsx';
import StroopTask from '../assessment/StroopTask.jsx';
import TrailMakingTask from '../assessment/TrailMakingTask.jsx';
import GoNoGoTask from '../assessment/GoNoGoTask.jsx';
import TokenTestTask from '../assessment/TokenTestTask.jsx';
import MatrixReasoningTask from '../assessment/MatrixReasoningTask.jsx';
import GeometricShapeCopyTask from '../assessment/GeometricShapeCopyTask.jsx';
import VisualMemoryTask from '../assessment/VisualMemoryTask.jsx';
import FaceRecognitionTask from '../assessment/FaceRecognitionTask.jsx';
import DelayedRecognitionMemoryTask from '../assessment/DelayedRecognitionMemoryTask.jsx';
import VerbalFluencyTask from '../assessment/VerbalFluencyTask.jsx';
import WordListRecallTask from '../assessment/WordListRecallTask.jsx';
import DelayedRecognitionTask from '../assessment/DelayedRecognitionTask.jsx';
import NamingTask from '../assessment/NamingTask.jsx';
import ClockDrawingTask from '../assessment/ClockDrawingTask.jsx';
import CubeCopyTask from '../assessment/CubeCopyTask.jsx';
import CalculationTask from '../assessment/CalculationTask.jsx';
import EmbeddedFigureTask from '../assessment/EmbeddedFigureTask.jsx';
import ObjectNamingTask from '../assessment/ObjectNamingTask.jsx';
import QuestionBankTask from '../assessment/QuestionBankTask.jsx';

// Maps a run-order task id to its component. 'questionBank' is the 13th
// step (see useDetectionAssessment.js) -- not one of the registry tasks,
// but scored and sequenced exactly like the rest.
const TASK_COMPONENTS = {
  stroop: StroopTask,
  trailMaking: TrailMakingTask,
  goNoGo: GoNoGoTask,
  tokenTest: TokenTestTask,
  matrixReasoning: MatrixReasoningTask,
  geometricShapeCopy: GeometricShapeCopyTask,
  visualMemory: VisualMemoryTask,
  faceRecognition: FaceRecognitionTask,
  delayedRecognitionMemory: DelayedRecognitionMemoryTask,
  verbalFluency: VerbalFluencyTask,
  wordListRecall: WordListRecallTask,
  delayedRecognition: DelayedRecognitionTask,
  naming: NamingTask,
  clockDrawing: ClockDrawingTask,
  cubeCopy: CubeCopyTask,
  calculation: CalculationTask,
  embeddedFigures: EmbeddedFigureTask,
  objectNaming: ObjectNamingTask,
  questionBank: QuestionBankTask,
};

function taskLabel(taskId, language) {
  if (taskId === 'questionBank') return t(language, 'questionBankLabel');
  return taskDefinition(taskId)?.label || taskId;
}

function statusText(language) {
  return {
    overdue: { label: t(language, 'statusOverdue'), tone: 'warn' },
    'due-today': { label: t(language, 'statusDueToday'), tone: 'warn' },
    'not-due-yet': { label: t(language, 'statusNotDueYet'), tone: 'info' },
    unknown: { label: t(language, 'statusUnknown'), tone: 'info' },
  };
}

// `assessment` is the single shared useDetectionAssessment() instance,
// lifted to App.jsx (same reasoning as the shared useMorphyChat() instance)
// so Morphy can also read assessment.phase for Mode 1 behavior.
export default function AssessmentSection({ self, assessment, onGoToProgress, language = DEFAULT_LANGUAGE }) {
  const [showIntro, setShowIntro] = useState(false);
  // 2026-08-19: "once they have completed if they again press the detection
  // assessment -- guide them and tell need not reattempt the test again
  // (like a reminder)". Non-punitive, per the project's established UX
  // philosophy elsewhere (soft-mandatory, never a hard lockout) -- this is a
  // guidance interstitial, not a block, so a patient who genuinely wants to
  // retake it still can.
  const [showAlreadyDoneGuard, setShowAlreadyDoneGuard] = useState(false);

  // 2026-08-27 ADDITION -- the exit side of full-screen mode (the enter
  // side is AssessmentIntro.jsx's "Begin" button, which has to be the one
  // requesting it -- see FullscreenEngine.js). Leaves full-screen the
  // moment the assessment is no longer actively running: on reaching
  // 'complete' (so AssessmentComplete's summary isn't trapped full-screen),
  // and also if this component unmounts entirely (patient navigates away
  // to a different tab mid-assessment) -- exit() is a safe no-op either
  // way if the browser was never in full-screen to begin with.
  useEffect(() => {
    if (assessment.phase === 'complete') {
      FullscreenEngine.exit();
    }
  }, [assessment.phase]);
  useEffect(() => () => FullscreenEngine.exit(), []);

  if (!self) return null;
  const { weeklyAssessment, weekendReminder } = self;
  const STATUS_TEXT = statusText(language);
  const status = STATUS_TEXT[weeklyAssessment.status] || STATUS_TEXT.unknown;
  const completedThisWeek = weekendReminder?.completedThisWeek === true;

  if (assessment.phase === 'complete') {
    const cognitiveScore = CognitiveScoreEngine.compute(assessment.session);
    return (
      <AssessmentComplete
        session={assessment.session}
        cognitiveScore={cognitiveScore}
        onGoToProgress={onGoToProgress}
        onRestart={() => {
          assessment.restart();
          setShowIntro(false);
        }}
        language={language}
      />
    );
  }

  if (assessment.phase === 'running') {
    const TaskComponent = TASK_COMPONENTS[assessment.currentTaskId];
    if (!TaskComponent) return null;
    return (
      <div className="nmpa-section nmpa-assessment-running">
        <section className="nmpa-card">
          <p className="nmpa-eyebrow">
            {format(t(language, 'taskProgress'), { number: assessment.currentTaskNumber, total: assessment.totalTasks })}
            {' '}&middot; {taskLabel(assessment.currentTaskId, language)}
          </p>
          <TaskComponent key={assessment.currentTaskId} onSubmit={assessment.submitTaskResult} language={language} />
        </section>
      </div>
    );
  }

  if (showIntro) {
    // LOBAR_TASKS.length (12), not assessment.totalTasks (13) -- the QB
    // block is the 13th run-order step internally, but to the patient it's
    // "the tasks, followed by 10 questions," not a 13th task.
    return <AssessmentIntro taskCount={LOBAR_TASKS.length} onBegin={assessment.start} language={language} />;
  }

  if (showAlreadyDoneGuard) {
    return (
      <div className="nmpa-section">
        <section className="nmpa-card nmpa-alert nmpa-alert--info">
          <h2 className="nmpa-card__title">{t(language, 'alreadyDoneTitle')}</h2>
          <p>
            {format(t(language, 'alreadyDoneBody'), {
              date: weeklyAssessment.lastCompletedDate,
              dueDate: weeklyAssessment.dueDate || t(language, 'notScheduledFallback'),
            })}
          </p>
          <div className="nmpa-button-row">
            <button type="button" className="nmpa-button nmpa-button--secondary" onClick={() => setShowAlreadyDoneGuard(false)}>
              {tc(language, 'back')}
            </button>
            <button type="button" className="nmpa-button nmpa-button--primary" onClick={() => { setShowAlreadyDoneGuard(false); setShowIntro(true); }}>
              {t(language, 'takeAgainAnyway')}
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="nmpa-section nmpa-assessment-page">
      <section className="nmpa-card nmpa-assessment-hero">
        <div className="nmpa-assessment-hero__heading">
          <div>
            <p className="nmpa-eyebrow">Weekly cognitive check-in</p>
            <h2 className="nmpa-card__title">{tc(language, 'assessment.label')}</h2>
          </div>
          <span className={`nmpa-tag nmpa-tag--${status.tone}`}>{status.label}</span>
        </div>
        <div className="nmpa-assessment-hero__meta">
          <div><span>Last completed</span><strong>{weeklyAssessment.lastCompletedDate || t(language, 'neverFallback')}</strong></div>
          <div><span>Next due</span><strong>{weeklyAssessment.dueDate || t(language, 'notScheduledFallback')}</strong></div>
          <div><span>Estimated time</span><strong>{estimateAssessmentMinutes().minMinutes}–{estimateAssessmentMinutes().maxMinutes} min</strong></div>
        </div>
        <div className="nmpa-assessment-hero__content">
          <p>
            {format(t(language, 'assessmentIntroParagraph'), {
              totalQuestions: QUESTION_BANK_INFO.totalQuestions,
              sourcePoolSize: QUESTION_BANK_INFO.sourcePoolSize,
            })}
          </p>
          <p className="nmpa-muted nmpa-muted--sm">{QUESTION_BANK_INFO.rule}</p>
        </div>
        <div className="nmpa-assessment-hero__actions">
          <span className="nmpa-assessment-intro__time-estimate">
            {format(t(language, 'estimatedTimeLine'), { min: estimateAssessmentMinutes().minMinutes, max: estimateAssessmentMinutes().maxMinutes })}
          </span>
          <button
            type="button"
            className="nmpa-button nmpa-button--primary"
            onClick={() => (completedThisWeek ? setShowAlreadyDoneGuard(true) : setShowIntro(true))}
          >
            {t(language, 'startAssessmentBtn')}
          </button>
        </div>
      </section>

      <section className="nmpa-card nmpa-assessment-coverage">
        <div className="nmpa-assessment-coverage__heading">
          <div>
            <p className="nmpa-eyebrow">Assessment coverage</p>
            <h3 className="nmpa-card__title">{t(language, 'lobarFunctionTestTitle')}</h3>
          </div>
          <span className="nmpa-muted nmpa-muted--sm">8 structured tasks across 4 regions</span>
        </div>
        <div className="nmpa-lobe-grid">
          {LOBES.map((lobe, index) => (
            <div key={lobe.key} className="nmpa-lobe-card">
              <div className="nmpa-lobe-card__heading"><span>{String(index + 1).padStart(2, '0')}</span><p className="nmpa-lobe-card__label">{lobe.label}</p></div>
              <ul className="nmpa-tasklist">
                {lobe.tasks.map((task) => <li key={task}>{task}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
