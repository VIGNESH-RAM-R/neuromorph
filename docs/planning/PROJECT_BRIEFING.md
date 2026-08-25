# NEUROMORPH -- project briefing for a fresh agent session

Read this FIRST, before touching any code, if you're a new Claude session
(different account, different Cowork instance, whatever) picking up this
project without prior context. It's written to get you from zero to
"safe to start working" in one read. After this, read `PROGRESS.md` (same
folder) for the detailed run-by-run history, and `OVERNIGHT_PLAN.md` if
you're continuing i18n/design-system work specifically.

**Coordination model:** VR (the user) runs multiple Cowork sessions on
this project in parallel across different accounts. One main session (the
one VR primarily talks to) acts as the project lead/coordinator and is
kept up to date on everything. If you're a secondary/parallel session:
treat `PROGRESS.md` as the shared log -- append a real entry there after
any meaningful chunk of work (what you did, what you verified, what's
still open), the same way every entry already in that file does. That's
how the lead session (and VR) find out what you did without needing to
watch you work live.

## What this project is

NEUROMORPH is an AI-powered dementia / early cognitive screening platform,
built for a hackathon (a few days of build time total, still ongoing
polish). It is NOT a diagnostic tool -- every screen that shows a score
says so explicitly. It has three user roles: **Patient**, **Doctor /
Clinician**, and **Caregiver**.

## The two-app architecture (important -- don't merge these)

This is genuinely TWO separate React + Vite apps, not one app with a role
flag:

- **`app_page`** (this folder) -- the patient-facing app. ALSO contains
  the doctor and caregiver login/role flows (see `RoleGateScreen.jsx` ->
  `App.jsx`'s `role` state) as fully separate hook stacks
  (`useAuth`/`useDoctorAuth`/`useCaregiverAuth`), each writing to its own
  Firestore collection (`/users`, `/doctors`, `/caregivers`).
- **`Doctor_Dashboard`** -- a SEPARATE clinician app (own `package.json`,
  own `src/`, own git history) that does the actual patient-list /
  report-review UI a real clinician would use day to day. It reads data
  written by `app_page`'s doctor-bridge export logic
  (`DoctorDashboardExportEngine.js`), but is otherwise independent.

Both share ONE Firebase project (`neuromorph-624c0` -- Auth, Firestore, and
one Cloud Function `askMorphy` that proxies Gemini API calls so the API key
never ships to the browser). Firebase config lives in each app's own
`.env` (gitignored, not in this repo -- VR has the real values locally).

There are also unrelated sibling folders (`face_recognition`,
`face_module`, `AI_ChatBot`, `app_page`... check what's actually connected
in your session) -- some of these are teammate source projects that got
PORTED INTO `app_page` (e.g. the Stroop/Go-No-Go/Matrix Reasoning/Visual
Memory/Face Recognition/Geometric Shape Copy/Token Test/Delayed Recognition
Memory tasks under `src/components/assessment/` all started as separate
teammate zip files -- see `lobarTaskRegistryConfig.js`'s header comment for
the full integration history). Don't assume a sibling folder needs
integrating unless VR asks -- some of them are just reference/leftover.

## What's actually built (as of this briefing)

**Patient app (`app_page`):**
- Auth (email/password + Google/Facebook via Firebase, real accounts) +
  onboarding.
- **Daily Set**: 5 daily mini-games (facial expressivity, speech, memory,
  reaction, attention), a Momentum Score that's gated behind completing
  the day's set (never shows a fabricated partial score), streaks with a
  Sunday rest day, milestone badges.
- **Detection Assessment** (weekly): the **Lobar Function Test** -- 8
  active cognitive tasks (Stroop, Go/No-Go, Token Test, Matrix Reasoning,
  Geometric Shape Copy, Visual Memory, Face Recognition, Delayed
  Recognition Memory), each mapped to a brain lobe + cognitive domain (see
  `lobarConfig.js` / `lobarTaskRegistryConfig.js`) -- plus a 10-question
  block pulled from a 100-item Question Bank. 7 of 8 tasks run a practice
  round before the scored one (documented exception: Delayed Recognition
  Memory, see its own header comment). A REAL derived time estimate
  (~12-18 min, see `assessmentTimeEstimateConfig.js`) is shown before
  starting.
- **Morphy** -- an AI chat assistant (Gemini via the Cloud Function, with
  Google Search grounding) with a local FAQ-matching fast path before
  falling back to the LLM. Auto-detects the user's input language/style
  (including Tanglish-style code-mixing) rather than requiring a manual
  toggle -- see `LanguageEngine.promptInstruction`.
- **Doctor role** (inside `app_page`, separate from Doctor_Dashboard): its
  own login, an access-approval gate (self-healing, see
  `useDoctorAuth.js`'s 2026-08-19 bug-fix comment), its own Morphy variant
  with a named-patient-lookup + PDF summary generator.
- **Caregiver role**: invite-code linking to a specific patient, a 15-item
  daily check-in about the patient (10 fixed + 5 rotating questions), its
  own Morphy variant.
- **i18n**: 7 languages (English, Hindi, Tamil, French, Telugu, Urdu,
  Spanish). Login/signup fully translated from day one
  (`src/i18n/authStrings.js`); a broader app-wide translation pass is
  ONGOING -- see `OVERNIGHT_PLAN.md` for the exact pattern and remaining
  checklist. Run `node scripts/check-translations.mjs` (or `npm test`,
  which includes it) after touching any translated string file -- it fails
  loudly if any of the 7 languages is missing a key.
- **Design/motion**: a first Samsung Health-style pass (animated progress
  ring, count-up numbers, staggered card entrance, a lit streak flame) is
  done on the Home screen as the reference pattern; propagating further is
  also tracked in `OVERNIGHT_PLAN.md`.
- **PWA**: installable (manifest + icons + offline service worker,
  `public/sw.js`), dismissible install prompt.

**Doctor_Dashboard**: patient roster + report review UI. Has NOT yet
received the i18n/design-system treatment `app_page` has -- see
`OVERNIGHT_PLAN.md`'s Doctor_Dashboard checklist if that's your task.

## Conventions -- follow these, don't reinvent

- **Engine / Service / Hook / Component split**, consistently: `engines/`
  = pure functions, no I/O, fully unit-testable in plain Node.
  `services/` = the only files that touch Firestore/Firebase directly.
  `hooks/` = React state + wiring one engine/service together.
  `components/` = render only, read from hooks via props.
- **i18n pattern**: `src/i18n/createStringLookup.js` exports
  `createStringLookup(STRINGS)` (a `t(language, key)` factory with
  English fallback) and `format(template, values)` (a `{placeholder}`
  interpolator). Each screen/domain gets its own
  `src/i18n/strings/<name>.js` exporting `<NAME>_STRINGS = { en: {...},
  hi: {...}, ta: {...}, fr: {...}, te: {...}, ur: {...}, es: {...} }` --
  all 7, every time. Components take a `language = DEFAULT_LANGUAGE` prop.
  Reference implementation: `src/i18n/strings/common.js` + `home.js` +
  `HomeSection.jsx`.
- **Config-driven data vs. component copy**: things like game names, task
  labels, milestone labels, and the 100-question bank are DATA (in
  `src/config/`), not component text -- translating them is a bigger job
  (adding a language dimension to the config) than translating a
  component's own JSX strings. Don't conflate the two when scoping work.
- **Git discipline**: both repos are real git repos now (checkpoint
  commits exist from 2026-08-19: `app_page`'s baseline is
  `4917d2b`/`5d31682`, `Doctor_Dashboard`'s is `d58e6ea`). Commit after
  each real, verified chunk of work with a specific message. If VR says
  "revert", the answer is `git log --oneline` then
  `git reset --hard <hash>`, not manual undo.
- **This sandbox can't run a real Vite build.** `node_modules` here was
  installed on Windows; native binaries (`esbuild`, `rollup`) for a Linux
  sandbox aren't present, and reinstalling hits registry 403s. Verify
  JS/JSX syntax with the pure-JS `@babel/parser` package instead (already
  a transitive dependency):
  ```
  node -e "require('@babel/parser').parse(require('fs').readFileSync('FILE','utf8'), { sourceType:'module', plugins:['jsx'] })"
  ```
  Run `npm test` (plain Node, no bundler needed) for the real logic tests.
- **Never touch**: Firebase deploy commands, security-rules deployment, or
  anything needing VR's Firebase CLI login -- files only. No credentials
  live in this sandbox.
- **"Take it again anyway" / soft-mandatory UX philosophy**: this app
  never hard-blocks a user from retrying something (assessment,
  onboarding, daily tasks) -- reminders and guidance interstitials, never
  locks. Keep new features consistent with that.

## Test commands

```
npm test                          # engines + assessment + AI-fallback + daily-set tests + translation parity
node scripts/check-translations.mjs   # translation parity only
```

## If you're asked to "check out the live app"

This sandbox has no display and can't run a live browser against VR's
local dev server. If VR wants a real, rendered-UI check (not just code/
logic verification): either (a) VR runs `npm run dev` locally and connects
the Claude in Chrome extension so a Claude session can navigate/read the
actual page, or (b) VR shares a screenshot. Absent either, "verification"
here means: syntax check + `npm test` + reading the diff -- say so plainly
rather than implying you've visually confirmed something you haven't.
