import { useState, useCallback } from 'react';
import { LOBAR_TASK_ORDER } from '../config/lobarTaskRegistryConfig.js';
import { AssessmentSessionModel } from '../engines/AssessmentSessionModel.js';

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
