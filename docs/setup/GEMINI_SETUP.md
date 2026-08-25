# Turning on Morphy's live AI fallback (free, via Google Gemini)

Morphy (patient) and Morphy for Clinicians (doctor) already answer most
questions instantly and for free from a local, hand-written FAQ list --
that never needs an API key and keeps working forever. This is for the
*fallback*: what happens when someone asks something not in that list.

By default this fallback is off (`AI_FALLBACK_CONFIG.enabled = false` in
`src/config/aiFallbackConfig.js`), and Morphy just says it doesn't know yet.
Turning it on takes three steps.

**Correction (2026-08-18):** Gemini itself is genuinely free, but deploying
*any* Firebase Cloud Function -- including this one -- requires Firebase's
"Blaze" (pay-as-you-go) plan, which does ask you to add a card. Blaze still
includes a large free-usage allowance every month (far more than this app
will ever use), so the realistic bill is $0.00 -- but you will be asked to
add a card before you can deploy. See step 2 below for exactly where.

---

## 1. Get a free Gemini API key (~2 min)

1. Go to [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
   and sign in with any Google account.
2. Click **Create API key**. Copy it -- you'll paste it in step 2, nowhere
   else. Never put this key in any file inside `src/` -- anything in `src/`
   ends up in the browser bundle, which means anyone could open dev tools
   and steal it.

**Know before you send anything real through it:** on the free tier,
Google may use your prompts/responses to improve their products, and
human reviewers can see them (this is different from the paid tier, which
doesn't do this). That's fine for this project right now since every chat
question is either about how the app works or about the mock/demo patient
data already in the repo -- there's no real patient information anywhere
in this codebase to accidentally send. If this app ever handles real
patient data, switch to the paid tier (or a HIPAA-eligible provider)
before wiring a live LLM to it -- not before.

## 2. Deploy the proxy function (~5 min)

The actual code is already written: `functions/index.js`. It's a small
Firebase Cloud Function that receives Morphy's question, calls Gemini with
your key (kept server-side, never shipped to the browser), and returns the
answer. You just need to deploy it.

1. If you haven't already: `npm install -g firebase-tools`, then
   `firebase login`.
2. From the project root (same folder as this file):
   ```
   firebase use --add
   ```
   and pick the same Firebase project this app's `.env` already points at
   (see `FIREBASE_SETUP.md` if you need the project ID).
3. Upgrade the project to the **Blaze plan**: go to
   [console.firebase.google.com](https://console.firebase.google.com), open
   this project, click the gear icon -> **Usage and billing** -> **Details
   & settings** -> **Modify plan** -> Blaze. It'll ask for a card. Cloud
   Functions cannot deploy on the free Spark plan, full stop -- this step
   isn't optional. Blaze's own free monthly allowance easily covers this
   app, so you should not actually be charged.
4. Store your key as a secret (this is what keeps it out of source control
   and out of the bundle):
   ```
   firebase functions:secrets:set GEMINI_API_KEY
   ```
   Paste the key from step 1 when prompted.
5. Deploy:
   ```
   firebase deploy --only functions
   ```
   This prints a URL that looks like
   `https://us-central1-<your-project>.cloudfunctions.net/askMorphy` --
   copy it.

## 3. Point the app at it

In `src/config/aiFallbackConfig.js`:
```js
export const AI_FALLBACK_CONFIG = {
  enabled: true,
  endpoint: 'https://us-central1-<your-project>.cloudfunctions.net/askMorphy',
  timeoutMs: 12000,
};
```

That's it -- both Morphy and Morphy for Clinicians now fall back to Gemini
for anything the local FAQ doesn't cover, using each one's own correct
system prompt automatically (`systemPromptConfig.js` for patients,
`doctorSystemPromptConfig.js` for doctors). Nothing else needs to change.

---

## Why Gemini and not Claude or Grok

You asked to avoid Claude specifically because it's paid, and to look at
Grok as an alternative. As of writing:

- **Gemini** has a genuine ongoing free tier -- no credit card, real daily
  request quota (the model this function uses, `gemini-2.5-flash-lite`,
  gets 1,000 free requests/day), which is what `functions/index.js` uses.
- **Grok's** consumer chat is free, but its *API* (what an app like this
  needs) isn't -- xAI gives a one-time $25 signup credit, then it's
  pay-per-token. Fine if you want it as a second option later, but not a
  standing free tier the way Gemini's is.

If you ever want to add Grok (or any other provider) as a second fallback,
`functions/index.js` is written as a thin, single-purpose proxy on
purpose -- copying it to a second function (e.g. `askMorphyGrok`) that
calls a different API is a small, isolated change, not a rewrite.

## Attribution

`ChatPanel.jsx` and `DoctorChatPanel.jsx` both show a small "Answers may be
generated using Google Gemini" line in their disclaimer once
`AI_FALLBACK_CONFIG.enabled` is true -- honest, visible credit, shown only
when it's actually true.
