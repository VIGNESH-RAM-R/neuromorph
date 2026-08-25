// Morphy's knowledge base. Every entry is plain data -- no logic here --
// so growing Morphy's knowledge is a config change, never a code change.
// Each entry: id, category (for grouping/analytics), a canonical question
// (shown in "you might also ask" suggestions), a list of keywords/phrases
// the matcher weighs most heavily, and the answer text itself.
//
// Categories: about, getting-started, assessment, modules, scoring,
// privacy, troubleshooting, doctor, morphy, general, account, education,
// motivation, caregiver, eeg, support, game-guide, error.
import { GAME_GUIDES } from './gameGuidesConfig.js';
import { GuideFormatterEngine } from '../engines/GuideFormatterEngine.js';
import { ERROR_TYPES } from './errorConfig.js';
import { ErrorHandlingEngine } from '../engines/ErrorHandlingEngine.js';

export const FAQ_ENTRIES = [
  // ---------- about ----------
  {
    id: 'what-is-neuromorph',
    category: 'about',
    question: 'What is NEUROMORPH?',
    keywords: ['what is neuromorph', 'what is this app', 'purpose', 'what does this do', 'about this app'],
    answer: "NEUROMORPH is an early cognitive screening app. It's not a diagnostic tool -- it tracks how you perform on short memory, attention, reaction, speech, and facial-expressivity tasks over time, weekly, and shows you and your doctor the trend. Catching a real change early is the whole point; a single session never means anything on its own.",
  },
  {
    id: 'is-this-a-diagnosis',
    category: 'about',
    question: 'Is this a medical diagnosis?',
    keywords: ['diagnosis', 'diagnose', 'do i have dementia', 'medical condition', 'clinical result'],
    answer: "No. Nothing in this app diagnoses any condition. Every result you see is a non-diagnostic band (like \"Normal\" or \"Mildly Reduced\") meant to flag when a trend is worth a real conversation with a doctor -- not to tell you what's wrong. Please don't treat any single score as medical fact.",
  },
  {
    id: 'who-is-this-for',
    category: 'about',
    question: 'Who is NEUROMORPH for?',
    keywords: ['who is this for', 'who should use this', 'target user', 'is this for me'],
    answer: 'NEUROMORPH is meant for people who want to keep an eye on their cognitive health over time, often alongside a caregiver or family member, with results a doctor can review. It works best as a regular habit rather than a one-time check.',
  },

  // ---------- getting-started ----------
  {
    id: 'how-to-login',
    category: 'getting-started',
    question: 'How do I log in or sign up?',
    keywords: ['login', 'log in', 'sign up', 'signup', 'create account', 'register', 'password'],
    answer: "From the welcome screen, choose Sign Up if it's your first time, or Log In if you already have an account. If you've forgotten your password, use \"Forgot password\" on the login screen -- I can't reset it for you directly, but that link will.",
  },
  {
    id: 'first-time-setup',
    category: 'getting-started',
    question: "What happens the first time I open the app?",
    keywords: ['first time', 'onboarding', 'getting started', 'new user', 'setup'],
    answer: "The first time in, you'll log in, see a quick tour (that's me!), and be asked for camera permission before anything that uses it -- you can always say no and skip camera-based tasks. After that you land on your home screen, which shows whether your weekly check-in is due.",
  },
  {
    id: 'how-often-use-app',
    category: 'getting-started',
    question: 'How often should I use the app?',
    keywords: ['how often', 'how many times a week', 'frequency', 'once a week', 'schedule'],
    answer: 'The formal Detection Assessment is meant to happen once a week. The Games section (Memory, Reaction, Attention, Speech, Facial Expressivity) can be played any time in between -- there is no limit, and more play just means more data for your trend.',
  },

  // ---------- assessment ----------
  {
    id: 'what-is-detection-assessment',
    category: 'assessment',
    question: 'What is the Detection Assessment?',
    keywords: ['detection assessment', 'weekly test', 'formal assessment', 'lobar function test'],
    answer: "It's the structured, weekly check-in: the Lobar Function Test (8 to 10 short tasks, each tied to a specific brain region) plus 10 questions pulled from a larger question bank, two per brain region, rotated each time so you're not seeing identical questions every session.",
  },
  {
    id: 'why-rotate-questions',
    category: 'assessment',
    question: 'Why do the questions change each time?',
    keywords: ['different questions', 'why do questions change', 'repeat questions', 'same questions', 'rotate'],
    answer: "So your results reflect how you're actually doing, not just how well you remember last session's answers. Repeating identical questions too often makes people look like they're improving purely from familiarity -- that's called a practice effect, and rotating questions keeps your trend meaningful.",
  },
  {
    id: 'tower-of-london-figure-matching',
    category: 'assessment',
    question: 'What are the Tower of London and figure matching tasks?',
    keywords: ['tower of london', 'figure matching', 'extra tasks', 'planning task'],
    answer: 'These are two optional add-on tasks being considered for the Lobar Function Test. Tower of London measures planning and problem-solving by having you rearrange objects to match a target pattern in as few moves as possible. Figure matching measures visual comparison and attention to detail.',
  },
  {
    id: 'how-long-does-assessment-take',
    category: 'assessment',
    question: 'How long does the Detection Assessment take?',
    keywords: ['how long', 'time', 'duration', 'minutes'],
    answer: "Usually somewhere around 15 to 20 minutes total, depending on how many Lobar Function Test tasks are included. You can typically pause and come back, but for the most reliable result, try to finish it in one sitting when you're not rushed.",
  },

  // ---------- modules ----------
  {
    id: 'module-memory',
    category: 'modules',
    question: 'What does the Memory module measure?',
    keywords: ['memory game', 'memory module', 'visual memory', 'recognition test', 'face recognition test'],
    answer: "The Memory games measure how well you encode and later recall or recognize things you were briefly shown -- shapes, images, or faces, depending on which memory game you're in. This is a different skill from remembering facts; it's about how well new information sticks after a short delay.",
  },
  {
    id: 'module-reaction',
    category: 'modules',
    question: 'What do the Reaction games measure?',
    keywords: ['reaction game', 'whack a mole', 'point and click', 'reflexes', 'speed'],
    answer: 'Reaction games like Whack-a-Mole and Point-and-Click measure how quickly and accurately you respond to something appearing on screen -- your processing speed and reflexes, not memory or planning.',
  },
  {
    id: 'module-attention',
    category: 'modules',
    question: 'What do the Attention games measure?',
    keywords: ['attention game', 'spot the difference', 'odd one out', 'focus', 'concentration'],
    answer: 'Attention games like Spot the Difference and Odd One Out measure sustained focus and your ability to notice small details or inconsistencies -- how well you keep concentrating on a task without missing things.',
  },
  {
    id: 'module-speech',
    category: 'modules',
    question: 'What does the Speech module measure?',
    keywords: ['speech module', 'speech test', 'talking', 'voice', 'fluency'],
    answer: 'The Speech module listens to short spoken responses and looks at things like verbal fluency and speech patterns over time. It uses your device microphone the same careful way the camera-based module uses your camera -- with consent required first and no raw audio kept beyond what the task needs.',
  },
  {
    id: 'module-facial-expressivity',
    category: 'modules',
    question: 'What does the Facial Expressivity Test measure?',
    keywords: ['facial expressivity', 'camera test', 'face reaction', 'facial expression test', 'expressivity score'],
    answer: "It uses your camera to see how your face responds to a few short prompts -- a picture, a sentence to read aloud, a small surprise. It tracks about 30 small facial-movement channels (never an image) and reports things like overall expressivity, how quickly you reacted, how wide a range of your face engaged, left/right symmetry, and blink rate. It's compared against your own resting baseline, not anyone else's face.",
  },
  {
    id: 'facial-vs-face-recognition',
    category: 'modules',
    question: "What's the difference between Facial Expressivity Test and Face Recognition Test?",
    keywords: ['difference between face tests', 'face recognition vs facial expressivity', 'two face modules'],
    answer: "They're unrelated despite the similar names. Face Recognition Test is a memory game -- illustrated faces shown on screen, no camera, testing whether you remember a face you saw a minute ago. Facial Expressivity Test uses your real camera and measures how your own face reacts to prompts. One is about memory, the other is about live facial movement.",
  },

  // ---------- scoring ----------
  {
    id: 'cognitive-vs-detection-score',
    category: 'scoring',
    question: "What's the difference between the Cognitive Score and Detection Score?",
    keywords: ['cognitive score', 'detection score', 'two scores', 'difference between scores'],
    answer: "The Cognitive Score (0-100) is a performance number built from things like accuracy, speed, and recall across everything you've done. The Detection Score is a banded risk indicator -- Low, Moderate, or Elevated -- based on established screening cutoffs. They're built for different purposes: one tracks performance, the other flags when a trend is worth a doctor's attention. Neither is a diagnosis.",
  },
  {
    id: 'what-does-band-mean',
    category: 'scoring',
    question: 'What do EXCELLENT, NORMAL, MILDLY REDUCED, and REDUCED mean?',
    keywords: ['excellent normal reduced', 'what does band mean', 'result band', 'severity'],
    answer: "These are non-diagnostic bands used across every task to describe how a single result compares to the expected range for that task -- nothing more. A lower band on one session, on one task, is not evidence of anything by itself; what actually matters is the trend across many sessions over weeks.",
  },
  {
    id: 'why-score-changed',
    category: 'scoring',
    question: 'Why did my score go down this week?',
    keywords: ['score went down', 'score dropped', 'worse score', 'lower score'],
    answer: "Loads of ordinary things can move a single score: poor sleep, being rushed, a noisy room, bad lighting for the camera task, or just an off day. One lower session on its own isn't meaningful -- what matters is whether a change holds up across several sessions. If you're worried, that's exactly the kind of thing worth mentioning to your doctor alongside your trend.",
  },

  // ---------- privacy ----------
  {
    id: 'camera-privacy',
    category: 'privacy',
    question: 'Is my camera video recorded or stored?',
    keywords: ['camera privacy', 'is video recorded', 'video stored', 'camera saved', 'record my face'],
    answer: 'No. Your camera video is processed entirely on your own device, in your browser, and is never uploaded, recorded, or sent anywhere. Only small numeric measurements of facial movement are kept -- never an image, photo, or video frame.',
  },
  {
    id: 'data-privacy-general',
    category: 'privacy',
    question: 'What happens to my data in general?',
    keywords: ['data privacy', 'where does my data go', 'who sees my results', 'data storage'],
    answer: "Your results are stored so you and your doctor can see your trend over time. Task-specific privacy details (like the camera and microphone handling) are explained on the consent screen for that task before it starts -- please read those, they're specific to what that task actually captures.",
  },
  {
    id: 'can-i-skip-camera',
    category: 'privacy',
    question: 'Can I skip the camera-based task?',
    keywords: ['skip camera', 'no camera', "don't want camera", 'opt out of camera'],
    answer: "Yes. Camera access is always opt-in with an explicit consent screen -- if you decline, you simply skip that task. It won't block the rest of the app.",
  },

  // ---------- troubleshooting ----------
  {
    id: 'camera-wont-start',
    category: 'troubleshooting',
    question: "My camera won't start / I'm seeing an error about the camera",
    keywords: ['camera not working', "camera won't start", 'camera error', 'srcobject', 'camera crash'],
    answer: "First, make sure you allowed camera access when your browser asked -- check the address bar for a blocked-camera icon. Second, this task needs a secure connection (a proper web address, not a plain double-clicked file), so make sure it's running through the dev server or a real deployed link. If it still fails, reload the page once and try again; if the exact same error keeps happening, tell me the error message and I'll flag it as something the team needs to look at.",
  },
  {
    id: 'blank-page',
    category: 'troubleshooting',
    question: "The page is blank / nothing loads",
    keywords: ['blank page', 'nothing loads', 'white screen', 'app not loading'],
    answer: 'This usually means the page was opened directly as a file instead of through a running server, or the dev server isn\'t running yet. Make sure a terminal is running `npm run dev` for that module, and open the localhost address it prints rather than double-clicking the HTML file.',
  },
  {
    id: 'browser-support',
    category: 'troubleshooting',
    question: 'Which browsers work best?',
    keywords: ['which browser', 'browser support', 'chrome', 'safari', 'firefox'],
    answer: "A recent version of Chrome, Edge, or Firefox works well for everything, including the camera and microphone tasks. Safari generally works too, but camera/microphone permission prompts can behave slightly differently there.",
  },
  {
    id: 'slow-or-laggy',
    category: 'troubleshooting',
    question: 'The app feels slow or laggy',
    keywords: ['slow', 'lag', 'laggy', 'freezing', 'performance issue'],
    answer: 'The camera-based task in particular runs a live model in your browser, which is heavier than the other tasks -- closing other tabs and apps usually helps. If a specific screen consistently freezes rather than just running a bit slow, that is worth reporting as a bug.',
  },

  // ---------- doctor ----------
  {
    id: 'doctor-dashboard',
    category: 'doctor',
    question: 'How does my doctor see my results?',
    keywords: ['doctor dashboard', 'doctor sees results', 'share with doctor', 'clinician view'],
    answer: 'Doctors have their own separate login to a Doctor Dashboard, where they see a list of their patients and can open each one to review trends and banded results over time -- built for a clinical read, not the patient-facing summary you see.',
  },
  {
    id: 'am-i-a-doctor',
    category: 'doctor',
    question: 'I am a doctor -- where do I log in?',
    keywords: ['doctor login', 'clinician login', 'physician access', 'i am a doctor'],
    answer: "Doctors use a separate Doctor Dashboard login from the patient app -- look for a \"Clinician / Doctor login\" option on the welcome screen, or ask whoever set up your account for the direct link.",
  },

  // ---------- morphy ----------
  {
    id: 'who-is-morphy',
    category: 'morphy',
    question: 'Who is Morphy?',
    keywords: ['who is morphy', 'what is morphy', 'about morphy', 'morphy the octopus'],
    answer: "I'm Morphy! I'm here to answer questions, explain what any task or score means, and help if something breaks. I know a lot about how NEUROMORPH works, but I'm not a doctor and can't give medical advice -- for anything about your actual health, that's a conversation for your doctor.",
  },
  {
    id: 'morphy-limitations',
    category: 'morphy',
    question: "What can't Morphy help with?",
    keywords: ['what cant morphy do', 'morphy limitations', 'morphy medical advice'],
    answer: "I can't give medical advice, interpret your personal results as a diagnosis, or fix things outside the app. For anything about your health, please talk to your doctor -- and for anything I genuinely don't know, I'll say so honestly rather than guess.",
  },

  // ---------- general (greeting / goodbye / thanks / help) ----------
  {
    id: 'greeting',
    category: 'general',
    question: 'Hi',
    keywords: ['hi', 'hello', 'hey', 'good morning', 'good evening', 'good afternoon'],
    answer: "Hi there! I'm Morphy. How can I help -- questions about the app, a game guide, your reports, or something not working right?",
  },
  {
    id: 'goodbye',
    category: 'general',
    question: 'Bye',
    keywords: ['bye', 'goodbye', 'see you', 'good night', 'later'],
    answer: 'Take care! Come back any time you have a question.',
  },
  {
    id: 'thanks',
    category: 'general',
    question: 'Thank you',
    keywords: ['thanks', 'thank you', 'appreciate it', 'thx'],
    answer: "You're welcome!",
  },
  {
    id: 'help-capabilities',
    category: 'general',
    question: 'What are your capabilities?',
    keywords: ['help', 'what can you do', 'what can you help with', 'capabilities'],
    answer: 'I can explain how NEUROMORPH works, walk you through how to play any game or assessment, explain your reports and progress in plain language, help troubleshoot common issues, and answer general questions about cognitive health. I can\'t diagnose anything or replace your doctor.',
  },

  // ---------- account ----------
  {
    id: 'login-issue',
    category: 'account',
    question: "I can't log in",
    keywords: ['login issue', "can't log in", 'login problem', 'wont log in'],
    answer: "Double-check your email and password are entered correctly, and that Caps Lock isn't on. If it still won't work, use \"Forgot password\" on the login screen to reset it. If the problem continues, it may be a temporary server issue -- try again in a few minutes or contact support.",
  },
  {
    id: 'forgot-password',
    category: 'account',
    question: 'I forgot my password',
    keywords: ['forgot password', 'reset password', 'cant remember password'],
    answer: 'Tap "Forgot password" on the login screen and follow the reset steps sent to your email. If you don\'t receive that email within a few minutes, check your spam folder before trying again.',
  },
  {
    id: 'otp-problem',
    category: 'account',
    question: "My OTP isn't working",
    keywords: ['otp', 'one time password', 'verification code', 'otp not working'],
    answer: "Make sure you're entering the most recent code -- older ones expire. Check that your device's clock is set correctly, since that can cause codes to be rejected. If a new code never arrives, check your signal or spam folder, or contact support.",
  },
  {
    id: 'sync-issue',
    category: 'account',
    question: 'My data is not syncing',
    keywords: ['sync issue', 'not syncing', 'data missing', 'sync problem'],
    answer: "Make sure you're connected to the internet, then try closing and reopening the app -- that usually triggers a fresh sync. If a specific session still won't appear after that, contact support so it isn't lost.",
  },
  {
    id: 'internet-requirement',
    category: 'account',
    question: 'Do I need internet to use this app?',
    keywords: ['need internet', 'internet requirement', 'offline mode', 'works offline'],
    answer: 'Most of the app needs an internet connection to save your results and sync with your doctor\'s view. Some parts may work briefly offline, but anything you complete without a connection should sync automatically once you\'re back online.',
  },

  // ---------- cognitive education ----------
  {
    id: 'what-is-dementia',
    category: 'education',
    question: 'What is dementia?',
    keywords: ['what is dementia', 'define dementia', 'dementia meaning'],
    answer: 'Dementia is a general term for a decline in memory, thinking, or reasoning severe enough to affect daily life. It has several possible causes and varies a lot between individuals. NEUROMORPH can help track changes over time, but only a healthcare professional can evaluate or diagnose it.',
  },
  {
    id: 'what-is-mci',
    category: 'education',
    question: 'What is Mild Cognitive Impairment (MCI)?',
    keywords: ['what is mci', 'mild cognitive impairment', 'mci meaning'],
    answer: "Mild Cognitive Impairment (MCI) describes noticeable changes in memory or thinking that are greater than typical for someone's age, but not severe enough to significantly disrupt daily independence. Some people with MCI stay stable, some improve, and some go on to develop dementia -- which is exactly why tracking a trend over time matters, rather than judging from one session.",
  },
  {
    id: 'when-to-see-a-doctor',
    category: 'education',
    question: 'When should I see a doctor about this?',
    keywords: ['when to see a doctor', 'when should i be concerned', 'talk to a doctor'],
    answer: "If you or someone close to you notices a real change over time -- not just one off day -- or if a result here shows a consistent declining trend, that's worth bringing to a doctor, ideally a neurologist or geriatric specialist. You don't need a \"bad\" result to ask questions either; if anything is worrying you, that's reason enough.",
  },

  // ---------- motivation ----------
  {
    id: 'feeling-nervous',
    category: 'motivation',
    question: "I'm nervous about this",
    keywords: ['nervous', 'anxious', 'scared to start', 'worried about the test'],
    answer: "It's completely normal to feel a little nervous. The assessments are designed to understand your cognitive abilities -- not to judge you. Take your time, answer honestly, and remember that the results are only one part of understanding your brain health.",
  },
  {
    id: 'i-failed',
    category: 'motivation',
    question: 'I think I failed the assessment',
    keywords: ['i failed', 'did badly', 'bad score', 'failed the test'],
    answer: "There isn't really a concept of \"failing\" these assessments. They help identify strengths and areas that may benefit from further attention. Every assessment provides useful information.",
  },
  {
    id: 'encourage-me',
    category: 'motivation',
    question: 'Encourage me',
    keywords: ['encourage me', 'motivate me', 'i dont want to continue', 'give me motivation'],
    answer: "You're building something valuable just by showing up consistently -- a real, honest picture of your own trend over time, which is worth far more than any single session. Keep going at your own pace.",
  },

  // ---------- caregiver ----------
  // 2026-08-18 CORRECTION: these three entries used to describe a
  // Settings -> Caregiver Mode -> Add/Manage Caregiver flow with specific
  // step-by-step instructions. That flow does not exist anywhere in this
  // codebase -- there is no caregiver invite system, no informant
  // questions, nothing. The old entries would have had Morphy confidently
  // walk a patient through steps in a screen that isn't there. Replaced
  // with one honest entry so the same real user queries ("what is
  // caregiver mode", "add a caregiver") still match something -- just a
  // true answer instead of a fabricated how-to.
  {
    id: 'caregiver-mode-not-available',
    category: 'caregiver',
    question: 'What is Caregiver Mode? / How do I add a caregiver?',
    keywords: ['caregiver mode', 'what is caregiver mode', 'family access', 'add caregiver', 'invite caregiver', 'connect caregiver', 'remove caregiver'],
    answer: "Caregiver Mode isn't available in NEUROMORPH yet -- there's currently no way to invite a family member or caregiver to view your progress or answer questions on your behalf. It's on the roadmap, not built yet.",
  },

  // ---------- EEG ----------
  // 2026-08-18 CORRECTION: same issue as Caregiver Mode above -- these
  // used to describe an EEG device pairing screen, Bluetooth connection
  // steps, and troubleshooting for hardware that was never built (see also
  // errorConfig.js's now-removed BLUETOOTH_DISABLED/EEG_DISCONNECTED
  // entries). Replaced with one honest entry.
  {
    id: 'eeg-not-available',
    category: 'eeg',
    question: 'What is EEG? / Do I need an EEG device?',
    keywords: ['what is eeg', 'eeg meaning', 'electroencephalogram', 'do i need eeg', 'is eeg required', 'eeg optional', 'eeg not connecting', 'eeg connection issue', 'eeg device problem'],
    answer: "EEG (electroencephalogram) integration isn't available in NEUROMORPH yet -- there's no EEG device support or connection screen built. The Detection Assessment and Games work fully without it. EEG is a possible future add-on, not something you need or can currently connect.",
  },

  // ---------- support ----------
  {
    id: 'contact-support',
    category: 'support',
    question: 'How do I contact support?',
    keywords: ['contact support', 'need help', 'talk to support', 'customer service'],
    answer: "I can open the support page for you from here, or you can find it any time under Settings -> Help & Support.",
  },
];

// Programmatically generated "how do I play X" entries from the structured
// GAME_GUIDES data (src/config/gameGuidesConfig.js) -- one source of truth
// for guide content, formatted for chat via GuideFormatterEngine. Appended
// here rather than duplicated by hand so a new game guide only needs to be
// added in one place.
// Only "how do I play" (numbered steps) is generated here -- an "explain"
// variant was tried too, but its content overlapped enough with the
// existing hand-written "module-*" entries above that the two started
// winning against each other for the same query. One well-scoped entry per
// guide beats two overlapping ones.
for (const guide of GAME_GUIDES) {
  FAQ_ENTRIES.push({
    id: `guide-${guide.id}`,
    category: 'game-guide',
    question: `How do I play ${guide.title}?`,
    keywords: [guide.title.toLowerCase(), 'how do i play', 'how to play', 'steps', 'instructions', 'guide', guide.category.toLowerCase()],
    answer: GuideFormatterEngine.formatSteps(guide),
  });
}

// Programmatically generated error-handling entries from ERROR_TYPES
// (src/config/errorConfig.js) -- same one-source-of-truth reasoning as the
// game guides above.
for (const [code, entry] of Object.entries(ERROR_TYPES)) {
  FAQ_ENTRIES.push({
    id: `error-${code.toLowerCase().replace(/_/g, '-')}`,
    category: 'error',
    question: entry.label,
    keywords: entry.keywords,
    answer: ErrorHandlingEngine.format(code),
  });
}
