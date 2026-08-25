import { AI_FALLBACK_CONFIG } from '../config/aiFallbackConfig.js';
import { SYSTEM_PROMPT, SYSTEM_PROMPT_VERSION } from '../config/systemPromptConfig.js';

const NOT_CONFIGURED_MESSAGE =
  "I don't have a live AI connection set up for that kind of question yet, but I've noted it down so the team can either teach me the answer directly or turn on my full AI mode. In the meantime, try rephrasing, or ask your care team.";

const NETWORK_ERROR_MESSAGE =
  "I tried reaching my extended AI brain but couldn't connect just now. Please check your connection and try again, or rephrase the question -- I might have it in my quick-answer list after all.";

// This is the one piece of Morphy that talks to the network, so -- like
// FaceTrackingService in the Facial Expressivity module -- it's the seam
// between pure logic and the outside world. Unlike a browser-only service,
// this one accepts an injectable `fetchImpl` specifically so it CAN be
// Node-tested (with a mock fetch) rather than only exercised in a browser.
//
// Dormant by default: AI_FALLBACK_CONFIG.enabled is false and endpoint is
// empty, so out of the box this always returns the honest
// "not configured yet" message rather than silently failing or fabricating
// an answer. No API key lives anywhere in this codebase -- see
// functions/index.js (a real, deployable Gemini-calling proxy) and
// GEMINI_SETUP.md for how a teammate turns this on for real.

// 2026-08-21: App Check token attachment (see DEPLOYMENT_READINESS.md item
// 3 / APPCHECK_SETUP.md). askMorphy is a plain HTTP Cloud Function
// (onRequest), not a callable one, so App Check tokens don't get attached
// automatically the way they would for Firestore/Auth calls -- this has to
// fetch and attach one manually. Guarded on `typeof window !== 'undefined'`
// FIRST (cheap, synchronous) so this whole path is skipped entirely in
// this file's own Node tests (no `window` global there) before even
// attempting the dynamic import -- belt-and-suspenders with the try/catch
// below, since a browser with App Check not configured (appCheck === null,
// the default until VITE_FIREBASE_APPCHECK_SITE_KEY is set) must also
// degrade to "send no header" without throwing.
async function appCheckHeader() {
  if (typeof window === 'undefined') return {};
  try {
    const [{ appCheck }, { getToken }] = await Promise.all([
      import('../config/firebaseConfig.js'),
      import('firebase/app-check'),
    ]);
    if (!appCheck) return {};
    const result = await getToken(appCheck, false);
    return result?.token ? { 'X-Firebase-AppCheck': result.token } : {};
  } catch {
    return {};
  }
}

export const AiFallbackService = {
  // `recentMessages`: the last several { role, text } turns of this
  // conversation, threaded through so a real backend can resolve
  // pronouns/references ("it", "page 2") per the system prompt's CONTEXT
  // MEMORY rules -- this local FAQ/action layer doesn't need that, but a
  // real LLM does.
  // `mode`: 'chat' (default) or 'pdf-analysis' -- lets the backend apply
  // the system prompt's PDF ANALYSIS MODE section when explaining an
  // uploaded report, versus its general conversational rules otherwise.
  // `systemPrompt`/`systemPromptVersion` (2026-08-18): now caller-supplied,
  // defaulting to Morphy's patient-facing prompt -- previously hardcoded to
  // that same import, which meant useDoctorChat.js would have silently sent
  // the PATIENT system prompt to the LLM fallback too, had it ever been
  // enabled. useDoctorChat.js now passes DOCTOR_SYSTEM_PROMPT explicitly;
  // every other caller is unaffected since the default is unchanged.
  async ask(
    { question, recentMessages = [], mode = 'chat', reportData = null, systemPrompt = SYSTEM_PROMPT, systemPromptVersion = SYSTEM_PROMPT_VERSION },
    config = AI_FALLBACK_CONFIG,
    fetchImpl = globalThis.fetch
  ) {
    if (!config.enabled || !config.endpoint) {
      return { ok: false, reason: 'not_configured', text: NOT_CONFIGURED_MESSAGE };
    }
    if (typeof fetchImpl !== 'function') {
      return { ok: false, reason: 'no_fetch_available', text: NOT_CONFIGURED_MESSAGE };
    }

    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timeout = controller ? setTimeout(() => controller.abort(), config.timeoutMs) : null;

    try {
      const response = await fetchImpl(config.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(await appCheckHeader()) },
        body: JSON.stringify({
          question,
          recentMessages,
          mode,
          reportData,
          systemPrompt,
          systemPromptVersion,
        }),
        signal: controller ? controller.signal : undefined,
      });

      if (!response.ok) {
        return { ok: false, reason: 'bad_response', text: NETWORK_ERROR_MESSAGE };
      }

      const data = await response.json();
      if (!data || typeof data.answer !== 'string' || !data.answer.trim()) {
        return { ok: false, reason: 'empty_answer', text: NETWORK_ERROR_MESSAGE };
      }

      return { ok: true, reason: 'llm', text: data.answer };
    } catch (err) {
      return { ok: false, reason: 'network_error', text: NETWORK_ERROR_MESSAGE };
    } finally {
      if (timeout) clearTimeout(timeout);
    }
  },
};
