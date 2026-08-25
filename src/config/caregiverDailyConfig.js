// The caregiver's daily check-in: 15 questions total about the PATIENT
// (recovery/improvement, day-to-day activities, mood/behaviour, safety,
// cognition) -- never questions about the caregiver themselves.
//
// 2026-08-23 REDESIGN (VR feedback: "i need 15 questions everyday for the
// caregiver to answer, need not repeat those questions, very rarely we can
// substitute questions if needed -- and the questions need to be very
// useful ... for the doctor to come to a conclusion of the patient day by
// day"). Two real problems with the previous 10-fixed/5-rotating design
// were fixed here:
//   1. Only 5 of 15 questions ever varied -- too small a rotating slice to
//      feel non-repetitive, and too small a pool (20) to give a doctor
//      broad day-by-day coverage.
//   2. The rotation math itself was a sliding window (day-to-day offset by
//      1), so consecutive days actually shared 80% of their "rotating"
//      questions -- the opposite of what a non-repeating check-in needs.
//      CaregiverDailyRotationEngine.js now partitions the pool into
//      disjoint daily chunks instead (see that file's comment).
//
// New shape: 5 CORE questions asked every single day (these are the ones
// with real day-over-day trend value for a doctor -- global function,
// memory, orientation, mood, and an always-available free-text safety
// net), + 10 questions drawn from a 50-question ROTATING_POOL, in chunks
// of 10 that are always mutually distinct within a 5-day cycle (50 / 10 =
// 5). So a caregiver only sees the exact same 10 rotating questions once
// every 5 days -- "very rarely" repeats, as asked -- while the doctor
// still gets a fully covered set of cognitive, functional, behavioural,
// and safety domains across roughly a week.
//
// `type`: 'scale' (1-5, rendered as 5 buttons), 'yesno' (2 buttons), or
// 'text' (free-form, always optional regardless of `required`, since
// forcing a caregiver to write something every day is exactly the kind of
// punitive UX this whole project has avoided elsewhere -- see
// dailyTaskConfig.js's own "soft-mandatory" philosophy).
export const CAREGIVER_CORE_QUESTIONS = [
  { id: 'overallWellbeing', type: 'scale', category: 'recovery', label: "Overall, how would you rate the patient's wellbeing today?", scaleLabels: ['Very poor', 'Poor', 'Okay', 'Good', 'Very good'] },
  { id: 'memoryLapses', type: 'yesno', category: 'recovery', label: 'Did you notice any new or unusual memory lapses today?' },
  { id: 'confusionEpisodes', type: 'yesno', category: 'recovery', label: 'Did they seem confused or disoriented at any point today?' },
  { id: 'moodToday', type: 'scale', category: 'mood', label: "How would you describe the patient's mood today?", scaleLabels: ['Very low', 'Low', 'Neutral', 'Good', 'Very positive'] },
  { id: 'anyConcerns', type: 'text', category: 'safety', label: "Any specific concerns or observations you'd like to note today? (optional)" },
];

// Backward-compatible alias -- kept in case anything outside this module
// still imports the old name during the transition.
export const CAREGIVER_FIXED_QUESTIONS = CAREGIVER_CORE_QUESTIONS;

export const CAREGIVER_ROTATING_POOL = [
  // -- Activities of daily living --
  { id: 'dailyActivities', type: 'scale', category: 'activities', label: 'How independently did they manage daily activities today (eating, dressing, moving around)?', scaleLabels: ['Needed full help', 'Needed a lot of help', 'Needed some help', 'Mostly independent', 'Fully independent'] },
  { id: 'sleepQuality', type: 'scale', category: 'activities', label: 'How was their sleep last night, as far as you know?', scaleLabels: ['Very poor', 'Poor', 'Okay', 'Good', 'Very good'] },
  { id: 'appetiteToday', type: 'scale', category: 'activities', label: 'How was their appetite today?', scaleLabels: ['Very poor', 'Poor', 'Okay', 'Good', 'Very good'] },
  { id: 'medicationTaken', type: 'yesno', category: 'safety', label: 'Were they able to take their medication as scheduled today, if applicable?' },
  { id: 'socialEngagement', type: 'scale', category: 'mood', label: 'How engaged were they with conversation or social interaction today?', scaleLabels: ['Withdrawn', 'A little', 'Some', 'Engaged', 'Very engaged'] },
  { id: 'physicalMobility', type: 'scale', category: 'activities', label: 'How was their physical mobility or balance today?', scaleLabels: ['Very poor', 'Poor', 'Okay', 'Good', 'Very good'] },
  { id: 'hygieneIndependence', type: 'scale', category: 'activities', label: 'How independently did they manage personal hygiene today?', scaleLabels: ['Needed full help', 'Needed a lot of help', 'Needed some help', 'Mostly independent', 'Fully independent'] },
  { id: 'toiletingIndependence', type: 'scale', category: 'activities', label: 'How independently did they manage toileting today?', scaleLabels: ['Needed full help', 'Needed a lot of help', 'Needed some help', 'Mostly independent', 'Fully independent'] },
  { id: 'dressingAppropriateness', type: 'yesno', category: 'activities', label: 'Did they dress appropriately for the weather/occasion without help today?' },
  { id: 'selfCareInitiative', type: 'scale', category: 'activities', label: 'Did they initiate self-care tasks (brushing teeth, grooming) on their own today, or need prompting?', scaleLabels: ['Needed full prompting', 'Needed a lot of prompting', 'Needed some prompting', 'Mostly initiated', 'Fully initiated'] },
  { id: 'exercisePhysicalActivity', type: 'yesno', category: 'activities', label: 'Did they get any physical activity or exercise today (walk, stretching, etc.)?' },
  { id: 'napsDuringDay', type: 'scale', category: 'activities', label: 'How much did they nap or doze off unintentionally during the day?', scaleLabels: ['None', 'A little', 'Some', 'Frequent', 'Constant dozing'] },
  { id: 'financialDecisionMaking', type: 'scale', category: 'activities', label: 'How well did they handle simple financial tasks today (counting change, understanding a bill), if it came up?', scaleLabels: ['Could not manage', 'Needed a lot of help', 'Needed some help', 'Mostly capable', 'Fully capable'] },
  { id: 'cooperationWithCare', type: 'scale', category: 'activities', label: 'How cooperative were they with care tasks (bathing, medication, appointments) today?', scaleLabels: ['Very resistant', 'Resistant', 'Neutral', 'Cooperative', 'Very cooperative'] },
  { id: 'appetiteChanges', type: 'yesno', category: 'activities', label: 'Did you notice any unusual change in their eating habits today?' },

  // -- Cognition / recovery trend --
  { id: 'repeatedQuestions', type: 'yesno', category: 'recovery', label: 'Did they repeat the same question or story multiple times today?' },
  { id: 'recognizedFamiliarPeople', type: 'yesno', category: 'recovery', label: 'Did they recognize familiar people (family, regular visitors) today?' },
  { id: 'followedConversation', type: 'scale', category: 'recovery', label: 'How well could they follow a conversation today?', scaleLabels: ['Not at all', 'A little', 'Somewhat', 'Well', 'Very well'] },
  { id: 'communicationClarity', type: 'scale', category: 'recovery', label: 'How clearly were they able to express themselves today?', scaleLabels: ['Very unclear', 'Unclear', 'Okay', 'Clear', 'Very clear'] },
  { id: 'independentDecisionMaking', type: 'scale', category: 'recovery', label: 'How well did they make small everyday decisions on their own today (what to wear, what to eat)?', scaleLabels: ['Not at all', 'Rarely', 'Sometimes', 'Mostly', 'Fully'] },
  { id: 'timeOrPlaceConfusion', type: 'yesno', category: 'safety', label: 'Did they seem unsure about the day, time, or where they were at any point today?' },
  { id: 'comparedToLastWeek', type: 'scale', category: 'recovery', label: 'Compared to last week, how would you rate their overall functioning today?', scaleLabels: ['Much worse', 'A little worse', 'About the same', 'A little better', 'Much better'] },
  { id: 'compareToYesterday', type: 'scale', category: 'recovery', label: 'Compared to yesterday specifically, how would you rate today?', scaleLabels: ['Much worse', 'A little worse', 'About the same', 'A little better', 'Much better'] },
  { id: 'wordFindingDifficulty', type: 'scale', category: 'recovery', label: 'How much difficulty did they have finding the right words today?', scaleLabels: ['No difficulty', 'Slight difficulty', 'Some difficulty', 'Considerable difficulty', 'Severe difficulty'] },
  { id: 'objectMisplacement', type: 'yesno', category: 'recovery', label: 'Did they misplace an item in an unusual place (e.g. keys in the fridge) today?' },
  { id: 'followedInstructions', type: 'scale', category: 'recovery', label: 'How well could they follow a simple 2-3 step instruction today?', scaleLabels: ['Not at all', 'Rarely', 'Sometimes', 'Mostly', 'Fully'] },
  { id: 'recognizedOwnReflection', type: 'yesno', category: 'recovery', label: 'Did they show any confusion recognizing themselves in a mirror or photo today?' },
  { id: 'dayNightConfusion', type: 'yesno', category: 'recovery', label: 'Did they seem confused about whether it was day or night at any point?' },
  { id: 'recallOfRecentEvent', type: 'yesno', category: 'recovery', label: 'Could they recall something that happened earlier today when asked later?' },
  { id: 'repetitiveBehaviors', type: 'yesno', category: 'recovery', label: 'Did they repeat the same physical action (e.g. checking locks, rearranging items) today?' },

  // -- Mood / behaviour --
  { id: 'irritabilityLevel', type: 'scale', category: 'mood', label: 'How irritable or agitated did they seem today?', scaleLabels: ['Not at all', 'A little', 'Somewhat', 'Quite a bit', 'Very much'] },
  { id: 'restfulnessDuringDay', type: 'scale', category: 'mood', label: 'How restful or calm did they seem during the day?', scaleLabels: ['Very restless', 'Restless', 'Okay', 'Calm', 'Very calm'] },
  { id: 'anxietySigns', type: 'yesno', category: 'mood', label: 'Did they show any signs of unusual anxiety or worry today?' },
  { id: 'positiveMomentToday', type: 'text', category: 'mood', label: "Any positive moment from today you'd like to share? (optional)" },
  { id: 'sundowningSigns', type: 'yesno', category: 'mood', label: 'Did their confusion or agitation seem to get worse in the late afternoon/evening?' },
  { id: 'emotionalOutbursts', type: 'yesno', category: 'mood', label: 'Did they have any sudden emotional outburst (crying, anger) today?' },
  { id: 'suspicionOrParanoia', type: 'yesno', category: 'mood', label: 'Did they express unusual suspicion or distrust (e.g. accusing someone of stealing) today?' },
  { id: 'reactionToNewSituation', type: 'scale', category: 'mood', label: 'How well did they cope with an unexpected change or new situation today, if any came up?', scaleLabels: ['Very poorly', 'Poorly', 'Okay', 'Well', 'Very well'] },
  { id: 'timeSpentAlone', type: 'scale', category: 'mood', label: 'How much of the day did they spend withdrawn or isolated, by choice?', scaleLabels: ['None', 'A little', 'Some', 'A lot', 'Nearly all day'] },
  { id: 'energyLevel', type: 'scale', category: 'activities', label: "How was the patient's energy level today?", scaleLabels: ['Very low', 'Low', 'Moderate', 'Good', 'Very good'] },

  // -- Safety --
  { id: 'wanderingOrDisorientation', type: 'yesno', category: 'safety', label: 'Did they wander or seem lost/disoriented in a familiar place today?' },
  { id: 'balanceOrFalls', type: 'yesno', category: 'safety', label: 'Did they stumble, lose balance, or have a near-fall today?' },
  { id: 'newSymptomsNoticed', type: 'yesno', category: 'safety', label: 'Did you notice any new physical symptom today (pain, dizziness, tremor, etc.)?' },
  { id: 'gettingLostFamiliarRoute', type: 'yesno', category: 'safety', label: 'Did they get lost or confused on a route they normally know well?' },
  { id: 'hallucinationsOrMisperceptions', type: 'yesno', category: 'safety', label: 'Did they describe seeing or hearing something that was not there today?' },
  { id: 'weightOrAppearanceChange', type: 'yesno', category: 'safety', label: 'Did you notice any change in their physical appearance or weight today?' },
  { id: 'painDiscomfortSigns', type: 'scale', category: 'safety', label: 'How much pain or physical discomfort did they seem to show today?', scaleLabels: ['None', 'Mild', 'Moderate', 'Considerable', 'Severe'] },
  { id: 'medicationSideEffects', type: 'yesno', category: 'safety', label: 'Did you notice any possible medication side effect (drowsiness, dizziness, nausea) today?' },
  { id: 'overallSafetyConcern', type: 'yesno', category: 'safety', label: 'Did anything happen today that made you concerned about their safety?' },
  { id: 'medicationRefusal', type: 'yesno', category: 'safety', label: 'Did they refuse or resist taking any medication today?' },
];

export const CAREGIVER_ROTATING_COUNT = 10;
export const CAREGIVER_DAILY_TOTAL = CAREGIVER_CORE_QUESTIONS.length + CAREGIVER_ROTATING_COUNT;
