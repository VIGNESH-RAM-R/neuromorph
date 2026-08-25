// Where the signup screens' full-panel cover image lives.
// 2026-08-18: the user sent a reference infographic (glowing crystalline
// brain sphere + stat cards + "How it works" + specialities) and asked for
// it to cover the left panel during signup. Earlier in this session the
// pasted image wasn't reachable as a real file, so this was a placeholder
// slot; it's since become available and the real file now lives at
// public/assets/brand/signup-cover.png. AuthBrandPanel's <img onError>
// handler still falls back to the animated network backdrop if this file
// is ever missing/renamed -- never a broken-image icon.
export const SIGNUP_COVER_IMAGE_URL = '/assets/brand/signup-cover.png';

// Where the role-gate ("who's signing in?", the very first screen)
// reference cover image lives -- the user's glowing head-profile /
// domain-callout photo, at public/assets/brand/role-gate-cover.png.
//
// 2026-08-22: RoleGateScreen no longer uses this (see its own header
// comment) -- it now always renders the hand-built, animated
// RoleGateBackdrop SVG instead, since that uses the app's real 6 cognitive
// domains (the photo's labels, e.g. "Visuospatial"/"Insights", don't match
// what this app actually measures) and stays theme-consistent, which the
// fixed-dark photo + hardcoded scrim did not. Left exported (file still on
// disk, unused for now) rather than deleted, in case a real, up-to-date
// version of this image shows up later and this swap is worth revisiting.
export const ROLE_GATE_COVER_IMAGE_URL = '/assets/brand/role-gate-cover.png';
