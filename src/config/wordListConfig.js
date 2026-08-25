// Shared between Word List Recall (early in the assessment -- study this
// list) and Delayed Recognition (deliberately last -- recognize it after a
// real delay filled by every other task). A fixed, non-randomized list
// keeps both tasks reproducible and testable, same reasoning as the Stroop
// trial set.
export const STUDY_WORDS = ['Garden', 'Bridge', 'Pencil', 'Whistle', 'Blanket', 'Harbor', 'Ladder', 'Candle', 'Ribbon', 'Cabinet'];

export const STUDY_TIME_SECONDS = 20;

// New words mixed in as distractors during Delayed Recognition -- never
// shown during the study phase.
export const DISTRACTOR_WORDS = ['Mountain', 'Feather', 'Pocket', 'Compass', 'Kettle', 'Shadow', 'Anchor', 'Meadow', 'Tunnel', 'Basket'];

// Fixed interleaved presentation order for Delayed Recognition -- old/new
// alternate in a set pattern rather than a runtime shuffle, so the task is
// reproducible and testable like every other task in this assessment.
export const RECOGNITION_ITEMS = [
  { word: STUDY_WORDS[0], isStudyWord: true },
  { word: DISTRACTOR_WORDS[0], isStudyWord: false },
  { word: DISTRACTOR_WORDS[1], isStudyWord: false },
  { word: STUDY_WORDS[1], isStudyWord: true },
  { word: STUDY_WORDS[2], isStudyWord: true },
  { word: DISTRACTOR_WORDS[2], isStudyWord: false },
  { word: STUDY_WORDS[3], isStudyWord: true },
  { word: DISTRACTOR_WORDS[3], isStudyWord: false },
  { word: DISTRACTOR_WORDS[4], isStudyWord: false },
  { word: STUDY_WORDS[4], isStudyWord: true },
  { word: STUDY_WORDS[5], isStudyWord: true },
  { word: DISTRACTOR_WORDS[5], isStudyWord: false },
  { word: DISTRACTOR_WORDS[6], isStudyWord: false },
  { word: STUDY_WORDS[6], isStudyWord: true },
  { word: STUDY_WORDS[7], isStudyWord: true },
  { word: DISTRACTOR_WORDS[7], isStudyWord: false },
  { word: STUDY_WORDS[8], isStudyWord: true },
  { word: DISTRACTOR_WORDS[8], isStudyWord: false },
  { word: DISTRACTOR_WORDS[9], isStudyWord: false },
  { word: STUDY_WORDS[9], isStudyWord: true },
];
