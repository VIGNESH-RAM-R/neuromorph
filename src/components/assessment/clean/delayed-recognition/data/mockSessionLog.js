// mockSessionLog
// -----------------------------------------------------------------------------
// Dev/demo fallback ONLY. MemoryRetrievalEngine prefers real data from
// StudyItemRegistry (populated by other NeuroMorph modules writing to it
// during their own encoding phases); this fixture exists so the app is
// still playable before other modules are retrofitted to register with it.
// Mirrors the chat simulation: Visual Memory Test's object set is real
// (matches its actual object pool), Figure Matching's is illustrative since
// that module doesn't yet write to the registry.
export const MOCK_SESSION_LOG = [
  {
    sourceModule: 'Visual Memory Test',
    itemType: 'object',
    presentedAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    items: [
      { id: 'apple', wasRecognizedAtEncoding: true },
      { id: 'key', wasRecognizedAtEncoding: true },
      { id: 'cup', wasRecognizedAtEncoding: false },
      { id: 'umbrella', wasRecognizedAtEncoding: true },
      { id: 'chair', wasRecognizedAtEncoding: false },
      { id: 'clock', wasRecognizedAtEncoding: true }
    ]
  },
  {
    sourceModule: 'Figure Matching Test',
    itemType: 'figure',
    presentedAt: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
    items: [
      { id: 'circle', wasRecognizedAtEncoding: true },
      { id: 'square', wasRecognizedAtEncoding: true },
      { id: 'triangle', wasRecognizedAtEncoding: false },
      { id: 'pentagon', wasRecognizedAtEncoding: true },
      { id: 'diamond', wasRecognizedAtEncoding: false }
    ]
  }
];
