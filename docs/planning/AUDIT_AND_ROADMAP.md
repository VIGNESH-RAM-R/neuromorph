# NEUROMORPH — Full App Audit & Work Split
Reviewed: 2026-08-18. This is a full read-through of app_page (fonts, layout, games, bugs, gaps) split into two tracks so you can hand this straight to your teammate.

---

## TRACK 1 — UI/UX (send this section to your teammate)

### Fix now
1. **Global uppercase text may hurt readability.** Right now `body { text-transform: uppercase }` capitalizes almost all text app-wide, not just headings. For a dementia-screening app whose users skew older and may already have visual/cognitive strain, all-caps body text is measurably harder to read than normal case. Recommend: keep uppercase only on short labels/headings/buttons (already has its own heading-font rule) and set body copy, instructions, and chat text back to normal case.
2. **Inconsistent responsive breakpoints.** The stylesheet uses 5 different breakpoint widths (480px, 560px, 640px, 800px, 900px) with no clear system. Recommend picking 2–3 standard breakpoints (e.g. 480 / 768 / 1024) and mapping every `@media` rule to one of them — easier to maintain and test.
3. **Progress screen has no mobile layout at all.** Domain Breakdown, Clinical Insights, and Activity Heatmap (the newer Progress-page sections) have zero `@media` rules. On a small phone these likely feel cramped or overflow, especially the heatmap's horizontal scroll strip. Needs an actual test pass on a real phone width and mobile-specific tweaks.
4. **Face Recognition photos have unhelpful alt text.** Images currently get `alt="face01"` etc. Screen-reader users hear "face zero one" instead of something meaningful like "Face photograph 1." Small fix, real accessibility improvement.
5. **Dead file to delete:** `src/components/auth/AuthBlobBackdrop.jsx` is not imported anywhere anymore (leftover from an earlier login redesign). Safe to delete.

### Visual QA pass needed
6. Recent weeks reworked a lot of theme-driven CSS (auth panel colors, role-gate visuals, brand fonts). Please click through **every screen in both Light and Dark mode** — patient login/signup, doctor login/signup, role-gate, home, daily set, progress, doctor home, doctor chat. Theme variables were touched broadly enough that a visual regression is plausible somewhere.
7. Check legibility of the small text in the role-gate brain callouts (13.5px title / 10.5px tagline) on an actual phone screen, not just a laptop — these are the smallest text sizes in the app and the audience skews older.
8. `.nmpa-game-grid` cards use a 220px minimum width — fine on most phones, but verify on very small/older devices (iPhone SE-class, ~375px wide) that cards don't feel squeezed.

### Games arrangement (needs your design input, backend follows once decided)
9. In `gamesConfig.js`, the daily **Memory / Reaction / Attention / Speech** categories are placeholders — no sub-games defined yet, all marked `not-built`. Only Facial Expressivity is actually wired into the Daily Set. Once you (or the other teammate) design what these 4 categories' game screens should look like and send the components, they get wired in on the backend side (see Track 2, item 4).

---

## TRACK 2 — Integration / Backend (your work)

### Already fixed during this review
1. **Canvas drawing bug (Geometric Shape Copy test) — fixed.** The drawing canvas was setting its pen color using `var(--nmpa-ink, #1a2333)` directly on a Canvas 2D context. Canvas doesn't understand CSS variables, so browsers silently ignore that and default to pure black. In light mode this looked fine by coincidence; in **dark mode**, the canvas background is dark too, so a patient's own drawn strokes were rendering at very low contrast — possibly barely visible. Fixed by resolving the real color before handing it to canvas. Already tested (all 201 test assertions still pass).

### The single biggest pending item
2. **Patient app and Doctor Dashboard aren't actually connected yet.** Both apps run on their own separate fake/mock data right now (`MockBackendService.js` in app_page, `mockPatients.js` in Doctor_Dashboard) — a patient completing an assessment in app_page does **not** show up in Doctor_Dashboard today. The good news: Doctor_Dashboard already has a full Firestore data-schema design document (`Doctor_Dashboard/src/schema/firestoreSchema.md`) written and ready to implement, and it's designed so wiring it in requires **no engine or UI changes** on either side — just an adapter that writes/reads real Firestore documents into the shapes both apps already expect. This is the real "make it one product instead of two demos" task, and it's squarely a backend job since Firebase is already used in app_page (Auth) — extending it to Firestore is a natural next step.

### Other pending backend/integration items
3. **Chatbot is currently telling patients about two features that don't exist.** Morphy's system prompt lists "EEG Integration (optional)" and "Caregiver Mode" as real NeuroMorph capabilities. I checked the whole codebase — neither has any actual implementation anywhere, they're mentioned only in prompt/FAQ text. If a patient asks "do you have EEG integration?", Morphy will currently say yes. Recommend removing those two lines from the prompt/FAQ until they're real, or explicitly marking them "planned" so Morphy answers honestly. This is a patient-trust/accuracy issue, not just a copy edit — worth prioritizing.
4. **Daily rotating game picker doesn't exist yet.** There's no logic that decides which Memory/Reaction/Attention/Speech game a patient sees "today." Once your teammate sends the actual game components (see Track 1, item 9), you'll need to build the picker logic and wire each into `DAILY_TASK_COMPONENTS` in `GamesSection.jsx` (currently only `facial-expressivity` is wired).
5. **Gemini chatbot backend is built but not deployed.** The Cloud Function (`functions/index.js`) and full deploy guide (`GEMINI_SETUP.md`) are ready — you still need to: get a free Gemini API key, run the Firebase deploy steps, paste the resulting URL into `aiFallbackConfig.js`, and flip `enabled: true`. Until this is done, Morphy answers only from its built-in FAQ (still works fine, just not free-form).
6. **`DOCTOR_DASHBOARD_URL` is still empty** in `externalLinksConfig.js` — once Doctor_Dashboard is deployed somewhere real, that link needs to be filled in so the patient app can actually point to it.
7. **`signup-cover.png` image slot is ready but empty.** Both signup screens already have a left-side cover-image slot built (with automatic fallback to the animated brain visual if the file's missing). Drop a real image in at `public/assets/brand/signup-cover.png` whenever you have one — no code change needed.
8. **Confirmed complete, no action needed:** Face Recognition Test is fully wired into the lobar function test, and the 20 AI-generated (not real people, no consent/copyright issue) face photos are already integrated as the synthetic dataset — this was already done, nothing pending here.

---

## Quick reference — who owns what going forward
- **UI/UX (teammate):** `src/components/*.jsx`, `src/styles/theme.css`
- **Integration/backend (you):** `src/engines/*.js`, `src/config/*.js`, `src/hooks/*.js`, `src/data/*.js`, `functions/`
- **Needs both of you to agree before editing:** `App.jsx`, `dailyTaskConfig.js`, `gamesConfig.js`, `GamesSection.jsx`
