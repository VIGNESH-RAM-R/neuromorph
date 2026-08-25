// Fixed set of applied-calculation problems, mixing plain arithmetic with
// money word problems (the classic "applied calculation" format used in
// real cognitive screens). Every `answer` is exact so scoring never needs
// fuzzy matching -- just numeric comparison after rounding to 2 decimals.
export const CALCULATION_PROBLEMS = [
  { id: 'p1', prompt: 'What is 17 + 25?', answer: 42 },
  { id: 'p2', prompt: 'What is 9 x 6?', answer: 54 },
  { id: 'p3', prompt: 'You have $10.85. You spend $3.40. How much is left?', answer: 7.45 },
  { id: 'p4', prompt: 'What is 100 - 37?', answer: 63 },
  { id: 'p5', prompt: 'A shirt costs $18 and is on sale for half price. What does it cost now?', answer: 9 },
];
