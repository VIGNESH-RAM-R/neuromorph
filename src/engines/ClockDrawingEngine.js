import { clampScore } from './assessmentScoringUtils.js';
import { CLOCK_TARGET_TIME, CLOCK_TOLERANCE } from '../config/clockDrawingConfig.js';

// All angle math here is pure degrees-in, score-out -- the component is
// responsible for turning a tap's (x, y) into a clock-angle (0deg = 12
// o'clock, clockwise) before calling this, which keeps this engine
// Node-testable with no DOM/geometry dependency.
function expectedAngles(target) {
  const minuteAngle = target.minute * 6;
  const hourAngle = (target.hour % 12) * 30 + target.minute * 0.5;
  return { hourAngle, minuteAngle };
}

// Shortest angular distance between two angles on a 360-degree circle.
function angularError(a, b) {
  const diff = Math.abs(a - b) % 360;
  return diff > 180 ? 360 - diff : diff;
}

function angleToScore(error, tolerance) {
  if (error <= tolerance.fullCreditDegrees) return 100;
  if (error >= tolerance.zeroCreditDegrees) return 0;
  const fraction = 1 - (error - tolerance.fullCreditDegrees) / (tolerance.zeroCreditDegrees - tolerance.fullCreditDegrees);
  return clampScore(fraction * 100);
}

export const ClockDrawingEngine = {
  // placedAngles: { hourAngle, minuteAngle } in degrees, as tapped by the user.
  score(placedAngles, target = CLOCK_TARGET_TIME, tolerance = CLOCK_TOLERANCE) {
    const expected = expectedAngles(target);
    const hourError = angularError(placedAngles.hourAngle, expected.hourAngle);
    const minuteError = angularError(placedAngles.minuteAngle, expected.minuteAngle);

    const hourScore = angleToScore(hourError, tolerance);
    const minuteScore = angleToScore(minuteError, tolerance);
    const score = clampScore((hourScore + minuteScore) / 2);

    return { score, hourError, minuteError, hourScore, minuteScore };
  },
};
