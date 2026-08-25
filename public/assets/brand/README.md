# Signup cover image

Drop the real image file here as **`signup-cover.png`** (or update the
filename in `src/config/brandAssetsConfig.js` to match whatever you save
it as).

Used by the signup screens (patient and doctor) only -- the login screens
keep the animated network backdrop. If this file doesn't exist, or fails
to load for any reason, the signup screens automatically fall back to the
same animated backdrop too -- nothing breaks either way.

Any reasonable image size/aspect ratio works; it's displayed with
`object-fit: cover` filling the full left panel.
