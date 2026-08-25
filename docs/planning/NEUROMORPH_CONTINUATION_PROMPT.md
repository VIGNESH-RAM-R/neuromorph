# NEUROMORPH — continuation prompt (paste this as your first message in a new Cowork chat)

I'm continuing an existing project called NEUROMORPH — an AI-based dementia early-screening platform. I've used Cowork for this before in a different chat that may have hit a usage limit. Below is the full state of the project. Read it fully before doing anything, then pick up exactly where it left off — do not restart planning, do not re-ask me questions that are already answered below.

## 0. First things you need from me
Please ask me (or I will proactively grant) access to these 5 folders on my computer — reconnect all of them, the actual code lives there and already reflects everything described below:
- `Doctor_Dashboard` — clinician-facing app
- `app_page` — patient-facing app (the main hub, includes this file)
- `face_recognition` — real, complete Face Recognition Test project
- `face_module` — real, complete Facial Expressivity Test project (webcam-based)
- `AI_ChatBot` — "Morphy" chat widget shared across apps

All actual integration work is saved directly in these folders (not just in old chat history), so once you have folder access you can verify everything below by reading the real files.

## 1. What NEUROMORPH is
A weekly clinical-style **Detection Assessment** (Lobar Function Test + a 10-question Question Bank, ~20 min max) plus a daily **Daily Set** of shorter "improvisation" games that feed a **Momentum Score**. A **Cognitive Score** comes from the weekly assessment; a doctor views both, plus longitudinal drift/trend, via `Doctor_Dashboard`. Firebase/Firestore is the backend across both apps.

## 2. Team split (still true)
- **I (the user) own**: the Lobar Function Test (the 8 "Final 8" games) + the Question Bank + the Doctor Dashboard. This is my current focus.
- **My teammate owns**: the Daily Set / Momentum Score improvisation games — Face and Speech are mandatory, Memory/Reaction/Attention are optional. He works on these separately and we integrate together later.

## 3. The real Final 8 (authoritative, confirmed by me earlier — do not second-guess this list)
Stroop, Go/No-Go, Token Test, Delayed Recognition Memory, Raven's Matrices (called "Matrix Reasoning" in code), Geometric Shape Copy, Visual Memory, Face Recognition.

**Status: 7 of 8 are fully integrated and working in `app_page`. Only Face Recognition is not yet wired in — but the real project for it already exists in the connected `face_recognition` folder, just not yet plugged into the registry.** This should be your first task.

## 4. Architecture conventions — follow these exactly, they're already established
- **Task contract**: every lobar task is a React component registered in `TASK_COMPONENTS` in `app_page/src/components/AssessmentSection.jsx`, keyed by task id. Component receives one prop, `onSubmit`, and calls `onSubmit({score, raw})` exactly once when finished (`score`: 0-100 number, `raw`: full detail object for analytics/doctor drill-down). Everything else (sequencing, "Task X of Y", timing) is handled by `useDetectionAssessment.js` + `AssessmentSessionModel.js` automatically.
- **Registry-driven**: `app_page/src/config/lobarTaskRegistryConfig.js` (`LOBAR_TASK_CATALOGUE`, filtered to `LOBAR_TASKS` via `active !== false`) is the single source of truth for which tasks run, their `lobe`, `domain`, and `order`. Task keys must match `Doctor_Dashboard/src/config/lobarConfig.js`'s `LOBES[].tasks` map exactly.
- **Domain mapping**: `Doctor_Dashboard/src/config/domainConfig.js` defines 6 cognitive domains (`attention`, `executiveFunction`, `processingSpeed`, `visualMemory`, `language`, `recognitionMemory`). A task's `domain` field in the registry feeds one of these directly — `AssessmentSessionModel.build()` aggregates generically by whatever domain a task declares, no hardcoded restriction. `visualMemory` and `delayedRecognitionMemory` tasks now feed the `visualMemory`/`recognitionMemory` domains directly (real matches). Tasks without a clean domain match use the closest honest fit and document why in a comment (e.g. `matrixReasoning`/`geometricShapeCopy` → `executiveFunction`).
- **Config/engine/component file trio**: each task = `src/config/xxxConfig.js` (pure data), `src/engines/XxxEngine.js` (pure, Node-testable scoring logic, no DOM), `src/components/assessment/XxxTask.jsx` (interactive component). Always port a teammate's real scoring math verbatim into the Engine file — never invent or approximate weights. If you must guess a value you can't find in the source, flag it explicitly, don't silently fabricate.
- **Restyling**: teammate's games arrive with their own CSS (or Tailwind, which this app does NOT have configured) — always strip it and restyle using `app_page/src/styles/theme.css`'s `nmpa-` prefixed classes. Shared task UI classes already exist: `.nmpa-task`, `.nmpa-task__instruction`, `.nmpa-task__progress`, `.nmpa-task__feedback`, `.nmpa-task__countdown` (+ shared `TaskCountdown.jsx` component), `.nmpa-task__matrix-*`, `.nmpa-task__geometry-*`, `.nmpa-task__object-*`, `.nmpa-task__token-*`, etc.
- **Practice → countdown → scored pattern**: most tasks internally run unscored practice (with feedback) → 3-2-1-GO countdown (shared `TaskCountdown.jsx`) → scored trials (no feedback) → single `onSubmit` call. A task's own top-level instructions/results screens are always dropped — `AssessmentIntro` covers whole-battery instructions, results surface later in Progress/Doctor Dashboard views.
- **StudyItemRegistry bridge** (`app_page/src/engines/StudyItemRegistry.js`, sessionStorage-backed): lets one task `.register({sourceModule, itemType, items, presentedAt})` items it showed the patient, and a LATER task `.retrieveAll()`/`.retrieveByType()` them. Currently used by `VisualMemoryTask.jsx` (registers) → `DelayedRecognitionMemoryTask.jsx` (retrieves, runs last on purpose so earlier tasks are the delay interval).
- **Time budget discipline**: the whole Detection Assessment must stay under ~20 minutes. Some teammate games ship with longer default protocols than that allows — it's fine to trim (e.g. Geometric Shape Copy was cut from 12 scored figures to 6; Visual Memory uses its lighter "demo" protocol instead of "standardClinical") as long as it's documented in a comment and the real scoring math is untouched.
- **Testing**: `app_page/test/assessment.test.js` (plain Node, `node test/assessment.test.js`, no deps) covers every lobar engine + registry + session logic — **currently 111 assertions passing**. `app_page/test/engines.test.js` (42 assertions, Firebase/Auth) untouched. `Doctor_Dashboard/test/engines.test.js` (76 assertions) untouched. Always add tests for new engines and re-run all three before calling anything done.
- **Doctor Dashboard honesty discipline**: `DoctorDashboardExportEngine.js` in `app_page` has a running header comment listing exactly which of the 6 cognitive domains are currently fed vs honestly omitted — keep it updated as you wire in more tasks. Never fabricate a domain score for something not actually measured; `DomainAggregationEngine.js` on the Doctor Dashboard side already renders "Not Measured" gracefully for missing data — use that, don't invent a number.
- **Sandbox note**: no real npm/Vite dev server available in the Cowork sandbox — verify with a babel-parser syntax-check script (pattern already used, see any `syntax_check*.mjs` in past sessions) + the Node test suites above, not an actual browser render. The user runs `npm install && npm run dev` themselves in VS Code to see it live.

## 5. What's been fully built and verified (do not redo)
- **Doctor Dashboard**: real Firebase Auth (email/password + Google) + Firestore integration for doctors (`DoctorAuthEngine.js`, `FirestorePatientService.js`, `useDoctorAuth.js`, `usePatientDirectory.js`, login/access-pending screens). Read-only by design (security rules only let doctors read `/patients/**`).
- **Doctor Dashboard already has, and you should NOT rebuild**: `DriftEngine.js` (linear-regression trend across full session history), `VariabilityEngine.js` (rising session-to-session inconsistency detector), `TrendIntelligenceEngine.js` (consolidates both into one clinician narrative), `CoherenceEngine.js` (research-preview cross-domain correlation), plus UI (`LongitudinalProgressSection.jsx`, `TrendIntelligencePanel.jsx`, `NetworkCoherencePanel.jsx`). This means "Longitudinal Cognitive Drift Detection" — one of my top-priority wishlist features — is **already done**.
- **app_page**: Stroop, Go/No-Go, Token Test, Matrix Reasoning, Geometric Shape Copy, Visual Memory, Delayed Recognition Memory — all real, teammate-built projects, fully ported into the config/engine/component trio above, wired into the registry, styled, tested. `MomentumScoreEngine.js` and `StreakEngine.js` already exist for the Daily Set (waiting on real game files to plug in).
- Cross-app Firestore contract: `/users/{uid}` private; `/patients/{patientId}` + `/patients/{patientId}/sessions/{date}` doctor-readable via `/doctors/{uid}` allowlist doc. `DoctorDashboardExportEngine.buildSessionRecord()` converts a completed session into the Doctor Dashboard's expected shape.

## 6. What's real but NOT yet integrated (your immediate next tasks, in order)
1. **Face Recognition** (`face_recognition` folder, connected, complete React project — README says it's "the memory game (illustrated faces, no camera)", NOT the same as face_module). Port it into the Final-8 registry exactly like the last 4 games were — same trio pattern, same StudyItemRegistry-style bridge already present in its own `src/engines/StudyItemRegistry.js` (reuse app_page's own copy, don't duplicate). This closes out all 8 Final-8 games.
2. **Facial Expressivity Test** (`face_module` folder, connected, complete React project, webcam-based via `@mediapipe/tasks-vision` FaceLandmarker — tracks 30 channels across brows/eyes/cheeks/nose/mouth/jaw, blink rate, symmetry, expression diversity, response latency). This is my teammate's "Face" daily game (mandatory, part of the 5 improvisation modules: Speech, Memory, Reaction, Attention, Face). Wire it into app_page's Daily Set using the same registry-driven pattern as the lobar tasks (a parallel `dailySetRegistryConfig.js` may need to be created if one doesn't exist yet — check first).
3. **Speech module** — NOT yet sent by me. I need to send this. Once received, integrate the same way as Facial Expressivity.
4. **Memory / Reaction / Attention** (optional daily games) — NOT yet sent by my teammate. Wire in as they arrive.
5. **Full Firebase + cross-app pass** — once all games are in, verify auth + Firestore read/write end to end across both apps, confirm Momentum Score / Cognitive Score / Drift-Trend-Variability engines all consume real session data correctly.
6. **End-to-end test pass** — final full run-through, fix bugs, confirm `npm install && npm run dev` works cleanly, buffer time before deadline.

## 7. Deadline
We have **7 days total** from when this plan was made to have a fully working, integrated app. Track how many of those days have already elapsed based on today's date vs when this conversation resumes, and tell me honestly if the timeline is at risk.

## 8. Eye tracking (deferred, my explicit decision)
I asked about "Webcam Eye Tracking" (a nice-to-have, ranked lowest of 4 wishlist features). Decision: **skip it for the 7-day deadline.** It could technically piggyback on `face_module`'s existing webcam session later (MediaPipe FaceLandmarker already exposes iris landmarks, so gaze estimation wouldn't need a second camera module) — but treat it as a stretch demo feature to attempt only AFTER the core app is fully working, not before.

## 9. Digital Behavioral Biomarkers — partially done, worth finishing if time allows
Individual task engines already compute rich behavioral metrics (Stroop's post-error slowing, Go/No-Go's commission/omission split, Visual Memory's reaction-time variability and memory-decay index) and `VariabilityEngine.js` exists on the Doctor Dashboard side — but nothing yet consolidates these into one unified "behavioral biomarker" view the way `TrendIntelligenceEngine` does for drift. Low priority relative to the 6 tasks in section 6, but worth a mention if there's slack time.

## 10. Standing instructions for how to work with me — follow these on every response
- Answer everything in **simple, plain language**.
- **End every substantive response with a concise "My take: ... / Your role: ..." summary** — my role only (my teammate's daily-games work is out of scope for you to summarize instructions for).
- Don't block on unnecessary questions for work that's already authorized and in-flight — but DO flag genuine mismatches (e.g. a file's actual content contradicting its filename or my description) rather than silently guessing, especially anything that could mislabel a real clinical instrument.
- Adapt whatever code/structure a teammate's file uses to fit this app's conventions — never ask them to rewrite their code to match mine first.
- If I upload a multi-file project, ask for the whole folder zipped, not individual files — picking files apart has caused real content mismatches before.

## 11. What I need to send you in the new chat
Only one thing is a genuine gap: **the Speech module** (a real project, not yet built/sent by anyone). Everything else needed either already exists in the 5 connected folders or is blocked on my teammate sending his own game files — not something you need from me directly.

---
Start by reconnecting the 5 folders, reading `app_page/src/config/lobarTaskRegistryConfig.js` and this file to confirm current state, then begin with task 6.1 (Face Recognition integration).
