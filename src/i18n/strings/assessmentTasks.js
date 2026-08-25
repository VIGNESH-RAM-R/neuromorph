import { createStringLookup, format } from '../createStringLookup.js';

// The individual Lobar Function Test task components under
// src/components/assessment/ -- explicitly the NEXT checklist item after
// assessment.js (the flow SHELL: AssessmentSection/Intro/Complete), per
// OVERNIGHT_PLAN.md and PROGRESS.md's 2026-08-20 04:34 entry.
//
// SCOPE (2026-08-22): covers the 9 components a patient can actually reach
// today -- the 8 currently-ACTIVE lobar tasks (StroopTask, GoNoGoTask,
// TokenTestTask, MatrixReasoningTask, GeometricShapeCopyTask,
// VisualMemoryTask, FaceRecognitionTask, DelayedRecognitionMemoryTask, per
// lobarTaskRegistryConfig.js's LOBAR_TASKS) plus QuestionBankTask (the
// 10-question block, always active, separate from the 8 lobar tasks). The
// 10 RETIRED task components (TrailMakingTask, VerbalFluencyTask,
// WordListRecallTask, DelayedRecognitionTask, NamingTask, ClockDrawingTask,
// CubeCopyTask, CalculationTask, EmbeddedFigureTask, ObjectNamingTask --
// `active: false` in lobarTaskRegistryConfig.js, never rendered by the live
// app) are a separate, deliberately deferred decision -- see PROGRESS.md.
//
// NOT covered here (separate, bigger, already-tracked items):
//   - QuestionBankTask's actual question.prompt/choices text -- comes from
//     QuestionBankEngine's 100-item bank config, its own higher-stakes
//     "translate clinical content carefully" checklist item.
//   - Token/color/shape/object/face NAMES used only in aria-label attributes
//     (e.g. TokenTestTask's `${size} ${color} ${shape}`, screen-reader-only)
//     -- come from each task's own config file (stroopConfig.js color
//     labels, tokenTestConfig.js, etc.), same "config-driven data is a
//     bigger job" deferral as gamesConfig.js/dailyTaskConfig.js.
//
// Many strings below are shared verbatim across several task files (e.g.
// "Practice trial", "Correct", "Submit") -- kept as ONE translated key each,
// reused via format()/direct lookup, rather than re-translating the same
// word 6 times with a chance of drifting inconsistent.
export const ASSESSMENT_TASKS_STRINGS = {
  en: {
    practicePrefix: 'Practice -- ',
    practiceTrialLabel: 'Practice trial',
    trialProgress: 'Trial {current} of {total}',
    practiceItemLabel: 'Practice item',
    itemProgress: 'Item {current} of {total}',
    practiceRoundLabel: 'Practice round',
    practiceFigureLabel: 'Practice figure',
    figureProgress: 'Figure {current} of {total}',
    categoryProgress: 'Category {current} of {total}',
    questionProgress: 'Question {current} of {total}',

    correct: 'Correct',
    incorrect: 'Incorrect',
    timeIsUp: "Time's up",
    submitBtn: 'Submit',
    clearBtn: 'Clear',
    doneBtn: 'Done',
    timeRemainingLine: 'Time remaining: {seconds}s',
    memorizeLine: 'Memorize: {seconds}s',
    delayLine: 'Delay: {seconds}s',
    delayHoldOnInstruction: 'Hold on -- recognition begins shortly.',

    stroopInstruction: 'Tap the button matching the INK COLOR of the word below -- not the word itself.',

    goNoGoInstruction: 'Tap the button (or press Spacebar) for GREEN. Do not respond for RED.',
    goNoGoRespondBtn: 'Response (Spacebar)',

    tokenTestInstruction: 'Listen carefully, then touch the token(s) described. Each instruction plays once.',
    tokenTestListeningStatus: 'Listen carefully -- playing once',
    tokenTestNotQuiteFeedback: "Not quite -- here's how it works",

    matrixInstruction: 'Figure out how the pattern changes, then pick the piece that completes it.',
    matrixChooseLabel: 'Choose the missing piece:',
    matrixCorrectPracticeFeedback: "Correct! That's how the pattern works.",
    matrixIncorrectPracticeFeedback: 'Not quite -- look at how each attribute changes across rows and columns.',

    geometricInstruction: 'Copy this figure as accurately as you can, then press Done.',
    geometricPracticeOkFeedback: "Nice -- that's the idea.",
    geometricPracticeRetryFeedback: 'Try to trace the full shape next time.',

    visualMemoryObserveInstruction: 'Study these objects. Try to remember all of them.',
    visualMemoryRecognizeInstruction: 'Select every object you saw earlier.',
    visualMemoryAllCorrectFeedback: 'All correct!',
    visualMemoryPartialFeedback: 'You got {hits} of {total} objects.',

    faceObserveInstruction: 'Study these faces. Try to remember each one.',
    faceRecognizeInstruction: 'Tap every face you saw earlier, then submit.',
    facePracticeFeedback: 'Correctly recognized {hits} of {totalTargets}; correctly rejected {correctRejections} of {totalDistractors} new faces.',

    delayedRecMemoryInstruction: 'Select every item you remember seeing earlier in this assessment.',
    delayedRecMemoryNoPracticeNote: "No practice round for this one -- you're recalling real items from earlier in this session.",
  },
  hi: {
    practicePrefix: 'अभ्यास -- ',
    practiceTrialLabel: 'अभ्यास ट्रायल',
    trialProgress: 'ट्रायल {current} / {total}',
    practiceItemLabel: 'अभ्यास आइटम',
    itemProgress: 'आइटम {current} / {total}',
    practiceRoundLabel: 'अभ्यास राउंड',
    practiceFigureLabel: 'अभ्यास आकृति',
    figureProgress: 'आकृति {current} / {total}',
    categoryProgress: 'श्रेणी {current} / {total}',
    questionProgress: 'प्रश्न {current} / {total}',

    correct: 'सही',
    incorrect: 'गलत',
    timeIsUp: 'समय समाप्त',
    submitBtn: 'सबमिट करें',
    clearBtn: 'साफ़ करें',
    doneBtn: 'हो गया',
    timeRemainingLine: 'शेष समय: {seconds} सेकंड',
    memorizeLine: 'याद करें: {seconds} सेकंड',
    delayLine: 'विराम: {seconds} सेकंड',
    delayHoldOnInstruction: 'रुकिए -- पहचान थोड़ी देर में शुरू होगी।',

    stroopInstruction: 'नीचे दिए गए शब्द के अक्षरों के रंग (INK COLOR) से मेल खाता बटन दबाएँ -- शब्द को नहीं।',

    goNoGoInstruction: 'हरे रंग के लिए बटन दबाएँ (या स्पेसबार दबाएँ)। लाल रंग पर कोई प्रतिक्रिया न दें।',
    goNoGoRespondBtn: 'प्रतिक्रिया (स्पेसबार)',

    tokenTestInstruction: 'ध्यान से सुनें, फिर बताए गए टोकन को छुएँ। हर निर्देश एक ही बार बजेगा।',
    tokenTestListeningStatus: 'ध्यान से सुनें -- एक बार बज रहा है',
    tokenTestNotQuiteFeedback: 'बिल्कुल सही नहीं -- यह ऐसे काम करता है',

    matrixInstruction: 'पहचानें कि पैटर्न कैसे बदल रहा है, फिर उसे पूरा करने वाला टुकड़ा चुनें।',
    matrixChooseLabel: 'लापता टुकड़ा चुनें:',
    matrixCorrectPracticeFeedback: 'सही! पैटर्न इसी तरह काम करता है।',
    matrixIncorrectPracticeFeedback: 'बिल्कुल सही नहीं -- देखें कि हर विशेषता पंक्तियों और स्तंभों में कैसे बदलती है।',

    geometricInstruction: 'इस आकृति को जितनी सटीकता से हो सके कॉपी करें, फिर "हो गया" दबाएँ।',
    geometricPracticeOkFeedback: 'बढ़िया -- यही सही तरीका है।',
    geometricPracticeRetryFeedback: 'अगली बार पूरी आकृति को रेखांकित करने की कोशिश करें।',

    visualMemoryObserveInstruction: 'इन वस्तुओं को ध्यान से देखें। सभी को याद रखने की कोशिश करें।',
    visualMemoryRecognizeInstruction: 'पहले देखी गई हर वस्तु को चुनें।',
    visualMemoryAllCorrectFeedback: 'सब सही!',
    visualMemoryPartialFeedback: 'आपने {total} में से {hits} वस्तुएँ सही चुनीं।',

    faceObserveInstruction: 'इन चेहरों को ध्यान से देखें। हर एक को याद रखने की कोशिश करें।',
    faceRecognizeInstruction: 'पहले देखा गया हर चेहरा चुनें, फिर सबमिट करें।',
    facePracticeFeedback: '{totalTargets} में से {hits} चेहरे सही पहचाने; {totalDistractors} नए चेहरों में से {correctRejections} को सही तरीके से नकारा।',

    delayedRecMemoryInstruction: 'इस असेसमेंट में पहले देखी गई हर वस्तु चुनें जो आपको याद हो।',
    delayedRecMemoryNoPracticeNote: 'इसके लिए कोई अभ्यास राउंड नहीं है -- आप इस सत्र में पहले देखी गई असली वस्तुएँ याद कर रहे हैं।',
  },
  ta: {
    practicePrefix: 'பயிற்சி -- ',
    practiceTrialLabel: 'பயிற்சி முயற்சி',
    trialProgress: 'முயற்சி {current} / {total}',
    practiceItemLabel: 'பயிற்சி உருப்படி',
    itemProgress: 'உருப்படி {current} / {total}',
    practiceRoundLabel: 'பயிற்சி சுற்று',
    practiceFigureLabel: 'பயிற்சி உருவம்',
    figureProgress: 'உருவம் {current} / {total}',
    categoryProgress: 'பிரிவு {current} / {total}',
    questionProgress: 'கேள்வி {current} / {total}',

    correct: 'சரி',
    incorrect: 'தவறு',
    timeIsUp: 'நேரம் முடிந்தது',
    submitBtn: 'சமர்ப்பி',
    clearBtn: 'அழி',
    doneBtn: 'முடிந்தது',
    timeRemainingLine: 'மீதமுள்ள நேரம்: {seconds} வி',
    memorizeLine: 'மனனம் செய்க: {seconds} வி',
    delayLine: 'இடைவெளி: {seconds} வி',
    delayHoldOnInstruction: 'சற்று காத்திருங்கள் -- அடையாளம் காணுதல் விரைவில் தொடங்கும்.',

    stroopInstruction: 'கீழே உள்ள சொல்லின் மை நிறத்திற்கு (INK COLOR) பொருந்தும் பொத்தானைத் தட்டவும் -- சொல்லைப் பொருட்படுத்த வேண்டாம்.',

    goNoGoInstruction: 'பச்சை நிறத்திற்கு பொத்தானைத் தட்டவும் (அல்லது ஸ்பேஸ்பாரை அழுத்தவும்). சிவப்பு நிறத்திற்கு பதிலளிக்க வேண்டாம்.',
    goNoGoRespondBtn: 'பதில் (ஸ்பேஸ்பார்)',

    tokenTestInstruction: 'கவனமாகக் கேளுங்கள், பின்னர் குறிப்பிடப்பட்ட டோக்கன்(களை)த் தொடவும். ஒவ்வொரு அறிவுறுத்தலும் ஒரே முறை இயங்கும்.',
    tokenTestListeningStatus: 'கவனமாகக் கேளுங்கள் -- ஒரு முறை இயங்குகிறது',
    tokenTestNotQuiteFeedback: 'சரியில்லை -- இது இப்படித்தான் வேலை செய்யும்',

    matrixInstruction: 'வடிவம் எப்படி மாறுகிறது என்பதைக் கண்டறிந்து, அதை நிறைவு செய்யும் துண்டைத் தேர்வு செய்யவும்.',
    matrixChooseLabel: 'விடுபட்ட துண்டைத் தேர்வு செய்யவும்:',
    matrixCorrectPracticeFeedback: 'சரி! வடிவம் இப்படித்தான் வேலை செய்கிறது.',
    matrixIncorrectPracticeFeedback: 'சரியில்லை -- ஒவ்வொரு பண்பும் வரிசைகள் மற்றும் நெடுவரிசைகளில் எப்படி மாறுகிறது எனப் பாருங்கள்.',

    geometricInstruction: 'இந்த உருவத்தை முடிந்தவரை துல்லியமாக நகலெடுக்கவும், பின்னர் "முடிந்தது" பொத்தானை அழுத்தவும்.',
    geometricPracticeOkFeedback: 'அருமை -- இதுதான் சரியான யோசனை.',
    geometricPracticeRetryFeedback: 'அடுத்த முறை முழு வடிவத்தையும் வரைய முயற்சிக்கவும்.',

    visualMemoryObserveInstruction: 'இந்தப் பொருட்களை கவனமாகப் பாருங்கள். அனைத்தையும் நினைவில் வைக்க முயற்சிக்கவும்.',
    visualMemoryRecognizeInstruction: 'முன்பு நீங்கள் பார்த்த ஒவ்வொரு பொருளையும் தேர்ந்தெடுக்கவும்.',
    visualMemoryAllCorrectFeedback: 'அனைத்தும் சரி!',
    visualMemoryPartialFeedback: '{total} பொருட்களில் {hits} பொருட்களை நீங்கள் சரியாகத் தேர்ந்தெடுத்தீர்கள்.',

    faceObserveInstruction: 'இந்த முகங்களை கவனமாகப் பாருங்கள். ஒவ்வொன்றையும் நினைவில் வைக்க முயற்சிக்கவும்.',
    faceRecognizeInstruction: 'முன்பு நீங்கள் பார்த்த ஒவ்வொரு முகத்தையும் தட்டவும், பின்னர் சமர்ப்பிக்கவும்.',
    facePracticeFeedback: '{totalTargets} இல் {hits} முகங்களை சரியாக அடையாளம் கண்டீர்கள்; {totalDistractors} புதிய முகங்களில் {correctRejections} ஐ சரியாக நிராகரித்தீர்கள்.',

    delayedRecMemoryInstruction: 'இந்த மதிப்பீட்டில் முன்பு நீங்கள் பார்த்ததாக நினைவிருக்கும் ஒவ்வொரு பொருளையும் தேர்ந்தெடுக்கவும்.',
    delayedRecMemoryNoPracticeNote: 'இதற்கு பயிற்சி சுற்று இல்லை -- இந்த அமர்வில் முன்பு பார்த்த உண்மையான பொருட்களை நீங்கள் நினைவுகூர்கிறீர்கள்.',
  },
  fr: {
    practicePrefix: 'Entraînement -- ',
    practiceTrialLabel: "Essai d'entraînement",
    trialProgress: 'Essai {current} sur {total}',
    practiceItemLabel: "Élément d'entraînement",
    itemProgress: 'Élément {current} sur {total}',
    practiceRoundLabel: "Manche d'entraînement",
    practiceFigureLabel: "Figure d'entraînement",
    figureProgress: 'Figure {current} sur {total}',
    categoryProgress: 'Catégorie {current} sur {total}',
    questionProgress: 'Question {current} sur {total}',

    correct: 'Correct',
    incorrect: 'Incorrect',
    timeIsUp: "Le temps est écoulé",
    submitBtn: 'Valider',
    clearBtn: 'Effacer',
    doneBtn: 'Terminé',
    timeRemainingLine: 'Temps restant : {seconds} s',
    memorizeLine: 'Mémorisez : {seconds} s',
    delayLine: 'Pause : {seconds} s',
    delayHoldOnInstruction: 'Patientez -- la reconnaissance commence bientôt.',

    stroopInstruction: "Appuyez sur le bouton correspondant à la COULEUR D'ENCRE du mot ci-dessous -- pas au mot lui-même.",

    goNoGoInstruction: 'Appuyez sur le bouton (ou la barre d\'espace) pour VERT. Ne répondez pas pour ROUGE.',
    goNoGoRespondBtn: 'Réponse (barre d\'espace)',

    tokenTestInstruction: 'Écoutez attentivement, puis touchez le ou les jetons décrits. Chaque consigne n\'est lue qu\'une seule fois.',
    tokenTestListeningStatus: 'Écoutez attentivement -- lecture unique',
    tokenTestNotQuiteFeedback: 'Pas tout à fait -- voici comment cela fonctionne',

    matrixInstruction: 'Repérez comment le motif change, puis choisissez la pièce qui le complète.',
    matrixChooseLabel: 'Choisissez la pièce manquante :',
    matrixCorrectPracticeFeedback: "Correct ! C'est ainsi que fonctionne le motif.",
    matrixIncorrectPracticeFeedback: "Pas tout à fait -- observez comment chaque caractéristique change selon les lignes et les colonnes.",

    geometricInstruction: 'Copiez cette figure aussi précisément que possible, puis appuyez sur Terminé.',
    geometricPracticeOkFeedback: "Bien -- c'est l'idée.",
    geometricPracticeRetryFeedback: 'Essayez de tracer la figure en entier la prochaine fois.',

    visualMemoryObserveInstruction: 'Observez ces objets. Essayez de tous les mémoriser.',
    visualMemoryRecognizeInstruction: 'Sélectionnez chaque objet que vous avez vu précédemment.',
    visualMemoryAllCorrectFeedback: 'Tout est correct !',
    visualMemoryPartialFeedback: 'Vous avez trouvé {hits} objets sur {total}.',

    faceObserveInstruction: 'Observez ces visages. Essayez de mémoriser chacun d\'eux.',
    faceRecognizeInstruction: 'Touchez chaque visage que vous avez vu précédemment, puis validez.',
    facePracticeFeedback: '{hits} visages reconnus sur {totalTargets} ; {correctRejections} nouveaux visages correctement écartés sur {totalDistractors}.',

    delayedRecMemoryInstruction: 'Sélectionnez chaque élément dont vous vous souvenez avoir vu plus tôt dans ce bilan.',
    delayedRecMemoryNoPracticeNote: "Pas d'entraînement pour cette épreuve -- vous devez vous rappeler d'éléments réels vus plus tôt dans cette session.",
  },
  te: {
    practicePrefix: 'ప్రాక్టీస్ -- ',
    practiceTrialLabel: 'ప్రాక్టీస్ ట్రయల్',
    trialProgress: 'ట్రయల్ {current} / {total}',
    practiceItemLabel: 'ప్రాక్టీస్ ఐటమ్',
    itemProgress: 'ఐటమ్ {current} / {total}',
    practiceRoundLabel: 'ప్రాక్టీస్ రౌండ్',
    practiceFigureLabel: 'ప్రాక్టీస్ ఆకారం',
    figureProgress: 'ఆకారం {current} / {total}',
    categoryProgress: 'వర్గం {current} / {total}',
    questionProgress: 'ప్రశ్న {current} / {total}',

    correct: 'సరైనది',
    incorrect: 'తప్పు',
    timeIsUp: 'సమయం ముగిసింది',
    submitBtn: 'సమర్పించు',
    clearBtn: 'క్లియర్ చేయి',
    doneBtn: 'పూర్తయింది',
    timeRemainingLine: 'మిగిలిన సమయం: {seconds} సె',
    memorizeLine: 'గుర్తుంచుకోండి: {seconds} సె',
    delayLine: 'విరామం: {seconds} సె',
    delayHoldOnInstruction: 'కొద్దిసేపు వేచి ఉండండి -- గుర్తింపు త్వరలో మొదలవుతుంది.',

    stroopInstruction: 'కింద ఉన్న పదం యొక్క ఇంక్ కలర్ (INK COLOR)కి సరిపోలే బటన్‌ని నొక్కండి -- పదాన్ని కాదు.',

    goNoGoInstruction: 'ఆకుపచ్చ రంగుకు బటన్ నొక్కండి (లేదా స్పేస్‌బార్ నొక్కండి). ఎరుపు రంగుకు స్పందించవద్దు.',
    goNoGoRespondBtn: 'స్పందన (స్పేస్‌బార్)',

    tokenTestInstruction: 'జాగ్రత్తగా వినండి, తర్వాత చెప్పిన టోకెన్(లు)ను తాకండి. ప్రతి సూచన ఒక్కసారి మాత్రమే వినిపిస్తుంది.',
    tokenTestListeningStatus: 'జాగ్రత్తగా వినండి -- ఒకసారి ప్లే అవుతోంది',
    tokenTestNotQuiteFeedback: 'సరిగ్గా సరిపోలేదు -- ఇది ఇలా పనిచేస్తుంది',

    matrixInstruction: 'నమూనా ఎలా మారుతుందో గుర్తించి, దానిని పూర్తి చేసే భాగాన్ని ఎంచుకోండి.',
    matrixChooseLabel: 'తప్పిపోయిన భాగాన్ని ఎంచుకోండి:',
    matrixCorrectPracticeFeedback: 'సరైనది! నమూనా ఇలాగే పనిచేస్తుంది.',
    matrixIncorrectPracticeFeedback: 'సరిగ్గా సరిపోలేదు -- ప్రతి లక్షణం వరుసలు మరియు నిలువు వరుసలలో ఎలా మారుతుందో గమనించండి.',

    geometricInstruction: 'ఈ ఆకారాన్ని వీలైనంత ఖచ్చితంగా కాపీ చేయండి, తర్వాత "పూర్తయింది" నొక్కండి.',
    geometricPracticeOkFeedback: 'బాగుంది -- ఇదే సరైన ఆలోచన.',
    geometricPracticeRetryFeedback: 'తదుపరిసారి పూర్తి ఆకారాన్ని గీయడానికి ప్రయత్నించండి.',

    visualMemoryObserveInstruction: 'ఈ వస్తువులను జాగ్రత్తగా చూడండి. అన్నింటినీ గుర్తుంచుకోవడానికి ప్రయత్నించండి.',
    visualMemoryRecognizeInstruction: 'మీరు ముందు చూసిన ప్రతి వస్తువును ఎంచుకోండి.',
    visualMemoryAllCorrectFeedback: 'అన్నీ సరైనవి!',
    visualMemoryPartialFeedback: 'మీరు {total}లో {hits} వస్తువులను సరిగ్గా ఎంచుకున్నారు.',

    faceObserveInstruction: 'ఈ ముఖాలను జాగ్రత్తగా చూడండి. ప్రతి దాన్ని గుర్తుంచుకోవడానికి ప్రయత్నించండి.',
    faceRecognizeInstruction: 'మీరు ముందు చూసిన ప్రతి ముఖాన్ని నొక్కి, తర్వాత సమర్పించండి.',
    facePracticeFeedback: '{totalTargets}లో {hits} ముఖాలను సరిగ్గా గుర్తించారు; {totalDistractors} కొత్త ముఖాలలో {correctRejections}ని సరిగ్గా తిరస్కరించారు.',

    delayedRecMemoryInstruction: 'ఈ అసెస్‌మెంట్‌లో ముందు చూసినట్లు గుర్తున్న ప్రతి వస్తువును ఎంచుకోండి.',
    delayedRecMemoryNoPracticeNote: 'దీనికి ప్రాక్టీస్ రౌండ్ లేదు -- మీరు ఈ సెషన్‌లో ముందు చూసిన నిజమైన వస్తువులను గుర్తు చేసుకుంటున్నారు.',
  },
  ur: {
    practicePrefix: 'مشق -- ',
    practiceTrialLabel: 'مشقی ٹرائل',
    trialProgress: 'ٹرائل {current} از {total}',
    practiceItemLabel: 'مشقی آئٹم',
    itemProgress: 'آئٹم {current} از {total}',
    practiceRoundLabel: 'مشقی راؤنڈ',
    practiceFigureLabel: 'مشقی شکل',
    figureProgress: 'شکل {current} از {total}',
    categoryProgress: 'زمرہ {current} از {total}',
    questionProgress: 'سوال {current} از {total}',

    correct: 'درست',
    incorrect: 'غلط',
    timeIsUp: 'وقت ختم ہو گیا',
    submitBtn: 'جمع کریں',
    clearBtn: 'صاف کریں',
    doneBtn: 'ہو گیا',
    timeRemainingLine: 'باقی وقت: {seconds} سیکنڈ',
    memorizeLine: 'یاد کریں: {seconds} سیکنڈ',
    delayLine: 'وقفہ: {seconds} سیکنڈ',
    delayHoldOnInstruction: 'رکیے -- شناخت جلد شروع ہوگی۔',

    stroopInstruction: 'نیچے دیے گئے لفظ کے سیاہی کے رنگ (INK COLOR) سے مماثل بٹن دبائیں -- لفظ کو نہیں۔',

    goNoGoInstruction: 'سبز کے لیے بٹن دبائیں (یا اسپیس بار دبائیں)۔ سرخ پر کوئی جواب نہ دیں۔',
    goNoGoRespondBtn: 'جواب (اسپیس بار)',

    tokenTestInstruction: 'غور سے سنیں، پھر بتائے گئے ٹوکن کو چھوئیں۔ ہر ہدایت صرف ایک بار چلے گی۔',
    tokenTestListeningStatus: 'غور سے سنیں -- ایک بار چل رہا ہے',
    tokenTestNotQuiteFeedback: 'بالکل درست نہیں -- یہ اس طرح کام کرتا ہے',

    matrixInstruction: 'معلوم کریں کہ نمونہ کیسے بدل رہا ہے، پھر اسے مکمل کرنے والا ٹکڑا منتخب کریں۔',
    matrixChooseLabel: 'غائب ٹکڑا منتخب کریں:',
    matrixCorrectPracticeFeedback: 'درست! نمونہ اسی طرح کام کرتا ہے۔',
    matrixIncorrectPracticeFeedback: 'بالکل درست نہیں -- دیکھیں کہ ہر خصوصیت قطاروں اور کالموں میں کیسے بدلتی ہے۔',

    geometricInstruction: 'اس شکل کو جتنا ممکن ہو درست طریقے سے کاپی کریں، پھر "ہو گیا" دبائیں۔',
    geometricPracticeOkFeedback: 'بہت خوب -- یہی صحیح خیال ہے۔',
    geometricPracticeRetryFeedback: 'اگلی بار پوری شکل کا خاکہ بنانے کی کوشش کریں۔',

    visualMemoryObserveInstruction: 'ان اشیاء کو غور سے دیکھیں۔ سب کو یاد رکھنے کی کوشش کریں۔',
    visualMemoryRecognizeInstruction: 'پہلے دیکھی گئی ہر چیز منتخب کریں۔',
    visualMemoryAllCorrectFeedback: 'سب درست!',
    visualMemoryPartialFeedback: 'آپ نے {total} میں سے {hits} اشیاء درست منتخب کیں۔',

    faceObserveInstruction: 'ان چہروں کو غور سے دیکھیں۔ ہر ایک کو یاد رکھنے کی کوشش کریں۔',
    faceRecognizeInstruction: 'پہلے دیکھا گیا ہر چہرہ دبائیں، پھر جمع کریں۔',
    facePracticeFeedback: '{totalTargets} میں سے {hits} چہرے درست پہچانے؛ {totalDistractors} نئے چہروں میں سے {correctRejections} کو درست طور پر مسترد کیا۔',

    delayedRecMemoryInstruction: 'اس تشخیص میں پہلے دیکھی گئی ہر وہ چیز منتخب کریں جو آپ کو یاد ہو۔',
    delayedRecMemoryNoPracticeNote: 'اس کے لیے کوئی مشقی راؤنڈ نہیں ہے -- آپ اس سیشن میں پہلے دیکھی گئی اصل اشیاء یاد کر رہے ہیں۔',
  },
  es: {
    practicePrefix: 'Práctica -- ',
    practiceTrialLabel: 'Ensayo de práctica',
    trialProgress: 'Ensayo {current} de {total}',
    practiceItemLabel: 'Elemento de práctica',
    itemProgress: 'Elemento {current} de {total}',
    practiceRoundLabel: 'Ronda de práctica',
    practiceFigureLabel: 'Figura de práctica',
    figureProgress: 'Figura {current} de {total}',
    categoryProgress: 'Categoría {current} de {total}',
    questionProgress: 'Pregunta {current} de {total}',

    correct: 'Correcto',
    incorrect: 'Incorrecto',
    timeIsUp: 'Se acabó el tiempo',
    submitBtn: 'Enviar',
    clearBtn: 'Borrar',
    doneBtn: 'Listo',
    timeRemainingLine: 'Tiempo restante: {seconds} s',
    memorizeLine: 'Memoriza: {seconds} s',
    delayLine: 'Pausa: {seconds} s',
    delayHoldOnInstruction: 'Espera -- el reconocimiento comienza en breve.',

    stroopInstruction: 'Toca el botón que coincida con el COLOR DE TINTA de la palabra de abajo -- no con la palabra en sí.',

    goNoGoInstruction: 'Toca el botón (o presiona la barra espaciadora) para VERDE. No respondas para ROJO.',
    goNoGoRespondBtn: 'Responder (barra espaciadora)',

    tokenTestInstruction: 'Escucha con atención y luego toca la(s) ficha(s) descrita(s). Cada instrucción se reproduce una sola vez.',
    tokenTestListeningStatus: 'Escucha con atención -- reproduciendo una vez',
    tokenTestNotQuiteFeedback: 'No exactamente -- así es como funciona',

    matrixInstruction: 'Descubre cómo cambia el patrón y luego elige la pieza que lo completa.',
    matrixChooseLabel: 'Elige la pieza que falta:',
    matrixCorrectPracticeFeedback: '¡Correcto! Así es como funciona el patrón.',
    matrixIncorrectPracticeFeedback: 'No exactamente -- fíjate cómo cambia cada atributo en filas y columnas.',

    geometricInstruction: 'Copia esta figura con la mayor precisión posible y luego presiona Listo.',
    geometricPracticeOkFeedback: 'Bien -- esa es la idea.',
    geometricPracticeRetryFeedback: 'Intenta trazar la figura completa la próxima vez.',

    visualMemoryObserveInstruction: 'Observa estos objetos. Intenta recordarlos todos.',
    visualMemoryRecognizeInstruction: 'Selecciona cada objeto que viste antes.',
    visualMemoryAllCorrectFeedback: '¡Todo correcto!',
    visualMemoryPartialFeedback: 'Acertaste {hits} de {total} objetos.',

    faceObserveInstruction: 'Observa estos rostros. Intenta recordar cada uno.',
    faceRecognizeInstruction: 'Toca cada rostro que viste antes y luego envía.',
    facePracticeFeedback: 'Reconociste correctamente {hits} de {totalTargets}; rechazaste correctamente {correctRejections} de {totalDistractors} rostros nuevos.',

    delayedRecMemoryInstruction: 'Selecciona cada elemento que recuerdes haber visto antes en esta evaluación.',
    delayedRecMemoryNoPracticeNote: 'Esta prueba no tiene ronda de práctica -- estás recordando elementos reales que viste antes en esta sesión.',
  },
};

export const t = createStringLookup(ASSESSMENT_TASKS_STRINGS);
export { format };
