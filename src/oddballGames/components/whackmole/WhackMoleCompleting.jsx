/**
 * Brief "Time's Up!" -> "Assessment Complete" transition (spec section
 * 53). Deliberately not an arcade "GAME OVER" — this is a cognitive test,
 * not something to fail.
 */
export default function WhackMoleCompleting() {
  return (
    <div className="oddball-screen wm-screen">
      <div className="oddball-check-badge" aria-hidden="true">
        ✓
      </div>
      <h1 className="oddball-heading">Time&rsquo;s Up!</h1>
      <p className="oddball-hint">Assessment Complete — calculating your results…</p>
    </div>
  );
}
