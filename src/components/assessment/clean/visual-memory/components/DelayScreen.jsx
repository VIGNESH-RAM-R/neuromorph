export default function DelayScreen({ timeRemainingSec }) {
  return (
    <div className="vmt-screen vmt-screen--center">
      <p className="vmt-body">Please wait</p>
      <p className="vmt-delay-timer" aria-live="polite">{timeRemainingSec}s</p>
    </div>
  );
}
