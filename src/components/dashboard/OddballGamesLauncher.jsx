import OddballGamesApp from '../../oddballGames/App.jsx';
import '../../oddballGames/theme.css';
import { DEFAULT_LANGUAGE } from '../../config/i18nConfig.js';
import { t } from '../../i18n/strings/dashboard.js';

// 2026-08-23: the ODD BALL cognitive games suite (Visual Oddball, Sequence
// Memory, Point & Click, Image Pairs, Whack the Mole, Spot the Difference)
// integrated directly into app_page as its own self-contained module --
// same pattern as FullDoctorDashboard.jsx. It ships with its own internal
// dashboard/navigation (OddballGamesApp === the uploaded project's own
// App.jsx, unchanged) and its own localStorage-backed history per game
// (see oddballGames/config/*Config.js's *_STORAGE_KEY constants), so
// nothing here needed to be rewired into app_page's own Daily Set/scoring
// model -- it's played standalone, reachable from GamesSection.jsx's
// "Cognitive Games Suite" card instead of not existing in this app at all.
//
// .oddball-root (see oddballGames/theme.css) scopes the suite's own
// background/ink/font/heading resets to this subtree only, so its theme
// can't bleed into the rest of app_page. onExit renders a small fixed
// "back" bar above the suite's own dashboard header -- the suite itself
// has no concept of a parent app to return to.
//
// 2026-08-26 (VR): label changed from "Back to NEUROMORPH" -- onExit
// actually returns to GamesSection (the patient dashboard's own
// "Improvisation Games" tab -- see GamesSection.jsx), not out to the
// NEUROMORPH landing page. Naming the real destination makes it read as
// one integrated app instead of two apps stitched together.
//
// 2026-08-26: this "Back to Games" wrapper string is translated (see
// src/i18n/strings/dashboard.js). The embedded OddballGamesApp suite
// itself is a separate, self-contained project with its own internal
// dashboard/copy -- out of scope for this pass, flagged as follow-up work.
export default function OddballGamesLauncher({ onExit, userName, initialDomain, initialGame, language = DEFAULT_LANGUAGE }) {
  return (
    <div className="oddball-root">
      <div className="nmpa-embedded-exit-bar nmpa-screen-only">
        <button type="button" className="nmpa-link" onClick={onExit}>&larr; {t(language, 'backToGames')}</button>
      </div>
      <OddballGamesApp user={userName ? { name: userName } : undefined} initialDomain={initialDomain} initialGame={initialGame} />
    </div>
  );
}
