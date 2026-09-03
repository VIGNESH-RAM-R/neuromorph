import FigureSVG from './FigureSVG.jsx';
import DrawingCanvas from './DrawingCanvas.jsx';

// Used to also show an Easy/Medium/Hard badge here — dropped per feedback:
// the tier still drives which figures get administered (see
// engines/ShapeGeneratorEngine.js), it's just never announced to the
// patient mid-task, matching every other weekly game.
export default function AssessmentScreen({
  figure, assessmentIndex, assessmentTotal, timeRemainingSec, canvasSize, theme,
  strokes, onPointerDown, onPointerMove, onPointerUp, onClear, onDone
}) {
  return (
    <div className="gsc-screen gsc-screen--assessment">
      <div className="gsc-topbar">
        <span className="gsc-pill">Figure {assessmentIndex + 1} / {assessmentTotal}</span>
        <span className="gsc-timer">{timeRemainingSec}s</span>
      </div>
      <div className="gsc-workspace">
        <div className="gsc-reference">
          <FigureSVG figure={figure} size={280} />
        </div>
        <div className="gsc-drawing-area">
          <DrawingCanvas
            size={canvasSize}
            strokes={strokes}
            theme={theme}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
          />
        </div>
      </div>
      <div className="gsc-controls">
        <button className="gsc-btn gsc-btn--ghost" onClick={onClear}>Clear</button>
        <button className="gsc-btn gsc-btn--primary" onClick={onDone}>Done</button>
      </div>
    </div>
  );
}
