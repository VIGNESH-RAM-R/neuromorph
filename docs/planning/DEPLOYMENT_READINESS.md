# NEUROMORPH -- deployment readiness audit (2026-08-21)

Full-codebase pass across both `app_page` and `Doctor_Dashboard`, done by
actually reading/grepping the relevant files (Cloud Function, Firestore
rules, `firebase.json`, `package.json`, component tree, manifest) rather
than assuming from memory. Everything below is a verified finding, not a
guess. Organized by how much it actually blocks a real (non-hackathon-demo)
deployment, not by how interesting it is to build.

## Sprint update (2026-08-21, same day) -- all 4 blocking items done

All 4 items below are implemented, syntax-checked, and passing the full
`npm test` suite (140+122+6+22 assertions + translation parity). Honest
notes on what "done" does and doesn't cover, per item:

1. **Hosting config** -- added, valid JSON. Could not verify the actual
   `dist/` build output from this sandbox (missing native Rollup binary,
   a pre-existing, documented limitation) -- run `npm run build && firebase
   deploy --only hosting` yourself once to confirm before treating this as
   fully proven.
2. **Error Boundary** -- built and wraps the app root in `main.jsx`. Only
   catches render errors in the React tree below it, not errors in event
   handlers or async callbacks (a React limitation, not a gap in this
   implementation) -- those still rely on existing try/catch.
3. **App Check** -- wired client-side (`firebaseConfig.js`) and
   server-side (`enforceAppCheck` option on `askMorphy`), but
   **deliberately left OFF by default** (`ENFORCE_APP_CHECK = false` in
   `functions/index.js`) until you've done the manual Firebase Console
   steps in `APPCHECK_SETUP.md` (register a reCAPTCHA v3 site key, deploy,
   confirm verified traffic) -- flipping it on before that would lock out
   real users, not just abusers.
4. **Consent + Privacy Policy** -- a real, honest, English-only Privacy
   Policy (`src/config/privacyPolicyConfig.js` + `PrivacyPolicyScreen.jsx`,
   deliberately NOT run through the 7-language i18n system -- mistranslated
   legal text is worse than mistranslated UI copy) is reachable from all 3
   signup screens. A required consent checkbox gates both the email-signup
   button and both social-auth buttons on each screen, and stamps a real
   `privacyConsentAcceptedAt` timestamp on the new profile. **One disclosed,
   known gap:** a brand-new Google/Facebook sign-in started from the LOGIN
   screen (not Signup) has no consent checkbox in this build, so that one
   path still writes `privacyConsentAcceptedAt: null` -- an existing user
   logging back in is unaffected either way. Also: this policy is a
   genuine first draft written from what the code actually does, not
   lawyer-reviewed -- have someone who knows the DPDP Act 2023 review it,
   and fill in a real contact email (currently a placeholder), before this
   goes in front of anyone outside your own testing.

## Blocking -- would break or endanger a real deployment (historical, see update above)

1. **`app_page/firebase.json` has no `hosting` block at all.** Only
   `functions` + `firestore.rules` are configured. `Doctor_Dashboard`'s
   `firebase.json` DOES have a correct hosting config (`public: "dist"`,
   SPA rewrite). Right now `firebase deploy` for `app_page` would deploy
   the Cloud Function and rules but never actually serve the frontend
   anywhere. This is a one-file fix (~10 lines, copy Doctor_Dashboard's
   pattern) but without it there is no live app_page URL, period.
2. **No React Error Boundary anywhere in either app.** One uncaught
   exception in any component (a bad Firestore read, a malformed session
   record, anything) white-screens the whole app for that user instead of
   showing a real "something went wrong, try again" state. Small to add
   (one component + wrap the app root), high value the moment this has
   real users instead of a live demo in front of judges.
3. **The Cloud Function (`askMorphy`) has real input validation (length
   caps, required fields, timeout, sanitized error responses -- this part
   is actually solid) but no App Check and no per-user rate limiting.**
   Anyone who finds the function URL can call it directly, unauthenticated,
   as many times as they want, burning your Gemini quota/cost. Fine for a
   demo audience; not fine once this is a public URL. Firebase App Check
   is the standard fix (a few hours, needs the Firebase CLI/console, not
   just file edits -- same "can't deploy from here" boundary as the
   Firestore rules).
4. **No signup-time consent and no privacy policy / terms of service
   anywhere in the app.** This collects real health-adjacent data (cognitive
   scores, session history, caregiver notes about a named patient) under
   real accounts. Before any real (non-demo, non-teammate-testing) user
   signs up, this needs an actual consent checkbox + a real privacy
   policy page, not just the existing non-diagnostic disclaimer (which
   covers "this isn't a diagnosis," not "here's what we do with your
   data"). This is content + a small UI addition, not a big engineering
   lift, but it's a real gap for anything beyond a hackathon audience.

## Should fix before real users, not blocking a demo

5. **No password reset flow, no email verification, no account/data
   deletion path.** Verified: no `sendPasswordResetEmail`,
   `sendEmailVerification`, or `deleteUser` call anywhere in the codebase.
   A patient who forgets their password today has no self-serve recovery.
   For health data specifically, "can a user delete their data" is also
   an increasingly standard expectation, not just a nice-to-have.
6. **Doctor notes security rule is written and reviewed but genuinely not
   deployed** (documented in `firestore.rules` itself and `PROGRESS.md`'s
   2026-08-20 entry). `firebase deploy --only firestore:rules` closes this
   -- a VR-only action, not something buildable from this sandbox.
7. **Accessibility is thin: only 18 of 85 `.jsx` files have any
   `aria-label` at all.** Already on the project's own backlog (item #14
   in the standing task list), never started. Matters generally, and
   matters MORE than usual here given the target user (elderly patients,
   possibly with mild cognitive impairment) is exactly the population
   accessibility guidance is written for.
8. **No automated UI/e2e or accessibility testing.** The logic/engine test
   suite is genuinely strong (140+122+6+22 in app_page, 80+7 in
   Doctor_Dashboard, all real assertions, not smoke tests) but nothing
   verifies a screen actually renders correctly, is keyboard-navigable, or
   survives a real browser. Fine for how this has been verified so far
   (syntax check + logic tests + your own visual spot-checks); a gap if
   this needs to survive changes from more contributors later.
9. **No error/crash monitoring in production** (no Sentry or equivalent),
   no uptime monitoring on the Cloud Function. Right now the only way to
   know something broke in production is a user telling you.

## Real, known feature gaps (already surfaced, not new findings)

10. Only 1 of 5 Daily Set games (`facial-expressivity`) is actually
    playable -- the other 4 render "Coming soon."
11. Speech isn't wired into the Detection Assessment yet (blocked on your
    teammate's module, by design, not forgotten).
12. Difficulty is fixed per task, not adaptive to live performance.
13. `Doctor_Dashboard` has zero i18n and none of `app_page`'s design/motion
    pass -- the two apps will look and read very differently side by side.
14. Offline support today is read/cache-only (PWA shell + assets via the
    service worker) -- there's no queue-and-sync for completing a session
    while offline.

## Explicitly NOT gaps -- verified solid, don't waste time re-checking these

The PWA manifest is complete and correct (icons, both `any` and `maskable`
purposes, proper `display`/`start_url`/`scope`). The Cloud Function's own
input validation, timeout handling, and error-message sanitization (never
leaking the raw Gemini error or the API key) are genuinely well done.
Firestore rules are tight and specific -- no collection is left more open
than it needs to be, and the one deliberately-broad case (`inviteCodes`
`get`) has a clear, correct reason documented inline. `.env`/`.env.local`
are correctly gitignored in both repos; no secret was found committed
anywhere.

## Where Cursor would actually help here (and where it wouldn't)

Most of this list -- the hosting config fix, the error boundary, the
consent/privacy content, App Check setup, password reset/deletion flows --
is exactly the kind of scoped, verifiable, delegate-and-check work this
session has already been doing well. Cursor doesn't add much there.

The one item on this list Cursor is genuinely well-suited for is #7,
accessibility: going file-by-file across 85 components with `npm run dev`
open, adding `aria-label`s, checking focus order, and eyeballing the
result live is exactly the "sit and iterate with fast in-editor
assistance" workflow Cursor is built for, more than the "delegate a whole
chunk and verify it" workflow this session runs on. If Cursor gets used
anywhere on this project, that's the one place it'd earn its keep over
just continuing here.
