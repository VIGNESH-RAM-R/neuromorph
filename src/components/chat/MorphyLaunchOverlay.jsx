import MorphyAvatar from './MorphyAvatar.jsx';

// Shared "Morphy is opening" animation -- pulse ring + three particles +
// the Morphy avatar itself, fading/floating in. Originally lived only
// inline inside MorphySection.jsx (the patient dashboard's dedicated
// "Open Assistant"/"Open Companion" page); pulled out here so the same
// animation can be reused wherever a Morphy icon or "open companion"
// entry point exists across the app (VR request: "morphy icon or open
// assistant enna kuduthalum morphy animation varanum - not only in
// patient dashboard"). Purely presentational -- the CSS (.nmpa-assistant-
// launch and friends, theme.css) is fixed/full-viewport already, so it
// looks correct no matter which screen renders it. Callers own their own
// `isLaunching` state and timers (see MorphySection.jsx for the pattern);
// this component just renders the overlay while that state is true.
export default function MorphyLaunchOverlay() {
  return (
    <div className="nmpa-assistant-launch" aria-hidden="true">
      <span className="nmpa-assistant-launch__pulse" />
      <span className="nmpa-assistant-launch__particle nmpa-assistant-launch__particle--one" />
      <span className="nmpa-assistant-launch__particle nmpa-assistant-launch__particle--two" />
      <span className="nmpa-assistant-launch__particle nmpa-assistant-launch__particle--three" />
      <div className="nmpa-assistant-launch__morphy"><MorphyAvatar size={96} label="" /></div>
    </div>
  );
}
