export default function ImagePairsCompleting({ reason }) {
  const heading = reason === 'TIME_EXPIRED' ? 'Time Complete' : 'Assessment Complete';
  return (
    <div className="oddball-screen ip-screen">
      <div className="oddball-check-badge" aria-hidden="true">
        ✓
      </div>
      <h1 className="oddball-heading">{heading}</h1>
      <p className="oddball-hint">Calculating your results…</p>
    </div>
  );
}
