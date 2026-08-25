// ============================================================================
// askMorphy -- the one piece of Morphy that actually talks to a live LLM.
// Deployed separately from the app_page frontend (Firebase Cloud Functions),
// so the Gemini API key lives here, server-side, and never ships in the
// browser bundle. See ../GEMINI_SETUP.md for how to get a free key and
// deploy this.
//
// Contract: matches AiFallbackService.js's ask() call exactly --
//   REQUEST  POST { question, recentMessages, mode, reportData, systemPrompt, systemPromptVersion }
//   RESPONSE 200  { answer: string }
//            4xx/5xx  { error: string }  (never the raw Gemini error or the API key)
//
// Serves Morphy (patient), Morphy for Clinicians (doctor), and Morphy for
// Caregivers -- it has no idea which one is calling; it just uses whatever
// systemPrompt the frontend sent (systemPromptConfig.js for patients,
// doctorSystemPromptConfig.js for doctors, caregiverSystemPromptConfig.js
// for caregivers -- see AiFallbackService.js's 2026-08-18 fix for why this
// used to be hardcoded to only the patient prompt).
//
// 2026-08-19: Google Search grounding enabled (see the `tools` field
// below) -- confirmed against Google's published pricing that Gemini 2.5
// models (including this function's gemini-2.5-flash-lite) get 1,500
// grounded requests/day free before any charge applies, so this is safe
// for a hackathon demo's real usage volume. Requires redeploying this
// function (`firebase deploy --only functions`) for the change to go live.
// ============================================================================
const { onRequest } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const cors = require('cors')({ origin: true });

// Set with: firebase functions:secrets:set GEMINI_API_KEY
// (never committed, never in this file, never in the frontend bundle)
const GEMINI_API_KEY = defineSecret('GEMINI_API_KEY');

// Flash-Lite has the most generous free-tier quota (1,000 requests/day as
// of when GEMINI_SETUP.md was written) -- plenty for a demo, and plenty
// fast for a chat UI. Change here, in one place, if that ever needs to
// move to a different model.
const GEMINI_MODEL = 'gemini-2.5-flash-lite';
const GEMINI_URL = (key) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`;

const MAX_QUESTION_LENGTH = 4000;
const MAX_HISTORY_TURNS = 8;
const REQUEST_TIMEOUT_MS = 15000;

// AiFallbackService.js sends { role: 'user' | 'assistant', content }.
// Gemini's API wants { role: 'user' | 'model', parts: [{ text }] }.
function toGeminiContents(recentMessages, question, reportData, mode) {
  const history = (Array.isArray(recentMessages) ? recentMessages : [])
    .slice(-MAX_HISTORY_TURNS)
    .filter((m) => m && typeof m.content === 'string' && m.content.trim())
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

  let finalQuestion = question;
  if (mode === 'pdf-analysis' && reportData) {
    // Truncated, not the full raw object -- this is context for the model,
    // not a place to dump an unbounded payload into every request.
    const summary = JSON.stringify(reportData).slice(0, 2000);
    finalQuestion = `${question}\n\n[Extracted report data, for context only -- do not invent fields not present here]: ${summary}`;
  }

  return [...history, { role: 'user', parts: [{ text: finalQuestion }] }];
}

// ============================================================================
// App Check (2026-08-21, see DEPLOYMENT_READINESS.md item 3 / APPCHECK_SETUP.md
// for the full story). `enforceAppCheck` rejects any request missing a
// valid `X-Firebase-AppCheck` header BEFORE this function's own code even
// runs -- the strongest version of this protection, but also the one most
// likely to break real users if flipped on out of order.
//
// DELIBERATELY LEFT `false` HERE. Do not flip to `true` until, in this
// order: (1) a real reCAPTCHA v3 site key is registered in Firebase
// Console -> App Check, (2) the frontend is deployed with
// VITE_FIREBASE_APPCHECK_SITE_KEY actually set (see firebaseConfig.js's
// App Check section), (3) Firebase Console's App Check metrics page shows
// real traffic producing VERIFIED tokens (give it a day of real usage),
// and only then (4) flip this to `true` and redeploy
// (`firebase deploy --only functions`). Flipping this before step 3 is
// confirmed would reject every real user's request, including your own --
// this is Firebase's own documented rollout order, not an invented one.
// ============================================================================
const ENFORCE_APP_CHECK = false;

exports.askMorphy = onRequest(
  { secrets: [GEMINI_API_KEY], cors: true, timeoutSeconds: 30, memory: '256MiB', enforceAppCheck: ENFORCE_APP_CHECK },
  (req, res) => {
    cors(req, res, async () => {
      if (req.method !== 'POST') {
        res.status(405).json({ error: 'Use POST.' });
        return;
      }

      const { question, recentMessages, mode, reportData, systemPrompt } = req.body || {};

      if (typeof question !== 'string' || !question.trim()) {
        res.status(400).json({ error: 'A non-empty "question" string is required.' });
        return;
      }
      if (question.length > MAX_QUESTION_LENGTH) {
        res.status(400).json({ error: `"question" is too long (max ${MAX_QUESTION_LENGTH} characters).` });
        return;
      }
      if (typeof systemPrompt !== 'string' || !systemPrompt.trim()) {
        // Never silently answer with no persona/safety rules at all --
        // the frontend always sends one (see AiFallbackService.js), so a
        // missing one here means something is wrong with the caller, not
        // a case to quietly paper over.
        res.status(400).json({ error: 'A "systemPrompt" string is required.' });
        return;
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

      try {
        const apiKey = GEMINI_API_KEY.value();
        const response = await fetch(GEMINI_URL(apiKey), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: toGeminiContents(recentMessages, question, reportData, mode),
            // 2026-08-19: Google Search grounding -- lets Morphy pull real,
            // current information from the web (e.g. general caregiving
            // advice, current health guidance) rather than only its
            // training-time knowledge. Gemini decides per-request whether a
            // given question actually needs a search; simple in-app
            // questions still answer directly, without the extra latency.
            // Same flag serves patient, doctor, and caregiver Morphy alike --
            // this function has no idea which one is calling.
            tools: [{ googleSearch: {} }],
            generationConfig: { temperature: 0.4, maxOutputTokens: 512 },
          }),
        });

        if (!response.ok) {
          // Log the real reason server-side for debugging, but never leak
          // Gemini's raw error body (which can echo request details) back
          // to the browser.
          const detail = await response.text().catch(() => '');
          console.error('Gemini API error', response.status, detail);
          res.status(502).json({ error: 'The AI service is unavailable right now. Please try again shortly.' });
          return;
        }

        const data = await response.json();
        const answer = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '';

        if (!answer.trim()) {
          res.status(502).json({ error: 'The AI service returned an empty answer.' });
          return;
        }

        res.status(200).json({ answer });
      } catch (err) {
        console.error('askMorphy failed', err);
        const timedOut = err?.name === 'AbortError';
        res.status(timedOut ? 504 : 500).json({
          error: timedOut ? 'The AI service took too long to respond.' : 'Something went wrong handling that request.',
        });
      } finally {
        clearTimeout(timeout);
      }
    });
  }
);
