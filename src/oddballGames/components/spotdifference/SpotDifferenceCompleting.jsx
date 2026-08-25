/** Brief, deliberate transition before results are computed and shown. */
export default function SpotDifferenceCompleting() {
  return (
    <div className="oddball-screen sd-screen">
      <div className="oddball-check-badge" aria-hidden="true">
        ✓
      </div>
      <h1 className="oddball-heading">Nicely Done!</h1>
      <p className="oddball-hint">Calculating your results…</p>
    </div>
  );
}
