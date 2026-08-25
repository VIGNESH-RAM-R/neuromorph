// The single source of truth for the Lobar Function Test: which tasks
// exist, what order they run in, which lobe each belongs to (must match
// the Doctor Dashboard's lobarConfig.js task keys exactly -- this is what
// keeps a session built here readable by LobarMappingEngine over there),
// and which of the three domains fed by "Digital Lobar Function Assessment"
// each task's score rolls up into.
//
// DOMAIN MAPPING NOTE (a documented simplification, not an invented rule):
// the Doctor Dashboard's own domainConfig.js already decided, before this
// module existed, that the Lobar Function Assessment only feeds THREE of
// the six cognitive domains -- attention, executiveFunction, processingSpeed.
// visualMemory, language, and recognitionMemory are explicitly sourced from
// other modules (Visual Memory Assessment, Speech Assessment, Delayed
// Recognition Assessment) instead.
//
// ============================================================================
// 2026-08-11 REVISION -- the real Final 8 lineup.
// ============================================================================
// The 8 tasks actually finalized for the Lobar Function Test are: Stroop,
// Go/No-Go, Token Test, Delayed Recognition Memory, Raven's Matrices,
// Geometric Shape Copy, Visual Memory, Face Recognition -- built by a
// teammate as separate, richer modules and integrated one file at a time.
// This is a real re-lineup from the original 12-task catalogue below, not
// an extension of it, so most of the original 12 are now RETIRED (active:
// false) rather than "cut for time" as before. Their files are left in
// place (still real, still tested) purely as a re-enable point, not because
// they're part of the current plan.
//
// ============================================================================
// 2026-08-11 UPDATE (same day, later batch) -- 7 of 8 now real and wired in.
// ============================================================================
// The teammate's actual project folders for Raven's Matrices ("Matrix
// Reasoning"), Geometric Shape Copy, Visual Memory, and Delayed Recognition
// Memory all arrived (zipped, real multi-file projects, not single files).
// wordListRecall + delayedRecognition -- the placeholder pair this catalogue
// used to flag as "no teammate file has arrived yet" -- are now RETIRED
// (active: false): the real delayedRecognitionMemory task below is exactly
// what that placeholder was standing in for.
//
// DOMAIN MAPPING UPDATE: the note above ("only 3 domains") described a
// self-imposed convention, not an actual code constraint -- AssessmentSessionModel
// already aggregates by whatever `domain` a task declares. visualMemory and
// delayedRecognitionMemory now declare `domain: 'visualMemory'` / `'recognitionMemory'`
// directly, which are REAL domain keys in Doctor Dashboard's own domainConfig.js
// (previously fed only by modules outside this app). matrixReasoning and
// geometricShapeCopy still use the documented-simplification pattern
// (`executiveFunction`, same precedent as the old clockDrawing entry) since
// there's no dedicated "visuospatial reasoning" domain in the 6-domain model.
//
// ============================================================================
// 2026-08-14 UPDATE -- Face Recognition integrated. All 8 of 8 now real.
// ============================================================================
// faceRecognition below is domain: 'recognitionMemory' (same domain as
// delayedRecognitionMemory) -- its own mechanic (study a set, then pick
// targets out of target+distractor foils) is structurally a recognition-
// memory task, not a pure encode-and-recall one like visualMemory.
// domainScoresRaw.recognitionMemory will now average faceRecognition +
// delayedRecognitionMemory together, which is a real, defensible pairing,
// not a mismatch -- both genuinely measure the same construct.
//
// ============================================================================
// 2026-08-14 UPDATE (same day, later batch) -- lobe rebalance: visualMemory
// and faceRecognition moved from temporal to occipital.
// ============================================================================
// Before this: frontal 2, temporal 4, parietal 2, occipital 0 -- lopsided,
// and Occipital was completely absent from every lobe display even though
// it's a real lobe in the model. This is a genuine reclassification, not a
// fudge to hit a round number: visual memory recognition and face
// recognition both centrally involve OCCIPITAL visual processing circuits
// (the visual cortex for encoding/recognizing visual material; the
// occipito-temporal junction / fusiform face area specifically for faces),
// at least as much as they involve temporal memory circuits. Domain
// assignments are UNCHANGED (visualMemory still feeds the 'visualMemory'
// domain, faceRecognition still feeds 'recognitionMemory') -- only the
// LOBE field (a display/grouping concern) moved. Result: frontal 2,
// temporal 2, parietal 2, occipital 2 -- even, and every lobe has real
// coverage.
//
// STATUS as of this revision (8 of 8 confirmed real and wired in):
//   - stroop, goNoGo -- Frontal lobe.
//   - tokenTest -- Temporal lobe.
//   - matrixReasoning -- Teammate's matrices_game project (vanilla JS,
//     ported into MatrixReasoningEngine.js). Parietal lobe.
//   - geometricShapeCopy -- Teammate's geometry_game project (canvas
//     drawing + computational-geometry scoring). Parietal lobe. Scored
//     sequence trimmed from the teammate's own 12 figures to 6 for the
//     20-minute time budget -- see geometricShapeCopyConfig.js.
//   - visualMemory -- Teammate's visual_memory project. Occipital lobe (see
//     rebalance note above). Registers its shown objects into
//     StudyItemRegistry (shared bridge) so delayedRecognitionMemory has
//     real material to re-test.
//   - faceRecognition -- Teammate's face_recognition project. Occipital
//     lobe (see rebalance note above), ordered right after visualMemory so
//     it also registers real study items (itemType: 'face') before
//     delayedRecognitionMemory runs. See faceRecognitionConfig.js for a
//     real pool-size constraint found and fixed during its integration
//     (documented there, not hidden).
//   - delayedRecognitionMemory -- REPLACES the wordListRecall/
//     delayedRecognition placeholder pair. Teammate's delayed_recognition_test
//     project. Temporal lobe (it re-tests memory, not raw visual
//     perception -- stays temporal even though its source material now
//     comes from two occipital-lobe tasks), deliberately LAST in run
//     order -- it presents no new material, only re-tests visualMemory's +
//     faceRecognition's items after a real delay. Its ITEM_POOLS gained a
//     `face` pool during the faceRecognition integration (was missing,
//     would have crashed at runtime).
// ============================================================================
// 2026-08-22 RE-SEQUENCE (VR feedback: Stroop/Go-No-Go "so boring at the
// very beginning"). Only the `order` values below changed -- lobe/domain
// assignments, scoring, everything else is untouched. Old order was
// stroop(1) -> goNoGo(2) -> tokenTest(3) -> matrixReasoning(4) ->
// geometricShapeCopy(5) -> visualMemory(6) -> faceRecognition(7).
// New order leads with the two most visually engaging, concrete tasks
// (real photos/objects, not abstract color-word/rapid-stimulus reflex
// tasks) and pushes Stroop/Go-No-Go to the back half, once the patient is
// already warmed up:
//   visualMemory(1) -> faceRecognition(2) -> matrixReasoning(3) ->
//   geometricShapeCopy(4) -> tokenTest(5) -> stroop(6) -> goNoGo(7).
// This is a genuine, not just cosmetic, improvement to
// delayedRecognitionMemory too: it re-tests items visualMemory/
// faceRecognition register, and "delay" = however much session is left
// after they run -- moving them to positions 1-2 instead of 6-7 makes
// that delay meaningfully LONGER (closer to a real clinical delayed-
// recall interval) rather than shorter, a genuine side benefit, not a
// tradeoff.
// ============================================================================
export const LOBAR_TASK_CATALOGUE = [
  // Real domain match (domain unchanged) -- lobe is 'occipital' as of the
  // 2026-08-14 rebalance note above (visual encoding/recognition is a real
  // occipital-circuit function, not just temporal memory). Moved to FIRST
  // (see 2026-08-22 re-sequence note above) -- also maximizes the real
  // delay interval before delayedRecognitionMemory re-tests these items.
  { id: 'visualMemory', label: 'Visual Memory', lobe: 'occipital', domain: 'visualMemory', order: 1, active: true },
  // Ordered right after visualMemory (well before delayedRecognitionMemory's
  // order: 13) so its registered study items are available by the time
  // Delayed Recognition Memory runs. Lobe is 'occipital' as of the
  // 2026-08-14 rebalance note above (face recognition centrally involves
  // the occipito-temporal visual circuit, not purely temporal memory).
  { id: 'faceRecognition', label: 'Face Recognition', lobe: 'occipital', domain: 'recognitionMemory', order: 2, active: true },
  // Raven's-style pattern completion -- closest honest fit is executiveFunction
  // (abstract rule inference / problem solving), same precedent as the
  // retired clockDrawing entry below.
  { id: 'matrixReasoning', label: 'Matrix Reasoning', lobe: 'parietal', domain: 'executiveFunction', order: 3, active: true },
  // Constructional/visuospatial drawing -- same closest-fit precedent as
  // matrixReasoning above (there's no dedicated visuospatial domain).
  { id: 'geometricShapeCopy', label: 'Geometric Shape Copy', lobe: 'parietal', domain: 'executiveFunction', order: 4, active: true },
  // Token Test: temporal-lobe auditory/language comprehension (touch tokens
  // in response to a spoken instruction, ascending in complexity). 'attention'
  // is the closest honest fit -- see the domain mapping note above.
  { id: 'tokenTest', label: 'Token Test', lobe: 'temporal', domain: 'attention', order: 5, active: true },
  // Moved from order 1 to order 6 -- see 2026-08-22 re-sequence note above.
  { id: 'stroop', label: 'Stroop Task', lobe: 'frontal', domain: 'executiveFunction', order: 6, active: true },
  // Moved from order 2 to order 7 (last of the active 8, right before
  // delayedRecognitionMemory) -- see 2026-08-22 re-sequence note above.
  { id: 'goNoGo', label: 'Go / No-Go', lobe: 'frontal', domain: 'attention', order: 7, active: true },
  { id: 'trailMaking', label: 'Trail Making', lobe: 'frontal', domain: 'processingSpeed', order: 8, active: false },
  { id: 'verbalFluency', label: 'Verbal Fluency', lobe: 'frontal', domain: 'executiveFunction', order: 8, active: false },
  { id: 'wordListRecall', label: 'Word List Recall', lobe: 'temporal', domain: 'attention', order: 9, active: false }, // retired -- see UPDATE note above
  // Real domain match -- see domain mapping note above. Deliberately last --
  // "delayed" needs the rest of the session (everything after visualMemory)
  // as the actual delay interval.
  { id: 'delayedRecognitionMemory', label: 'Delayed Recognition Memory', lobe: 'temporal', domain: 'recognitionMemory', order: 13, active: true },
  { id: 'delayedRecognition', label: 'Delayed Recognition', lobe: 'temporal', domain: 'attention', order: 12, active: false }, // retired -- see UPDATE note above
  { id: 'naming', label: 'Naming Task', lobe: 'temporal', domain: 'processingSpeed', order: 10, active: false },
  { id: 'clockDrawing', label: 'Clock Drawing', lobe: 'parietal', domain: 'executiveFunction', order: 11, active: false },
  { id: 'cubeCopy', label: 'Cube Copy', lobe: 'parietal', domain: 'executiveFunction', order: 14, active: false },
  { id: 'calculation', label: 'Applied Calculation', lobe: 'parietal', domain: 'executiveFunction', order: 15, active: false },
  { id: 'embeddedFigures', label: 'Embedded Figure Identification', lobe: 'occipital', domain: 'attention', order: 16, active: false },
  { id: 'objectNaming', label: 'Visual Object Naming', lobe: 'occipital', domain: 'processingSpeed', order: 17, active: false },
];

// The tasks that actually run right now -- everything downstream
// (AssessmentSessionModel's default registry, AssessmentSection's task
// count copy, etc.) reads THIS, not the full catalogue, so retiring or
// re-enabling a task is a single `active` flip above and nothing else.
export const LOBAR_TASKS = LOBAR_TASK_CATALOGUE.filter((t) => t.active !== false);

// Sorted, ready-to-run order. delayedRecognition's `order` field places it
// last regardless of declaration order above.
export const LOBAR_TASK_ORDER = [...LOBAR_TASKS].sort((a, b) => a.order - b.order).map((t) => t.id);

export const LOBAR_TASK_KEYS = LOBAR_TASKS.map((t) => t.id);

// Looks up ANY task, active or not, from the full catalogue -- so an
// inactive (retired or cut) task can still be inspected/referenced without
// needing to be re-enabled first.
export function taskDefinition(id) {
  return LOBAR_TASK_CATALOGUE.find((t) => t.id === id);
}
