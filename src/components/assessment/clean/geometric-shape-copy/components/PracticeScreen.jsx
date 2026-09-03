import FigureSVG from './FigureSVG.jsx';
import DrawingCanvas from './DrawingCanvas.jsx';

export default function PracticeScreen({
  figure, practiceIndex, practiceTotal, timeRemainingSec, canvasSize, theme,
  strokes, onPointerDown, onPointerMove, onPointerUp, onClear, onDone
}) {
  return (
    <div className="gsc-screen gsc-screen--practice">
      <div className="gsc-topbar">
        <span className="gsc-pill">Practice {practiceIndex + 1} / {practiceTotal}</span>
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
      <p className="gsc-caption">Practice round -- not scored.</p>
    </div>
  );
}
