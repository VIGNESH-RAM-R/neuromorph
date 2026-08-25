import { GAME_CATEGORIES } from '../config/gamesConfig.js';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

// A different offset per category so Memory/Reaction/Attention don't all
// flip to their "other" game on the exact same calendar day -- purely
// cosmetic variety, not load-bearing for anything else.
const CATEGORY_OFFSETS = { memory: 0, reaction: 1, attention: 2 };

function epochDayNumber(dateIso) {
  // dateIso is a plain 'YYYY-MM-DD' string -- parsed as UTC midnight so this
  // is stable regardless of the caller's local timezone.
  return Math.floor(new Date(`${dateIso}T00:00:00Z`).getTime() / MS_PER_DAY);
}

// Deterministic (never Math.random) day-to-sub-game picker: the same
// category + calendar date always resolves to the same sub-game, so a
// patient who reloads mid-day never sees the "other" one, and this stays
// trivially unit-testable. Each category cycles through its own 2-game
// pool independently.
export const DailyGameRotationEngine = {
  todaysGame(categoryId, dateIso) {
    const category = GAME_CATEGORIES.find((c) => c.id === categoryId);
    if (!category || !category.subGames || category.subGames.length === 0 || !dateIso) return undefined;
    const offset = CATEGORY_OFFSETS[categoryId] ?? 0;
    const index = (epochDayNumber(dateIso) + offset) % category.subGames.length;
    return category.subGames[index];
  },

  // Convenience: today's pick for all 3 rotating categories at once, keyed
  // by category id -- what SelfModel actually calls.
  todaysPicks(dateIso) {
    const picks = {};
    for (const category of GAME_CATEGORIES) {
      picks[category.id] = this.todaysGame(category.id, dateIso);
    }
    return picks;
  },
};
