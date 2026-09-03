import { useState, useRef, useCallback, useEffect, useId } from "react";

/* ============================================================
   ORCHESTRATOR CONTRACT
   This game must emit exactly this shape when a session ends:

   {
     game_id, lobe, session_id, patient_id, timestamp,
     difficulty_level, raw_score, max_score, accuracy,
     response_times, error_types, items_attempted, items_skipped
   }

   error_types vocabulary (one entry per WRONG scored item only):
   wrong_color | wrong_shape | wrong_size | wrong_sequence |
   missed_component | no_response
   ============================================================ */

const GAME_ID = "token_test";
const LOBE = "temporal";

/* ============================================================
   TOKEN / BOARD LAYER
   ============================================================ */

const COLORS = ["red", "blue", "green", "yellow", "white"];
const SHAPES = ["circle", "square"];
const SIZES = ["large", "small"];
const BOARD_SIZE = 10; // visible tokens per trial (kept small on purpose)
const PRACTICE_ITEM_COUNT = 3; // was 1 — not enough to actually get the idea before the scored session

const COLOR_HEX = {
  red: "#c1443a",
  blue: "#2f6db5",
  green: "#2f8f5b",
  yellow: "#d9a521",
  white: "#f4f4f4",
};

function shuffle(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
function randomFrom(list) {
  return list[Math.floor(Math.random() * list.length)];
}
function buildFullTokenSet() {
  const tokens = [];
  let id = 0;
  for (const size of SIZES) {
    for (const color of COLORS) {
      for (const shape of SHAPES) {
        tokens.push({ id: `tok-${id++}`, color, shape, size });
      }
    }
  }
  return tokens;
}
// Attribute match ignores size entirely — this game's commands only
// ever specify color and/or shape, per the difficulty definitions below.
function tokenMatchesStep(token, step) {
  if (step.color && token.color !== step.color) return false;
  if (step.shape && token.shape !== step.shape) return false;
  return true;
}

const TokenEngine = {
  /**
   * Builds a reduced-size board (BOARD_SIZE tokens, not the full 20)
   * for a given command, guaranteeing the board is always answerable.
   */
  generateBoard(command, boardSize = BOARD_SIZE) {
    const fullSet = buildFullTokenSet();

    // 'single' and 'sequential' commands: guarantee one matching
    // token per step, fill the rest with random distractors.
    const usedIds = new Set();
    const required = [];
    const stepList = command.type === "sequential" ? command.steps : [command.step];

    for (const step of stepList) {
      const candidates = fullSet.filter((t) => tokenMatchesStep(t, step) && !usedIds.has(t.id));
      const pool = candidates.length ? candidates : fullSet.filter((t) => tokenMatchesStep(t, step));
      const pick = randomFrom(pool);
      required.push(pick);
      usedIds.add(pick.id);
    }

    // Real bug, not just a display nit: this used to only exclude the exact
    // required token by id, so a distractor could still be a *different*
    // token that also matches a step's spoken attributes — e.g. an "easy"
    // command only ever says a color ("Touch the blue token"), but the full
    // token set has 4 blue tokens (2 shapes x 2 sizes); with only the one
    // required blue token excluded, the other 3 were all still eligible
    // distractors, so the board could show a blue circle AND a blue square
    // with an instruction that never mentioned shape at all — genuinely
    // ambiguous, not a hard trial. Now excludes every token that matches
    // ANY step's spoken attributes (color alone for easy, color+shape for
    // medium/hard), not just the one literal token instance chosen as the
    // target — so nothing on the board can ever satisfy the instruction
    // except the actual required token(s).
    const remainingPool = fullSet.filter(
      (t) => !usedIds.has(t.id) && !stepList.some((step) => tokenMatchesStep(t, step))
    );
    const distractorCount = Math.max(0, boardSize - required.length);
    const distractors = shuffle(remainingPool).slice(0, distractorCount);
    const boardTokens = shuffle([...required, ...distractors]);
    const positions = shuffle([...Array(boardTokens.length).keys()]);
    const board = boardTokens.map((t, i) => ({ ...t, position: positions[i] }));

    return { board };
  },
};

/* ============================================================
   COMMAND ENGINE
   easy   = single attribute (color only)
   medium = two attributes (color + shape)
   hard   = multi-step sequence ("touch X then touch Y")
   ============================================================ */

const TIME_LIMIT_MS = { easy: 20000, medium: 22000, hard: 28000 };

function stepPhrase(step) {
  const parts = [];
  if (step.color) parts.push(step.color);
  parts.push(step.shape ? step.shape : "token");
  const article = /^[aeiou]/i.test(parts[0]) ? "an" : "the";
  return `${article} ${parts.join(" ")}`;
}

function generateEasyCommand() {
  // Was color-only ("Touch the blue token") — now always names the shape
  // too, per feedback: even with the board-ambiguity fix above guaranteeing
  // only one token can ever match, hearing just a color still felt
  // underspecified. "Easy" keeps its own (shorter) time limit for pacing,
  // it just no longer differs from "medium" in what gets spoken.
  const step = { color: randomFrom(COLORS), shape: randomFrom(SHAPES) };
  return {
    id: `cmd-${Math.random().toString(36).slice(2, 8)}`,
    level: "easy",
    type: "single",
    step,
    text: `Touch ${stepPhrase(step)}.`,
    requiredSelections: 1,
    timeLimitMs: TIME_LIMIT_MS.easy,
  };
}

function generateMediumCommand() {
  const step = { color: randomFrom(COLORS), shape: randomFrom(SHAPES) };
  return {
    id: `cmd-${Math.random().toString(36).slice(2, 8)}`,
    level: "medium",
    type: "single",
    step,
    text: `Touch ${stepPhrase(step)}.`,
    requiredSelections: 1,
    timeLimitMs: TIME_LIMIT_MS.medium,
  };
}

function distinctColorShapePair(exclude) {
  let pair;
  do {
    pair = { color: randomFrom(COLORS), shape: randomFrom(SHAPES) };
  } while (exclude.some((p) => p.color === pair.color && p.shape === pair.shape));
  return pair;
}

function generateHardSequentialCommand() {
  const step1 = { color: randomFrom(COLORS), shape: randomFrom(SHAPES) };
  const step2 = distinctColorShapePair([step1]);
  const connective = randomFrom(["and then touch", "then touch"]);
  return {
    id: `cmd-${Math.random().toString(36).slice(2, 8)}`,
    level: "hard",
    type: "sequential",
    steps: [step1, step2],
    text: `Touch ${stepPhrase(step1)} ${connective} ${stepPhrase(step2)}.`,
    requiredSelections: 2,
    timeLimitMs: TIME_LIMIT_MS.hard,
  };
}

// Retired: generateHardConditionalCommand() ("if X is present, touch Y,
// otherwise touch Z") — see CommandEngine.generateSessionCommands()'s
// comment. Everything downstream that only existed to support it
// (buildConditionalBoard, TokenEngine's "conditional" branch,
// ValidationEngine's resolvedStep branch) was removed with it, not left
// as unreachable dead code.

// A command's first and last SPOKEN step — for "single" commands that's the
// same one step; for "sequential" commands the first and second step can
// differ, and it's specifically the boundary between two commands (this
// one's last step vs. the next one's first step) that could repeat.
function firstStep(command) {
  return command.type === "sequential" ? command.steps[0] : command.step;
}
function lastStep(command) {
  return command.type === "sequential" ? command.steps[command.steps.length - 1] : command.step;
}
function stepsEqual(a, b) {
  return !!a && !!b && a.color === b.color && a.shape === b.shape;
}

// Generates via `generator`, retrying (up to 20x — 20 is already far more
// than needed given how few color+shape combinations exist) if the new
// command's first spoken step would repeat the immediately preceding
// command's last spoken step. Same principle as Stroop's consecutive-repeat
// guard: only ever compares against the ONE command right before it, so the
// sequence as a whole is still genuinely random, just never audibly repeats
// itself back to back.
function generateAvoidingRepeat(generator, previous) {
  let command;
  let attempts = 0;
  do {
    command = generator();
    attempts += 1;
  } while (previous && attempts < 20 && stepsEqual(firstStep(command), lastStep(previous)));
  return command;
}

const CommandEngine = {
  // 3 unscored practice items — easy tier, for orientation only (was 1,
  // not enough for a patient to actually get the idea of how the task
  // works before the scored session begins). `previous` is the command
  // just spoken (or null for the first one) — see generateAvoidingRepeat.
  generatePracticeItem(previous) {
    return generateAvoidingRepeat(generateEasyCommand, previous);
  },
  // 9 scored commands, ascending difficulty: 3 easy, 3 medium, 3 hard.
  // Hard items were previously a random mix of sequential ("touch X then
  // touch Y") and conditional ("if X is present, touch Y, otherwise touch
  // Z") commands — conditional retired: two nested instructions spoken
  // once, with no way to ask for a repeat, was reported as
  // confusing rather than difficult in the intended sense. Every hard item
  // is sequential now.
  generateSessionCommands() {
    const generators = [
      ...Array(3).fill(generateEasyCommand),
      ...Array(3).fill(generateMediumCommand),
      ...Array(3).fill(generateHardSequentialCommand),
    ];
    const commands = [];
    let previous = null;
    for (const generator of generators) {
      previous = generateAvoidingRepeat(generator, previous);
      commands.push(previous);
    }
    return commands;
  },
};

/* ============================================================
   VALIDATION ENGINE
   Returns { correct, errorType } where errorType is one of the
   6 orchestrator-defined values, or null when correct.
   ============================================================ */

function validateSingleOrConditional(step, selections, attempted) {
  if (!attempted || !selections[0]) return { correct: false, errorType: "no_response" };
  const token = selections[0];
  const colorWrong = !!step.color && token.color !== step.color;
  const shapeWrong = !!step.shape && token.shape !== step.shape;
  const wrongCount = [colorWrong, shapeWrong].filter(Boolean).length;
  if (wrongCount === 0) return { correct: true, errorType: null };
  if (wrongCount > 1) return { correct: false, errorType: "missed_component" };
  return { correct: false, errorType: colorWrong ? "wrong_color" : "wrong_shape" };
}

function validateSequential(steps, selections, attempted) {
  if (!attempted || selections.length === 0) return { correct: false, errorType: "no_response" };
  if (selections.length < steps.length) return { correct: false, errorType: "missed_component" };

  let inOrder = true;
  for (let i = 0; i < steps.length; i++) {
    if (!tokenMatchesStep(selections[i], steps[i])) {
      inOrder = false;
      break;
    }
  }
  if (inOrder) return { correct: true, errorType: null };

  const rightTokensWrongOrder = steps.every((step) => selections.some((t) => tokenMatchesStep(t, step)));
  return { correct: false, errorType: rightTokensWrongOrder ? "wrong_sequence" : "missed_component" };
}

const ValidationEngine = {
  validateResponse(command, selections, attempted) {
    if (command.type === "sequential") return validateSequential(command.steps, selections, attempted);
    return validateSingleOrConditional(command.step, selections, attempted);
  },
};

/* ============================================================
   REPORT BUILDER — assembles the exact orchestrator JSON shape
   ============================================================ */

function generateSessionId() {
  return `sess-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const ReportBuilder = {
  build({ sessionId, patientId, trialHistory }) {
    const raw_score = trialHistory.filter((t) => t.correct).length;
    const max_score = trialHistory.length;
    const accuracy = max_score ? Number((raw_score / max_score).toFixed(4)) : 0;
    const response_times = trialHistory.map((t) => Number(t.reactionMs.toFixed(1)));
    const error_types = trialHistory.filter((t) => !t.correct).map((t) => t.errorType);
    const items_attempted = trialHistory.filter((t) => t.attempted).length;
    const items_skipped = trialHistory.filter((t) => !t.attempted).length;

    return {
      game_id: GAME_ID,
      lobe: LOBE,
      session_id: sessionId,
      patient_id: patientId,
      timestamp: new Date().toISOString(),
      // This session always ascends through easy -> medium -> hard,
      // so difficulty_level reports the highest tier administered.
      difficulty_level: "hard",
      raw_score,
      max_score,
      accuracy,
      response_times,
      error_types,
      items_attempted,
      items_skipped,
    };
  },
};

/* ============================================================
   AUDIO — single playback, slow pleasant female voice
   ============================================================ */

const FEMALE_VOICE_HINTS = [
  "female", "samantha", "victoria", "zira", "susan", "karen", "moira",
  "tessa", "fiona", "allison", "ava", "serena", "amy", "joanna", "salli",
  "kimberly", "ivy", "emma", "olivia", "zoe", "google us english",
];

function loadVoices() {
  return new Promise((resolve) => {
    if (!("speechSynthesis" in window)) {
      resolve([]);
      return;
    }
    const existing = window.speechSynthesis.getVoices();
    if (existing.length) {
      resolve(existing);
      return;
    }
    window.speechSynthesis.onvoiceschanged = () => resolve(window.speechSynthesis.getVoices());
    setTimeout(() => resolve(window.speechSynthesis.getVoices()), 500);
  });
}
function pickFemaleVoice(voices) {
  const englishVoices = voices.filter((v) => v.lang && v.lang.toLowerCase().startsWith("en"));
  const pool = englishVoices.length ? englishVoices : voices;
  const byHint = pool.find((v) => FEMALE_VOICE_HINTS.some((hint) => v.name.toLowerCase().includes(hint)));
  return byHint || pool[0] || voices[0] || null;
}
let cachedVoice = null;
async function speak(text) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  if (!cachedVoice) {
    const voices = await loadVoices();
    cachedVoice = pickFemaleVoice(voices);
  }
  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text);
    if (cachedVoice) utterance.voice = cachedVoice;
    utterance.rate = 0.78;
    utterance.pitch = 1.05;
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    window.speechSynthesis.speak(utterance);
  });
}
function cancelSpeech() {
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}

/* ============================================================
   REACT HOOK LAYER — useTokenTest()
   ============================================================ */

const PHASE = { INSTRUCTIONS: "instructions", PRACTICE: "practice", COUNTDOWN: "countdown", ASSESSMENT: "assessment", COMPLETED: "completed" };
const SUB_PHASE = { IDLE: "idle", SPEAKING: "speaking", RESPONDING: "responding", FEEDBACK: "feedback" };
const TIMER_TICK_MS = 100;

function useTokenTest({ patientId, onPracticeComplete }) {
  const [phase, setPhase] = useState(PHASE.INSTRUCTIONS);
  const [subPhase, setSubPhase] = useState(SUB_PHASE.IDLE);
  const [board, setBoard] = useState([]);
  const [, setCommandText] = useState(null);
  const [selections, setSelections] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [timeLimit, setTimeLimit] = useState(0);
  const [isPracticeStep, setIsPracticeStep] = useState(true);
  const [trialIndex, setTrialIndex] = useState(0);
  const [, setTrialHistory] = useState([]);
  const [countdownValue, setCountdownValue] = useState(3);
  const [report, setReport] = useState(null);
  const [practiceFeedback, setPracticeFeedback] = useState(null);

  const sessionCommandsRef = useRef([]);
  const sessionIdRef = useRef(null);
  const currentCommandRef = useRef(null);
  const trialStartRef = useRef(null);
  const selectionsRef = useRef([]);
  const timerIntervalRef = useRef(null);
  const resolvedRef = useRef(false);
  // 0-based index of the practice item currently on screen, and the
  // accumulated result of each one so far this practice round — read
  // directly in the returned `progress` object below (a ref updates
  // synchronously, unlike state, so there's no stale-render risk between
  // finalizePractice bumping it and the next practice item's own render).
  const practiceIndexRef = useRef(0);
  const practiceResultsRef = useRef([]);

  useEffect(() => {
    return () => {
      cancelSpeech();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  const clearTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  const startResponseTimer = useCallback(
    (limitMs, onExpire) => {
      clearTimer();
      trialStartRef.current = Date.now();
      setTimeLimit(limitMs);
      setTimeRemaining(limitMs);
      timerIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - trialStartRef.current;
        const remaining = Math.max(0, limitMs - elapsed);
        setTimeRemaining(remaining);
        if (remaining <= 0) {
          clearTimer();
          onExpire();
        }
      }, TIMER_TICK_MS);
    },
    [clearTimer]
  );

  const presentCommand = useCallback(
    async (command, { onExpire }) => {
      resolvedRef.current = false;
      selectionsRef.current = [];
      setSelections([]);
      const { board: newBoard } = TokenEngine.generateBoard(command);
      currentCommandRef.current = command;
      setBoard(newBoard);
      setSubPhase(SUB_PHASE.SPEAKING);
      setCommandText(command.text);
      await speak(command.text);
      setCommandText(null);
      setSubPhase(SUB_PHASE.RESPONDING);
      startResponseTimer(command.timeLimitMs, onExpire);
    },
    [startResponseTimer]
  );

  // ---- Practice (PRACTICE_ITEM_COUNT unscored items, one after another) ----
  const runPractice = useCallback(() => {
    // currentCommandRef.current still holds the PREVIOUS practice item at
    // this point (presentCommand below is what overwrites it) — null on the
    // very first item, exactly the "nothing to avoid repeating yet" case.
    const command = CommandEngine.generatePracticeItem(currentCommandRef.current);
    setPracticeFeedback(null);
    presentCommand(command, { onExpire: () => finalizePractice([], false) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presentCommand]);

  const finalizePractice = useCallback(
    (finalSelections, attempted) => {
      if (resolvedRef.current) return;
      resolvedRef.current = true;
      clearTimer();
      const validation = ValidationEngine.validateResponse(currentCommandRef.current, finalSelections, attempted);
      const reactionMs = Date.now() - trialStartRef.current;
      setPracticeFeedback(validation.correct ? "correct" : "incorrect");
      setSubPhase(SUB_PHASE.FEEDBACK);
      practiceResultsRef.current.push({ correct: validation.correct, reactionMs, attempted, errorType: validation.errorType });

      const wasLastPracticeItem = practiceIndexRef.current + 1 >= PRACTICE_ITEM_COUNT;
      setTimeout(() => {
        if (!wasLastPracticeItem) {
          practiceIndexRef.current += 1;
          resolvedRef.current = false;
          runPractice();
          return;
        }
        // All PRACTICE_ITEM_COUNT items reported together as one practice
        // round — same batched-report shape every other game already uses
        // for its own multi-trial practice, not one call per item.
        onPracticeComplete?.(practiceResultsRef.current);
        setIsPracticeStep(false);
        setPhase(PHASE.COUNTDOWN);
      }, 1200);
    },
    [clearTimer, onPracticeComplete, runPractice]
  );

  // ---- Scored session (9 commands) ----
  const finishSession = useCallback(
    (finalHistory) => {
      const finalReport = ReportBuilder.build({
        sessionId: sessionIdRef.current,
        patientId,
        trialHistory: finalHistory,
      });
      // Not part of the documented orchestrator shape above (ReportBuilder
      // stays exactly as-is) — tacked on so the contract adapter can build
      // per-trial GameResult.trials[] without reconstructing it from the
      // aggregate response_times/error_types arrays, which aren't
      // positionally aligned (error_types only has entries for wrong items).
      finalReport._trialHistory = finalHistory;
      setReport(finalReport);
      setPhase(PHASE.COMPLETED);
    },
    [patientId]
  );

  const runScoredTrial = useCallback(
    (index) => {
      const sequence = sessionCommandsRef.current;
      if (index >= sequence.length) return;
      const command = sequence[index];
      presentCommand(command, { onExpire: () => finalizeScoredTrial(index, [], false) });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [presentCommand]
  );

  const finalizeScoredTrial = useCallback(
    (index, finalSelections, attempted) => {
      if (resolvedRef.current) return;
      resolvedRef.current = true;
      clearTimer();
      const reactionMs = Date.now() - trialStartRef.current;
      const validation = ValidationEngine.validateResponse(currentCommandRef.current, finalSelections, attempted);

      const trialRecord = {
        level: currentCommandRef.current.level,
        type: currentCommandRef.current.type,
        reactionMs,
        attempted,
        correct: validation.correct,
        errorType: validation.errorType,
      };

      setTrialHistory((prev) => {
        const updated = [...prev, trialRecord];
        const nextIndex = index + 1;
        if (nextIndex >= sessionCommandsRef.current.length) {
          finishSession(updated);
        } else {
          setTrialIndex(nextIndex);
          runScoredTrial(nextIndex);
        }
        return updated;
      });
    },
    [clearTimer, finishSession, runScoredTrial]
  );

  const startAssessment = useCallback(() => {
    practiceIndexRef.current = 0;
    practiceResultsRef.current = [];
    setIsPracticeStep(true);
    setPhase(PHASE.PRACTICE);
    runPractice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Countdown 3-2-1-GO -> begin the 9-command scored session.
  useEffect(() => {
    if (phase !== PHASE.COUNTDOWN) return;
    setCountdownValue(3);
    let value = 3;
    const interval = setInterval(() => {
      value -= 1;
      if (value >= 1) {
        setCountdownValue(value);
      } else {
        clearInterval(interval);
        setCountdownValue(0);
        setTimeout(() => {
          sessionCommandsRef.current = CommandEngine.generateSessionCommands();
          sessionIdRef.current = generateSessionId();
          setTrialHistory([]);
          setTrialIndex(0);
          setPhase(PHASE.ASSESSMENT);
          runScoredTrial(0);
        }, 600);
      }
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const selectToken = useCallback(
    (token) => {
      if (subPhase !== SUB_PHASE.RESPONDING) return;
      if (resolvedRef.current) return;
      const command = currentCommandRef.current;
      const updated = [...selectionsRef.current, token];
      selectionsRef.current = updated;
      setSelections(updated);
      if (updated.length >= command.requiredSelections) {
        if (phase === PHASE.PRACTICE) finalizePractice(updated, true);
        else if (phase === PHASE.ASSESSMENT) finalizeScoredTrial(trialIndex, updated, true);
      }
    },
    [subPhase, phase, trialIndex, finalizePractice, finalizeScoredTrial]
  );

  const restart = useCallback(() => {
    cancelSpeech();
    clearTimer();
    resolvedRef.current = true;
    setPhase(PHASE.INSTRUCTIONS);
    setSubPhase(SUB_PHASE.IDLE);
    setBoard([]);
    setCommandText(null);
    setSelections([]);
    selectionsRef.current = [];
    setIsPracticeStep(true);
    setTrialIndex(0);
    setTrialHistory([]);
    setReport(null);
    setPracticeFeedback(null);
  }, [clearTimer]);

  return {
    phase,
    subPhase,
    board,
    selections,
    timeRemaining,
    timeLimit,
    progress: {
      current: phase === PHASE.PRACTICE ? practiceIndexRef.current + 1 : trialIndex + 1,
      total: phase === PHASE.PRACTICE ? PRACTICE_ITEM_COUNT : sessionCommandsRef.current.length || 9,
    },
    isPracticeStep,
    practiceFeedback,
    countdownValue,
    report,
    startAssessment,
    selectToken,
    restart,
  };
}

/* ============================================================
   PRESENTATION LAYER
   ============================================================ */

// Flat, solid-color shapes on white are the actual validated Token Test
// stimulus material (real plastic tokens, 2 shapes x 2 sizes x 5 colors) —
// changing color/shape rendering itself isn't "more realistic," it's less
// faithful to the instrument. What was genuinely flat/icon-like was the
// total absence of any depth cue: a drop shadow plus a subtle glossy
// highlight overlay below give these a physical, sitting-on-the-table feel
// without touching the base fill color or the shape's own silhouette —
// color and shape stay exactly as crisp and unambiguous as before.
function TokenGlyph({ color, shape, size }) {
  const dimension = size === "large" ? 52 : 32;
  const fill = COLOR_HEX[color] || "#999";
  const stroke = color === "white" ? "#c7cfd8" : "rgba(0,0,0,0.2)";
  const gradientId = useId();
  const shapeProps =
    shape === "circle"
      ? { tag: "circle", attrs: { cx: 50, cy: 50, r: 46 } }
      : { tag: "rect", attrs: { x: 6, y: 6, width: 88, height: 88, rx: 14 } };
  const Shape = shapeProps.tag;
  return (
    <svg
      width={dimension}
      height={dimension}
      viewBox="0 0 100 100"
      aria-hidden="true"
      style={{ filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.25))" }}
    >
      <defs>
        <radialGradient id={gradientId} cx="32%" cy="26%" r="80%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.65" />
          <stop offset="45%" stopColor="#ffffff" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.18" />
        </radialGradient>
      </defs>
      <Shape {...shapeProps.attrs} fill={fill} stroke={stroke} strokeWidth="3" />
      <Shape {...shapeProps.attrs} fill={`url(#${gradientId})`} />
    </svg>
  );
}

function TokenBoard({ board, selections, onSelect, disabled }) {
  const sorted = [...board].sort((a, b) => a.position - b.position);
  const selectedIds = new Set(selections.map((t) => t.id));
  return (
    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
      {sorted.map((token) => {
        const isSelected = selectedIds.has(token.id);
        return (
          <div key={token.id} className="aspect-square rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center">
            <button
              type="button"
              onClick={() => onSelect(token)}
              disabled={disabled}
              aria-label={`${token.size} ${token.color} ${token.shape}`}
              aria-pressed={isSelected}
              className={`w-full h-full flex items-center justify-center rounded-xl transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-700 ${
                isSelected ? "ring-2 ring-blue-700" : ""
              }`}
            >
              <TokenGlyph color={token.color} shape={token.shape} size={token.size} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

function InstructionScreen({ onStart }) {
  const rules = [
    "Each instruction is spoken aloud one time only — there is no replay.",
    "The written instruction is never shown while you respond, so listen carefully.",
    "Respond as promptly as you comfortably can — there's no need to rush.",
    "You'll complete 3 practice items first, which are not scored.",
  ];
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 sm:p-10">
      <p className="text-xs font-semibold tracking-widest uppercase text-blue-700 mb-2">
        Temporal Lobe · Auditory &amp; Language Comprehension
      </p>
      <h1 className="text-3xl font-bold text-slate-900 mb-3">Token Test</h1>
      <p className="text-slate-600 leading-relaxed mb-6">
        This short activity asks you to touch tokens on the board in response to spoken
        instructions, starting simple and gradually adding steps.
      </p>
      <ul className="grid gap-3 mb-8">
        {rules.map((rule, i) => (
          <li key={i} className="flex gap-3 items-start bg-slate-50 rounded-lg px-4 py-3 text-sm text-slate-600">
            <span className="mt-1.5 w-2 h-2 rounded-full bg-blue-400 flex-none" />
            {rule}
          </li>
        ))}
      </ul>
      <button
        onClick={onStart}
        className="rounded-full bg-blue-700 text-white font-semibold px-8 py-4 shadow-lg shadow-blue-700/20 hover:bg-blue-800 transition-colors"
      >
        Start Assessment
      </button>
    </div>
  );
}

function TrialScreen({ isPractice, progress, subPhase, board, selections, onSelect, timeRemaining, timeLimit, feedback }) {
  const isSpeaking = subPhase === "speaking";
  const isResponding = subPhase === "responding";
  const timerPct = timeLimit > 0 ? Math.max(0, (timeRemaining / timeLimit) * 100) : 100;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 sm:p-10">
      {isPractice && (
        <span className="inline-block text-xs font-bold tracking-widest uppercase bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full mb-5">
          Practice — not scored
        </span>
      )}
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-semibold text-slate-500">
          {isPractice ? "Practice item" : "Item"} {progress.current} of {progress.total}
        </span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden mb-6">
        <div
          className="h-full bg-blue-600 rounded-full transition-all"
          style={{ width: `${(progress.current / progress.total) * 100}%` }}
        />
      </div>

      {isSpeaking && (
        <div className="flex flex-col items-center justify-center gap-4 py-16">
          <div className="w-16 h-16 rounded-full bg-blue-600 animate-pulse" />
          <p className="text-sm font-semibold text-slate-500">Listen carefully — playing once</p>
        </div>
      )}

      {isResponding && (
        <>
          <div className="w-full h-1 rounded-full bg-slate-100 overflow-hidden mb-6">
            <div className="h-full bg-blue-400 rounded-full" style={{ width: `${timerPct}%`, transition: "width 100ms linear" }} />
          </div>
          <TokenBoard board={board} selections={selections} onSelect={onSelect} disabled={!isResponding} />
        </>
      )}

      {feedback && (
        <div
          className={`text-center font-semibold rounded-lg mt-5 py-3.5 ${
            feedback === "correct" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
          }`}
        >
          {feedback === "correct" ? "Correct" : "Not quite — here's how it works"}
        </div>
      )}
    </div>
  );
}

function CountdownScreen({ value }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 sm:p-10">
      <div className="flex items-center justify-center min-h-[280px]">
        <span key={value} className="text-8xl font-extrabold text-blue-700">
          {value > 0 ? value : "GO"}
        </span>
      </div>
    </div>
  );
}

function ResponseTimeStrip({ report }) {
  const max = Math.max(...report.response_times, 1);
  return (
    <div className="flex items-end gap-1.5 h-20 bg-slate-50 rounded-xl border border-slate-200 px-4 py-3">
      {report.response_times.map((ms, i) => (
        <div key={i} className="flex-1 flex flex-col items-center justify-end h-full" title={`${ms}ms`}>
          <div
            className="w-full rounded-t bg-blue-500"
            style={{ height: `${Math.max(6, (ms / max) * 100)}%` }}
          />
        </div>
      ))}
    </div>
  );
}

function JsonBlock({ report }) {
  const [copied, setCopied] = useState(false);
  const jsonText = JSON.stringify(report, null, 2);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard may be unavailable in some sandboxed contexts
    }
  };

  return (
    <div className="bg-slate-900 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-800">
        <span className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Orchestrator output</span>
        <button
          onClick={handleCopy}
          className="text-xs font-semibold text-slate-200 bg-slate-700 hover:bg-slate-600 rounded-full px-3 py-1 transition-colors"
        >
          {copied ? "Copied" : "Copy JSON"}
        </button>
      </div>
      <pre className="text-xs text-emerald-300 p-4 overflow-x-auto leading-relaxed">{jsonText}</pre>
    </div>
  );
}

function CompletionScreen({ report, onRestart }) {
  if (!report) return null;
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 sm:p-10">
      <p className="text-xs font-semibold tracking-widest uppercase text-blue-700 mb-2">Session Complete</p>
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Token Test Results</h1>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-slate-50 rounded-xl border border-slate-200 px-4 py-4 text-center">
          <div className="text-2xl font-bold text-slate-900">{report.raw_score}/{report.max_score}</div>
          <div className="text-xs text-slate-500 uppercase tracking-wide mt-1">Raw score</div>
        </div>
        <div className="bg-slate-50 rounded-xl border border-slate-200 px-4 py-4 text-center">
          <div className="text-2xl font-bold text-slate-900">{Math.round(report.accuracy * 100)}%</div>
          <div className="text-xs text-slate-500 uppercase tracking-wide mt-1">Accuracy</div>
        </div>
        <div className="bg-slate-50 rounded-xl border border-slate-200 px-4 py-4 text-center">
          <div className="text-2xl font-bold text-slate-900">{report.items_skipped}</div>
          <div className="text-xs text-slate-500 uppercase tracking-wide mt-1">No response</div>
        </div>
      </div>

      <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-2">Response times per item</h2>
      <div className="mb-6">
        <ResponseTimeStrip report={report} />
      </div>

      <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-2">Raw JSON (for orchestrator verification)</h2>
      <div className="mb-8">
        <JsonBlock report={report} />
      </div>

      <button
        onClick={onRestart}
        className="rounded-full bg-blue-700 text-white font-semibold px-8 py-3.5 shadow-lg shadow-blue-700/20 hover:bg-blue-800 transition-colors"
      >
        Run Another Session
      </button>
    </div>
  );
}

/* ============================================================
   APP
   ============================================================ */

/* ============================ Contract adapter ==============================
   See src/features/games/weekly/token-test/adapter.js for the mount/unmount
   wrapper this component gets rendered through. */
function toContractTrials(trialHistory) {
  return (trialHistory || []).map((t) => ({
    responseTimeMs: t.reactionMs,
    correct: t.correct,
    errorType: t.correct ? undefined : t.errorType,
  }));
}

export default function TokenTestGame({ config, onComplete, onPracticeComplete }) {
  const t = useTokenTest({
    patientId: undefined,
    onPracticeComplete: (practiceTrials) =>
      onPracticeComplete?.({ score: null, trials: toContractTrials(practiceTrials) }),
  });

  useEffect(() => {
    if (t.phase === PHASE.COMPLETED && t.report) {
      onComplete?.({
        score: t.report.raw_score,
        trials: toContractTrials(t.report._trialHistory),
        rawLog: t.report,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t.phase, t.report]);
  void config;

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-50 to-blue-50 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        {t.phase === PHASE.INSTRUCTIONS && <InstructionScreen onStart={t.startAssessment} />}

        {t.phase === PHASE.PRACTICE && (
          <TrialScreen
            isPractice
            progress={t.progress}
            subPhase={t.subPhase}
            board={t.board}
            selections={t.selections}
            onSelect={t.selectToken}
            timeRemaining={t.timeRemaining}
            timeLimit={t.timeLimit}
            feedback={t.practiceFeedback}
          />
        )}

        {t.phase === PHASE.COUNTDOWN && <CountdownScreen value={t.countdownValue} />}

        {t.phase === PHASE.ASSESSMENT && (
          <TrialScreen
            isPractice={false}
            progress={t.progress}
            subPhase={t.subPhase}
            board={t.board}
            selections={t.selections}
            onSelect={t.selectToken}
            timeRemaining={t.timeRemaining}
            timeLimit={t.timeLimit}
          />
        )}

        {t.phase === PHASE.COMPLETED && <CompletionScreen report={t.report} onRestart={t.restart} />}
      </div>
    </div>
  );
}
