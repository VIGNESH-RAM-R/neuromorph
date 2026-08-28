# NEUROMORPH — UI/UX Design-System Audit (Patient App + Doctor Dashboard)

Reviewed: 2026-08-27. Requested as a professional UI/UX pass: find every place the design is weak, note it clearly, and start fixing what's safe to fix without eyes on the rendered app. This is a companion to `docs/planning/AUDIT_AND_ROADMAP.md` (2026-08-18) — most of that document's Track 1 items are already resolved (global uppercase body text is gone, the canvas dark-mode bug is fixed); this pass goes deeper into the CSS design system itself: type scale, spacing, color tokens, radius, accessibility, and cross-app consistency.

**How this was done:** code-level audit (reading and grepping every theme file, counting real occurrences) rather than a pixel-level visual pass. A visual/screenshot pass is currently blocked — the Chrome browser extension isn't connected and "Computer use" isn't turned on for this device yet. Everything below is a real, counted, file-and-line-backed finding, not a guess. The elaborate hand-tuned sections (the landing page's orbit/particle animation, the oddball games arcade palette) were deliberately left alone in this pass — those show real prior craft and shouldn't be touched blind; they need actual eyes on them first.

---

## Already fixed in this pass (safe, additive, zero visual risk)

1. **Added a documented type scale** to `src/styles/theme.css` (`--nmpa-text-2xs` through `--nmpa-text-4xl`, 10 steps). Nothing was rewired to use it yet — existing rules keep their exact current pixel values, so there is zero visual change today. This gives every *future* edit a scale to pick from instead of inventing another one-off number.
2. **Added a documented spacing scale** (`--nmpa-space-1` through `--nmpa-space-12`, 4px grid) and a **radius scale** (`--nmpa-radius-sm/md/lg/xl/full`) the same way — additive only, nothing repointed yet.
3. **Broadened keyboard-focus coverage.** The app already had one focus-visible rule, but it only covered `a`, `button`, `input`, `[tabindex]`. Extended it to `textarea`, `select`, `summary`, and common ARIA roles (`button`, `tab`, `menuitem`, `switch`, `checkbox`), plus a `@supports not selector(:focus-visible)` fallback so older browsers still show a focus ring on plain `:focus`. Elderly, keyboard-only, and low-vision users depend on this being complete, not just present.
4. Verified both patches with a brace-balance parse of the full stylesheet (120,431 chars, depth 0 at EOF — structurally valid) — a live dev-server preview kept getting killed by this environment's process lifecycle (background processes don't survive between shell calls here), so this was the reliable verification path available without visual access. **You should run `npm run dev` yourself and click through Light/Dark on a few screens before this goes further**, precisely because I can't currently confirm it visually.

---

## Confirmed, counted problems (prioritized)

### 1. Color system: 75 hardcoded hex values bypass an otherwise-complete token system
`src/styles/theme.css` has a full light/dark token system (`--nmpa-ink`, `--nmpa-accent`, `--nmpa-surface`, etc.) — but 75 distinct hex colors are written directly into rules instead of referencing a token (mostly inside the landing page and score-orbit sections, e.g. `#a5b4fc`, `#7dd3fc`, `#c4b5fd` repeated across many selectors). Every one of these is invisible to the dark/light theme switch — if a hardcoded color happens to look fine in dark mode (many of these were clearly designed dark-first for the landing hero), it may not have been checked against light mode at all. This is the single biggest reason a full light/dark parity pass matters before doing more visual work.

### 2. Type scale: still uncontrolled after this pass's addition
Independently of the new scale, the current file has real font-size chaos: 30 distinct `font-size` values in the main patient app, 40 distinct values inside the oddball games suite, 20 in the doctor dashboard. A 4px-off pixel value with no name attached to it (`13.5px`, `10.5px`) is a sign of eyeballed, non-systematic tuning. Recommend: next pass, migrate rules one section at a time onto the new `--nmpa-text-*` tokens, rounding each to its nearest step, and use that as the forcing function to catch accidental duplicates.

### 3. Breakpoints: 9 distinct widths, no system
`@media` queries fire at 480, 620, 720, 760, 780, 800, 860, 900, and 980px — nine different widths for what should be 2–3 named breakpoints. This is worse than the 5-breakpoint issue flagged in the prior 08-18 audit, meaning it's drifted further rather than being cleaned up. Recommend standardizing on something like 480 / 768 / 1024 and remapping every rule, one screen at a time (each remap needs a visual check, so this is a "next visual pass" item, not something to do blind).

### 4. Radius scale: 13 distinct values (14 counting `50%`)
`border-radius` values in the patient app alone: 3px, 4px, 8px, 9px, 10px, 11px, 12px, 14px, 16px, 18px, 26px, 30px, 999px, plus `50%` used interchangeably with `999px` for circles. The doctor dashboard, by contrast, is disciplined — almost entirely 8px and 999px (32 and 10 occurrences respectively), with only 4 outliers. The new `--nmpa-radius-*` scale added in this pass gives the patient app a path toward that same discipline.

### 5. Touch target: `.nmpa-scale__option` is 36×36px, below the 44px WCAG minimum
`src/styles/theme.css` line ~1291: the self-report rating-scale buttons (`.nmpa-scale__option`, used for things like mood/pain/confidence scales during assessments) are 36px circles with `cursor: pointer`. WCAG 2.5.5 recommends a minimum 44×44px target, and this app's own primary buttons already meet that (`.nmpa-button` is 48px min-height — good). This is a small, concrete fix: bump `.nmpa-scale__option` to 44×44px (adjust the surrounding `gap` in `.nmpa-scale` if needed so a row of them doesn't overflow). Worth prioritizing given the audience skews older and these are tap targets used *during an actual cognitive assessment* — a mis-tap there is a data-quality risk, not just a cosmetic one.

### 6. Cross-app font consistency — better than initially assumed, one real gap
Correction from an earlier pass of this same audit: the doctor dashboard does **not** use a third heading font — it uses `'Plus Jakarta Sans'` for headings, the same as the patient app. The actual divergence is narrower than first thought: only the **oddball games suite** breaks from this, using `'Manrope'` for headings (`src/oddballGames/theme.css` line 44) against `'Inter'` body text — the same body font as everywhere else, so it's one font swapped, not a wholesale different system. Low urgency, but worth a decision: intentional (games suite gets its own arcade identity) or accidental drift.

### 7. Oddball games suite has zero dark-mode support
`src/oddballGames/theme.css` (5,962 lines) defines one `:root` token block and never branches on `[data-theme='dark']` anywhere in the file — confirmed via a full-file search, zero matches. Both the patient app and doctor dashboard fully support dark mode. If a patient switches to dark mode and opens a game, the game screen will either look wrong (light-only colors on a dark shell) or clash at the boundary with the rest of the app. This is the largest structural finding in this audit — worth a real decision (build dark-mode tokens for the games suite, or explicitly document that games are light-only "by design" and make sure the transition in/out of a game doesn't jar).

---

## Deliberately not touched this pass

- **Landing page hero (orbit/particle/glow animation system, `~549`–`~575` in `theme.css`).** Hundreds of lines of real, hand-tuned animation work. Rewriting or "cleaning up" this blind, without seeing it render, risks breaking something that already looks good. Needs visual access first.
- **Oddball games arcade palette.** Deliberately distinct from the clinical app shell — that's very likely intentional (games should feel like games), so it wasn't touched or judged as "inconsistent" beyond the dark-mode gap above, which is a functional gap, not a style opinion.
- **Any color, spacing, or radius value inside an existing selector** — only new, additive tokens were introduced. Nothing that already renders on screen changed in this pass, on purpose, until there's a way to visually confirm each change.

---

## What's still blocking a full visual pass

Two paths were checked and both are currently unavailable on this device:
- **Claude-in-Chrome browser extension** — not connected.
- **Computer use** — available on this device but not yet turned on (a request was sent to enable it; not re-sending until you confirm).

Once either is on, the next session should: click through every screen in both Light and Dark mode (this was already flagged as needed in the 08-18 audit and still hasn't been done), then work through items 2, 3, and 7 above with real visual confirmation at each step, plus a decision on item 6.

---

## Your role:
Nothing required right now — this is a working note plus a first safe batch of fixes already applied to `src/styles/theme.css` (new type/spacing/radius tokens, broadened keyboard-focus coverage). When you get a chance: (1) run `npm run dev` locally and click through a few screens in Light and Dark mode to confirm nothing looks different (it shouldn't — these were additive-only changes), and (2) either connect the Claude-in-Chrome extension or turn on "Computer use" in the Claude desktop app's Settings, so the next pass can work from real screenshots instead of code-only inference for the deeper fixes (touch-target sizing, breakpoint consolidation, dark-mode support for the games suite). I'll keep working through the rest of this list in the meantime.
