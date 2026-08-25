import { createStringLookup } from '../createStringLookup.js';

// App-wide chrome shared across every screen: the top bar's nav labels and
// brand subtitle, the sign-out button, the theme/language toggles, the
// session-loading state, and the footer's non-diagnostic disclaimer. First
// slice of Doctor_Dashboard's i18n effort (2026-08-22), porting the exact
// pattern app_page's src/i18n/strings/common.js established -- see
// OVERNIGHT_PLAN.md's "Doctor_Dashboard" checklist. Same honest scope note
// as app_page's own i18n files: this is Claude-translated UI copy, good
// enough for a clinician-facing dashboard's chrome; a native-speaker review
// pass is worth doing before any real clinical deployment.
export const COMMON_STRINGS = {
  en: {
    brandSubtitle: 'Doctor Dashboard',
    'nav.patients': 'Patients',
    'nav.requests': 'Requests',
    'nav.report': 'Patient Report',
    signOut: 'Sign out',
    themeToggleLight: 'Light mode',
    themeToggleDark: 'Dark mode',
    themeToggleAriaLabel: 'Toggle light/dark theme',
    languageSelectorAriaLabel: 'Choose language',
    loadingSession: 'Loading your session…',
    footerDisclaimer: 'NEUROMORPH is an early cognitive screening tool, not a diagnostic instrument. All findings require clinical correlation.',
  },
  hi: {
    brandSubtitle: 'डॉक्टर डैशबोर्ड',
    'nav.patients': 'मरीज़',
    'nav.requests': 'अनुरोध',
    'nav.report': 'मरीज़ रिपोर्ट',
    signOut: 'साइन आउट',
    themeToggleLight: 'लाइट मोड',
    themeToggleDark: 'डार्क मोड',
    themeToggleAriaLabel: 'लाइट/डार्क थीम बदलें',
    languageSelectorAriaLabel: 'भाषा चुनें',
    loadingSession: 'आपका सेशन लोड हो रहा है…',
    footerDisclaimer: 'न्यूरोमॉर्फ एक शुरुआती कॉग्निटिव स्क्रीनिंग टूल है, नैदानिक उपकरण नहीं। सभी निष्कर्षों के लिए क्लिनिकल सहसंबंध आवश्यक है।',
  },
  ta: {
    brandSubtitle: 'மருத்துவர் டாஷ்போர்டு',
    'nav.patients': 'நோயாளிகள்',
    'nav.requests': 'கோரிக்கைகள்',
    'nav.report': 'நோயாளர் அறிக்கை',
    signOut: 'வெளியேறு',
    themeToggleLight: 'லைட் மோட்',
    themeToggleDark: 'டார்க் மோட்',
    themeToggleAriaLabel: 'லைட்/டார்க் தீம் மாற்று',
    languageSelectorAriaLabel: 'மொழியைத் தேர்ந்தெடு',
    loadingSession: 'உங்கள் அமர்வு ஏற்றப்படுகிறது…',
    footerDisclaimer: 'நியூரோமார்ஃப் ஒரு ஆரம்பநிலை அறிவாற்றல் பரிசோதனை கருவி, இது ஒரு நோய் கண்டறியும் கருவி அல்ல. அனைத்து முடிவுகளுக்கும் மருத்துவ ஒப்பீடு தேவை.',
  },
  fr: {
    brandSubtitle: 'Tableau de bord médecin',
    'nav.patients': 'Patients',
    'nav.requests': 'Demandes',
    'nav.report': 'Rapport patient',
    signOut: 'Se déconnecter',
    themeToggleLight: 'Mode clair',
    themeToggleDark: 'Mode sombre',
    themeToggleAriaLabel: 'Basculer entre le thème clair et sombre',
    languageSelectorAriaLabel: 'Choisir la langue',
    loadingSession: 'Chargement de votre session…',
    footerDisclaimer: "NEUROMORPH est un outil de dépistage cognitif précoce, pas un instrument de diagnostic. Tous les résultats nécessitent une corrélation clinique.",
  },
  te: {
    brandSubtitle: 'డాక్టర్ డాష్‌బోర్డ్',
    'nav.patients': 'రోగులు',
    'nav.requests': 'అభ్యర్థనలు',
    'nav.report': 'రోగి నివేదిక',
    signOut: 'సైన్ అవుట్',
    themeToggleLight: 'లైట్ మోడ్',
    themeToggleDark: 'డార్క్ మోడ్',
    themeToggleAriaLabel: 'లైట్/డార్క్ థీమ్‌ను మార్చండి',
    languageSelectorAriaLabel: 'భాషను ఎంచుకోండి',
    loadingSession: 'మీ సెషన్ లోడ్ అవుతోంది…',
    footerDisclaimer: 'న్యూరోమార్ఫ్ ఒక ప్రారంభ దశ కాగ్నిటివ్ స్క్రీనింగ్ సాధనం, ఇది రోగనిర్ధారణ పరికరం కాదు. అన్ని ఫలితాలకు క్లినికల్ సహసంబంధం అవసరం.',
  },
  ur: {
    brandSubtitle: 'ڈاکٹر ڈیش بورڈ',
    'nav.patients': 'مریض',
    'nav.requests': 'درخواستیں',
    'nav.report': 'مریض کی رپورٹ',
    signOut: 'سائن آؤٹ',
    themeToggleLight: 'لائٹ موڈ',
    themeToggleDark: 'ڈارک موڈ',
    themeToggleAriaLabel: 'لائٹ/ڈارک تھیم تبدیل کریں',
    languageSelectorAriaLabel: 'زبان منتخب کریں',
    loadingSession: 'آپ کا سیشن لوڈ ہو رہا ہے…',
    footerDisclaimer: 'نیورومورف ایک ابتدائی کوگنیٹیو اسکریننگ ٹول ہے، تشخیصی آلہ نہیں۔ تمام نتائج کے لیے طبی ارتباط ضروری ہے۔',
  },
  es: {
    brandSubtitle: 'Panel del médico',
    'nav.patients': 'Pacientes',
    'nav.requests': 'Solicitudes',
    'nav.report': 'Informe del paciente',
    signOut: 'Cerrar sesión',
    themeToggleLight: 'Modo claro',
    themeToggleDark: 'Modo oscuro',
    themeToggleAriaLabel: 'Alternar entre tema claro y oscuro',
    languageSelectorAriaLabel: 'Elegir idioma',
    loadingSession: 'Cargando tu sesión…',
    footerDisclaimer: 'NEUROMORPH es una herramienta de detección cognitiva temprana, no un instrumento de diagnóstico. Todos los hallazgos requieren correlación clínica.',
  },
};

export const t = createStringLookup(COMMON_STRINGS);
