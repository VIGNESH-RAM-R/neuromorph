import { createStringLookup } from '../createStringLookup.js';

// Deliberately its own tiny, standalone string file (not folded into
// common.js) -- ErrorBoundary.jsx renders when something else in the app
// may have already broken, so its own strings need to stay simple,
// self-contained, and never depend on anything that could itself throw.
export const ERROR_BOUNDARY_STRINGS = {
  en: {
    title: 'Something went wrong',
    message: "This screen ran into an unexpected error. Your data is safe -- reloading usually fixes this.",
    reloadBtn: 'Reload',
  },
  hi: {
    title: 'कुछ गड़बड़ हो गई',
    message: 'इस स्क्रीन में एक अप्रत्याशित त्रुटि आई। आपका डेटा सुरक्षित है -- रीलोड करने से आमतौर पर यह ठीक हो जाता है।',
    reloadBtn: 'रीलोड करें',
  },
  ta: {
    title: 'ஏதோ தவறு நடந்தது',
    message: 'இந்த திரையில் எதிர்பாராத பிழை ஏற்பட்டது. உங்கள் தரவு பாதுகாப்பாக உள்ளது -- மீண்டும் ஏற்றுவது பொதுவாக இதை சரிசெய்யும்.',
    reloadBtn: 'மீண்டும் ஏற்று',
  },
  fr: {
    title: 'Une erreur est survenue',
    message: 'Cet écran a rencontré une erreur inattendue. Vos données sont en sécurité -- recharger la page résout généralement le problème.',
    reloadBtn: 'Recharger',
  },
  te: {
    title: 'ఏదో తప్పు జరిగింది',
    message: 'ఈ స్క్రీన్‌లో ఊహించని లోపం ఏర్పడింది. మీ డేటా సురక్షితంగా ఉంది -- రీలోడ్ చేయడం సాధారణంగా దీన్ని పరిష్కరిస్తుంది.',
    reloadBtn: 'రీలోడ్ చేయండి',
  },
  ur: {
    title: 'کچھ غلط ہو گیا',
    message: 'اس اسکرین میں ایک غیر متوقع خرابی پیش آئی۔ آپ کا ڈیٹا محفوظ ہے -- دوبارہ لوڈ کرنے سے عام طور پر یہ ٹھیک ہو جاتا ہے۔',
    reloadBtn: 'دوبارہ لوڈ کریں',
  },
  es: {
    title: 'Algo salió mal',
    message: 'Esta pantalla encontró un error inesperado. Tus datos están seguros -- recargar generalmente soluciona esto.',
    reloadBtn: 'Recargar',
  },
};

export const t = createStringLookup(ERROR_BOUNDARY_STRINGS);
