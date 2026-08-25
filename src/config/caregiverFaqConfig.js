// The caregiver-facing counterpart to faqConfig.js/doctorFaqConfig.js --
// same shape (id/category/question/keywords/answer), same generic
// ConversationEngine/FaqMatcherEngine matching underneath, its own content
// pool. Kept smaller and more focused than the doctor set on purpose (a
// first real batch, honest about being a start, not exhaustive) -- ids
// prefixed 'care-' by the same convention 'doc-' already established.
export const CAREGIVER_FAQ_ENTRIES = [
  {
    id: 'care-what-is-neuromorph',
    category: 'about',
    question: 'What is NeuroMorph?',
    keywords: ['what is neuromorph', 'what is this app', 'overview', 'what does this do'],
    answer: "NeuroMorph is a cognitive wellness and early screening platform. The patient you're supporting completes short weekly assessments and daily check-ins; you complete your own daily check-in about how they're doing day-to-day. Together, this gives their care team a fuller picture than either view alone.",
  },
  {
    id: 'care-what-is-daily-checkin',
    category: 'daily-checkin',
    question: "What is my daily check-in for?",
    keywords: ['daily check-in', 'what is the check-in', 'why answer questions', 'daily questions purpose'],
    answer: "It's 15 short questions about the patient's day -- mood, daily activities, memory, safety -- from your perspective as their caregiver. Patients don't always notice or report changes in themselves, so your observations fill in a real gap. It takes a couple of minutes and isn't a test with a pass/fail score.",
  },
  {
    id: 'care-checkin-required-daily',
    category: 'daily-checkin',
    question: 'Do I have to complete the check-in every single day?',
    keywords: ['every day', 'skip a day', 'miss a day', 'required daily'],
    answer: "It's designed to be done daily for the most useful trend, but missing an occasional day isn't a failure -- there's no penalty built in. Just try to get back to it the next day so the picture stays as complete as possible.",
  },
  {
    id: 'care-why-some-questions-change',
    category: 'daily-checkin',
    question: 'Why do some of my daily questions change each day?',
    keywords: ['questions change', 'different questions', 'why different every day', 'rotating questions'],
    answer: "5 of the 15 questions are the same every day -- the core signal a doctor can trend over time. The other 10 rotate through a wider pool of 50 questions in daily sets that don't repeat for about a week, so you cover a lot more ground (mobility, hygiene, decision-making, safety, and more) without making any single day's check-in longer.",
  },
  {
    id: 'care-who-sees-my-answers',
    category: 'privacy',
    question: 'Who can see what I write in the daily check-in?',
    keywords: ['who sees my answers', 'privacy', 'is this shared', 'confidential'],
    answer: "Your check-in answers are stored under your own caregiver account and are meant to support the patient's care picture -- they aren't shown publicly or to anyone outside the app's intended care team. If you're ever unsure who specifically can see something, ask your app administrator or the patient's clinician directly.",
  },
  {
    id: 'care-invite-code',
    category: 'linking',
    question: 'What is the invite code for?',
    keywords: ['invite code', 'link to patient', 'connect to patient', 'pairing code'],
    answer: "The invite code is how you connect your caregiver account to the specific patient you're supporting. The patient generates it from their own app and shares it with you directly -- this way, no one can attach themselves to a patient's account without that patient's own consent.",
  },
  {
    id: 'care-lost-invite-code',
    category: 'linking',
    question: "I don't have an invite code, what do I do?",
    keywords: ['no invite code', 'lost code', 'where do i get a code', "don't have a code"],
    answer: "Ask the patient you're caring for to open their NeuroMorph app and generate one for you from their home screen -- it's a short code they can share with you directly, by message or in person.",
  },
  {
    id: 'care-notifications',
    category: 'reminders',
    question: 'Will I get reminders to do my check-in?',
    keywords: ['reminders', 'notifications', 'will i be reminded', 'alerts'],
    answer: "You'll see an in-app reminder banner when you open the app if today's check-in isn't done yet. Real phone push notifications (that arrive even when the app is closed) aren't built yet -- for now, the reminder only shows when you actually open NeuroMorph.",
  },
  {
    id: 'care-emergency',
    category: 'safety',
    question: 'What do I do in a medical emergency?',
    keywords: ['emergency', 'urgent', 'medical emergency', 'call for help'],
    answer: "This app is not for emergencies. If the patient has a fall with injury, chest pain, sudden severe confusion, or is unresponsive, contact local emergency services or get them to a hospital immediately -- don't wait on anything here.",
  },
  {
    id: 'care-medication-question',
    category: 'safety',
    question: 'Can you tell me about a medication or dosage?',
    keywords: ['medication', 'dosage', 'drug interaction', 'medicine question'],
    answer: "I can't advise on medication, dosing, or interactions -- that has to come from the patient's prescribing clinician or pharmacist. I can help with the daily check-in or general caregiving questions instead.",
  },
  {
    id: 'care-caregiver-stress',
    category: 'wellbeing',
    question: 'I feel overwhelmed as a caregiver, can you help?',
    keywords: ['overwhelmed', 'caregiver burnout', 'caregiver stress', 'exhausted', 'tired of caregiving'],
    answer: "Caregiving is genuinely hard, and feeling overwhelmed doesn't mean you're doing it wrong. Practical things that help many caregivers: short daily breaks even if brief, accepting help when offered, connecting with a local or online caregiver support group, and talking to your own doctor if it's affecting your health. You matter here too, not just the patient.",
  },
  {
    id: 'care-diagnosis-question',
    category: 'safety',
    question: 'Does the patient have dementia?',
    keywords: ['does the patient have dementia', 'is this dementia', 'alzheimer diagnosis'],
    answer: "I can't determine that, and neither can NeuroMorph's data on its own -- these are non-diagnostic screening and monitoring signals. Only a qualified clinician, after a proper evaluation, can diagnose dementia or any related condition. If you're concerned, that's worth raising directly with their doctor.",
  },
  {
    id: 'care-morphy-file-upload',
    category: 'morphy',
    question: 'Can Morphy read a document I upload?',
    keywords: ['upload a file', 'upload pdf', 'analyze document', 'read my file'],
    answer: "Yes -- you can upload a PDF (like a NeuroMorph report) and I'll extract and explain what's in it. I won't invent values that aren't actually in the document.",
  },
  {
    id: 'care-morphy-voice',
    category: 'morphy',
    question: 'Can I talk to Morphy instead of typing?',
    keywords: ['voice input', 'talk to morphy', 'speak instead of type', 'microphone'],
    answer: "Yes -- tap the microphone icon in the chat and speak your question; it'll be transcribed and sent automatically once you're done talking.",
  },
  {
    id: 'care-morphy-language',
    category: 'morphy',
    question: 'Can Morphy understand my language?',
    keywords: ['other language', 'tamil', 'telugu', 'hindi', 'tanglish', 'my language'],
    answer: "Yes -- just type or speak naturally in whatever language (or mixed language, like Tanglish) you're comfortable with, and I'll reply the same way.",
  },
];
