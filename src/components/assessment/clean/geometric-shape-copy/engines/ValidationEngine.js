// ValidationEngine
// -----------------------------------------------------------------------------
// Single responsibility: decide whether a completed attempt at a figure is a
// valid, scoreable attempt, or should be recorded as a non-response. Contains
// no drawing-quality judgement (that is GeometryAnalysisEngine's job) -- only
// structural validity checks.

const MIN_TOTAL_POINTS = 3; // fewer than this is almost certainly an accidental tap

export const ValidationEngine = {
  // strokes: array of stroke arrays of {x,y,t}. timedOut: whether the
  // per-figure or master session timer expired before submission.
  validateAttempt(strokes, timedOut) {
    const totalPoints = (strokes || []).reduce((sum, s) => sum + (s ? s.length : 0), 0);
    const hasAnyStroke = (strokes || []).some((s) => s && s.length > 1);

    if (!hasAnyStroke && timedOut) {
      return { valid: false, timedOut: true, reason: 'not_administered_or_no_response' };
    }
    if (!hasAnyStroke) {
      return { valid: false, timedOut: false, reason: 'no_strokes_submitted' };
    }
    if (totalPoints < MIN_TOTAL_POINTS) {
      return { valid: false, timedOut: !!timedOut, reason: 'insufficient_input' };
    }
    return { valid: true, timedOut: !!timedOut, reason: null };
  }
};
