import { createStringLookup, format } from '../createStringLookup.js';

// Copy for MorphyCompanion.jsx -- the persistent, patient-only companion
// mascot (see App.jsx's 2026-08-28 patient-shell block). Deliberately its
// own small table, separate from home.js's existing milestone/streak
// copy: those strings describe a STATE ("3 more days to X"), these
// describe a brief, in-the-moment REACTION (a brief speech-bubble line
// when a milestone/Daily Set/momentum/weekly-due event just happened) --
// different job, so kept short and celebratory rather than explanatory.
// Standing i18n rule for this session: full 7-language coverage for every
// patient-facing surface -- this qualifies (MorphyCompanion is imported
// only in the patient branch of App.jsx, never caregiver/doctor).
export const MORPHY_COMPANION_STRINGS = {
  en: {
    ariaLabelClosed: 'Open Morphy, your NEUROMORPH companion',
    ariaLabelOpen: 'Close Morphy',
    ariaLabelAssessmentActive: "Morphy (resting quietly during your assessment)",
    milestoneReached: '{label}! Amazing work.',
    dailySetComplete: "Today's set is done. Nice work!",
    momentumImprovement: "You're doing even better than yesterday.",
    weeklyDue: 'Your weekly Detection Assessment is ready whenever you are.',
    idleGreeting: 'Hi! Need anything?',
  },
  hi: {
    ariaLabelClosed: 'मॉर्फी खोलें, आपका NEUROMORPH साथी',
    ariaLabelOpen: 'मॉर्फी बंद करें',
    ariaLabelAssessmentActive: 'मॉर्फी (आपके मूल्यांकन के दौरान चुपचाप आराम कर रहा है)',
    milestoneReached: '{label}! शानदार काम।',
    dailySetComplete: 'आज का सेट पूरा हो गया। बहुत बढ़िया!',
    momentumImprovement: 'आप कल से भी बेहतर कर रहे हैं।',
    weeklyDue: 'आपका साप्ताहिक डिटेक्शन असेसमेंट तैयार है, जब भी आप चाहें।',
    idleGreeting: 'नमस्ते! कुछ चाहिए?',
  },
  ta: {
    ariaLabelClosed: 'மார்ஃபியைத் திற, உங்கள் NEUROMORPH துணை',
    ariaLabelOpen: 'மார்ஃபியை மூடு',
    ariaLabelAssessmentActive: 'மார்ஃபி (உங்கள் மதிப்பீட்டின் போது அமைதியாக ஓய்வெடுக்கிறது)',
    milestoneReached: '{label}! அற்புதமான வேலை.',
    dailySetComplete: 'இன்றைய செட் முடிந்தது. அருமை!',
    momentumImprovement: 'நேற்றை விடவும் இன்று சிறப்பாக செய்கிறீர்கள்.',
    weeklyDue: 'உங்கள் வாராந்திர டிடெக்ஷன் அசெஸ்மென்ட் தயார், நீங்கள் தயாராகும்போது.',
    idleGreeting: 'ஹாய்! ஏதாவது வேண்டுமா?',
  },
  fr: {
    ariaLabelClosed: 'Ouvrir Morphy, votre compagnon NEUROMORPH',
    ariaLabelOpen: 'Fermer Morphy',
    ariaLabelAssessmentActive: 'Morphy (se repose tranquillement pendant votre évaluation)',
    milestoneReached: '{label} ! Un travail formidable.',
    dailySetComplete: "L'ensemble du jour est terminé. Bien joué !",
    momentumImprovement: "Vous faites encore mieux qu'hier.",
    weeklyDue: 'Votre évaluation de dépistage hebdomadaire est prête quand vous le souhaitez.',
    idleGreeting: 'Salut ! Besoin de quelque chose ?',
  },
  te: {
    ariaLabelClosed: 'మార్ఫీని తెరవండి, మీ NEUROMORPH సహచరుడు',
    ariaLabelOpen: 'మార్ఫీని మూసివేయండి',
    ariaLabelAssessmentActive: 'మార్ఫీ (మీ అసెస్‌మెంట్ సమయంలో నిశ్శబ్దంగా విశ్రాంతి తీసుకుంటోంది)',
    milestoneReached: '{label}! అద్భుతమైన పని.',
    dailySetComplete: 'ఈ రోజు సెట్ పూర్తయింది. చాలా బాగుంది!',
    momentumImprovement: 'మీరు నిన్నటి కంటే మరింత బాగా చేస్తున్నారు.',
    weeklyDue: 'మీ వారపు డిటెక్షన్ అసెస్‌మెంట్ మీరు సిద్ధమైనప్పుడు సిద్ధంగా ఉంది.',
    idleGreeting: 'హాయ్! ఏమైనా కావాలా?',
  },
  ur: {
    ariaLabelClosed: 'مورفی کھولیں، آپ کا NEUROMORPH ساتھی',
    ariaLabelOpen: 'مورفی بند کریں',
    ariaLabelAssessmentActive: 'مورفی (آپ کے اسیسمنٹ کے دوران خاموشی سے آرام کر رہا ہے)',
    milestoneReached: '{label}! زبردست کام۔',
    dailySetComplete: 'آج کا سیٹ مکمل ہو گیا۔ شاباش!',
    momentumImprovement: 'آپ کل سے بھی بہتر کر رہے ہیں۔',
    weeklyDue: 'آپ کا ہفتہ وار ڈٹیکشن اسیسمنٹ تیار ہے، جب بھی آپ چاہیں۔',
    idleGreeting: 'ہائے! کچھ چاہیے؟',
  },
  es: {
    ariaLabelClosed: 'Abrir Morphy, tu compañero de NEUROMORPH',
    ariaLabelOpen: 'Cerrar Morphy',
    ariaLabelAssessmentActive: 'Morphy (descansando tranquilamente durante tu evaluación)',
    milestoneReached: '¡{label}! Un trabajo increíble.',
    dailySetComplete: 'El conjunto de hoy está completo. ¡Bien hecho!',
    momentumImprovement: 'Lo estás haciendo aún mejor que ayer.',
    weeklyDue: 'Tu evaluación de detección semanal está lista cuando tú quieras.',
    idleGreeting: '¡Hola! ¿Necesitas algo?',
  },
};

export const t = createStringLookup(MORPHY_COMPANION_STRINGS);
export { format };
