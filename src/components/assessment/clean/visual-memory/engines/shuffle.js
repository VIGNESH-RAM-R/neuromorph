// Shared Fisher-Yates shuffle -- used by ObjectGenerationEngine, SceneEngine,
// and RecognitionEngine. Centralized so randomization behavior (and any
// future seeding for reproducible research protocols) lives in one place.
export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
