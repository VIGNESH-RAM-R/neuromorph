import { createStringLookup } from '../createStringLookup.js';

// RoleGateScreen -- the very first screen shown (before any login form),
// see RoleGateScreen.jsx's own 2026-08-17 comment for why it exists.
//
// Scope decision (OVERNIGHT_PLAN.md's open question, resolved here,
// 2026-08-20 overnight run): RoleGateScreen does NOT get its own language
// picker. Reasoning -- `language` is already app-wide state resolved in
// App.jsx via useLanguage() *before* RoleGateScreen ever renders (see
// useLanguage.js: it reads a previously-stored choice from localStorage, or
// falls back to DEFAULT_LANGUAGE if none exists yet). That means a
// *returning* user who already picked a language on a login screen last
// time will correctly see this screen in their language too, with zero new
// UI -- the only case that stays English is a brand-new user on their very
// first-ever visit, before they've made any choice at all, which is exactly
// what DEFAULT_LANGUAGE is for. Adding a second, separate picker here (on
// top of the one already on every login screen) would be redundant UI for
// a screen that's on screen for a couple of seconds at most. So: thread the
// existing `language` prop down and translate the text, no new picker.
export const ROLE_GATE_STRINGS = {
  en: {
    lede: "Who's signing in?",
    patientTitle: 'User / Patient Login',
    patientSub: 'Weekly check-ins, daily games, and your progress',
    doctorTitle: "I'm a Doctor / Clinician",
    doctorSub: 'Review patient assessments and ask the clinical assistant',
    caregiverTitle: "I'm a Caregiver",
    caregiverSub: 'Daily check-ins on how your loved one is doing',
  },
  hi: {
    lede: 'कौन साइन इन कर रहा है?',
    patientTitle: 'यूज़र / पेशेंट लॉगिन',
    patientSub: 'साप्ताहिक चेक-इन, रोज़ाना गेम्स, और आपकी प्रगति',
    doctorTitle: 'मैं एक डॉक्टर / क्लिनिशियन हूं',
    doctorSub: 'मरीज़ों के असेसमेंट देखें और क्लिनिकल असिस्टेंट से पूछें',
    caregiverTitle: 'मैं एक केयरगिवर हूं',
    caregiverSub: 'आपके प्रियजन कैसे कर रहे हैं, इस पर रोज़ाना चेक-इन',
  },
  ta: {
    lede: 'யார் உள்நுழைகிறார்கள்?',
    patientTitle: 'யூசர் / பேஷன்ட் லாகின்',
    patientSub: 'வாராந்திர செக்-இன்கள், தினசரி விளையாட்டுகள், மற்றும் உங்கள் முன்னேற்றம்',
    doctorTitle: 'நான் ஒரு டாக்டர் / கிளினிஷியன்',
    doctorSub: 'நோயாளியின் மதிப்பீடுகளை பார்வையிட்டு கிளினிக்கல் அசிஸ்டன்ட்டிடம் கேளுங்கள்',
    caregiverTitle: 'நான் ஒரு பராமரிப்பாளர்',
    caregiverSub: 'உங்கள் அன்புக்குரியவர் எப்படி இருக்கிறார் என்பதைப் பற்றிய தினசரி செக்-இன்',
  },
  fr: {
    lede: 'Qui se connecte ?',
    patientTitle: 'Connexion utilisateur / patient',
    patientSub: 'Bilans hebdomadaires, jeux quotidiens, et votre progression',
    doctorTitle: 'Je suis médecin / clinicien',
    doctorSub: "Consultez les évaluations des patients et posez vos questions à l'assistant clinique",
    caregiverTitle: 'Je suis un aidant',
    caregiverSub: "Bilans quotidiens sur l'état de votre proche",
  },
  te: {
    lede: 'ఎవరు సైన్ ఇన్ అవుతున్నారు?',
    patientTitle: 'యూజర్ / పేషెంట్ లాగిన్',
    patientSub: 'వారపు చెక్-ఇన్‌లు, రోజువారీ గేమ్‌లు, మరియు మీ పురోగతి',
    doctorTitle: 'నేను ఒక డాక్టర్ / క్లినిషియన్',
    doctorSub: 'పేషెంట్ అసెస్‌మెంట్‌లను సమీక్షించండి మరియు క్లినికల్ అసిస్టెంట్‌ని అడగండి',
    caregiverTitle: 'నేను ఒక కేర్‌గివర్',
    caregiverSub: 'మీ ప్రియమైన వ్యక్తి ఎలా ఉన్నారో దానిపై రోజువారీ చెక్-ఇన్‌లు',
  },
  ur: {
    lede: 'کون سائن اِن کر رہا ہے؟',
    patientTitle: 'یوزر / پیشنٹ لاگ اِن',
    patientSub: 'ہفتہ وار چیک اِنز، روزانہ گیمز، اور آپ کی پیش رفت',
    doctorTitle: 'میں ایک ڈاکٹر / کلینیشن ہوں',
    doctorSub: 'مریض کے جائزوں کا معائنہ کریں اور کلینیکل اسسٹنٹ سے پوچھیں',
    caregiverTitle: 'میں ایک کیئرگیور ہوں',
    caregiverSub: 'آپ کے پیارے کیسا محسوس کر رہے ہیں، اس پر روزانہ چیک اِن',
  },
  es: {
    lede: '¿Quién inicia sesión?',
    patientTitle: 'Inicio de sesión de usuario / paciente',
    patientSub: 'Chequeos semanales, juegos diarios, y tu progreso',
    doctorTitle: 'Soy médico / clínico',
    doctorSub: 'Revisa las evaluaciones de pacientes y consulta al asistente clínico',
    caregiverTitle: 'Soy cuidador',
    caregiverSub: 'Chequeos diarios sobre cómo está tu ser querido',
  },
};

export const t = createStringLookup(ROLE_GATE_STRINGS);
