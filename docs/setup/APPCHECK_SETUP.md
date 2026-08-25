# Turning on App Check (protects `askMorphy` from abuse)

Right now, anyone who finds the `askMorphy` Cloud Function's URL can call
it directly -- no login needed, since Morphy talks to unauthenticated
visitors on the login/signup screens too. That's fine for a demo audience;
once the URL is public, it's a real cost/abuse risk (someone could burn
your Gemini quota just by hammering the URL with a script). App Check
fixes that by requiring every request to prove it's coming from your real,
deployed app before this function even runs.

This is written, coded, and safe-by-default already -- it does nothing
until you complete the steps below. Takes about 10 minutes.

---

## Step 1: Register App Check in Firebase Console (~5 min)

1. Go to your project in [console.firebase.google.com](https://console.firebase.google.com/).
2. Left sidebar -> **Build** -> **App Check**.
3. Find your web app in the list -> click it -> **reCAPTCHA v3** as the
   provider (it's free, no separate account needed) -> follow the prompt
   to register a reCAPTCHA v3 site key for your app's domain.
   - If you're testing locally first, also register `localhost` as an
     allowed domain in the reCAPTCHA admin console it links you to.
4. Copy the **site key** it gives you.

## Step 2: Add the site key to `.env` (~1 min)

Paste it into `.env` (same folder as `.env.example`):
```
VITE_FIREBASE_APPCHECK_SITE_KEY=your-key-here
```
That's it on the frontend side -- `firebaseConfig.js` picks this up
automatically and starts attaching real App Check tokens to Morphy's
requests. Leaving this blank (the default) means App Check just stays
off, same as today.

## Step 3: Deploy the frontend with the key set (~2 min)

```
npm run build
firebase deploy --only hosting
```
(Needs `firebase.json`'s `hosting` block, added 2026-08-21 -- see
`DEPLOYMENT_READINESS.md`.)

## Step 4: Watch App Check's metrics for a day BEFORE enforcing anything

Firebase Console -> App Check -> your `askMorphy` function should start
showing **Verified** requests once real traffic hits the deployed site.
Give this at least a few hours to a day of real usage. This step matters
-- it's the difference between "App Check is working" and "App Check is
about to lock out every real user."

## Step 5: Only once Step 4 looks right -- turn on enforcement

Open `functions/index.js`, find the line:
```js
const ENFORCE_APP_CHECK = false;
```
Change it to `true`, then redeploy:
```
firebase deploy --only functions
```
From this point on, `askMorphy` rejects any request without a valid App
Check token -- including a request from anyone who finds the raw function
URL and tries to call it directly, which is the whole point.

---

## Why this is split into two deploy steps, not one

Flipping `ENFORCE_APP_CHECK` to `true` before the frontend is actually
live with a working site key would reject every real request, including
your own -- there'd be no way for a legitimate browser to prove itself yet.
This is Firebase's own documented rollout order (register -> deploy ->
monitor -> enforce), not something invented for this project. Skipping
Step 4 is the most common way teams accidentally lock themselves out of
their own app.
