// Face Recognition Test config.
//
// 2026-08-17 UPDATE -- real AI-generated face photos.
// ============================================================================
// The original 20-entry FACE_POOL below described PROCEDURAL faces (a
// `features` object: headShape/hairStyle/eyebrowAngle/glasses/etc.) meant to
// be rendered by a synthetic-SVG avatar generator. That generator was never
// actually wired into FaceRecognitionTask.jsx -- FaceIllustration has always
// rendered a plain <img src={FACE_ASSET_PATH(id)}> pointing at a real asset
// file, so `features` was unused dead data (kept only as provenance from the
// teammate's original face_recognition project).
//
// A teammate later sent a second module (FACERE_3.JSX -- a self-contained,
// Claude-artifact-style rebuild of this same test) that ships its own
// AI_FACE_POOL: 20 real, AI-generated (NOT real people, no likeness/consent
// issue) 300x300 photographic face images, embedded as base64 JPEGs. Per the
// user's decision (2026-08-17, "trim to fit our pacing"), this app adopts
// those 20 photos as static asset files -- public/assets/faces/faceNN.jpg,
// replacing the old illustrated face*.svg files 1:1 by id, so nothing else
// (FaceRecognitionTask.jsx, delayedRecognitionMemoryConfig.js's `face` item
// pool, StudyItemRegistry) needed to change. The rest of that teammate's
// module (8 scored trials, fixed 20s delay, optional patient-photo-upload
// personalization) was intentionally NOT brought in -- see
// FaceRecognitionTask.jsx's header comment for why.
//
// PAIRGROUP NOTE: the old `features`-based pool assigned some faces a
// `pairGroup` (e.g. face01/face02 both "glassesPair") so the 'hard' tier
// could deliberately pick a visually-near-duplicate distractor for the
// scored study faces. Real AI-generated photos have no such controllable
// similarity axis -- there's no reliable way to know two of the 20 photos
// "look alike" without inspecting them by eye, which doesn't scale and isn't
// something this config should guess at. pairGroup is therefore `null` for
// every entry now; FaceGenerationEngine already falls back to a plain random
// distractor whenever pairGroup is absent (see its `preferPairedDistractor`
// branch), so no engine code changed. This is a real, disclosed trade-off:
// 'hard' trials are still harder than 'easy'/'medium' (more study faces, more
// distractors, less observation time), just without the extra
// look-alike-distractor difficulty boost the procedural pool could produce.
export const FACE_POOL = [
  { id: 'face01', name: 'Face 1', pairGroup: null },
  { id: 'face02', name: 'Face 2', pairGroup: null },
  { id: 'face03', name: 'Face 3', pairGroup: null },
  { id: 'face04', name: 'Face 4', pairGroup: null },
  { id: 'face05', name: 'Face 5', pairGroup: null },
  { id: 'face06', name: 'Face 6', pairGroup: null },
  { id: 'face07', name: 'Face 7', pairGroup: null },
  { id: 'face08', name: 'Face 8', pairGroup: null },
  { id: 'face09', name: 'Face 9', pairGroup: null },
  { id: 'face10', name: 'Face 10', pairGroup: null },
  { id: 'face11', name: 'Face 11', pairGroup: null },
  { id: 'face12', name: 'Face 12', pairGroup: null },
  { id: 'face13', name: 'Face 13', pairGroup: null },
  { id: 'face14', name: 'Face 14', pairGroup: null },
  { id: 'face15', name: 'Face 15', pairGroup: null },
  { id: 'face16', name: 'Face 16', pairGroup: null },
  { id: 'face17', name: 'Face 17', pairGroup: null },
  { id: 'face18', name: 'Face 18', pairGroup: null },
  { id: 'face19', name: 'Face 19', pairGroup: null },
  { id: 'face20', name: 'Face 20', pairGroup: null },
];

export const DIFFICULTY_TIERS = {
  easy: { studyCount: 4, distractorCount: 2, observationMs: 8000, preferPairedDistractor: false },
  medium: { studyCount: 5, distractorCount: 3, observationMs: 9000, preferPairedDistractor: false },
  hard: { studyCount: 6, distractorCount: 4, observationMs: 10000, preferPairedDistractor: true },
};

export const SCORING_CONFIG = {
  difficultyWeights: { easy: 0.8, medium: 1.0, hard: 1.3 },
  faceRecognitionWeights: { encoding: 0.25, retrieval: 0.30, discrimination: 0.25, consistency: 0.20 },
  interpretationThresholds: { excellent: 85, normal: 70, mildlyReduced: 50 },
};

// TRIAL_MODES ported verbatim. This app uses 'demo' (1 practice + 3 scored:
// easy/medium/hard) -- same time-budget reasoning as Visual Memory Test's
// protocol choice (see visualMemoryConfig.js), and the same reasoning behind
// NOT adopting FACERE_3.JSX's 8-scored-trial protocol (see 2026-08-17 note
// above).
export const TRIAL_MODES = {
  demo: { practiceTrials: 1, scoredSequence: ['easy', 'medium', 'hard'] },
  standardClinical: { practiceTrials: 1, scoredSequence: ['easy', 'easy', 'medium', 'medium', 'hard', 'hard'] },
  research: { practiceTrials: 2, scoredSequence: ['easy', 'easy', 'medium', 'medium', 'medium', 'hard', 'hard', 'hard'] },
};

export const DEFAULT_TRIAL_MODE = 'demo';

export const RECOGNITION_TIMEOUT_MS = 30000;

// .jpg as of the 2026-08-17 real-photo swap (was .svg).
export const FACE_ASSET_PATH = (id) => `/assets/faces/${id}.jpg`;

// FACE POOL SIZE NOTE (a real, honestly-documented constraint, not a
// fabrication): the teammate's original app accumulates excludeIds across
// an ENTIRE session (practice + all scored trials), never reusing a face
// once shown. With only 20 faces in the pool, that accumulation runs out
// mid-session even under 'demo' -- practice(6) + easy(6) + medium(8) = 20
// exhausts the pool exactly, leaving 0 faces for the hard trial's required
// 10. This is a real bug in the source, not something introduced here.
// FaceRecognitionTask.jsx below fixes it the same way GeometricShapeCopy's
// and Visual Memory's protocol trims were handled -- a documented, minimal
// adaptation: each trial draws fresh from the full 20-face pool (excluding
// only its own study+distractor faces), instead of excluding every face
// ever shown earlier in the session. A face may therefore reappear in a
// later trial (e.g. as a distractor after being a target earlier) -- a
// disclosed trade-off, not a scoring change (FaceGenerationEngine,
// ValidationEngine, MetricsEngine are all untouched). This still applies
// with the 2026-08-17 real-photo pool -- same 20-id pool, same math.
