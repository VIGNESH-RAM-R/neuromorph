// Used to offer a live Demo/Standard-clinical protocol radio choice here —
// VisualMemoryGame.jsx already always calls the hook with
// initialProtocolKey: 'standardClinical' (never 'demo'), so that choice was
// asking the patient to pick between two options that led to the same
// place; the length is fixed by the assessment, not by the patient's
// preference. The 2 practice trials the standardClinical protocol already
// runs first (unscored, for orientation) are the "demo" — this screen just
// leads straight into them now, then straight into the 15 scored trials
// after, with no choice in between.
export default function InstructionScreen({ onStart }) {
  return (
    <div className="vmt-screen">
      <h1>Visual memory test</h1>
      <p className="vmt-eyebrow">NEUROMORPH — Visual Memory component</p>
      <p className="vmt-body">
        You will briefly see a group of everyday objects. Study them carefully.
        After they disappear, you will identify the objects you remember from a
        larger set. Work as accurately and carefully as you can.
      </p>
      <p className="vmt-body">You'll start with 2 practice trials, which aren't scored.</p>

      <button className="vmt-btn vmt-btn--primary" onClick={onStart}>Start assessment</button>
    </div>
  );
}
