export default function CountdownScreen({ label }) {
  return (
    <div className="gsc-screen gsc-screen--countdown">
      <div className="gsc-countdown-number" key={label}>{label}</div>
      <p className="gsc-sub">Get ready&hellip;</p>
    </div>
  );
}
