// DrawingEngine
// -----------------------------------------------------------------------------
// Single responsibility: capture freehand drawing input (mouse, touch, stylus)
// as timestamped stroke data. Contains NO comparison, scoring, or shape
// recognition -- that lives entirely in GeometryAnalysisEngine. This engine
// only records what physically happened on the canvas.
//
// A "stroke" is one continuous pen-down-to-pen-up path: an array of
// { x, y, t } points. A drawing session is an ordered list of strokes.

export class DrawingEngine {
  constructor() {
    this.reset();
  }

  reset() {
    this.strokes = [];
    this.currentStroke = null;
    this.figureStartTime = null; // when the reference figure was first shown
    this.firstStrokeTime = null; // timestamp of the very first drawn point
  }

  // Call when a new figure is displayed, before any input is accepted.
  startFigure() {
    this.reset();
    this.figureStartTime = performance.now();
  }

  beginStroke(x, y) {
    const t = performance.now();
    if (this.firstStrokeTime === null) this.firstStrokeTime = t;
    this.currentStroke = [{ x, y, t }];
  }

  extendStroke(x, y) {
    if (!this.currentStroke) return;
    this.currentStroke.push({ x, y, t: performance.now() });
  }

  endStroke() {
    if (!this.currentStroke) return;
    if (this.currentStroke.length > 1) this.strokes.push(this.currentStroke);
    this.currentStroke = null;
  }

  // Strokes committed so far, including the one currently being drawn (for
  // live canvas rendering while the pointer is still down).
  getStrokes() {
    return this.currentStroke ? [...this.strokes, this.currentStroke] : this.strokes;
  }

  getStrokeCount() {
    return this.strokes.length;
  }

  // Planning time: latency between the figure appearing and the first point drawn.
  getPlanningTimeMs() {
    if (this.firstStrokeTime === null || this.figureStartTime === null) return null;
    return this.firstStrokeTime - this.figureStartTime;
  }

  // Total path length across all committed strokes, in canvas pixels.
  getTotalPathLength() {
    let total = 0;
    for (const stroke of this.strokes) {
      for (let i = 1; i < stroke.length; i++) {
        const dx = stroke[i].x - stroke[i - 1].x;
        const dy = stroke[i].y - stroke[i - 1].y;
        total += Math.sqrt(dx * dx + dy * dy);
      }
    }
    return total;
  }

  // Sum of each stroke's own duration (pen-down to pen-up) -- "active" drawing
  // time, deliberately excluding the gaps between strokes.
  getActiveDrawingDurationMs() {
    let total = 0;
    for (const stroke of this.strokes) {
      if (stroke.length > 1) total += stroke[stroke.length - 1].t - stroke[0].t;
    }
    return total;
  }

  // Gaps between the end of one stroke and the start of the next.
  getPauseDurationsMs() {
    const pauses = [];
    for (let i = 1; i < this.strokes.length; i++) {
      const prevEnd = this.strokes[i - 1][this.strokes[i - 1].length - 1].t;
      const nextStart = this.strokes[i][0].t;
      pauses.push(nextStart - prevEnd);
    }
    return pauses;
  }

  // Drawing speed in canvas pixels per second, based on path length over active time.
  getDrawingSpeed() {
    const activeMs = this.getActiveDrawingDurationMs();
    if (activeMs <= 0) return 0;
    return this.getTotalPathLength() / (activeMs / 1000);
  }

  getTotalElapsedMs() {
    if (this.figureStartTime === null) return 0;
    const strokes = this.strokes;
    const last = strokes.length
      ? strokes[strokes.length - 1][strokes[strokes.length - 1].length - 1].t
      : performance.now();
    return last - this.figureStartTime;
  }
}
