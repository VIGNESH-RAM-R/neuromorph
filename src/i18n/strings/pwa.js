import { createStringLookup } from '../createStringLookup.js';

// Copy for InstallAppPrompt.jsx -- kept in its own file rather than added
// to common.js so this addition (built independently, 2026-08-20) never
// touches a file the overnight translation pass might be mid-edit on.
export const PWA_STRINGS = {
  en: {
    installTitle: 'Install NEUROMORPH',
    installBlurb: 'Add it to your home screen for one-tap access and offline support.',
    install: 'Install',
    notNow: 'Not now',
    installedTitle: "You're all set",
    installedBlurb: 'NEUROMORPH is installed. Open it any time from your home screen.',
  },
  hi: {
    installTitle: 'NEUROMORPH इंस्टॉल करें',
    installBlurb: 'एक-टैप एक्सेस और ऑफ़लाइन सपोर्ट के लिए इसे अपनी होम स्क्रीन पर जोड़ें।',
    install: 'इंस्टॉल करें',
    notNow: 'अभी नहीं',
    installedTitle: 'आप तैयार हैं',
    installedBlurb: 'NEUROMORPH इंस्टॉल हो गया है। इसे कभी भी अपनी होम स्क्रीन से खोलें।',
  },
  ta: {
    installTitle: 'NEUROMORPH-ஐ நிறுவவும்',
    installBlurb: 'ஒரு-தட்டு அணுகல் மற்றும் ஆஃப்லைன் ஆதரவிற்காக இதை உங்கள் ஹோம் ஸ்கிரீனில் சேர்க்கவும்.',
    install: 'நிறுவவும்',
    notNow: 'இப்போது வேண்டாம்',
    installedTitle: 'நீங்கள் தயார்',
    installedBlurb: 'NEUROMORPH நிறுவப்பட்டது. எப்போது வேண்டுமானாலும் உங்கள் ஹோம் ஸ்கிரீனில் இருந்து திறக்கவும்.',
  },
  fr: {
    installTitle: 'Installer NEUROMORPH',
    installBlurb: "Ajoutez-le à votre écran d'accueil pour un accès en un geste et une utilisation hors ligne.",
    install: 'Installer',
    notNow: 'Pas maintenant',
    installedTitle: 'Vous êtes prêt',
    installedBlurb: "NEUROMORPH est installé. Ouvrez-le à tout moment depuis votre écran d'accueil.",
  },
  te: {
    installTitle: 'NEUROMORPH ఇన్‌స్టాల్ చేయండి',
    installBlurb: 'వన్-టాప్ యాక్సెస్ మరియు ఆఫ్‌లైన్ మద్దతు కోసం దీన్ని మీ హోమ్ స్క్రీన్‌కు జోడించండి.',
    install: 'ఇన్‌స్టాల్ చేయండి',
    notNow: 'ఇప్పుడు వద్దు',
    installedTitle: 'మీరు సిద్ధంగా ఉన్నారు',
    installedBlurb: 'NEUROMORPH ఇన్‌స్టాల్ అయింది. దీన్ని ఎప్పుడైనా మీ హోమ్ స్క్రీన్ నుండి తెరవండి.',
  },
  ur: {
    installTitle: 'NEUROMORPH انسٹال کریں',
    installBlurb: 'ون ٹیپ رسائی اور آف لائن سپورٹ کے لیے اسے اپنی ہوم اسکرین پر شامل کریں۔',
    install: 'انسٹال کریں',
    notNow: 'ابھی نہیں',
    installedTitle: 'آپ تیار ہیں',
    installedBlurb: 'NEUROMORPH انسٹال ہو گیا ہے۔ اسے کسی بھی وقت اپنی ہوم اسکرین سے کھولیں۔',
  },
  es: {
    installTitle: 'Instalar NEUROMORPH',
    installBlurb: 'Añádela a tu pantalla de inicio para un acceso con un toque y uso sin conexión.',
    install: 'Instalar',
    notNow: 'Ahora no',
    installedTitle: 'Todo listo',
    installedBlurb: 'NEUROMORPH está instalada. Ábrela cuando quieras desde tu pantalla de inicio.',
  },
};

export const t = createStringLookup(PWA_STRINGS);
