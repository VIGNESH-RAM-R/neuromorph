# Setting up the real backend (Firebase)

This turns the app from "demo data on your laptop" into "real accounts,
real saved progress, usable by anyone with the link." Takes about 15
minutes. Go slowly, step by step -- nothing here needs coding knowledge.

---

## Step 1: Create the Firebase project (~3 min)

1. Go to [console.firebase.google.com](https://console.firebase.google.com/)
   and sign in with the same Google account you used for the OAuth setup
   (or any Google account).
2. Click **Create a project** (or **Add project**).
3. Project name: `neuromorph` (or anything you like) -> **Continue**.
4. It'll ask about Google Analytics -- toggle it **off** (you don't need it
   for this) -> **Create project**.
5. Wait ~30 seconds for it to finish, then **Continue** into the project.

## Step 2: Register the web app (~2 min)

1. On the project's home screen (the one with the big Firebase logo),
   click the **`</>`** (web) icon to add a web app.
2. App nickname: `neuromorph-web` -> **Register app**.
3. **Don't** check "Also set up Firebase Hosting" yet -- we'll do that
   later.
4. You'll now see a code block that looks like this:
   ```js
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "neuromorph-xxxxx.firebaseapp.com",
     projectId: "neuromorph-xxxxx",
     storageBucket: "neuromorph-xxxxx.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef123456"
   };
   ```
   **Copy all 6 of those values** -- send them to me (or paste them
   yourself into `.env`, matching the `VITE_FIREBASE_...` lines already
   there). These are safe to share/paste -- Firebase's web config is
   meant to be public; it's not a secret like the OAuth Client Secret was.
5. Click **Continue to console**.

## Step 3: Turn on Authentication (~3 min)

1. Left sidebar -> **Build** -> **Authentication** -> **Get started**.
2. You'll see a list of "Sign-in providers." Click each of these and
   toggle **Enable**, then **Save**:
   - **Email/Password** -- just enable it, no other settings needed.
   - **Google** -- enable it, it'll ask for a "project support email,"
     pick your own email -> Save.
   - **Facebook** -- enable it. It will ask for an **App ID** and
     **App secret** -- use the same Facebook App ID from `SETUP_OAUTH.md`,
     and grab the **App Secret** from the same Facebook dashboard screen
     (**App settings -> Basic**, it's right next to the App ID, click
     "Show"). It'll also give you an **OAuth redirect URI** -- copy that
     and paste it into Facebook's **Facebook Login -> Settings -> Valid
     OAuth Redirect URIs**, then Save on both sides.

## Step 4: Turn on the database (~2 min)

1. Left sidebar -> **Build** -> **Firestore Database** -> **Create
   database**.
2. Location: pick whichever region is closest to you -> **Next**.
3. Start in **Production mode** (not test mode) -> **Create**.
   - Production mode starts locked-down (nobody can read/write anything)
     until we add rules -- I'll write those rules once this step is
     done, so real users can only read/write their own data. This is the
     secure default; don't switch to test mode.

## Step 5: Send me the 6 config values

Paste the `firebaseConfig` block from Step 2 here in chat (or drop the 6
values into `.env` yourself), and let me know once Steps 3 and 4 are done.
I'll take it from there -- wiring real login and real data saving into the
app, and writing the Firestore security rules so each person can only see
their own data (and a doctor role can see patient data, nobody else can).

---

## What you get once this is wired in

- Real accounts -- signing up actually creates a persisted user, logging
  in from a different device shows the same data.
- Completed assessments actually save -- no more "resets when you refresh
  the page."
- The Doctor Dashboard can read real patient data instead of the sample
  6 (well, 7) mock patients.
- Still 100% free at this scale -- Firebase's free tier comfortably
  covers a hackathon demo and way beyond.

---

## Manual step still needed: redeploy `firestore.rules` (2026-08-20)

`firestore.rules` (this folder) has a new `doctorNotes` rule added under
`/patients/{uid}/doctorNotes/{noteId}` -- it lets an approved doctor create
and read clinical notes on a patient (see Doctor_Dashboard's
`FirestorePatientService.addDoctorNote`/`listDoctorNotes`). This rule is
written and ready but **not live** on the deployed Firebase project yet --
no automated session here has Firebase CLI credentials, and deploying rules
is explicitly out of scope for one. Until you deploy it, Doctor Dashboard's
"Add note" on a real patient will fail with an honest
`permission-denied` error shown in the UI (not silently swallowed).

To deploy it yourself once you're ready:
```
firebase deploy --only firestore:rules
```
(run from this folder, with the Firebase CLI logged in to the
`neuromorph-624c0` project). See `PROGRESS.md`'s 2026-08-20 entry for the
full context on what changed.
