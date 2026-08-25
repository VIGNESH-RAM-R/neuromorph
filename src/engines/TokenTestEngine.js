import { TOKEN_COLORS, TOKEN_SHAPES, TOKEN_SIZES, TOKEN_BOARD_SIZE, TOKEN_TIME_LIMIT_MS } from '../config/tokenTestConfig.js';
import { round1 } from './mathUtils.js';

// Teammate's Token Test implementation (2026-08-11 integration), adapted
// into this app's engine/config/component convention. Trial/board
// generation, command generation, response validation, and scoring are all
// pure here (Node-testable, no DOM); TokenTestTask.jsx owns only
// presentation, speech playback, and per-trial timing.

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
  for (const size of TOKEN_SIZES) {
    for (const color of TOKEN_COLORS) {
      for (const shape of TOKEN_SHAPES) {
        tokens.push({ id: `tok-${id++}`, color, shape, size });
      }
    }
  }
  return tokens;
}
// Attribute match ignores size entirely -- commands only ever specify
// color and/or shape, per the difficulty definitions below.
function tokenMatchesStep(token, step) {
  if (step.color && token.color !== step.color) return false;
  if (step.shape && token.shape !== step.shape) return false;
  return true;
}

function buildConditionalBoard(command, fullSet, boardSize) {
  const conditionPresent = Math.random() < 0.5;
  const targetStep = conditionPresent ? command.then : command.else;
  const usedIds = new Set();
  const required = [];

  const targetToken = randomFrom(fullSet.filter((t) => tokenMatchesStep(t, targetStep)));
  required.push(targetToken);
  usedIds.add(targetToken.id);

  if (conditionPresent) {
    const condCandidates = fullSet.filter((t) => tokenMatchesStep(t, command.condition) && !usedIds.has(t.id));
    const condPool = condCandidates.length ? condCandidates : fullSet.filter((t) => tokenMatchesStep(t, command.condition));
    const condToken = randomFrom(condPool);
    required.push(condToken);
    usedIds.add(condToken.id);
  }

  let remainingPool = fullSet.filter((t) => !usedIds.has(t.id));
  if (!conditionPresent) {
    remainingPool = remainingPool.filter((t) => !tokenMatchesStep(t, command.condition));
  }

  const distractorCount = Math.max(0, boardSize - required.length);
  const distractors = shuffle(remainingPool).slice(0, distractorCount);
  const boardTokens = shuffle([...required, ...distractors]);
  const positions = shuffle([...Array(boardTokens.length).keys()]);
  const board = boardTokens.map((t, i) => ({ ...t, position: positions[i] }));

  return { board, resolvedStep: targetStep, conditionPresent };
}

export const TokenEngine = {
  /**
   * Builds a reduced-size board (boardSize tokens, not the full 20) for a
   * given command, guaranteeing the board is always answerable.
   */
  generateBoard(command, boardSize = TOKEN_BOARD_SIZE) {
    const fullSet = buildFullTokenSet();
    if (command.type === 'conditional') return buildConditionalBoard(command, fullSet, boardSize);

    const usedIds = new Set();
    const required = [];
    const stepList = command.type === 'sequential' ? command.steps : [command.step];

    for (const step of stepList) {
      const candidates = fullSet.filter((t) => tokenMatchesStep(t, step) && !usedIds.has(t.id));
      const pool = candidates.length ? candidates : fullSet.filter((t) => tokenMatchesStep(t, step));
      const pick = randomFrom(pool);
      required.push(pick);
      usedIds.add(pick.id);
    }

    const remainingPool = fullSet.filter((t) => !usedIds.has(t.id));
    const distractorCount = Math.max(0, boardSize - required.length);
    const distractors = shuffle(remainingPool).slice(0, distractorCount);
    const boardTokens = shuffle([...required, ...distractors]);
    const positions = shuffle([...Array(boardTokens.length).keys()]);
    const board = boardTokens.map((t, i) => ({ ...t, position: positions[i] }));

    return { board, resolvedStep: null };
  },
};

function stepPhrase(step) {
  const parts = [];
  if (step.color) parts.push(step.color);
  parts.push(step.shape ? step.shape : 'token');
  const article = /^[aeiou]/i.test(parts[0]) ? 'an' : 'the';
  return `${article} ${parts.join(' ')}`;
}

function distinctColorShapePair(exclude) {
  let pair;
  do {
    pair = { color: randomFrom(TOKEN_COLORS), shape: randomFrom(TOKEN_SHAPES) };
  } while (exclude.some((p) => p.color === pair.color && p.shape === pair.shape));
  return pair;
}

function generateEasyCommand() {
  const step = { color: randomFrom(TOKEN_COLORS) };
  return { id: `cmd-${Math.random().toString(36).slice(2, 8)}`, level: 'easy', type: 'single', step, text: `Touch ${stepPhrase(step)}.`, requiredSelections: 1, timeLimitMs: TOKEN_TIME_LIMIT_MS.easy };
}
function generateMediumCommand() {
  const step = { color: randomFrom(TOKEN_COLORS), shape: randomFrom(TOKEN_SHAPES) };
  return { id: `cmd-${Math.random().toString(36).slice(2, 8)}`, level: 'medium', type: 'single', step, text: `Touch ${stepPhrase(step)}.`, requiredSelections: 1, timeLimitMs: TOKEN_TIME_LIMIT_MS.medium };
}
function generateHardSequentialCommand() {
  const step1 = { color: randomFrom(TOKEN_COLORS), shape: randomFrom(TOKEN_SHAPES) };
  const step2 = distinctColorShapePair([step1]);
  const connective = randomFrom(['and then touch', 'then touch']);
  return { id: `cmd-${Math.random().toString(36).slice(2, 8)}`, level: 'hard', type: 'sequential', steps: [step1, step2], text: `Touch ${stepPhrase(step1)} ${connective} ${stepPhrase(step2)}.`, requiredSelections: 2, timeLimitMs: TOKEN_TIME_LIMIT_MS.hard };
}
function generateHardConditionalCommand() {
  const condition = { color: randomFrom(TOKEN_COLORS), shape: randomFrom(TOKEN_SHAPES) };
  const thenStep = distinctColorShapePair([condition]);
  const elseStep = distinctColorShapePair([condition, thenStep]);
  return { id: `cmd-${Math.random().toString(36).slice(2, 8)}`, level: 'hard', type: 'conditional', condition, then: thenStep, else: elseStep, text: `If there is ${stepPhrase(condition)} on the board, touch ${stepPhrase(thenStep)}. Otherwise, touch ${stepPhrase(elseStep)}.`, requiredSelections: 1, timeLimitMs: TOKEN_TIME_LIMIT_MS.hard };
}

export const CommandEngine = {
  // Exactly one unscored practice item -- easy tier, for orientation only.
  generatePracticeItem() {
    return generateEasyCommand();
  },
  // 9 scored commands, ascending difficulty: 3 easy, 3 medium, 3 hard.
  // Hard items are a random mix of sequential and conditional.
  generateSessionCommands() {
    const hardItems = Array.from({ length: 3 }, () => (Math.random() < 0.5 ? generateHardSequentialCommand() : generateHardConditionalCommand()));
    return [...Array.from({ length: 3 }, generateEasyCommand), ...Array.from({ length: 3 }, generateMediumCommand), ...hardItems];
  },
};

function validateSingleOrConditional(step, selections, attempted) {
  if (!attempted || !selections[0]) return { correct: false, errorType: 'no_response' };
  const token = selections[0];
  const colorWrong = !!step.color && token.color !== step.color;
  const shapeWrong = !!step.shape && token.shape !== step.shape;
  const wrongCount = [colorWrong, shapeWrong].filter(Boolean).length;
  if (wrongCount === 0) return { correct: true, errorType: null };
  if (wrongCount > 1) return { correct: false, errorType: 'missed_component' };
  return { correct: false, errorType: colorWrong ? 'wrong_color' : 'wrong_shape' };
}
function validateSequential(steps, selections, attempted) {
  if (!attempted || selections.length === 0) return { correct: false, errorType: 'no_response' };
  if (selections.length < steps.length) return { correct: false, errorType: 'missed_component' };
  let inOrder = true;
  for (let i = 0; i < steps.length; i++) {
    if (!tokenMatchesStep(selections[i], steps[i])) { inOrder = false; break; }
  }
  if (inOrder) return { correct: true, errorType: null };
  const rightTokensWrongOrder = steps.every((step) => selections.some((t) => tokenMatchesStep(t, step)));
  return { correct: false, errorType: rightTokensWrongOrder ? 'wrong_sequence' : 'missed_component' };
}

export const ValidationEngine = {
  // error_types vocabulary (one entry per WRONG scored item only):
  // wrong_color | wrong_shape | wrong_sequence | missed_component | no_response
  validateResponse(command, selections, attempted) {
    if (command.type === 'sequential') return validateSequential(command.steps, selections, attempted);
    if (command.type === 'conditional') return validateSingleOrConditional(command.resolvedStep, selections, attempted);
    return validateSingleOrConditional(command.step, selections, attempted);
  },
};

export const TokenTestEngine = {
  // trialHistory: [{ level, type, reactionMs, attempted, correct, errorType }]
  // (one entry per SCORED command only -- the single practice item never
  // contributes here).
  score(trialHistory = []) {
    const max_score = trialHistory.length;
    if (max_score === 0) {
      return { score: 0, raw_score: 0, max_score: 0, accuracy: 0, response_times: [], error_types: [], items_attempted: 0, items_skipped: 0 };
    }
    const raw_score = trialHistory.filter((t) => t.correct).length;
    const accuracy = raw_score / max_score;
    const response_times = trialHistory.map((t) => Math.round(t.reactionMs));
    const error_types = trialHistory.filter((t) => !t.correct).map((t) => t.errorType);
    const items_attempted = trialHistory.filter((t) => t.attempted).length;
    const items_skipped = trialHistory.filter((t) => !t.attempted).length;

    return {
      score: round1(accuracy * 100), // alias so the standard onSubmit({score, raw}) call site works unchanged
      raw_score,
      max_score,
      accuracy: Math.round(accuracy * 10000) / 10000,
      response_times,
      error_types,
      items_attempted,
      items_skipped,
      byLevel: {
        easy: trialHistory.filter((t) => t.level === 'easy' && t.correct).length,
        medium: trialHistory.filter((t) => t.level === 'medium' && t.correct).length,
        hard: trialHistory.filter((t) => t.level === 'hard' && t.correct).length,
      },
    };
  },
};
