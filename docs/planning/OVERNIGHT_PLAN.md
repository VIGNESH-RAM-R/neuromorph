# NEUROMORPH overnight automation plan

Started: 2026-08-19 22:23. Hard stop: 2026-08-20 05:30 (VR wakes up around
then -- do not start new risky work after 05:00; leave a clean, tested,
committed state).

**Scope (VR's explicit answers, 2026-08-19 22:2x):**
- Both apps: `app_page` (patient/doctor/caregiver) AND `Doctor_Dashboard`
  (separate clinician app, own Firebase auth/Firestore, no i18n or shared
  design system today).
- Priority order: agent's judgment, but **quality over coverage** --
  "anything you prefer first... very properly and perfectly." Read: it is
  better to finish 5 screens really well (real, checked, tested,
  grammatically sound translations; smooth, non-janky animation; no broken
  builds) than to half-finish 20.
- Runs as a scheduled task, roughly every 60-90 minutes, because the chat
  session cannot stay open unattended for 8 hours.

**Ground rules for every run (read this every time, not just the first):**
1. Read this file AND `PROGRESS.md` (same folder) first. `PROGRESS.md` is
   the append-only log of what's actually been done, run by run -- this
   file is the plan, that file is the truth about current state. If they
   ever disagree, trust `PROGRESS.md`.
2. Pick up the **next unchecked item** below, in order, unless
   `PROGRESS.md`'s last entry says otherwise (e.g. "left mid-way through
   X, resume there").
3. Do the item for real: write the code, run the syntax check
   (`@babel/parser`, see any earlier commit for the exact invocation), run
   `npm test` in the relevant app (`app_page` has `npm run
   check-translations` folded into `npm test` already; add the equivalent
   for `Doctor_Dashboard` when you build it there), fix anything broken.
   Never leave a run mid-edit with a broken build.
4. `git add -A && git commit` after each completed item (or a sensible
   sub-chunk of a big item), with a real, specific commit message. Both
   `app_page` and `Doctor_Dashboard` are real git repos now (see the
   "Checkpoint before overnight automation" / "Baseline checkpoint" commits)
   -- this is VR's safety net. If VR ever says "revert", the answer is
   `git log --oneline` to find the last-good commit, then
   `git checkout -- .` / `git reset --hard <hash>`, not manual
   undo-by-hand.
5. Append one entry to `PROGRESS.md` before stopping: what you did, what
   you verified, what's next. Keep it short and factual.
6. If you finish everything below with time to spare, move to the backlog
   section at the bottom rather than stopping early.
7. Never touch Firebase config, security rules deployment, or anything
   requiring VR's Firebase CLI login -- code and rules FILES only. Don't
   run `firebase deploy` (no credentials here anyway).
8. Don't invent new scope beyond what's listed here or obviously implied by
   it (e.g. "translate this screen" implies fixing an English typo you
   spot along the way -- fine; it does not imply redesigning the screen's
   layout from scratch).

## The i18n pattern (already established -- follow it exactly)

Reference implementation: `src/i18n/strings/common.js` +
`src/i18n/strings/home.js` + `src/components/HomeSection.jsx` +
`src/components/DashboardShell.jsx`, all in `app_page`, committed
2026-08-19 as "i18n architecture + Home screen full translation".

- One dictionary file per screen/domain in `src/i18n/strings/<name>.js`,
  exporting `<NAME>_STRINGS = { en: {...}, hi: {...}, ta: {...}, fr: {...},
  te: {...}, ur: {...}, es: {...} }` (all 7, every time -- partial files
  fail `check-translations.mjs` on purpose) and `export const t =
  createStringLookup(<NAME>_STRINGS);` from `../createStringLookup.js`.
- For strings needing runtime values (counts, names), import `format` from
  `home.js` (it'll likely get promoted to `createStringLookup.js` once 2-3
  files need it -- fine to do that promotion, just update both call sites).
- Components take a `language = DEFAULT_LANGUAGE` prop (import
  `DEFAULT_LANGUAGE` from `../config/i18nConfig.js`) and call `t(language,
  'key')` instead of hardcoding English text.
- Thread `language` down from `App.jsx` (it already has `language` in
  scope from `useLanguage()`) at every call site you touch.
- Data-driven config text (game names in `gamesConfig.js`, milestone labels
  in `momentumConfig.js`, the 100-question assessment bank, doctor/patient
  onboarding field labels) is a BIGGER job than a component's own copy --
  translating an array of `{id, label}` objects means adding a language
  dimension to the config itself. Treat each of these as its own checklist
  item below, not a quick add-on to whichever screen renders it.
- Quality bar: real, grammatically correct translations (you're a strong
  writer in all 6 non-English languages here -- use that, don't produce
  stilted word-for-word text). Keep tone consistent with the English
  original (warm, plain-language, non-clinical-jargon). After writing a
  dictionary, run `node scripts/check-translations.mjs` -- it must pass
  before you move on.
- RTL note: Urdu (`ur`) is the one RTL language (see `LANGUAGES` in
  `i18nConfig.js`, `dir: 'rtl'`). Translated TEXT is enough for tonight --
  a full RTL layout pass (mirroring flex/grid direction, icons, etc.) is
  its own backlog item, don't block screen translation on it.

## The motion/design pattern (already established -- follow it exactly)

Reference: the "Motion & Samsung Health-style dashboard visuals" section in
`src/styles/theme.css` (search for that exact comment) + `MomentumRing.jsx`
+ `useCountUp.js` + the `nmpa-anim-fade-up` usage in `HomeSection.jsx`.

- Card entrance: wrap top-level `<section className="nmpa-card ...">`
  elements in a screen with `nmpa-anim-fade-up`, stagger via inline
  `style={{ '--nmpa-anim-delay': '<n>ms' }}` in 60ms steps top to bottom.
- Any "big number that means something" (a score, a count) is a candidate
  for `useCountUp`. Any "progress toward a goal, 0-100%" is a candidate for
  a ring like `MomentumRing` (generalize it -- e.g. an `<ProgressRing
  pct={...} label={...} />` -- if a second screen needs one, don't just
  copy-paste `MomentumRing.jsx` wholesale).
  Don't force a ring or count-up where the data doesn't actually invite one
  (this is about restraint fitting Samsung Health's actual feel, not
  animating everything).
- Never a required animation: every new keyframe/transition needs a
  `@media (prefers-reduced-motion: reduce)` fallback (see the existing
  block in theme.css for the pattern -- either `animation: none` or the
  final-state look with no transition).
- Keep using the existing design tokens (`--nmpa-accent`, `--nmpa-radius-*`,
  `--nmpa-shadow-*`, `--nmpa-motion-*` in `theme.css`'s `:root` block) --
  don't invent new one-off colors/shadows/radii.

## Checklist -- app_page (in priority order)

### i18n: core chrome + high-traffic screens
- [x] `common.js` (nav, generic buttons) + `home.js` + `HomeSection.jsx` +
      `DashboardShell.jsx` -- DONE, this is the reference pattern.
- [ ] `GamesSection.jsx` (+ per-game sub-screens under
      `src/components/daily/` if they have their own hardcoded copy)
- [ ] `AssessmentSection.jsx` + `src/components/assessment/*` (the
      Detection Assessment flow shell/instructions -- NOT the actual
      100-question bank content itself, that's its own item below)
- [ ] `ProgressSection.jsx`, `DomainsSection.jsx`, `ActivitySection.jsx`,
      `InsightsSection.jsx`, `ReportsSection.jsx`
- [ ] `MorphySection.jsx`, `ChatPanel.jsx`, `ChatBubbleButton.jsx`,
      `ChatMessage.jsx` (chat UI chrome -- Morphy's actual AI replies are
      already language-aware via `LanguageEngine.promptInstruction`, this
      is just the surrounding buttons/placeholders/disclaimer text)
- [ ] `RoleGateScreen.jsx` (currently only English regardless of the
      language toggle, since the toggle lives on the login screens which
      come AFTER role selection -- worth a small UX look: should
      RoleGateScreen get its own language picker, or does English-only
      make sense for a screen shown before any language choice exists?
      Use judgment; document the decision in PROGRESS.md either way.)
- [ ] `DoctorHomeSection.jsx`, `DoctorAccessPendingScreen.jsx`,
      `DoctorChatPanel.jsx` (Doctor chrome inside app_page --
      `DoctorLoginScreen.jsx`/`DoctorSignupScreen.jsx` already get language
      via `AuthBrandPanel`, check whether their OWN button/label text is
      fully covered by `authStrings.js` or needs a `doctorAuth.js` string
      file)
- [ ] `CaregiverHomeSection.jsx`, `CaregiverDailyCheckIn.jsx`,
      `CaregiverLinkPatientScreen.jsx`, `CaregiverChatPanel.jsx` (same
      check for `CaregiverLoginScreen.jsx`/`CaregiverSignupScreen.jsx`)
- [ ] Onboarding: `OnboardingStep.jsx`, `OnboardingComplete.jsx`, and the
      field labels themselves in `onboardingConfig.js` /
      `doctorOnboardingConfig.js` / `caregiverOnboardingConfig.js` (this is
      a config-translation item, bigger than a component copy pass --
      budget real time for it)

### i18n: config-driven data (bigger jobs, do these once the above is solid)
- [ ] `gamesConfig.js` -- game/category names and descriptions
- [ ] `momentumConfig.js` -- `STREAK_MILESTONES` labels
- [ ] `dailyTaskConfig.js` -- the 5 daily task names/descriptions
- [ ] The Detection Assessment's actual question bank (Lobar Function Test
      + the 10 rotating questions -- find the config file(s) under
      `src/config/` or `src/components/assessment/`). **This is flagged as
      higher-stakes clinical content in this project's own prior notes** --
      translate it carefully, keep the English meaning exact, and note in
      PROGRESS.md that it's Claude-translated UI copy, not a
      clinically-validated instrument in each target language, same
      honesty standard as `authStrings.js`'s existing header comment.
- [ ] Doctor FAQ (`doctorFaqConfig.js`) and Caregiver FAQ
      (`caregiverFaqConfig.js`) -- lower priority, these only ever show up
      as local matches in English queries today (the matcher isn't
      language-aware), so translating the FAQ answers without also
      teaching `ConversationEngine`/`FaqMatcherEngine` to match non-English
      queries produces translated answers to English-only questions. Either
      skip this one for tonight (document why in PROGRESS.md) or do both
      halves properly if time allows -- don't ship a half-measure.

### Design/motion pass (app_page)
- [x] Home -- done (see reference above)
- [x] Games section -- done (see the header comment in GamesSection.jsx):
      card stagger + a real checkmark-pop micro-interaction on
      task-complete (nmpa-checklist__item.is-done .nmpa-checklist__mark,
      theme.css's nmpa-check-pop keyframe)
- [x] Progress/Domains/Activity/Insights/Reports -- done 2026-08-21: card
      stagger on all 5 screens, plus real chart entrance animations
      (LineChart draws on via the SVG2 `pathLength` trick, points pop in
      staggered; DomainBreakdownChart's bars grow via `transform: scaleX`
      with rows fading up in sync). ActivitySection's heatmap and
      ReportsSection's single static card deliberately got NO extra
      per-element animation -- documented in each file's header comment as
      a restraint call, not an oversight (84 heatmap cells staggering, or
      animating a lone button, wouldn't fit Samsung Health's actual feel).
- [x] Doctor + Caregiver home screens -- done 2026-08-21: same
      card-entrance treatment as patient Home. CaregiverHomeSection also
      picked up the exact same lit-flame + useCountUp streak treatment
      HomeSection.jsx uses (same concept, reused, not reinvented).

## Checklist -- Doctor_Dashboard

Doctor_Dashboard has NO i18n and NO shared design tokens with app_page
today (separate `theme.css`, separate component tree under `src/ui/`).
Treat this as "port the pattern," not "assume it's already there."

- [ ] Read `Doctor_Dashboard/src/styles/theme.css` in full first --
      confirm whether it shares CSS variable NAMES with app_page's
      theme.css (`--nmpa-*`) or uses its own scheme, before assuming
      anything can be copy-pasted.
- [ ] Set up the same `src/i18n/createStringLookup.js` +
      `src/i18n/strings/` pattern inside `Doctor_Dashboard` (it's a fully
      separate app/repo, so this is a real port, not a shared import).
- [ ] Add a language selector to Doctor_Dashboard's own login screen
      (check `src/ui/auth/` for what exists today).
- [ ] Translate Doctor_Dashboard's own login/signup + top-level nav +
      patient-list screen chrome (`src/ui/layout/`, `src/ui/patients/`)
      into all 7 languages.
- [ ] Same motion/design pass: card entrance, and look for a natural
      "ring or count-up" candidate (likely the patient roster's
      score/trend summaries).
- [ ] Add a `scripts/check-translations.mjs` to Doctor_Dashboard too (copy
      the app_page one, adjust paths) and wire it into its own test/build
      script if one exists (`package.json` -- check first).

## Backlog (only after everything above is solid)

- Empty states for every list/history view (no daily history yet, no
  reports yet, etc.) -- check what exists today before assuming there's
  nothing.
- A real loading-skeleton component for async Firestore reads, replacing
  any bare "Loading…" text where one exists.
- An error boundary + a friendly fallback screen for uncaught render
  errors (currently probably a blank white screen).
- Accessibility pass: run through `design:accessibility-review` skill's
  checklist (contrast, focus states, touch target size) on the screens
  touched tonight.
- A short `DEMO_SCRIPT.md` for hackathon judges: the fastest path through
  every headline feature (3 roles, i18n, Morphy, caregiver invite flow),
  written for someone who's never seen the app before.

## Done outside this checklist (informational, don't redo)

- **PWA installability** (manifest, generated icons, offline service worker,
  dismissible install prompt in all 7 languages) -- a separate, self-directed
  request from VR, not part of this plan. See `PROGRESS.md`'s "23:1x -- Live
  session" entry for full detail. Nothing here needs action; just don't
  duplicate it if a future idea for "make it installable" comes up.

## Status

See `PROGRESS.md` in this same folder for the run-by-run log.
