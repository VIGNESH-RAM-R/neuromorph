// ItemIllustration
// -----------------------------------------------------------------------------
// Presentation-only: renders one retrieved item's illustration. figure/
// symbol load a static SVG from public/assets/{itemType}s/ — deliberately
// abstract stimuli (a circle, a checkmark), not real-world objects, so
// there's no "more realistic" version of these to move to; a photo of a
// checkmark isn't a meaningful upgrade the way a photo of a fork is. object
// is different: public/assets/objects/*.svg used to be its own separate
// copy of the exact same 20 real-world objects Visual Memory uses (same
// filenames — apple.svg, fork.svg, and so on) — now points at the same
// photos Visual Memory was switched to
// (src/features/games/weekly/visual-memory/components/ObjectIllustration.jsx),
// instead of a redundant second icon set nobody asked to also replace. face
// is different again: a registered face TARGET carries its full descriptor
// (or a photo dataURL) as `face` — spread straight through from what Face
// Recognition registered — and renders via the shared FaceAvatar, the exact
// same rendering Face Recognition itself used, so the retest is a faithful
// re-display of the actual face, not a generic placeholder (see
// src/features/games/lib/FaceAvatar.jsx's doc comment). A face DISTRACTOR
// (drawn from data/itemPools.json's plain id list, never shown at encoding)
// has no such descriptor, so one is generated deterministically from its id
// — the same distractor id always renders the same face.
import FaceAvatar from '../../../lib/FaceAvatar.jsx';

const FOLDER_BY_TYPE = { figure: 'figures', symbol: 'symbols' };

const SKIN_TONES = ['#F5D6B8', '#EFC49B', '#DCA772', '#C88A54', '#A5673A', '#7A4A2B'];
const HAIR_COLORS = ['#241812', '#4A2E1E', '#7A4A24', '#A9702F', '#C9A876', '#5B5B5B', '#1A1A1A', '#8A5A3B'];
const EYE_COLORS = ['#4A372A', '#3E6E96', '#4E7A44', '#6B4226', '#5A5A5A'];
const HAIR_STYLES = ['short', 'side-part', 'curly', 'bun', 'bald', 'medium'];
const FACE_SHAPES = ['oval', 'round', 'square', 'heart'];
const EYEBROW_STYLES = ['straight', 'arched', 'thick', 'thin'];
const AGE_GROUPS = ['young', 'middle', 'senior'];
const NOSE_WIDTHS = [7, 9, 11, 13];
const MOUTH_WIDTHS = [26, 32, 38, 44];

function hashSeed(id) {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) | 0;
  return Math.abs(h);
}

function syntheticDistractorFace(id) {
  const seed = hashSeed(id);
  const pick = (arr, salt) => arr[(seed + salt) % arr.length];
  return {
    id,
    kind: 'synthetic',
    skinTone: pick(SKIN_TONES, 0),
    hairColor: pick(HAIR_COLORS, 1),
    hairStyle: pick(HAIR_STYLES, 2),
    eyeColor: pick(EYE_COLORS, 3),
    faceShape: pick(FACE_SHAPES, 4),
    eyebrowStyle: pick(EYEBROW_STYLES, 5),
    noseWidth: pick(NOSE_WIDTHS, 6),
    mouthWidth: pick(MOUTH_WIDTHS, 7),
    ageGroup: pick(AGE_GROUPS, 8),
  };
}

export default function ItemIllustration({ itemType, id, face, size = 56 }) {
  if (itemType === 'face') {
    const faceData = face?.kind ? face : syntheticDistractorFace(id);
    return (
      <div style={{ width: size, height: size, overflow: 'hidden', borderRadius: '50%' }}>
        <FaceAvatar face={faceData} />
      </div>
    );
  }

  if (itemType === 'object') {
    return (
      <img
        src={`/assets/visual_memory/photos/${id}.png`}
        alt={id}
        width={size}
        height={size}
        className="drt-illustration"
        draggable={false}
      />
    );
  }

  const folder = FOLDER_BY_TYPE[itemType] || itemType;
  return (
    <img
      src={`/assets/${folder}/${id}.svg`}
      alt={id}
      width={size}
      height={size}
      className="drt-illustration"
      draggable={false}
    />
  );
}
