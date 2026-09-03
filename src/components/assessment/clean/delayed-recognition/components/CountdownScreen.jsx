export default function CountdownScreen({ label }) {
  return (
    <div className="drt-screen drt-screen--center">
      <div className="drt-countdown">{label}</div>
    </div>
  );
}
