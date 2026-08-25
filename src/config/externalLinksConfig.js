// External links referenced from inside the app -- kept as data, not
// hardcoded in a component, so wiring in the real marketing site (or
// changing it later, any number of times) is a one-line edit here, never a
// component change.
//
// 2026-08-17: real URL added (Team NEXUM's NeuroTrack marketing site,
// confirmed live). AuthTopBar.jsx's disabled/"coming soon" fallback only
// kicks in when this is empty, so the About button on the login/signup
// screens now opens this in a new tab. Site content/team profiles can be
// edited on the Vercel project directly, anytime, independent of this app
// -- this app only ever links out to it, never embeds or caches it.
export const ABOUT_WEBSITE_URL = 'https://neurotrack-ai-hcmg.vercel.app/';

// 2026-08-23: DOCTOR_DASHBOARD_URL (the separately hosted Firebase Hosting
// site) removed -- the full Doctor Dashboard is no longer an external
// redirect. It's integrated directly into this app now; see
// src/doctorDashboard/ (the ported app) and
// src/components/doctor/FullDoctorDashboard.jsx (the mount point
// DoctorHomeSection.jsx's "Go to Doctor Dashboard" button opens).
