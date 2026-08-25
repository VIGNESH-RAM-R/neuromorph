# Docs index

Reference material that used to sit loose at the project root, now grouped by purpose.

## setup/
Step-by-step guides for wiring up external services this app depends on.

- `SETUP_OAUTH.md` -- real Google Client ID + Facebook App ID for social login
- `FIREBASE_SETUP.md` -- Firebase project, Auth, Firestore rules
- `APPCHECK_SETUP.md` -- App Check rollout (reCAPTCHA v3)
- `GEMINI_SETUP.md` -- Gemini API key for Morphy's AI fallback
- `GOOGLE_PLACES_SETUP.md` -- Places Autocomplete API key

## planning/
Working history, audits, and handoff notes from the build process -- useful for
context on *why* something is the way it is, not required reading to run the app.

- `PROJECT_BRIEFING.md` -- start-here orientation for a new contributor/session
- `PROGRESS.md` -- run-by-run development log
- `OVERNIGHT_PLAN.md` -- the config-driven-data / i18n overnight pass plan
- `AUDIT_AND_ROADMAP.md` -- feature audit and what's left
- `DEPLOYMENT_READINESS.md` -- pre-launch checklist
- `NEUROMORPH_CONTINUATION_PROMPT.md` -- prompt used to resume a prior session

## handover/
- `NEUROMORPH_Project_Handover.docx` -- project handover document

## spec/
Reference specs saved verbatim, not yet implemented against.

- `MORPHY_MASTER_SPEC.md`
- `neuromorph-master-prompt.md`

See the root [`README.md`](../README.md) for how to actually run the app.
