# Setting up real Google & Facebook login

The code is already wired for real OAuth (`useGoogleAuth.js`, `useFacebookAuth.js`,
`SocialAuthEngine.js`) -- the only thing missing is your own credentials.
Both take about 5 minutes to create, and both are free.

Until you add them, the Google/Facebook buttons on Login and Signup will
honestly show a disabled "(setup needed)" state instead of pretending to
work -- so you'll know immediately once it's wired correctly.

---

## 1. Google Client ID (~5 min)

1. Go to [console.cloud.google.com](https://console.cloud.google.com/) and
   sign in with any Google account.
2. Top bar -> click the project dropdown -> **New Project**. Name it
   something like `neuromorph` -> **Create**. Make sure it's selected once
   created.
3. Left sidebar -> **APIs & Services** -> **OAuth consent screen**.
   - User Type: **External** -> **Create**.
   - App name: `NEUROMORPH`. User support email: your email. Developer
     contact email: your email. Save and continue through the remaining
     steps (Scopes, Test users) -- defaults are fine for a demo/hackathon.
   - On **Test users**, add the Google account(s) you'll actually demo
     with, while the app is in "Testing" publishing status (unverified
     apps can only sign in accounts you've explicitly added here).
4. Left sidebar -> **APIs & Services** -> **Credentials** -> **+ Create
   Credentials** -> **OAuth client ID**.
   - Application type: **Web application**.
   - Name: `NEUROMORPH web`.
   - **Authorized JavaScript origins** -- add exactly what you run the app
     on:
     - `http://localhost:5174` (this app's dev server -- see `vite.config.js`)
     - Add your production/demo URL here too once you deploy (e.g. a
       Vercel/Netlify URL), before the hackathon so it works live.
   - You do **not** need an "Authorized redirect URI" -- Google Identity
     Services (the flow this app uses) is a popup/One Tap flow, not a
     redirect flow.
   - **Create**. Copy the **Client ID** (ends in `.apps.googleusercontent.com`).
5. Paste it into `.env` (copy `.env.example` to `.env` first):
   ```
   VITE_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
   ```
6. Restart `npm run dev` (env vars are only read on startup). The Google
   button on Login/Signup will now render Google's own real Sign In button.

---

## 2. Facebook App ID (~5 min)

1. Go to [developers.facebook.com](https://developers.facebook.com/) and
   log in with a Facebook account -> **My Apps** -> **Create App**.
2. Use case: choose **Authenticate and request data from users with
   Facebook Login** (or "Consumer" on older UIs) -> continue.
3. App name: `NEUROMORPH` -> **Create app**.
4. On the app dashboard, find **Facebook Login** in the product list and
   click **Set up** (if it isn't added automatically, **Add Product** ->
   Facebook Login -> Set up -> choose **Web**).
5. When asked for your **Site URL**, enter `http://localhost:5174/`
   (add your production URL too, later, the same way).
6. Left sidebar -> **App settings** -> **Basic**. Copy the **App ID** at
   the top.
7. Same screen -> **App domains**: add `localhost` (and your production
   domain later). Save changes.
8. Left sidebar -> **Facebook Login** -> **Settings**. Under **Valid OAuth
   Redirect URIs** you can leave this blank for now -- this app's flow
   (`FB.login()` via the JS SDK) is a popup flow and doesn't need one for
   local testing, but add your production URL's `/` here before a live
   demo, to be safe.
9. Your app starts in **Development mode** -- it will only let *your own*
   Facebook account (and any you add as testers under **App roles** ->
   **Roles**) log in until you submit it for App Review. That's expected
   and fine for a hackathon demo -- add your teammates as testers so
   everyone can try it.
10. Paste the App ID into `.env`:
    ```
    VITE_FACEBOOK_APP_ID=your-app-id-here
    ```
11. Restart `npm run dev`. The "Continue with Facebook" button will now be
    clickable and trigger Facebook's real login dialog.

---

## Notes

- **Neither of these needs a backend to work as a real sign-in.** The user
  really does see Google's/Facebook's own consent screen and a real
  identity token comes back. What this app doesn't have yet is a server to
  re-verify that token before trusting it (see the honesty note at the top
  of `src/engines/SocialAuthEngine.js`) -- exactly the same documented gap
  as the existing email/password login. Fine for a demo; the standard next
  step once a real backend exists.
- **Nothing breaks if you only set up one of the two.** Each button is
  independently gated on its own env var.
- If a teammate pulls this project, they each need their own local `.env`
  (it's gitignored on purpose) -- either share the same Client ID/App ID
  with them directly, or have them create their own for local dev.
