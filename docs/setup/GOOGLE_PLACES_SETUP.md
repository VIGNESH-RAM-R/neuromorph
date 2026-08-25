# Turning on live place search (Medical license region field)

The doctor onboarding form's "Medical license region" field can search
every real city, state/province, and country worldwide as you type (e.g.
typing "Bangalore" offers "Bengaluru, Karnataka, India"), the same way
Google Maps' own search box does. This uses Google's Places API and needs
a real API key + a Google Cloud Billing account to turn on.

This is written, coded, and safe-by-default already -- until you complete
the steps below, the field just falls back to a plain text input (nothing
breaks, nothing looks unfinished, it just isn't live-searchable yet).
Takes about 10-15 minutes, plus however long Google Cloud Billing signup
takes if you haven't set that up before.

---

## Step 1: Enable billing + the Places API (~10 min)

Google's Places API (New) requires a Google Cloud Billing account to be
attached to the project, even though it comes with a recurring free
monthly credit that comfortably covers a hackathon demo's worth of
searches. If NEUROMORPH's Firebase project doesn't have billing enabled
yet:

1. Go to [console.cloud.google.com](https://console.cloud.google.com/) and
   select the same project Firebase is using (`neuromorph-624c0`).
2. Left sidebar -> **Billing** -> link or create a billing account.
3. Left sidebar -> **APIs & Services** -> **Library** -> search
   **"Places API (New)"** -> **Enable**.
4. Also enable **"Maps JavaScript API"** (the Places Autocomplete widget
   loads through it).

## Step 2: Create and restrict an API key (~5 min)

1. **APIs & Services** -> **Credentials** -> **Create Credentials** ->
   **API key**.
2. Immediately click **Edit API key** and restrict it -- an unrestricted
   Maps key is a real cost risk if it leaks:
   - **Application restrictions** -> **HTTP referrers** -> add your real
     domain(s) (and `localhost:*` / `127.0.0.1:*` while testing locally).
   - **API restrictions** -> **Restrict key** -> select **Places API
     (New)** and **Maps JavaScript API** only.
3. Copy the key.

## Step 3: Add the key to `.env` (~1 min)

```
VITE_GOOGLE_MAPS_API_KEY=your-key-here
```

That's it -- `googleMapsConfig.js` picks this up automatically, and the
Medical license region field switches from a plain text input to the real
live search on the next reload. Leaving this blank (the default) means it
just stays a plain text input, same as before this feature existed.

## Step 4: Deploy with the key set

```
npm run build
firebase deploy --only hosting
```

---

## Known, disclosed limitations

- **Only the doctor onboarding form's license-region field uses this.**
  Every other field/screen in the app is unaffected.
- **Visual theming is best-effort, not deep.** The widget renders its own
  UI inside a shadow DOM Google controls, so it won't perfectly match
  NEUROMORPH's dark theme -- not pursued further given the hackathon
  timeline (see `PlaceAutocompleteField.jsx`'s own comment).
- **Clearing the search box's own text doesn't clear the stored value** --
  only picking a real suggestion from the dropdown updates what's saved.
  The field shows a "Selected: ..." line below the box so what's actually
  stored is always visible regardless.
- **Costs real money past the free monthly credit** if usage is heavy --
  fine for a hackathon demo's scale, worth watching before any large real
  deployment (same caution as Gemini's quota, see `GEMINI_SETUP.md`).
