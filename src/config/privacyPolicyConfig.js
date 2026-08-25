// 2026-08-21: real, honest Privacy Policy content -- see
// DEPLOYMENT_READINESS.md item 4. DELIBERATELY English-only, not run
// through this app's usual 7-language i18n pattern: legal/policy text is a
// different risk category from UI copy -- a mistranslated button label is
// a minor UX papercut, a mistranslated privacy commitment is a real
// promise made incorrectly in someone's own language. Same honesty
// standard as authStrings.js's own header comment (Claude-translated UI
// copy is fine; Claude-translated LEGAL text, unreviewed, is not), just
// drawing the line more conservatively here. Kept OUT of src/i18n/ and
// NOT named *_STRINGS on purpose so scripts/check-translations.mjs
// correctly does not flag this as an incomplete translation table -- this
// is a deliberate scope decision, not an oversight.
//
// TODO(VR): replace CONTACT_EMAIL below with a real address before this
// goes in front of anyone outside your own testing. Also review the whole
// document yourself (or have someone who actually knows Indian data-
// protection law, e.g. the DPDP Act 2023, review it) before treating this
// as your real, final privacy policy -- this is a genuine, complete first
// draft, written from what the codebase actually does (verified against
// firestore.rules and every FirestoreXService.js file, not guessed), but
// it is not legal advice and has not been reviewed by a lawyer.
export const PRIVACY_POLICY_VERSION = '1.0';
export const PRIVACY_POLICY_LAST_UPDATED = '2026-08-21';
export const CONTACT_EMAIL = '[contact email -- VR to fill in]';

export const PRIVACY_POLICY_SECTIONS = [
  {
    title: 'What NEUROMORPH is',
    body:
      'NEUROMORPH is an early cognitive screening tool. It is NOT a diagnostic tool -- ' +
      'every screen that shows a score says so explicitly, and this policy is no ' +
      'different: nothing here changes that. This document explains what information ' +
      'the app collects, why, and who can see it.',
  },
  {
    title: 'What we collect',
    body:
      'If you use NEUROMORPH as a Patient: your name, email, and age (from onboarding); ' +
      'your completed Detection Assessment sessions (task-by-task scores, domain scores, ' +
      'and an overall score); your Daily Set completion history and Momentum Score; and, ' +
      'if you use Morphy, the questions you ask it (sent to Google’s Gemini API to ' +
      'generate a response -- see "Third parties" below).\n\n' +
      'If you use it as a Doctor: your name, email, and professional profile (specialty, ' +
      'years of practice, practice setting); and, if approved, read access to a patient’s ' +
      'assessment history (never write access -- doctors cannot edit a patient’s own data) ' +
      'plus any clinical notes you write about a patient.\n\n' +
      'If you use it as a Caregiver: your name and email; your daily check-in answers about ' +
      'the patient you’re linked to; and which patient you’re linked to (via an invite ' +
      'code that patient generated and shared with you).',
  },
  {
    title: 'Why we collect it',
    body:
      'Every field above exists to make a specific feature work -- scoring your assessment, ' +
      'showing your streak, letting an approved doctor review your history, letting a ' +
      'caregiver track daily wellbeing. We don’t collect anything "just in case," and we ' +
      'don’t use your data for advertising -- there is none in this app.',
  },
  {
    title: 'Who can see your data',
    body:
      'This is enforced by Firestore Security Rules on our backend, not just app-level checks -- ' +
      'so this is a real technical guarantee, not just a policy statement. Your own private ' +
      'profile is readable and writable only by you, ever. A doctor account can READ (never ' +
      'write) a patient’s assessment-history bridge record, but only if that doctor account ' +
      'has been approved, and only that specific record -- never your full private profile. A ' +
      'caregiver account can only read/write its own check-in records, linked to one patient by ' +
      'an invite code that patient chose to share -- a caregiver never gets direct read access to ' +
      'a patient’s own assessment scores through this app today.',
  },
  {
    title: 'Third parties',
    body:
      'We use Firebase (Google Cloud) for authentication and data storage -- your data is hosted ' +
      'on Google’s infrastructure, subject to Google Cloud’s own security practices. If ' +
      'you chat with Morphy and your question needs a live AI response, that question (and a ' +
      'short recent-message history for context) is sent to Google’s Gemini API, which may ' +
      'also use Google Search to ground its answer in current information. No API key or ' +
      'credential ever ships in the app itself -- that request is proxied through our own ' +
      'server-side function specifically so the key stays private. We do not sell your data to ' +
      'anyone, for any reason.',
  },
  {
    title: 'Data retention and deletion',
    body:
      'Honestly: there is no automatic data-retention limit or self-serve "delete my account" ' +
      'button in the app today -- this is a real, known gap (tracked in DEPLOYMENT_READINESS.md), ' +
      'not something we’re choosing not to tell you. Until that’s built, if you want your ' +
      'data deleted, contact us at the address below and we’ll do it manually.',
  },
  {
    title: 'Security measures',
    body:
      'Passwords are handled entirely by Firebase Authentication -- this app never sees or stores ' +
      'your raw password. All traffic is encrypted (HTTPS). Access to your data is enforced by ' +
      'server-side security rules, described above, not just hidden by the app’s UI.',
  },
  {
    title: 'Not for children',
    body:
      'NEUROMORPH is built for adult patients, their doctors, and their caregivers. It is not ' +
      'directed at, or knowingly collecting data from, children.',
  },
  {
    title: 'Questions or a deletion request',
    body: `Contact us at ${CONTACT_EMAIL}.`,
  },
];
