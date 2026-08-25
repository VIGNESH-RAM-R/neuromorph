import assert from 'node:assert/strict';

import { AiFallbackService } from '../src/engines/AiFallbackService.js';
import { SYSTEM_PROMPT } from '../src/config/systemPromptConfig.js';
import { DOCTOR_SYSTEM_PROMPT } from '../src/config/doctorSystemPromptConfig.js';
import { ConversationEngine } from '../src/engines/ConversationEngine.js';

let passed = 0;
function check(name, fn) {
  try {
    fn();
    passed++;
  } catch (err) {
    console.error(`FAIL: ${name}`);
    throw err;
  }
}

async function checkAsync(name, fn) {
  try {
    await fn();
    passed++;
  } catch (err) {
    console.error(`FAIL: ${name}`);
    throw err;
  }
}

const ENABLED_CONFIG = { enabled: true, endpoint: 'https://example.test/askMorphy', timeoutMs: 5000 };

// A minimal mock fetch -- records the request it was called with and
// returns a canned Gemini-proxy-shaped response, so these tests exercise
// AiFallbackService's own logic without any real network call.
function mockFetch(responseBody = { answer: 'A real answer.' }, ok = true) {
  const calls = [];
  const fn = async (url, options) => {
    calls.push({ url, options, body: JSON.parse(options.body) });
    return {
      ok,
      json: async () => responseBody,
    };
  };
  fn.calls = calls;
  return fn;
}

await checkAsync('AiFallbackService.ask: dormant by default -- returns the honest "not configured" message, never calls fetch', async () => {
  const fetchImpl = mockFetch();
  const result = await AiFallbackService.ask({ question: 'What is NEUROMORPH?' }, { enabled: false, endpoint: '', timeoutMs: 1000 }, fetchImpl);
  assert.equal(result.ok, false);
  assert.equal(result.reason, 'not_configured');
  assert.equal(fetchImpl.calls.length, 0);
});

await checkAsync('AiFallbackService.ask: with no systemPrompt argument, defaults to the PATIENT system prompt', async () => {
  const fetchImpl = mockFetch();
  await AiFallbackService.ask({ question: 'How does scoring work?' }, ENABLED_CONFIG, fetchImpl);
  assert.equal(fetchImpl.calls.length, 1);
  assert.equal(fetchImpl.calls[0].body.systemPrompt, SYSTEM_PROMPT);
});

await checkAsync('AiFallbackService.ask: a caller-supplied systemPrompt (e.g. useDoctorChat.js) is sent verbatim, not overridden by the patient prompt', async () => {
  const fetchImpl = mockFetch();
  await AiFallbackService.ask(
    { question: 'Summarize this patient.', systemPrompt: DOCTOR_SYSTEM_PROMPT, systemPromptVersion: '1.0' },
    ENABLED_CONFIG,
    fetchImpl
  );
  assert.equal(fetchImpl.calls.length, 1);
  assert.equal(fetchImpl.calls[0].body.systemPrompt, DOCTOR_SYSTEM_PROMPT);
  assert.notEqual(fetchImpl.calls[0].body.systemPrompt, SYSTEM_PROMPT);
});

await checkAsync('AiFallbackService.ask: a real answer comes back ok:true with the answer text', async () => {
  const fetchImpl = mockFetch({ answer: 'Weekly assessments take about 25 minutes.' });
  const result = await AiFallbackService.ask({ question: 'How long does it take?' }, ENABLED_CONFIG, fetchImpl);
  assert.equal(result.ok, true);
  assert.equal(result.text, 'Weekly assessments take about 25 minutes.');
});

check('ConversationEngine.getSmallTalkResponse: greetings are answered locally without Gemini', () => {
  assert.match(ConversationEngine.getSmallTalkResponse('Hello bro'), /Hello! I'm Morphy/);
  assert.equal(ConversationEngine.getSmallTalkResponse('What is my score?'), null);
});

await checkAsync('AiFallbackService.ask: a non-ok HTTP response never fabricates an answer', async () => {
  const fetchImpl = mockFetch({}, false);
  const result = await AiFallbackService.ask({ question: 'x' }, ENABLED_CONFIG, fetchImpl);
  assert.equal(result.ok, false);
  assert.equal(result.reason, 'bad_response');
});

await checkAsync('AiFallbackService.ask: an empty/missing answer field is treated as a failure, not a blank success', async () => {
  const fetchImpl = mockFetch({ answer: '   ' });
  const result = await AiFallbackService.ask({ question: 'x' }, ENABLED_CONFIG, fetchImpl);
  assert.equal(result.ok, false);
  assert.equal(result.reason, 'empty_answer');
});

console.log(`\n${passed} assertions passed.`);
