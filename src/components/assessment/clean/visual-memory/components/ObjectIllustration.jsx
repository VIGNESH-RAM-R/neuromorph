// ObjectIllustration
// -----------------------------------------------------------------------------
// Presentation-only: renders one object's real photo from
// public/assets/visual_memory/photos/ (was a line-icon SVG from
// public/assets/visual_memory/ directly — replaced per feedback that the
// icons weren't recognizable/realistic enough for a memory task where the
// object itself needs to register at a glance). No business logic, no
// knowledge of whether the object is a target or distractor -- that's the
// caller's concern.
// Was 56 — combined with the tile's own padding (since trimmed, see
// styles/index.css's .vmt-tile), the photo read as occupying only the
// middle of its tile. Bumped alongside the source photos in
// public/assets/visual_memory/photos/ themselves being auto-cropped
// tighter (white margin trimmed to a small even border) so the object
// actually fills the frame — this is a bigger display size at the same
// source resolution, not an upscale, so nothing gets blurrier.
export default function ObjectIllustration({ id, name, size = 84 }) {
  return (
    <img
      src={`/assets/visual_memory/photos/${id}.png`}
      alt={name}
      width={size}
      height={size}
      className="vmt-illustration"
      draggable={false}
    />
  );
}
