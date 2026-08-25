/**
 * Pre-session data validation for Image Pairs (spec section 53). The
 * assessment must never start on a malformed deck — invalid decks fail
 * fast with a descriptive error list rather than presenting a broken task.
 */
export function validateDeck(cards, expectedTotalPairs) {
  const errors = [];

  if (!Array.isArray(cards)) {
    return { valid: false, errors: ['deck is not an array'] };
  }

  const expectedTotalCards = expectedTotalPairs * 2;
  if (cards.length !== expectedTotalCards) {
    errors.push(`expected ${expectedTotalCards} cards, found ${cards.length}`);
  }

  const cardIds = cards.map((c) => c.cardId);
  if (new Set(cardIds).size !== cardIds.length) {
    errors.push('duplicate cardId values found');
  }

  const counts = new Map();
  cards.forEach((c) => counts.set(c.stimulusId, (counts.get(c.stimulusId) || 0) + 1));

  const uniqueStimuli = [...counts.keys()];
  if (uniqueStimuli.length !== expectedTotalPairs) {
    errors.push(`expected ${expectedTotalPairs} unique stimuli, found ${uniqueStimuli.length}`);
  }

  const notExactlyTwo = uniqueStimuli.filter((id) => counts.get(id) !== 2);
  if (notExactlyTwo.length > 0) {
    errors.push(`stimuli not occurring exactly twice: ${notExactlyTwo.join(', ')}`);
  }

  const missingIconOrLabel = cards.filter((c) => !c.iconId || !c.label);
  if (missingIconOrLabel.length > 0) {
    errors.push(`${missingIconOrLabel.length} card(s) missing iconId/label`);
  }

  return { valid: errors.length === 0, errors };
}

/** Confirms the stimulus set itself (before deck-building) has no gaps. */
export function validateStimulusSet(stimuli) {
  const errors = [];
  if (!Array.isArray(stimuli) || stimuli.length === 0) {
    return { valid: false, errors: ['stimulus set is empty'] };
  }
  const ids = stimuli.map((s) => s.stimulusId);
  if (new Set(ids).size !== ids.length) errors.push('duplicate stimulusId values in stimulus set');
  const missingIcon = stimuli.filter((s) => !s.iconId);
  if (missingIcon.length > 0) errors.push('one or more stimuli missing iconId');
  return { valid: errors.length === 0, errors };
}
