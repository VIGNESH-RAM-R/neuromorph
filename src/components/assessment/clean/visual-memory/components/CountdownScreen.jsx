export default function CountdownScreen({ label }) {
  return (
    <div className="vmt-screen vmt-screen--center">
      <div className="vmt-countdown">{label}</div>
    </div>
  );
}
