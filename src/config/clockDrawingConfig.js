// "Ten past ten" is the standard instruction used in real-world Clock
// Drawing Tests (it's chosen clinically because it produces two
// well-separated hands, making omissions/errors easy to see) -- kept here
// rather than inventing a different time.
export const CLOCK_TARGET_TIME = { hour: 10, minute: 10 };

export const CLOCK_TOLERANCE = {
  fullCreditDegrees: 10, // angular error at/under this = full credit for that hand
  zeroCreditDegrees: 60, // angular error at/over this = zero credit for that hand
};
