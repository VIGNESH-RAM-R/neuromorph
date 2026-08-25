import { useEffect, useRef, useState } from 'react';
import { useSpotDifferenceEngine } from '../../hooks/useSpotDifferenceEngine';
import { SPOT_DIFFERENCE_IMAGES } from '../../config/spotDifferenceConfig';

const WRONG_MESSAGES = [
  'Not quite — keep looking!',
  'Try somewhere nearby.',
  "Close look, but not that spot — look around this area.",
  "That one matches. Try looking near the differences you've already found.",
];

/**
 * The actual two-picture game board for one level. Click/tap hit-testing
 * and completion detection are entirely owned by useSpotDifferenceEngine
 * (backed by the pure engines/spotDifferenceEngine.js) — this component
 * only converts a click's viewport position into the natural-image pixel
 * coordinates the engine expects (ported verbatim from the source
 * prototype's handleClick/placeMarker math) and renders the result.
 *
 * Found-difference markers are positioned as percentages of the image
 * frame rather than via getBoundingClientRect() on every render: since
 * each frame's <img> is `width:100%; height:auto`, the frame's rendered
 * box always exactly wraps the image, so `(diff.x / round.w) * 100%` maps
 * a natural-pixel coordinate onto the rendered image exactly, at any
 * screen size, without any resize-tracking code.
 */
export default function SpotDifferenceGame({ level, onLevelComplete, onChooseAnotherLevel }) {
  const engine = useSpotDifferenceEngine({ onLevelComplete });
  const [wrongStreak, setWrongStreak] = useState(0);
  const [tip, setTip] = useState(null);
  const [flashes, setFlashes] = useState([]);
  const tipTimerRef = useRef(null);
  const flashIdRef = useRef(0);

  useEffect(() => {
    engine.start(level);
    setWrongStreak(0);
    setTip(null);
    setFlashes([]);
    return () => clearTimeout(tipTimerRef.current);
    // Intentionally re-runs only when the level itself changes — engine is
    // stable across renders (all its exported functions are useCallback'd).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level]);

  const round = level.rounds[engine.roundIndex];
  const images = SPOT_DIFFERENCE_IMAGES[round.img];
  const roundComplete = engine.roundState.found.length === round.diffs.length;

  function handleFrameClick(e, frameKey) {
    if (roundComplete) return;
    const img = e.currentTarget.querySelector('img');
    if (!img) return;
    const rect = img.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const scaleX = round.w / rect.width;
    const scaleY = round.h / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    const onB = frameKey === 'B';

    const outcome = engine.tap(x, y, onB);
    if (!outcome) return;

    if (outcome.result === 'MISS') {
      const nextStreak = wrongStreak + 1;
      setWrongStreak(nextStreak);
      setTip(WRONG_MESSAGES[Math.min(nextStreak - 1, WRONG_MESSAGES.length - 1)]);
      clearTimeout(tipTimerRef.current);
      tipTimerRef.current = setTimeout(() => setTip(null), 1800);

      const xPct = ((e.clientX - rect.left) / rect.width) * 100;
      const yPct = ((e.clientY - rect.top) / rect.height) * 100;
      const id = flashIdRef.current++;
      setFlashes((prev) => [...prev, { id, frameKey, xPct, yPct }]);
      setTimeout(() => setFlashes((prev) => prev.filter((f) => f.id !== id)), 700);
    } else if (outcome.result === 'HIT') {
      setWrongStreak(0);
      setTip(null);
    }
  }

  const roundLabel =
    level.rounds.length > 1
      ? `${level.label} Level — Picture ${engine.roundIndex + 1} of ${level.rounds.length}`
      : `${level.label} Level`;

  function renderMarkers(frameKey) {
    const onB = frameKey === 'B';
    return engine.roundState.found.map((diffIndex) => {
      const d = round.diffs[diffIndex];
      const dx = onB && d.bx !== undefined ? d.bx : d.x;
      const dy = onB && d.by !== undefined ? d.by : d.y;
      return (
        <div
          key={`marker-${frameKey}-${diffIndex}`}
          className="sd-marker"
          style={{ left: `${(dx / round.w) * 100}%`, top: `${(dy / round.h) * 100}%` }}
          aria-hidden="true"
        />
      );
    });
  }

  function renderFlashes(frameKey) {
    return flashes
      .filter((f) => f.frameKey === frameKey)
      .map((f) => (
        <div
          key={f.id}
          className="sd-flash"
          style={{ left: `${f.xPct}%`, top: `${f.yPct}%` }}
          aria-hidden="true"
        />
      ));
  }

  return (
    <div className="oddball-screen sd-screen sd-screen--game">
      <div className="sd-status-card">
        <p className="sd-status-title">{roundLabel}</p>
        <p className="sd-progress-count">
          {engine.roundState.found.length} of {round.diffs.length} differences found
        </p>
        <div className="sd-dots">
          {round.diffs.map((_, i) => (
            <span
              key={i}
              className={`sd-dot${engine.roundState.found.includes(i) ? ' sd-dot--found' : ''}`}
              aria-hidden="true"
            />
          ))}
        </div>
        {roundComplete && (
          <div className="sd-complete-banner">Wonderful! You found every difference. 🌿</div>
        )}
      </div>

      {tip && <div className="sd-wrong-tip">{tip}</div>}

      <div className="sd-panels">
        <div className="sd-panel">
          <p className="sd-panel-label">Picture 1</p>
          <div className="sd-image-frame" onClick={(e) => handleFrameClick(e, 'A')}>
            <img src={images.base} alt="" draggable="false" />
            {renderMarkers('A')}
            {renderFlashes('A')}
          </div>
        </div>
        <div className="sd-panel">
          <p className="sd-panel-label">Picture 2</p>
          <div className="sd-image-frame" onClick={(e) => handleFrameClick(e, 'B')}>
            <img src={images.mod} alt="" draggable="false" />
            {renderMarkers('B')}
            {renderFlashes('B')}
          </div>
        </div>
      </div>

      <p className="sd-gentle-note">
        Take your time. There is no timer and no penalty for a wrong tap — just keep looking until
        you have found them all.
      </p>

      <div className="seq-cs-actions">
        <button className="seq-cs-btn seq-cs-btn--secondary" onClick={() => engine.resetRound()}>
          Start this picture over
        </button>
        <button className="seq-cs-btn seq-cs-btn--secondary" onClick={onChooseAnotherLevel}>
          &#9776; Choose another level
        </button>
      </div>
    </div>
  );
}
