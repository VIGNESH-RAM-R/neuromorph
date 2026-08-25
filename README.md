# NEUROMORPH -- Patient App

The patient-facing shell: login/signup, then a dashboard with five sections
-- Home, Detection Assessment, Games, My Progress, and Chat with Morphy
(also reachable from the chat bubble in the corner of every page). This is
the "last 40%" integration piece tying the previously separate NEUROMORPH
projects together into one app a patient actually logs into.

## Run it in VS Code

1. Install [Node.js](https://nodejs.org) (LTS) if you don't have it.
2. Open this folder in VS Code: `File -> Open Folder...`
3. Terminal -> New Terminal.
4. `npm install`
5. (Optional but recommended) set up real Google/Facebook login -- copy
   `.env.example` to `.env` and follow **`docs/setup/SETUP_OAUTH.md`** (~5 min each).
   The app runs fine without this step; the social buttons just show an
   honest "setup needed" state until you do.
6. `npm run dev`
7. Open the local address it prints (usually `http://localhost:5174`).
8. Run the engine test suite any time: `npm test`

## What's real vs. mocked in this delivery

| Piece | This delivery | Real integration path |
|---|---|---|
| Login / signup | Real form validation (`AuthEngine`), but no real account system -- any well-formed login or signup succeeds and logs you in as one demo patient (`mockSelf.js`) | Swap `useAuth.js`'s `login`/`signup` bodies for a real auth provider (Firebase Auth, etc.); every screen only ever reads `isAuthenticated`/`currentUser`, so nothing downstream changes |
| Google / Facebook login | **Real OAuth, not a styled fake button.** `useGoogleAuth.js` loads Google Identity Services and renders Google's own official button; `useFacebookAuth.js` loads the real Facebook Login SDK. Once you add your own Client ID / App ID (`docs/setup/SETUP_OAUTH.md`, ~5 min each), clicking either shows the provider's real consent screen and comes back with a real, signed identity. `SocialAuthEngine.js` is explicit that the JWT/response is read but not re-verified server-side -- same documented gap as email/password, since this app has no backend yet | Add a backend endpoint that re-verifies the Google ID token / Facebook access token server-side before trusting it, and persists a real per-provider account instead of mapping onto the one demo patient |
| Light / dark theme | **Fully real, not a CSS toggle demo.** `ThemeEngine.js` + `useTheme.js` resolve light (default) vs. dark, remembering an explicit choice in `localStorage` and otherwise following the OS's `prefers-color-scheme`. Every color in `theme.css` is a CSS custom property branching on `data-theme`, so nothing is hardcoded per-component. Dark mode's accent color (`#6C5CE7`) is deliberately Morphy's own established brand violet, not an arbitrary pick, and both themes' text/background pairs were checked against WCAG AA contrast | None needed -- already real; extending it to any future component is automatic as long as it uses the `--nmpa-*` tokens |
| Post-signup onboarding | **Real, working flow, not a stub.** A brand-new signup (never a login) goes through a 3-step details form -- About You (date of birth required, everything else optional), Medical Background, Family History & Emergency Contact -- fully config-driven (`onboardingConfig.js`), validated by `OnboardingEngine`, sequenced by `useOnboarding`. Every field but date of birth can be skipped, and the whole flow can be skipped outright -- this is a wellness app for an often-older audience, not a mandatory intake form. Answers are merged into `currentUser` in memory (age auto-derived from date of birth) | Persist the profile to a real per-user record instead of in-memory `currentUser`; a real "Settings" section to edit it later doesn't exist yet either (referenced honestly in the completion copy as future work) |
| Daily Set completion, streak, Momentum Score | Fully real, working engines (`DailyTaskEngine`, `StreakEngine`, `MomentumScoreEngine`) computing from `mockSelf.js`'s raw daily history -- nothing here is a hardcoded display number | Replace `mockSelf.js` with a real per-user data source of the same shape |
| Weekly Detection Assessment | **Fully real and playable end to end, using the real Question Bank.** 8 of 12 lobar tasks are active this week (Stroop, Trail Making, Word List Recall, Delayed Recognition, Clock Drawing, Cube Copy, Embedded Figure Identification, Visual Object Naming -- 2 per lobe), trimmed from the full 12 on 2026-08-09 to fit a 25-minute weekly session budget. The other 4 (Go/No-Go, Verbal Fluency, Naming, Applied Calculation) are fully built and still in the codebase, just inactive -- see `lobarTaskRegistryConfig.js`'s header for exactly why each was cut and how to re-enable one (`active: true`, nothing else changes). Plus a Question Bank block (2 questions guaranteed per lobe + 2 wildcard from the rest, self-assessment only, no caregiver-rating items, selected at random each run out of the real 100-item bank from `100_QB.xlsx`) runs in sequence, scores with real engines, and assembles into a session via `AssessmentSessionModel`. `CognitiveScoreEngine` bands the result (Excellent/Normal/Mildly Reduced/Reduced) using the exact same thresholds as the Doctor Dashboard. Completing it patches the in-memory record immediately, so the app shows "this week: completed" and doesn't re-invite a same-week retake -- session-only, no backend write yet | Replace the in-memory `recordCompletedAssessment` patch with a real write. See `questionBankConfig.js`'s header comment for exactly which ~20 items were adapted (caregiver-rating items, live-date/location items, drawing/photo items) and why, if the source spreadsheet is revised later |
| Doctor Dashboard bridge | **Real, working bridge, not a mock-up.** `DoctorDashboardExportEngine.buildSessionRecord()` converts a completed session + its Cognitive Score into the exact shape `Doctor_Dashboard`'s `ReportModel` expects -- see `Doctor_Dashboard/README.md` for the "Robert Hayes" demo patient (`NMX-2001`) built from 6 weeks of this shape, rendering real graph plots, previous-week comparison, and clinical insights in that app already | Call `buildSessionRecord` on real completion and write it into a shared per-patient record instead of a hardcoded mock patient array |
| Morphy during the assessment | Real, not cosmetic: while a session is `running`, Morphy (`AssessmentModeGuard`) only answers genuinely unrelated categories (troubleshooting/account/general/privacy) and calmly defers everything else -- no hints, no scoring talk -- per the master prompt's Mode 1 rules. It also greets differently on first open during a run, and offers Brain Training Mode once the session completes | None needed -- already real |
| Games section | Two modules are genuinely connected and described accurately (Face Recognition Test, Facial Expressivity Test); the rest (Reaction, Attention, Speech, and the other Memory sub-games) are labeled honestly as either "built previously, not connected this session" or "coming soon" -- never claimed as ready when they aren't | Connect those project folders to a session and wire in real launch buttons |
| My Progress | Real charts computed from `mockSelf.js`'s history; "Download Monthly Report" is a genuinely working `window.print()` export (same approach as the Doctor Dashboard), not a fabricated PDF library integration | Swap the mock history source; optionally add a server-rendered PDF endpoint later |
| Chat with Morphy | **Fully real, not a placeholder.** Every file from `AI_ChatBot`'s "Reusing Morphy" integration steps was copied in as-is -- same 73-entry FAQ, same mock-backend actions, same PDF Analysis Mode, same three-tier local-first routing. See `AI_ChatBot/README.md` for the full architecture writeup; nothing about it changed by being copied here | None needed -- already a real integration |

## Architecture

Same philosophy as every other NEUROMORPH project: components render only
what an engine already decided; engines are pure, framework-agnostic, and
Node-tested; config files hold every threshold/list/template so nothing is
a magic number buried in a component.

```
src/
  config/
    sectionsConfig.js        # the 5 dashboard sections
    dailyTaskConfig.js       # the Daily Set template
    momentumConfig.js        # Momentum Score blend weights, streak rule
    lobarConfig.js           # display-only mirror of the Doctor Dashboard's 4 lobes / 8 active tasks
    lobarTaskRegistryConfig.js # source of truth: full 12-task catalogue + which 8 are active, lobe, domain, run order
    scoringBands.js           # mirrored from the Doctor Dashboard -- same banding vocabulary everywhere
    operationalConfig.js      # ASSESSMENT_INTERVAL_DAYS (7), mirrored from the Doctor Dashboard
    questionBankConfig.js     # the REAL 100-item QB from 100_QB.xlsx, tagged by lobe -- see its header for adaptation notes
    assessmentModeConfig.js   # Morphy's Mode 1 (Cognitive Assessment Mode) copy + safe-category list
    onboardingConfig.js       # the 3-step post-signup details form -- steps/fields/options, all data-driven
    oauthConfig.js            # reads real Google/Facebook credentials from .env -- see docs/setup/SETUP_OAUTH.md
    [stroopConfig / trailMakingConfig / goNoGoConfig / verbalFluencyConfig / wordListConfig /
     namingConfig / objectNamingConfig / clockDrawingConfig / cubeCopyConfig / calculationConfig /
     embeddedFigureConfig -- one fixed, reproducible config per lobar task]
    gamesConfig.js           # which game modules are connected vs. built-elsewhere vs. not yet built
    [+ all copied-in Morphy config -- see AI_ChatBot/README.md]
  data/
    mockSelf.js               # one demo patient's raw daily/weekly history
  engines/
    mathUtils.js
    AuthEngine.js              # mock login/signup validation
    DailyTaskEngine.js         # today's checklist + completion math
    StreakEngine.js            # current/longest streak from daily history
    MomentumScoreEngine.js     # completion + performance blend, per day
    WeeklyAdherenceEngine.js   # due / due-today / overdue for the weekly assessment
    SelfModel.js                # the single assembler every screen reads from
    assessmentScoringUtils.js   # shared clampScore/accuracyScore/speedScore/blendedScore
    AssessmentSessionModel.js   # assembles the 8 active task results + the QB score into one session
    CognitiveScoreEngine.js     # session -> {score, band, interpretation, disclaimer}
    AssessmentModeGuard.js      # pure decision: should Morphy defer, given phase + FAQ category
    OnboardingEngine.js          # per-step validation + final profile assembly (age derived from DOB)
    DoctorDashboardExportEngine.js # session + Cognitive Score -> Doctor Dashboard's exact session shape
    ThemeEngine.js               # pure light/dark resolution + toggle logic (no DOM/localStorage side effects)
    SocialAuthEngine.js          # decodes a real Google ID token / normalizes a real Facebook profile
    [StroopEngine / TrailMakingEngine / GoNoGoEngine / VerbalFluencyEngine / WordListRecallEngine /
     DelayedRecognitionEngine / NamingEngine / ClockDrawingEngine / CubeCopyEngine / CalculationEngine /
     EmbeddedFigureEngine / QuestionBankEngine -- one scoring engine per lobar task + the QB block]
    [+ all copied-in Morphy engines -- see AI_ChatBot/README.md]
  hooks/
    useAuth.js                  # now also exposes recordCompletedAssessment() + completeOnboarding()
    useSelf.js                  # builds SelfModel.build() once per render
    useDetectionAssessment.js   # sequences the 12 tasks + QB block, assembles the final session
    useOnboarding.js            # sequences the 3-step onboarding form, mirrors useDetectionAssessment's pattern
    useMorphyChat.js            # takes assessmentPhase, switches into Mode 1 while a session is running
    useTheme.js                  # applies data-theme to <html>, persists the explicit choice
    useGoogleAuth.js             # loads Google Identity Services, renders Google's real Sign In button
    useFacebookAuth.js           # loads the real Facebook SDK, triggers FB.login()
  components/                   # grouped by feature/role, mirrors the app's own navigation
    auth/                        # shared login/signup building blocks + the patient-facing screens
                                  #   LoginScreen.jsx / SignupScreen.jsx / RoleGateScreen.jsx / PrivacyPolicyScreen.jsx
                                  #   AuthBrandPanel, AuthBlobBackdrop, AuthTextField, PasswordField, AuthDivider,
                                  #   SocialAuthRow, GoogleSignInButton, FacebookLoginButton
    caregiver/                   # the caregiver role's full screen set (login/signup/link-patient/home/chat/check-in)
    doctor/                      # the doctor role's full screen set (login/signup/pending/home/chat)
    dashboard/                   # DashboardShell (topbar + side nav) + the 5 patient dashboard sections
                                  #   HomeSection / AssessmentSection / GamesSection / ProgressSection / MorphySection
                                  #   + ActivitySection / DomainsSection / InsightsSection / ReportsSection
                                  #   (split out of the old ProgressSection -- see each file's header)
    assessment/                  # AssessmentIntro, AssessmentComplete, one *Task.jsx per lobar task + QuestionBankTask
    onboarding/                  # OnboardingStep (generic, config-driven) + OnboardingComplete
    daily/                       # embedded Daily Set task components (e.g. FacialExpressivityTask)
    chat/                        # Morphy chat widget pieces -- MorphyAvatar, ChatBubbleButton, ChatMessage, ChatPanel, MorphyWidget
    charts/                      # dependency-free inline-SVG data viz -- LineChart, MomentumRing,
                                  #   DomainBreakdownChart, ActivityHeatmap, ClinicalInsights
    reports/                     # print-only report layouts -- PrintableSelfReport, PrintableDoctorPatientReport
    common/                      # app-wide utilities -- ErrorBoundary, ThemeToggle, SectionIcon, InstallAppPrompt
    icons/                       # dependency-free inline SVGs -- ThemeIcons, FormIcons, BrandIcons
  styles/
    theme.css                    # nmpa- prefixed tokens/components, full light + dark palettes, Morphy CSS block
    print.css
test/
  engines.test.js                # 41 Node-runnable assertions: auth/daily/streak/momentum/adherence,
                                  # OnboardingEngine, ThemeEngine, SocialAuthEngine
  assessment.test.js             # 78 Node-runnable assertions covering every lobar task engine (active AND
                                  # inactive), the real QB engine, AssessmentSessionModel, CognitiveScoreEngine,
                                  # AssessmentModeGuard, and DoctorDashboardExportEngine
docs/
  setup/                         # SETUP_OAUTH.md, FIREBASE_SETUP.md, APPCHECK_SETUP.md, GEMINI_SETUP.md, GOOGLE_PLACES_SETUP.md
  planning/                      # PROJECT_BRIEFING.md, PROGRESS.md, OVERNIGHT_PLAN.md, AUDIT_AND_ROADMAP.md, DEPLOYMENT_READINESS.md, ...
  spec/                          # MORPHY_MASTER_SPEC.md, neuromorph-master-prompt.md (verbatim reference specs)
  handover/                      # NEUROMORPH_Project_Handover.docx
.env.example                     # copy to .env and fill in the OAuth keys (see docs/setup/SETUP_OAUTH.md)
```

Note on test coverage: this app's own 119 assertions (41 + 78) cover the
auth/daily/streak/momentum/adherence logic, every lobar task engine, the
Question Bank engine, session assembly, Cognitive Score banding, Morphy's
assessment-mode guard, the onboarding flow, the Doctor Dashboard export
bridge, theme resolution, and the social-login profile mapping -- all built
specifically for this project. The copied-in Morphy engines (FaqMatcherEngine,
ConversationEngine, etc.) were already verified with 37 assertions in
`AI_ChatBot/test/engines.test.js` -- copying working, already-tested code
rather than re-deriving it is deliberate, not a coverage gap.

A note on verifying the new UI in this delivery: this build environment has
no npm registry access, so `npm run build` / `npm run dev` can't actually be
launched here to screenshot the result (Vite's bundler needs a
platform-specific binary that couldn't be downloaded) -- the exact same
class of sandbox limitation already documented in `Doctor_Dashboard/README.md`.
What *is* verified in-session: every new/changed file parses with zero
syntax errors and every relative import resolves (a `@babel/parser`-based
check across all 23 touched files), plus the full 119-assertion test suite
passing. `npm run dev` on your own machine (with real registry access) will
render normally.

## Daily Set and Momentum Score, in plain terms

Each day's checklist is: one rotating game (Memory/Reaction/Attention),
Speech, Facial Expressivity, and a small fixed set of daily-life questions.
Momentum Score blends how much of that got done today with how well it
went (50/50 by default, tunable in `momentumConfig.js`) -- if nothing
performance-bearing is done yet today, the score reflects completion alone
rather than inventing a performance number. Streak counts consecutive
*completed* days (today doesn't count toward or against it until it's
actually finished) and is soft-mandatory by design, not a hard lockout.

## Sections, and why they're arranged this way

Home is the daily landing page -- what needs doing today, streak, Momentum
Score. Detection Assessment is the separate weekly cadence, kept visually
distinct so it never gets confused with the daily games. Games holds every
improvisation module, connected or not, so the whole roadmap is visible
even before every piece is wired in. My Progress is the trend/reporting
view. Chat with Morphy is both its own section and a corner bubble on every
other page, per the original request -- one shared conversation either way.

## Privacy note

Login is mocked (see table above) -- nothing typed into the login/signup
forms is sent anywhere or stored beyond React state for the current page
session. Morphy's own privacy behavior (chat messages, unanswered-question
logging) is unchanged from `AI_ChatBot/README.md`.
