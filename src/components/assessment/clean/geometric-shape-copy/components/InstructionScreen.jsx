import FigureSVG from './FigureSVG.jsx';

export default function InstructionScreen({ onStart, sampleFigure }) {
  return (
    <div className="gsc-screen gsc-screen--instruction">
      <h1>Geometric Shape Copying Test</h1>
      <p className="gsc-sub">Parietal-lobe visuoconstructional assessment</p>

      <div className="gsc-instruction-body">
        <div className="gsc-instruction-example">
          <FigureSVG figure={sampleFigure} size={160} />
          <span className="gsc-caption">Example reference figure</span>
        </div>
        <ol className="gsc-instruction-list">
          <li>A figure will appear on the left. Copy it as accurately as you can on the blank canvas on the right.</li>
          <li>Draw freehand with your mouse, finger, or stylus. There is no snapping or auto-correction.</li>
          <li>Each figure has its own time limit (45-90 seconds) shown as a countdown.</li>
          <li>You'll get 2 practice figures first (not scored), then 12 scored figures.</li>
          <li>Press "Done" when you've finished a figure, or the timer will submit it automatically.</li>
        </ol>
      </div>

      <button className="gsc-btn gsc-btn--primary" onClick={onStart}>Start practice</button>
    </div>
  );
}
