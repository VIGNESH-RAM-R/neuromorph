/**
 * Pure, framework-free state machine for Image Pairs. Holds no timers and
 * touches no DOM/React — every transition is a plain function of
 * (state, input) -> state, so the assessment logic (card selection,
 * matching, completion) can be unit-tested and validated independently of
 * the UI (spec sections 50-51). `hooks/useImagePairsEngine.js` is the thin
 * React wrapper that owns timers and calls into this file.
 *
 * Phases: idle -> playing -> evaluating -> playing (...) -> complete.
 * "evaluating" is the brief window between a second card being flipped and
 * the UI-driven reveal delay resolving it (resolveEvaluation) — no new
 * card selection is accepted while evaluating, which is what prevents a
 * third card being selected mid-evaluation (spec section 15).
 */

/** Builds the initial (pre-start) state for a deck of cards. */
export function createInitialState(deckCards, totalPairs) {
  return {
    phase: 'idle', // idle | playing | evaluating | complete
    cards: deckCards.map((c) => ({ ...c, status: 'hidden' })),
    firstSelection: null,
    secondSelection: null,
    matchedPairs: 0,
    totalPairs,
    incorrectAttempts: 0,
    cardSelections: 0,
    pairDecisions: [],
    cardEvents: [],
    startTime: null,
    endTime: null,
    completionReason: null, // null | 'ALL_MATCHED' | 'TIME_EXPIRED' | 'INTERRUPTED'
  };
}

/** Transitions idle -> playing and records the authoritative start timestamp. */
export function startGame(state, timestamp) {
  return { ...state, phase: 'playing', startTime: timestamp };
}

/**
 * Applies a card selection. Returns `{ state, justEvaluated }`.
 *
 * Invalid selections (wrong phase, unknown card, or a card that is not
 * currently `hidden` — already revealed/matched) are a strict no-op: the
 * exact same `state` reference is returned so callers can cheaply detect
 * "nothing happened" via `next === state`. This single guard is what
 * prevents re-selecting the same card, re-selecting a matched card, and
 * selecting a third card while a pair is mid-evaluation (spec section 15).
 */
export function selectCard(state, cardId, timestamp) {
  if (state.phase !== 'playing') return { state, justEvaluated: null };

  const card = state.cards.find((c) => c.cardId === cardId);
  if (!card || card.status !== 'hidden') return { state, justEvaluated: null };

  const cards = state.cards.map((c) => (c.cardId === cardId ? { ...c, status: 'revealed' } : c));
  const cardEvent = {
    eventIndex: state.cardEvents.length + 1,
    cardId: card.cardId,
    stimulusId: card.stimulusId,
    position: card.position,
    timestamp,
    selectionRole: state.firstSelection ? 'second' : 'first',
  };
  const cardEvents = [...state.cardEvents, cardEvent];
  const cardSelections = state.cardSelections + 1;

  if (!state.firstSelection) {
    return {
      state: {
        ...state,
        cards,
        firstSelection: { cardId: card.cardId, stimulusId: card.stimulusId, timestamp },
        cardEvents,
        cardSelections,
      },
      justEvaluated: null,
    };
  }

  const first = state.firstSelection;
  const correct = first.stimulusId === card.stimulusId;
  const decisionTimeMs = timestamp - first.timestamp;
  const pairDecision = {
    pairIndex: state.pairDecisions.length + 1,
    firstCardId: first.cardId,
    firstStimulusId: first.stimulusId,
    firstTimestamp: first.timestamp,
    secondCardId: card.cardId,
    secondStimulusId: card.stimulusId,
    secondTimestamp: timestamp,
    correct,
    decisionTimeMs,
  };

  const nextState = {
    ...state,
    cards,
    secondSelection: { cardId: card.cardId, stimulusId: card.stimulusId, timestamp },
    phase: 'evaluating',
    pairDecisions: [...state.pairDecisions, pairDecision],
    matchedPairs: state.matchedPairs + (correct ? 1 : 0),
    incorrectAttempts: state.incorrectAttempts + (correct ? 0 : 1),
    cardEvents,
    cardSelections,
  };

  return { state: nextState, justEvaluated: { correct, pairIndex: pairDecision.pairIndex } };
}

/**
 * Resolves a pending evaluation after the UI's brief reveal delay: locks
 * matched cards as `matched`, or flips mismatched cards back to `hidden`.
 * Transitions to `complete` (`completionReason: 'ALL_MATCHED'`) once every
 * pair has been found. No-ops (returns state unchanged) if there is
 * nothing pending to resolve — e.g. the timer already ended the session.
 */
export function resolveEvaluation(state, correct, timestamp) {
  if (state.phase !== 'evaluating') return state;

  const ids = [state.firstSelection?.cardId, state.secondSelection?.cardId].filter(Boolean);
  const cards = state.cards.map((c) => (ids.includes(c.cardId) ? { ...c, status: correct ? 'matched' : 'hidden' } : c));

  const allMatched = state.matchedPairs >= state.totalPairs;

  return {
    ...state,
    cards,
    firstSelection: null,
    secondSelection: null,
    phase: allMatched ? 'complete' : 'playing',
    completionReason: allMatched ? 'ALL_MATCHED' : state.completionReason,
    endTime: allMatched ? timestamp : state.endTime,
  };
}

/** Ends the session because the maximum duration elapsed. No-op if already complete. */
export function expireTime(state, timestamp) {
  if (state.phase === 'complete') return state;
  return { ...state, phase: 'complete', completionReason: 'TIME_EXPIRED', endTime: timestamp };
}

/** Ends the session because it was interrupted (tab hidden, exit control). No-op if already complete. */
export function interruptGame(state, timestamp) {
  if (state.phase === 'complete') return state;
  return { ...state, phase: 'complete', completionReason: 'INTERRUPTED', endTime: timestamp };
}
