// DrawingCanvas
// -----------------------------------------------------------------------------
// Presentation-only: captures freehand input via the Pointer Events API
// (unifies mouse/touch/stylus) and renders committed + in-progress strokes.
// Freehand only -- no drag-and-drop, no snapping, no shape recognition here.
import { useRef, useEffect, useCallback } from 'react';
// The Canvas 2D API doesn't resolve CSS custom properties the way DOM
// elements' own CSS does — `ctx.strokeStyle = 'var(--x, #fallback)'` just
// silently fails to parse and canvas keeps its previous value. Real theme
// colors are read from here instead, keyed by config.theme, per
// features/04 §A.3 point 4.
import { canvasColors } from '../../../lib/theme.js';

export default function DrawingCanvas({ size = 480, strokes, theme = 'light', onPointerDown, onPointerMove, onPointerUp }) {
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, size, size);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = 3;
    ctx.strokeStyle = canvasColors(theme).primary;
    for (const stroke of strokes || []) {
      if (!stroke.length) continue;
      ctx.beginPath();
      ctx.moveTo(stroke[0].x, stroke[0].y);
      for (let i = 1; i < stroke.length; i++) ctx.lineTo(stroke[i].x, stroke[i].y);
      ctx.stroke();
    }
  }, [strokes, size, theme]);

  useEffect(() => { redraw(); }, [redraw]);

  const getLocalPoint = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handlePointerDown = (e) => {
    e.preventDefault();
    drawingRef.current = true;
    canvasRef.current.setPointerCapture(e.pointerId);
    const { x, y } = getLocalPoint(e);
    onPointerDown(x, y);
  };
  const handlePointerMove = (e) => {
    if (!drawingRef.current) return;
    const { x, y } = getLocalPoint(e);
    onPointerMove(x, y);
  };
  const handlePointerUp = (e) => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    try { canvasRef.current.releasePointerCapture(e.pointerId); } catch { /* noop */ }
    onPointerUp();
  };

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className="gsc-canvas"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    />
  );
}
