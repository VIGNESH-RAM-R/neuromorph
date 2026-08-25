import { useState, useRef, useCallback, useEffect } from 'react';
import { RECOGNITION_MAX_SEC, ITEM_ASSET_PATH } from '../../config/delayedRecognitionMemoryConfig.js';
import { MemoryRetrievalEngine, RecognitionEngine, ValidationEngine, DelayedRecognitionMemoryEngine } from '../../engines/DelayedRecognitionMemoryEngine.js';
import TaskCountdown from './shared/TaskCountdown.jsx';
import { t, format } from '../../i18n/strings/assessmentTasks.js';
import { DEFAULT_LANGUAGE } from '../../config/i18nConfig.js';

// Delayed Recognition Memory Test -- teammate's real project
// (delayed_recognition_test.zip, 2026-08-11 integration, part of the real
// Final 8: "Delayed Recognition Memory"). Deliberately the LAST task in the
// battery (see lobarTaskRegistryConfig.js) -- it presents no new study
// material of its own, only re-tests what Visual Memory Test showed earlier,
// so every intervening task IS the delay interval. Flow: countdown -> one
// recognition trial per retrieved category (in practice, just the one
// "Visual Memory Test" / object category) -> onSubmit.

function ItemIllustration({ itemType, id, size = 64 }) {
  return <img src={ITEM_ASSET_PATH(itemType, id)} alt={id} width={size} height={size} className="nmpa-task__object-icon" />;
}

export default function DelayedRecognitionMemoryTask({ onSubmit, language = DEFAULT_LANGUAGE }) {
  const [phase, setPhase] = useState('countdown'); // 'countdown' | 'recognition'
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [currentGrid, setCurrentGrid] = useState(null);
  const [selected, setSelected] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);

  const categoriesRef = useRef(null);
  if (categoriesRef.current === null) categoriesRef.current = MemoryRetrievalEngine.retrieveAll();
  const categories = categoriesRef.current;

  const timerRef = useRef(null);
  const recognitionStartRef = useRef(null);
  const trialResultsRef = useRef([]);
  const sessionIdRef = useRef('drm-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8));

  const clearTimer = useCallback(() => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } }, []);
  useEffect(() => () => clearTimer(), [clearTimer]);

  const loadCategory = useCallback((index) => {
    const studySet = categories[index];
    const grid = RecognitionEngine.buildTrial(studySet);
    setCurrentGrid(grid);
    setSelected({});
    recognitionStartRef.current = Date.now();
    let remaining = RECOGNITION_MAX_SEC;
    setTimeRemaining(remaining);
    clearTimer();
    timerRef.current = setInterval(() => {
      remaining -= 1;
      setTimeRemaining(Math.max(0, remaining));
      if (remaining <= 0) { clearTimer(); submitTrial(index, studySet, grid, true); }
    }, 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories, clearTimer]);

  useEffect(() => {
    if (phase !== 'recognition') return;
    loadCategory(categoryIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, categoryIndex]);

  function submitTrial(index, studySet, grid, timedOut) {
    clearTimer();
    const reactionTimeMs = Date.now() - (recognitionStartRef.current || Date.now());
    const selectedIds = Object.keys(selected);
    const result = ValidationEngine.validate(selectedIds, grid);
    const record = { itemType: studySet.itemType, sourceModule: studySet.sourceModule, reactionTimeMs, timedOut, ...result };
    const updated = [...trialResultsRef.current, record];
    trialResultsRef.current = updated;

    const nextIndex = index + 1;
    if (nextIndex >= categories.length) {
      const raw = DelayedRecognitionMemoryEngine.score(updated, { sessionId: sessionIdRef.current });
      onSubmit({ score: raw.score, raw });
    } else {
      setCategoryIndex(nextIndex);
    }
  }

  const toggleSelect = useCallback((id) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[id]) delete next[id]; else next[id] = true;
      return next;
    });
  }, []);

  if (phase === 'countdown') return <TaskCountdown onDone={() => setPhase('recognition')} />;
  if (!currentGrid) return null;

  const studySet = categories[categoryIndex];

  return (
    <div className="nmpa-task">
      <p className="nmpa-task__instruction">{t(language, 'delayedRecMemoryInstruction')}</p>
      {/* 2026-08-20: unlike every other task in this battery, there is
          deliberately no practice round here -- see this file's header
          comment. A quick, honest note so it doesn't read as a missing
          step rather than a designed one. */}
      <p className="nmpa-muted nmpa-muted--sm">{t(language, 'delayedRecMemoryNoPracticeNote')}</p>
      <p className="nmpa-task__progress">{format(t(language, 'categoryProgress'), { current: categoryIndex + 1, total: categories.length })}</p>
      <p className="nmpa-muted">{format(t(language, 'timeRemainingLine'), { seconds: timeRemaining })}</p>

      <div className="nmpa-task__object-grid nmpa-task__object-grid--selectable">
        {currentGrid.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`nmpa-task__object-option ${selected[item.id] ? 'is-selected' : ''}`}
            onClick={() => toggleSelect(item.id)}
            aria-pressed={!!selected[item.id]}
          >
            <ItemIllustration itemType={studySet.itemType} id={item.id} />
          </button>
        ))}
      </div>

      <button
        type="button"
        className="nmpa-button nmpa-button--primary"
        onClick={() => submitTrial(categoryIndex, studySet, currentGrid, false)}
      >
        {t(language, 'submitBtn')}
      </button>
    </div>
  );
}
