# NEUROMORPH — Team Split & GitHub Workflow

Two people, one codebase, working at the same time without stepping on each other. This doc covers: what to send your friend, how you two collaborate on GitHub, and how he sets up Claude Cowork on his end.

## 1. Who owns what

**You (VR):** landing page, login/signup pages, themes, Detection Assessment, Doctor Dashboard.
**Him:** Caregiver dashboard, improvisation/oddball games section.

Concrete folders, based on the actual codebase today:

| Area | Owner | Folders/files |
|---|---|---|
| Landing page, login/signup, role gate | You | `src/components/auth/**` |
| Themes | You | `src/styles/theme.css` |
| Detection Assessment | You | `src/components/assessment/**` |
| Doctor Dashboard | You | `src/doctorDashboard/**`, `src/components/doctor/**` |
| Caregiver dashboard | Him | `src/components/caregiver/**`, `src/hooks/useCaregiverAuth.js`, `src/hooks/useCaregiverChat.js`, `src/engines/Caregiver*.js`, `src/config/caregiver*Config.js` |
| Games / improvisation section | Him | `src/oddballGames/**` (its own mini app — App.jsx, components, config, engines, hooks, theme.css), `src/components/dashboard/GamesSection.jsx`, `src/components/dashboard/OddballGamesLauncher.jsx`, `src/config/gamesConfig.js`, `src/config/gameGuidesConfig.js`, `src/engines/DailyGameRotationEngine.js` |

**Shared/risky files** — whoever touches these, tell the other person first, since both of you may need to edit them and that's where merge conflicts happen:
- `src/App.jsx` (wires every role together)
- `firestore.rules`
- `functions/index.js`
- `.env` / `.env.example`
- `package.json`

If you both stay inside your own folders above, you'll almost never conflict. The shared files are the only real risk.

## 2. Put the project on GitHub (you do this once)

You don't have a git repo yet, so start here:

1. Go to github.com, create a new **private** repository (e.g. `neuromorph`). Don't initialize it with a README — you already have files.
2. On your computer, open a terminal in the `app_page` folder and run:
   ```
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<your-username>/neuromorph.git
   git push -u origin main
   ```
3. Your `.gitignore` already excludes `node_modules/`, `dist/`, and `.env` — so no secrets or bloat get pushed. Good as-is.
4. On GitHub: **Settings → Collaborators → Add people** → invite your friend's GitHub account. He accepts the invite email.

## 3. What to send your friend

Since `.env` is intentionally not in git (it has real Firebase/Google/Facebook keys), send these separately, directly to him (chat/email, not committed to GitHub):

1. **The GitHub repo link** (after adding him as a collaborator).
2. **Your actual `.env` file contents** (or have him copy `.env.example` to `.env` and fill in the same real values you're using — same Firebase project, so login/data actually work for both of you).
3. **This `TEAM_HANDOFF.md` file** — it's already in the repo, so once he clones it he'll have it.
4. Point him to the existing docs already in the folder for deeper context: `FIREBASE_SETUP.md`, `GEMINI_SETUP.md`, `SETUP_OAUTH.md`, `CARE_CONNECTION_PROMPT.md` (if present) — whatever setup docs already exist, so he's not guessing.

## 4. How you both work day to day

1. **Each of you works on your own branch**, never directly on `main`:
   - You: `git checkout -b feature/landing-doctor`
   - Him: `git checkout -b feature/caregiver-games`
2. Commit often with clear messages (`git add . && git commit -m "..."`), push your branch (`git push -u origin <branch-name>`).
3. When a chunk of work is ready, open a **Pull Request** on GitHub from your branch into `main`, the other person reviews/clicks merge.
4. **Before starting work each session**, pull the latest `main` into your branch so you're not working on stale code:
   ```
   git checkout main
   git pull
   git checkout feature/landing-doctor
   git merge main
   ```
5. If a conflict shows up, it'll almost always be in one of the shared files listed in section 1 — resolve it together (screen-share or just talk it through) rather than guessing.

## 5. Getting him set up in Claude Cowork

1. He installs Git (or GitHub Desktop, if he prefers a UI over the terminal) and clones the repo to a folder on his computer:
   ```
   git clone https://github.com/<your-username>/neuromorph.git
   ```
2. He copies the real `.env` values you sent him into `neuromorph/app_page/.env`.
3. He opens Claude Cowork, and connects that cloned folder (the same way you connected yours).
4. He tells Claude something like: *"I'm working on the caregiver dashboard and the games/improvisation section of this app. Here's TEAM_HANDOFF.md for context — my folders are src/components/caregiver, src/oddballGames, and the games config files. Don't touch src/components/auth, theme.css, assessment, or doctorDashboard, that's my teammate's area."* That one message gives Cowork the same scope boundaries this doc lays out.
5. He runs `npm install` once, then `npm run dev` to actually preview the app while working.

## 6. Verifying changes before pushing

Both of you should run this before opening a PR — it catches broken logic without needing a real browser:
```
npm test
```
This runs the engine/assessment/AI-fallback/daily-set test suites plus a translation-completeness check. If it's red, don't push yet.
