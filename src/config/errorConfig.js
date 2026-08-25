// The 12 error types called out in the system prompt's ERROR HANDLING
// section. Each has a plain explanation plus 2-4 concrete troubleshooting
// steps -- ErrorHandlingEngine formats these consistently and always
// appends a support offer, so the format never depends on how carefully
// each entry was hand-written.
export const ERROR_TYPES = {
  NO_INTERNET: {
    label: 'No Internet Connection',
    keywords: ['no internet', 'no connection', 'offline', 'not connected', "can't connect"],
    explanation: "The app needs an internet connection to save your results and keep them in sync.",
    steps: ['Check that Wi-Fi or mobile data is turned on.', 'Try opening a website in your browser to confirm you\'re actually online.', 'Move to an area with a stronger signal if you\'re on mobile data.', 'Restart the app once you\'re reconnected.'],
  },
  SERVER_ERROR: {
    label: 'Server Error',
    keywords: ['server error', 'something went wrong', '500 error', 'app error'],
    explanation: "This usually means something went wrong on our end, not with your device.",
    steps: ['Wait a minute or two and try again.', 'Restart the app.', 'If it keeps happening, that\'s worth reporting to support with what you were doing when it occurred.'],
  },
  CAMERA_PERMISSION_DENIED: {
    label: 'Camera Permission Denied',
    keywords: ['camera permission', 'camera denied', 'camera not allowed', 'camera blocked'],
    explanation: 'The Facial Expressivity Test needs camera access, which your device or browser is currently blocking.',
    steps: ['Check your browser or device settings for camera permissions and allow access for this app.', 'Reload the page after changing the permission.', 'If you\'d rather not use the camera, you can skip that task -- it won\'t block the rest of the app.'],
  },
  MICROPHONE_PERMISSION_DENIED: {
    label: 'Microphone Permission Denied',
    keywords: ['microphone permission', 'mic denied', 'microphone not allowed', 'mic blocked'],
    explanation: 'The Speech module needs microphone access, which your device or browser is currently blocking.',
    steps: ['Check your browser or device settings for microphone permissions and allow access for this app.', 'Reload the page after changing the permission.', 'If you\'d rather not use the microphone, you can skip that task -- it won\'t block the rest of the app.'],
  },
  // 2026-08-18: BLUETOOTH_DISABLED and EEG_DISCONNECTED removed -- both
  // described troubleshooting steps for an EEG device connection screen
  // that was never built anywhere in this codebase (see faqConfig.js's
  // same-day correction). Fabricated troubleshooting for hardware that
  // doesn't exist is worse than no entry at all.
  PDF_EXPORT_FAILED: {
    label: 'PDF Export Failed',
    keywords: ['pdf export failed', 'pdf not exporting', "can't export pdf", 'pdf error'],
    explanation: "Your report couldn't be turned into a PDF file.",
    steps: ['Try again -- this is sometimes a temporary hiccup.', 'Make sure you have enough free storage space on your device.', 'If it keeps failing, contact support so the report isn\'t lost.'],
  },
  UPLOAD_FAILED: {
    label: 'Upload Failed',
    keywords: ['upload failed', "can't upload", 'upload error', 'upload not working'],
    explanation: "Something you tried to upload -- a report or a file -- didn't go through.",
    steps: ['Check your internet connection.', 'Make sure the file isn\'t too large or in an unsupported format.', 'Try again in a minute.'],
  },
  SESSION_EXPIRED: {
    label: 'Session Expired',
    keywords: ['session expired', 'logged out', 'session timeout'],
    explanation: 'For security, you get signed out automatically after a period of inactivity.',
    steps: ['Log back in -- your saved results are safe and unaffected.', 'If you were mid-assessment, you may need to restart that session.'],
  },
  INVALID_LOGIN: {
    label: 'Invalid Login',
    keywords: ['invalid login', 'wrong password', 'login rejected', 'incorrect credentials'],
    explanation: "Your email or password wasn't recognized.",
    steps: ['Double-check for typos, especially Caps Lock.', 'Use "Forgot password" if you\'re not sure it\'s correct.', 'Make sure you\'re using the same email you originally signed up with.'],
  },
  STORAGE_FULL: {
    label: 'Storage Full',
    keywords: ['storage full', 'not enough storage', 'device full', 'out of space'],
    explanation: 'Your device is low on storage space, which can stop the app from saving data properly.',
    steps: ['Free up space by removing unused apps, photos, or files.', 'Restart the app once space is freed up.'],
  },
  UPDATE_REQUIRED: {
    label: 'Update Required',
    keywords: ['update required', 'please update', 'version too old', 'app out of date'],
    explanation: "You're on a version of the app that's too old to continue safely.",
    steps: ['Update the app from your app store.', 'Restart the app after updating.'],
  },
};
