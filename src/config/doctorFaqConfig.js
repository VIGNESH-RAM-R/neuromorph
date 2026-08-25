// The doctor-facing counterpart to faqConfig.js -- same shape (id/category/
// question/keywords/answer), same generic ConversationEngine/
// FaqMatcherEngine matching underneath, but a completely separate content
// pool written for a clinician audience instead of a patient/caregiver one.
// Kept as its OWN file rather than merged into FAQ_ENTRIES so patient and
// doctor knowledge never leak into each other's suggestion chips.
//
// HONEST SCOPE NOTE: this is a first batch of ~45 entries, not a literal
// 150 -- written for accuracy over volume so every answer here is something
// this app can actually back up (a real config value, a real mock-data
// number, or a real, already-built feature). More entries can be added the
// same way any FAQ entry is added: pure data, no code change. Every number
// or threshold quoted below is pulled from this codebase's real config
// files (scoringBands.js, domainInsightConfig.js, lobarConfig.js,
// doctorOnboardingConfig.js) -- nothing here is invented.
export const DOCTOR_FAQ_ENTRIES = [
  // ---------- about ----------
  {
    id: 'doc-what-is-neuromorph',
    category: 'about',
    question: 'What is NEUROMORPH, from a clinical standpoint?',
    keywords: ['what is neuromorph', 'what is this platform', 'overview', 'what does this do', 'about neuromorph'],
    answer: 'NEUROMORPH is an early cognitive screening and monitoring platform. Patients complete short weekly tasks (attention, memory, executive function, face recognition) from home; scores accumulate into a longitudinal trend you review here or in the Doctor Dashboard. It is a screening and monitoring aid, not a diagnostic instrument -- it is designed to flag when a trend is worth a real clinical conversation, not to replace one.',
  },
  {
    id: 'doc-is-diagnostic',
    category: 'about',
    question: 'Is NEUROMORPH a diagnostic tool?',
    keywords: ['diagnostic tool', 'fda', 'cleared', 'approved', 'diagnose dementia', 'is this diagnostic'],
    answer: 'No. NEUROMORPH does not diagnose dementia, Alzheimer\'s disease, MCI, or any other condition, and it is not FDA-cleared as a diagnostic device. Every score is a non-diagnostic performance band. Clinical correlation and, where indicated, formal neuropsychological or neurological evaluation is recommended before any clinical decision is made from these results.',
  },
  {
    id: 'doc-intended-use',
    category: 'about',
    question: 'What is the intended clinical use case?',
    keywords: ['intended use', 'use case', 'when should i use this', 'clinical workflow'],
    answer: "NEUROMORPH is best used for two things: (1) early screening of patients with subjective memory complaints or known risk factors, before a formal work-up, and (2) longitudinal monitoring of patients you're already tracking, so a slow decline that a single annual visit could miss gets caught between visits.",
  },
  {
    id: 'doc-two-apps',
    category: 'about',
    question: 'What is the difference between this chat and the Doctor Dashboard?',
    keywords: ['doctor dashboard', 'difference between apps', 'two apps', 'where is the dashboard'],
    answer: "This chat lives inside the same app your patients use (app_page), so you can get a quick answer or a patient summary without switching tools. The Doctor Dashboard is a separate, fuller clinical application -- alert triage, full session history, trend charts, and caregiver notes for every patient. Ask me to \"open the Doctor Dashboard\" any time and I'll point you there.",
  },
  {
    id: 'doc-who-built',
    category: 'about',
    question: 'Who built NEUROMORPH?',
    keywords: ['who built this', 'who made this', 'team', 'developer'],
    answer: 'NEUROMORPH is built by Team NEXUM. You can read the full project description any time from the About link on the login screen.',
  },

  // ---------- scoring ----------
  {
    id: 'doc-cognitive-score',
    category: 'scoring',
    question: 'How is the overall Cognitive Score computed?',
    keywords: ['cognitive score', 'overall score', 'how is score calculated', 'scoring method'],
    answer: 'Each completed session produces raw 0-100 scores per domain and per task. The overall session score is derived from those raw domain scores, then mapped onto a performance band using fixed thresholds (Excellent, Normal, Mildly Reduced, Reduced) -- the same thresholds and mapping function used everywhere in the app, so a score here and a score in the Doctor Dashboard always mean the same thing.',
  },
  {
    id: 'doc-band-thresholds',
    category: 'scoring',
    question: 'What are the performance band thresholds?',
    keywords: ['band thresholds', 'excellent normal reduced', 'what score is normal', 'cutoffs'],
    answer: 'Excellent is 85 and above. Normal is 70 to 84. Mildly Reduced is 50 to 69. Reduced is below 50. These bands describe task/session performance only -- they are not risk levels or diagnostic categories.',
  },
  {
    id: 'doc-mildly-reduced-meaning',
    category: 'scoring',
    question: 'What does a "Mildly Reduced" band mean?',
    keywords: ['mildly reduced meaning', 'what does mildly reduced mean'],
    answer: 'Performance mildly below the expected range for that task. On its own it is not alarming -- a single Mildly Reduced session can reflect fatigue, distraction, or a bad day. It becomes clinically relevant when it repeats or trends downward across sessions.',
  },
  {
    id: 'doc-reduced-meaning',
    category: 'scoring',
    question: 'What does a "Reduced" band mean?',
    keywords: ['reduced band meaning', 'what does reduced mean'],
    answer: 'Performance notably below the expected range for that task, and it may warrant closer clinical follow-up. As with every band in NEUROMORPH, this describes observed task performance only -- it does not constitute a diagnosis of dementia or any other condition.',
  },
  {
    id: 'doc-percent-change',
    category: 'scoring',
    question: 'How is the percent change between sessions calculated?',
    keywords: ['percent change', 'trend percentage', 'increase decrease percent', '+8% -13%'],
    answer: 'Percent change is (latest score minus earliest score) divided by the earliest score, shown as a signed percentage -- for example +8% or -13%. It is only ever computed with two or more real data points and a non-zero starting score, so you will never see a fabricated trend from a single session.',
  },
  {
    id: 'doc-cumulative-decline',
    category: 'scoring',
    question: 'What is a "cumulative decline" pattern?',
    keywords: ['cumulative decline', 'slow decline', 'gradual decline pattern'],
    answer: 'A pattern where no single session-over-session drop is large enough to trip a step-change alert, but the drop from the first session to the latest one is significant. Priya Nair (NMX-1005) in the mock roster is the textbook example: 79 to 71 to 63, each step under the step-level threshold, but a real 16-point drop overall -- exactly the kind of slow decline a step-only check would miss.',
  },
  {
    id: 'doc-rising-variability',
    category: 'scoring',
    question: 'What does "rising variability" or "volatile" mean in a trend?',
    keywords: ['rising variability', 'volatile trend', 'inconsistent scores'],
    answer: 'It flags a patient whose scores are not trending down on average, but whose spread around that average is growing -- a swing pattern rather than a steady one. Walter Higgins (NMX-1006) demonstrates this: his mean stays roughly flat, but his last three sessions swing far wider than his first three, which a mean/threshold-only system would miss entirely.',
  },
  {
    id: 'doc-single-session-caution',
    category: 'scoring',
    question: 'Can I rely on a single session score?',
    keywords: ['single session', 'one session enough', 'trust one score'],
    answer: 'Not on its own. A single session score can reflect a bad night\'s sleep, a noisy environment, or unfamiliarity with the interface just as easily as a real change. The value of NEUROMORPH is the trend across sessions, not any one number.',
  },

  // ---------- domains ----------
  {
    id: 'doc-domain-attention',
    category: 'domains',
    question: 'What does the Attention domain measure?',
    keywords: ['attention domain', 'what is attention measuring'],
    answer: 'Sustained focus and working memory span, drawn primarily from the Stroop Task and Go / No-Go performance.',
  },
  {
    id: 'doc-domain-executive-function',
    category: 'domains',
    question: 'What does the Executive Function domain measure?',
    keywords: ['executive function domain', 'what is executive function measuring'],
    answer: 'Planning, problem solving, and mental flexibility -- drawn from tasks like Matrix Reasoning and Go / No-Go, where the patient has to switch strategy or inhibit an automatic response.',
  },
  {
    id: 'doc-domain-processing-speed',
    category: 'domains',
    question: 'What does the Processing Speed domain measure, and is it live yet?',
    keywords: ['processing speed domain', 'is processing speed available'],
    answer: 'How quickly a patient completes tasks. On the patient dashboard\'s own domain breakdown, Processing Speed currently has no dedicated active source task, so it is honestly shown as "not yet available" rather than a fabricated number. Note this is separate from the live bridge demo patient (Robert Hayes / NMX-2001), whose Detection Assessment export does include a processingSpeed figure -- the two are different modules within NEUROMORPH that haven\'t been fully unified yet.',
  },
  {
    id: 'doc-domain-visual-memory',
    category: 'domains',
    question: 'What does the Visual Memory domain measure?',
    keywords: ['visual memory domain', 'what is visual memory measuring'],
    answer: 'Encoding and recalling visual material -- fed by the Visual Memory task, one of the two active Occipital Lobe tasks.',
  },
  {
    id: 'doc-domain-language',
    category: 'domains',
    question: 'What does the Language domain measure, and is it live yet?',
    keywords: ['language domain', 'is language available'],
    answer: 'Comprehension and verbal expression. Like Processing Speed, Language currently has no dedicated active source task feeding the patient dashboard\'s domain breakdown, so it is shown as "not yet available" rather than guessed at.',
  },
  {
    id: 'doc-domain-recognition-memory',
    category: 'domains',
    question: 'What does the Recognition Memory domain measure?',
    keywords: ['recognition memory domain', 'what is recognition memory measuring'],
    answer: 'Recognizing previously seen material -- fed primarily by the Face Recognition task and delayed-recognition-style items.',
  },
  {
    id: 'doc-six-domains-list',
    category: 'domains',
    question: 'What are all six cognitive domains NEUROMORPH tracks?',
    keywords: ['six domains', 'all domains', 'list of domains'],
    answer: 'Attention, Executive Function, Processing Speed, Visual Memory, Language, and Recognition Memory. Four are currently active with a real source task on the patient dashboard (Attention, Executive Function, Visual Memory, Recognition Memory); Processing Speed and Language are tracked in the data model but not yet fed by a live task there.',
  },

  // ---------- lobar tasks ----------
  {
    id: 'doc-task-stroop',
    category: 'tasks',
    question: 'What does the Stroop Task assess, and which lobe?',
    keywords: ['stroop task', 'stroop lobe'],
    answer: 'Frontal Lobe. It measures selective attention and inhibitory control -- the classic color/word interference task.',
  },
  {
    id: 'doc-task-go-no-go',
    category: 'tasks',
    question: 'What does Go / No-Go assess, and which lobe?',
    keywords: ['go no go task', 'go/no-go lobe'],
    answer: 'Frontal Lobe. It measures response inhibition -- how reliably the patient withholds a response to a "no-go" cue after being primed to respond quickly.',
  },
  {
    id: 'doc-task-token-test',
    category: 'tasks',
    question: 'What does the Token Test assess, and which lobe?',
    keywords: ['token test', 'token test lobe'],
    answer: 'Temporal Lobe. It measures receptive language and instruction-following, following multi-step verbal commands.',
  },
  {
    id: 'doc-task-delayed-recognition',
    category: 'tasks',
    question: 'What does Delayed Recognition Memory assess, and which lobe?',
    keywords: ['delayed recognition memory task', 'delayed recognition lobe'],
    answer: 'Temporal Lobe. It measures whether previously studied material is correctly recognized after a delay -- a core memory-consolidation check.',
  },
  {
    id: 'doc-task-matrix-reasoning',
    category: 'tasks',
    question: 'What does Matrix Reasoning assess, and which lobe?',
    keywords: ['matrix reasoning task', 'matrix reasoning lobe'],
    answer: 'Parietal Lobe. It measures non-verbal, abstract pattern reasoning.',
  },
  {
    id: 'doc-task-geometric-shape-copy',
    category: 'tasks',
    question: 'What does Geometric Shape Copy assess, and which lobe?',
    keywords: ['geometric shape copy task', 'shape copy lobe'],
    answer: 'Parietal Lobe. It measures visuospatial and constructional ability -- copying a geometric figure accurately.',
  },
  {
    id: 'doc-task-visual-memory',
    category: 'tasks',
    question: 'What does the Visual Memory task assess, and which lobe?',
    keywords: ['visual memory task lobe'],
    answer: 'Occipital Lobe. It measures encoding and short-term retention of visual material.',
  },
  {
    id: 'doc-task-face-recognition',
    category: 'tasks',
    question: 'What does the Face Recognition task assess, and which lobe?',
    keywords: ['face recognition task lobe'],
    answer: 'Occipital Lobe. It measures facial recognition memory -- studying a set of faces, then picking each one out again from distractors after a delay.',
  },
  {
    id: 'doc-eight-tasks-overview',
    category: 'tasks',
    question: 'What are all 8 active tasks and how are they distributed across lobes?',
    keywords: ['eight tasks', 'all active tasks', 'task list', 'lobe distribution'],
    answer: 'Frontal: Stroop Task, Go / No-Go. Temporal: Token Test, Delayed Recognition Memory. Parietal: Matrix Reasoning, Geometric Shape Copy. Occipital: Visual Memory, Face Recognition. Every lobe currently has exactly 2 active tasks.',
  },
  {
    id: 'doc-question-bank',
    category: 'tasks',
    question: 'How many questions does a patient answer per session, and where do they come from?',
    keywords: ['question bank', 'how many questions per session', 'question pool size'],
    answer: 'Each weekly session draws 10 questions -- 2 per brain region -- from a source pool of 100, rotated so a patient rarely sees the same set twice in a row.',
  },

  // ---------- cadence & access ----------
  {
    id: 'doc-assessment-cadence',
    category: 'cadence',
    question: 'How often does a patient complete an assessment?',
    keywords: ['how often assessment', 'weekly assessment', 'assessment frequency'],
    answer: "Weekly. NEUROMORPH is built around a regular habit rather than a one-time check -- a single session never means much on its own, but a consistent weekly cadence is what makes the trend meaningful.",
  },
  {
    id: 'doc-access-gate',
    category: 'access',
    question: 'Why can\'t I see patient data right after signing up as a doctor?',
    keywords: ['cant see patient data', 'access pending', 'admin approval'],
    answer: "Signing in doesn't automatically grant patient data access -- an administrator must add your account first. This is the same access gate used in the Doctor Dashboard, and it exists so patient data is never exposed to an unverified clinician account.",
  },
  {
    id: 'doc-data-storage',
    category: 'access',
    question: 'Where is patient data stored?',
    keywords: ['data storage', 'where is data stored', 'firestore', 'database'],
    answer: 'Completed patient sessions are written to a shared Firestore backend, which both this app and the Doctor Dashboard read from -- there is no separate, unsynced copy of a patient\'s results sitting in either app.',
  },
  {
    id: 'doc-privacy',
    category: 'access',
    question: 'How is patient privacy protected?',
    keywords: ['privacy', 'patient consent', 'confidentiality'],
    answer: "Access is gated behind admin approval for every clinician account, and the demo/mock patient data used in this assistant's lookup feature never includes real patient identities -- only illustrative sample records. For real deployments, standard clinical data-handling and consent practices for your jurisdiction still apply; NEUROMORPH does not replace your organization's privacy policy or a signed consent process.",
  },

  // ---------- patient lookup (meta -- explains this chat's own capability) ----------
  {
    id: 'doc-lookup-how-to',
    category: 'meta',
    question: 'How do I look up a patient in this chat?',
    keywords: ['look up a patient', 'find a patient', 'search patient', 'how to search patient'],
    answer: 'Type the patient\'s name or ID along with a word like "summarize", "report", "pdf", or "summary" -- for example "summarize Eleanor Whitfield" or "generate a PDF for NMX-1005". I\'ll match against the sample patient roster and reply with their latest score, band, domain breakdown, and trend.',
  },
  {
    id: 'doc-lookup-not-found',
    category: 'meta',
    question: 'What happens if I ask about a patient who isn\'t in the system?',
    keywords: ['patient not found', 'unknown patient', 'no match'],
    answer: 'I\'ll tell you honestly that I couldn\'t find a match rather than guessing or inventing a summary. Right now my lookup covers the sample patient roster (7 records) mirrored from the Doctor Dashboard\'s demo data -- a live deployment would connect this to your real patient list.',
  },
  {
    id: 'doc-lookup-multiple-matches',
    category: 'meta',
    question: 'What if my search matches more than one patient?',
    keywords: ['multiple patients matched', 'ambiguous search'],
    answer: 'I\'ll list every matching name and patient ID and ask you to be more specific -- for example by including the full name or the patient ID -- rather than guessing which one you meant.',
  },
  {
    id: 'doc-pdf-generation',
    category: 'meta',
    question: 'Can you actually generate a downloadable PDF for a patient?',
    keywords: ['generate pdf', 'download pdf', 'export patient report'],
    answer: 'I\'ll prepare the patient\'s summary and open your browser\'s print dialog with a formatted report you can save as a PDF -- the same "Save as PDF" pattern already used for a patient\'s own self-report. I can\'t email or auto-file it anywhere on my own.',
  },

  // ---------- doctor dashboard hand-off ----------
  {
    id: 'doc-open-dashboard',
    category: 'handoff',
    question: 'How do I get to the full Doctor Dashboard?',
    keywords: ['open doctor dashboard', 'go to doctor dashboard', 'full dashboard'],
    answer: 'From your doctor home screen, use the "Go to Doctor Dashboard" link -- it opens the separate, fuller clinical application with alert triage, complete session history, and caregiver notes for every patient.',
  },
  {
    id: 'doc-dashboard-vs-chat-features',
    category: 'handoff',
    question: 'What can the Doctor Dashboard do that this chat can\'t?',
    keywords: ['dashboard features', 'what can dashboard do'],
    answer: 'Full multi-session history and charts per patient, automated risk/trend alerts (step-change, cumulative decline, rising variability), caregiver notes, and case management across your whole patient list. This chat is a fast, conversational front door -- for deep chart review, use the Dashboard.',
  },

  // ---------- onboarding & account ----------
  {
    id: 'doc-update-profile',
    category: 'account',
    question: 'How do I update my specialty or practice setting later?',
    keywords: ['update profile', 'change specialty', 'edit professional info'],
    answer: 'Your professional profile (specialty, years of practice, practice setting, license region) was collected during onboarding. Editing it after the fact isn\'t wired up in this build yet -- for now, that\'s a note for the team; contact your administrator if it needs correcting sooner.',
  },
  {
    id: 'doc-why-onboarding-questions',
    category: 'account',
    question: 'Why am I asked professional questions during doctor signup?',
    keywords: ['why professional questions', 'why onboarding questions'],
    answer: 'They tailor what this assistant shows you -- for example, your typical caseload and preferred report format. All but the first question (specialty) are optional and can be skipped.',
  },

  // ---------- troubleshooting ----------
  {
    id: 'doc-login-trouble',
    category: 'troubleshooting',
    question: 'I can\'t log in to my doctor account. What should I check?',
    keywords: ['cant log in', 'login not working', 'doctor login trouble'],
    answer: 'First check you\'re on the Doctor login (not the patient one) -- use the role picker before signing in. If your credentials are correct but you still can\'t see patient data, that\'s expected until an administrator approves your account, not a login bug.',
  },
  {
    id: 'doc-forgot-password',
    category: 'troubleshooting',
    question: 'How do I reset my doctor account password?',
    keywords: ['forgot password', 'reset password', 'doctor password'],
    answer: 'Use the "Forgot Password" link on the doctor login screen -- it works the same way as the patient login\'s password reset flow.',
  },

  // ---------- education ----------
  {
    id: 'doc-cognitive-vs-detection-score',
    category: 'education',
    question: 'What is the difference between a Cognitive Score and a Detection Assessment score?',
    keywords: ['cognitive score vs detection score', 'detection assessment score'],
    answer: 'The Cognitive Score is the patient-facing "My Progress" dashboard\'s overall weekly figure, drawn from four active domains today. The Detection Assessment is a separate module that currently exports Attention, Executive Function, and Processing Speed only -- that narrower 3-domain shape is exactly what feeds the Doctor Dashboard\'s live bridge demo patient (Robert Hayes). The two aren\'t identical yet; both are honest, partial reflections of NEUROMORPH\'s real current coverage, not a discrepancy to worry about.',
  },
  {
    id: 'doc-non-diagnostic-disclaimer',
    category: 'education',
    question: 'What is the standard non-diagnostic disclaimer NEUROMORPH uses?',
    keywords: ['non-diagnostic disclaimer', 'standard disclaimer text'],
    answer: 'NEUROMORPH is an early cognitive screening tool. Bands describe observed task performance only and do not constitute a diagnosis of dementia or any other condition. Clinical correlation and, where indicated, formal neuropsychological or neurological evaluation is recommended.',
  },
];
