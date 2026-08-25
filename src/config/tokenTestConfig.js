// Token Test -- teammate's new module (2026-08-11 integration, not part of
// the original 12-task catalogue). Temporal-lobe auditory/language
// comprehension: the participant touches tokens on a board in response to
// a spoken instruction of increasing complexity (single attribute -> two
// attributes -> multi-step sequence or conditional).
export const TOKEN_COLORS = ['red', 'blue', 'green', 'yellow', 'white'];
export const TOKEN_SHAPES = ['circle', 'square'];
export const TOKEN_SIZES = ['large', 'small'];
export const TOKEN_BOARD_SIZE = 10; // visible tokens per trial (kept small on purpose)

export const TOKEN_COLOR_HEX = {
  red: '#c1443a',
  blue: '#2f6db5',
  green: '#2f8f5b',
  yellow: '#d9a521',
  white: '#f4f4f4',
};

export const TOKEN_TIME_LIMIT_MS = { easy: 20000, medium: 22000, hard: 28000 };
