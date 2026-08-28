import { useState, useCallback } from 'react';
import { LOBAR_TASK_ORDER } from '../config/lobarTaskRegistryConfig.js';
import { AssessmentSessionModel } from '../engines/AssessmentSessionModel.js';
import { StudyItemRegistry } from '../engines/StudyItemRegistry.js';

// The Question Bank block runs as one final step after the 12 lobar tasks
// -- "the Lobar Function Test, plus 10 questions from the QB" is one
// combined weekly session, per the product owner. It gets its own pseudo
// task id ('questionBank') in the run order so this hook can sequence and
// time it exactly like every other task, but its score is kept OUT of
// `results`/lobarTaskScores (that array's shape is a contract with the
// Doctor Dashboard) and instead passed to AssessmentSessionModel.build as
// its dedicated qbScore argument.
const RUN_ORDER = [...LOBAR_TASK_ORDER, 'questionBank'];

// Orchestrates the Detection Assessment run: intro -> one step at a time in
// RUN_ORDER -> complete. Each task component is responsible for its own
// internal UI/state and calls `submitTaskResult({ score, raw })` when done;
// this hook only tracks sequencing, per-step timing, and assembling the
// final session once every step has reported in.
export function useDetectionAssessment() {
  const [phase, setPhase] = useState('intro'); // 'intro' | 'running' | 'complete'
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState([]);
  const [qbScore, setQbScore] = useState(undefined);
  const [taskStartedAt, setTaskStartedAt] = useState(null);

  const currentTaskId = RUN_ORDER[currentIndex];

  const start = useCallback(() => {
    // 2026-08-27 BUGFIX (found during the full Detection Assessment audit):
    // StudyItemRegistry.clear() was NEVER called anywhere in the app --
    // VisualMemoryTask/FaceRecognitionTask only ever REGISTER items,
    // nothing ever resets the sessionStorage-backed list between attempts.
    // Since sessionStorage survives page reloads/re-navigations within the
    // same browser tab (it only clears when the tab/window actually
    // closes), a patient retaking the assessment in the same tab -- or a
    // second patient using the same shared device without closing the
    // browser -- would have Delayed Recognition Memory tested against a
    // MIX of this attempt's items plus every earlier attempt's leftover
    // items still sitting in storage. That's a real, silent scoring
    // contamination bug: the "delayed recognition" trial could ask about
    // something studied last week (or by someone else entirely), not what
    // was actually just shown -- exactly the "scores should be genuinely
    // individual, no bugs" requirement this audit was checking for.
    // Clearing here, at the moment a fresh attempt actually starts (not at
    // completion -- a patient can always look back at what they registered
    // mid-run without this firing early), guarantees every attempt begins
    // from a real, clean slate.
    StudyItemRegistry.clear();
    setPhase('running');
    setCurrentIndex(0);
    setResults([]);
    setQbScore(undefined);
    setTaskStartedAt(Date.now());
  }, []);

  const submitTaskResult = useCallback(({ score, raw } = {}) => {
    const durationMs = taskStartedAt ? Date.now() - taskStartedAt : undefined;

    if (currentTaskId === 'questionBank') {
      setQbScore(score);
    } else {
      setResults((prev) => [...prev, { taskId: currentTaskId, score, raw, durationMs }]);
    }

    setCurrentIndex((i) => {
      const nextIndex = i + 1;
      if (nextIndex >= RUN_ORDER.length) {
        setPhase('complete');
      } else {
        setTaskStartedAt(Date.now());
      }
      return nextIndex;
    });
  }, [currentTaskId, taskStartedAt]);

  const restart = useCallback(() => {
    setPhase('intro');
    setCurrentIndex(0);
    setResults([]);
    setQbScore(undefined);
    setTaskStartedAt(null);
  }, []);

  const session = phase === 'complete' ? AssessmentSessionModel.build(results, qbScore) : null;

  return {
    phase,
    currentTaskId,
    currentTaskNumber: currentIndex + 1,
    totalTasks: RUN_ORDER.length,
    results,
    session,
    start,
    submitTaskResult,
    restart,
  };
}
