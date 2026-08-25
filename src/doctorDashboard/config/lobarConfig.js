// Lobar function mapping config -- the single source of truth linking raw
// task ids to a lobe, its primary functions, and human-readable task labels.
// LobarMappingEngine reads this rather than hardcoding task lists, so adding
// a new task later (or a fifth lobe grouping such as cerebellar/subcortical)
// is a config change, not an engine rewrite.
//
// 2026-08-14: visualMemory + faceRecognition moved from temporal to
// occipital (matches app_page's lobarTaskRegistryConfig.js) -- a real
// reclassification (both centrally involve occipital visual-processing
// circuits), not a fudge to balance counts, though it does also fix
// Occipital having had zero currently-active tasks before this. Domain
// mapping (domainConfig.js) is unaffected -- only the lobe grouping moved.
export const LOBES = [
  {
    key: 'frontal',
    label: 'Frontal Lobe',
    primaryFunctions: ['Executive Function', 'Planning', 'Attention', 'Response Inhibition'],
    tasks: {
      stroop: 'Stroop Task',
      trailMaking: 'Trail Making',
      goNoGo: 'Go / No-Go',
      verbalFluency: 'Verbal Fluency',
    },
  },
  {
    key: 'temporal',
    label: 'Temporal Lobe',
    primaryFunctions: ['Memory Encoding & Retrieval', 'Language Comprehension', 'Auditory Processing'],
    tasks: {
      wordListRecall: 'Word List Recall',
      delayedRecognition: 'Delayed Recognition',
      naming: 'Naming Task',
      tokenTest: 'Token Test',
      delayedRecognitionMemory: 'Delayed Recognition Memory',
    },
  },
  {
    key: 'parietal',
    label: 'Parietal Lobe',
    primaryFunctions: ['Visuospatial Construction', 'Calculation', 'Spatial Attention'],
    tasks: {
      clockDrawing: 'Clock Drawing',
      cubeCopy: 'Cube Copy',
      calculation: 'Applied Calculation',
      matrixReasoning: 'Matrix Reasoning',
      geometricShapeCopy: 'Geometric Shape Copy',
    },
  },
  {
    key: 'occipital',
    label: 'Occipital Lobe',
    primaryFunctions: ['Visual Perception', 'Object Recognition'],
    tasks: {
      embeddedFigures: 'Embedded Figure Identification',
      objectNaming: 'Visual Object Naming',
      visualMemory: 'Visual Memory',
      faceRecognition: 'Face Recognition',
    },
  },
];

export const LOBE_KEYS = LOBES.map((l) => l.key);
