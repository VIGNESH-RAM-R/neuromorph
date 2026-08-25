// Structured "how do I play" guide data for every module actually built in
// this project so far -- NOT the Stroop/Trail Making/Visual Search/Tower of
// London names from the original spec, which don't match any delivered
// module. See README.md for why. The exact final game lineup (especially
// which 2 of each Memory/Reaction/Attention pair ship) is still being
// decided by the team -- guides exist here for everything currently built
// so nothing is missing once that's finalized; unused ones are harmless.
//
// Kept structured (not hand-written prose) so this same data could later
// drive an in-app step-by-step tutorial overlay, not just chat answers --
// GuideFormatterEngine.formatAsAnswer() is the one place that turns this
// into chat text.
export const GAME_GUIDES = [
  {
    id: 'whack-a-mole',
    title: 'Whack-a-Mole',
    category: 'Reaction',
    purpose: 'Measures how quickly and accurately you respond to something appearing unpredictably on screen.',
    durationMinutes: '2-3',
    steps: [
      'Tap "Start" when you\'re ready.',
      'Watch the grid -- moles will pop up one at a time in random spots.',
      'Tap a mole as soon as it appears.',
      'Keep going until the round ends.',
    ],
    tips: ['Keep your finger near the center of the screen so you can reach any spot quickly.', "Accuracy matters as much as speed -- a wrong tap still counts."],
    measures: ['Reaction time', 'Accuracy', 'Response consistency'],
  },
  {
    id: 'point-and-click',
    title: 'Point & Click',
    category: 'Reaction',
    purpose: 'Measures visual reaction speed to a single clear target.',
    durationMinutes: '2-3',
    steps: [
      'Tap "Start" when you\'re ready.',
      'Wait for the target shape to appear.',
      'Tap it as fast as you can.',
      'A new target appears after each tap -- keep going until the round ends.',
    ],
    tips: ['False taps before the target appears are recorded, so wait for it.'],
    measures: ['Reaction time', 'False-start rate'],
  },
  {
    id: 'spot-the-difference',
    title: 'Spot the Difference',
    category: 'Attention',
    purpose: 'Measures sustained visual attention and your ability to notice small inconsistencies.',
    durationMinutes: '3-4',
    steps: [
      'Two similar images appear side by side.',
      'Look for spots where the two images differ.',
      'Tap each difference you find.',
      'Find as many as you can before time runs out.',
    ],
    tips: ['Scan in a consistent pattern (e.g. left to right, top to bottom) rather than jumping around.'],
    measures: ['Number found', 'Time to find each difference', 'Missed differences'],
  },
  {
    id: 'odd-one-out',
    title: 'Odd One Out',
    category: 'Attention',
    purpose: 'Measures focus and pattern recognition under mild distraction.',
    durationMinutes: '2-3',
    steps: [
      'A group of similar items appears on screen.',
      'One item is subtly different from the rest.',
      'Tap the one that doesn\'t belong.',
      'A new group appears after each answer.',
    ],
    tips: ['Take a breath before each new group rather than rushing -- accuracy is what\'s measured, not just speed.'],
    measures: ['Accuracy', 'Response time'],
  },
  {
    id: 'visual-memory-test',
    title: 'Visual Memory Test',
    category: 'Memory',
    purpose: 'Measures how well you encode and briefly hold new visual information.',
    durationMinutes: '3-5',
    steps: [
      'A set of shapes or images is shown for a few seconds.',
      'The screen clears for a short delay.',
      'You\'re shown a new set and asked which items you saw before.',
      'Select every item you remember seeing.',
    ],
    tips: ['Try to notice each item\'s distinct features rather than its general shape -- it helps at recall time.'],
    measures: ['Recognition accuracy', 'Response time', 'False-positive rate'],
  },
  {
    id: 'face-recognition-test',
    title: 'Face Recognition Test',
    category: 'Memory',
    purpose: "Measures face-specific recognition memory -- a distinct skill from remembering objects or shapes.",
    durationMinutes: '4-6',
    steps: [
      'A series of illustrated faces is shown one at a time.',
      'After a short delay, you\'ll see pairs or groups of faces.',
      'Pick the face you were shown earlier.',
      'Continue through all trials.',
    ],
    tips: ['These are illustrated faces, not photos -- no camera is used in this module.'],
    measures: ['Recognition accuracy', 'Response time', 'Performance by difficulty level'],
  },
  {
    id: 'facial-expressivity-test',
    title: 'Facial Expressivity Test',
    category: 'Face',
    purpose: 'Uses your camera to measure how your face responds to a few short prompts, compared to your own resting baseline.',
    durationMinutes: '2-3',
    steps: [
      'Allow camera access when asked -- this is required and always opt-in.',
      'Hold still and relax your face for a few seconds while your baseline is measured.',
      'Respond naturally to each prompt (a picture, a sentence to read, a small surprise).',
      'That\'s it -- no need to exaggerate your expressions.',
    ],
    tips: ['Sit somewhere reasonably well-lit, facing the camera.', 'Nothing is recorded or saved as video or images -- only movement measurements.'],
    measures: ['Overall expressivity', 'Response latency', 'Expression diversity', 'Facial symmetry', 'Blink rate'],
  },
  {
    id: 'speech-module',
    title: 'Speech Module',
    category: 'Speech',
    purpose: 'Listens to short spoken responses to measure verbal fluency and speech patterns over time.',
    durationMinutes: '2-4',
    steps: [
      'Allow microphone access when asked -- this is required and always opt-in.',
      'Follow the on-screen prompt (e.g. naming items in a category, or reading a short passage).',
      'Speak naturally at your normal pace.',
      'Recording stops automatically after each prompt.',
    ],
    tips: ['A quiet room gives the most reliable result.'],
    measures: ['Verbal fluency', 'Speech pattern trends over time'],
  },
  {
    id: 'detection-assessment',
    title: 'Detection Assessment (Lobar Function Test + Questions)',
    category: 'Assessment',
    purpose: "The structured, weekly formal check-in -- a set of short tasks each tied to a specific brain region, plus a handful of rotating questions.",
    durationMinutes: '15-20',
    steps: [
      'Open the Detection Assessment from your home screen when it\'s due.',
      'Complete each short task in order -- you\'ll see which brain function each one relates to.',
      'Answer the 10 questions that follow (these rotate each week, so you won\'t see the exact same set twice in a row).',
      'Review your Cognitive Score and Detection Score band once finished.',
    ],
    tips: ['Try to finish in one sitting, somewhere quiet, when you\'re not rushed -- it gives the most reliable result.'],
    measures: ['Cognitive Score', 'Detection Score band', 'Per-region performance'],
  },
];
