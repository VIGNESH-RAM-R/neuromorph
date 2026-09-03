import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";

/* =========================================================================
   NeuroTrack — Stroop Color-Word Test
   A clinical-grade cognitive assessment screen, built to sit inside the
   NeuroTrack dementia screening platform. Follows the same design language
   and file structure as the other NeuroTrack modules (e.g. Trail Making
   Test): diagnostic instrumentation styling, a restrained navy/blue
   palette, and a single self-contained component tree with the CSS
   injected as a template string at the bottom of the file.
   ========================================================================= */

/* ---------------------------- Trial constants ---------------------------- */
const PRACTICE_COUNT = 10;
const SCORED_TRIAL_COUNT = 15;
const CONGRUENT_RATIO = 0.25; // 25% congruent / 75% incongruent, per protocol
// Was 5000ms (matching the depleting bar's 5s CSS animation below) — widened
// to give patients more real thinking time under the response deadline
// itself, not just a slower-looking bar: the bar's fill duration always has
// to equal this value exactly, or it would show time still remaining after
// a response actually timed out. See .timer-bar-fill's animation duration.
const TRIAL_TIMEOUT_MS = 7000;
const MIN_VALID_RT = 200; // anticipatory-response floor, excluded from RT stats

const COLORS = [
  { name: "Red", cssVar: "--ink-red" },
  { name: "Blue", cssVar: "--ink-blue" },
  { name: "Green", cssVar: "--ink-green" },
  { name: "Yellow", cssVar: "--ink-yellow" },
];

/* Fisher–Yates */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* TrialGenerationEngine + ColorEngine, inlined per the single-file module
   convention: builds one randomized Stroop trial. `previous`, when given,
   is retried against — each trial used to be generated in total isolation,
   so the exact same ink color (or the exact same word) could land on two
   consecutive trials purely by chance; with retries this can never happen,
   without weighting away from true randomness across the trial set as a
   whole (only ever compares against the one immediately prior trial). */
function genTrial(id, phase, previous) {
  let ink, word, congruent;
  let attempts = 0;
  do {
    congruent = Math.random() < CONGRUENT_RATIO;
    ink = COLORS[Math.floor(Math.random() * COLORS.length)];
    word = congruent
      ? ink.name
      : COLORS.filter((c) => c.name !== ink.name)[Math.floor(Math.random() * (COLORS.length - 1))].name;
    attempts++;
  } while (previous && attempts < 20 && (ink.name === previous.inkName || word.toUpperCase() === previous.word));
  return {
    id,
    phase,
    word: word.toUpperCase(),
    inkName: ink.name,
    inkVar: ink.cssVar,
    trialType: congruent ? "congruent" : "incongruent",
    buttonOrder: shuffle(COLORS.map((c) => c.name)),
  };
}

function buildTrialSet(phase, count) {
  const trials = [];
  let previous = null;
  for (let i = 0; i < count; i++) {
    previous = genTrial(i + 1, phase, previous);
    trials.push(previous);
  }
  return trials;
}

/* ------------------------------ Formatting -------------------------------- */
function formatTime(ms) {
  const totalMs = Math.max(0, ms);
  const s = Math.floor(totalMs / 1000);
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  const cs = String(Math.floor((totalMs % 1000) / 10)).padStart(2, "0");
  return `${mm}:${ss}.${cs}`;
}

function formatMs(ms) {
  if (ms == null || Number.isNaN(ms)) return "—";
  return `${(ms / 1000).toFixed(2)}s`;
}

/* --------------------------- MetricsEngine helpers ------------------------- */
function mean(arr) {
  if (!arr.length) return 0;
  return arr.reduce((s, x) => s + x, 0) / arr.length;
}
function median(arr) {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}
function stddev(arr) {
  if (arr.length < 2) return 0;
  const m = mean(arr);
  const v = arr.reduce((s, x) => s + (x - m) * (x - m), 0) / (arr.length - 1);
  return Math.sqrt(v);
}
function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}
function round1(v) {
  return Math.round(v * 10) / 10;
}
/* Anticipatory-response filter: RTs under MIN_VALID_RT are excluded from
   timing statistics (they cannot reflect genuine stimulus processing). */
function validRTs(records) {
  return records.filter((r) => r.reactionTime >= MIN_VALID_RT).map((r) => r.reactionTime);
}

/* ------------------------------ MetricsEngine ------------------------------
   Reference ranges used to normalize sub-scores are drawn from published
   Stroop norms: healthy adults average ~640-880ms on congruent trials and
   show a ~85-115ms congruent/incongruent interference effect (Stroop, 1935
   replications; MacLeod, 1991). RT distributions are right-skewed, so
   median (not mean) is used for central tendency per standard practice. */
function buildResultModel(responses) {
  const total = responses.length;
  const timeouts = responses.filter((r) => r.timeout).length;
  const correct = responses.filter((r) => r.correct && !r.timeout);
  const correctResponses = correct.length;
  const incorrectResponses = total - correctResponses;
  const overallAccuracy = round1((correctResponses / total) * 100);

  const congruent = responses.filter((r) => r.trialType === "congruent");
  const incongruent = responses.filter((r) => r.trialType === "incongruent");
  const congruentAccuracy = round1(
    (congruent.filter((r) => r.correct && !r.timeout).length / (congruent.length || 1)) * 100
  );
  const incongruentAccuracy = round1(
    (incongruent.filter((r) => r.correct && !r.timeout).length / (incongruent.length || 1)) * 100
  );

  const correctRTs = validRTs(correct);
  const congruentRTs = validRTs(congruent.filter((r) => r.correct && !r.timeout));
  const incongruentRTs = validRTs(incongruent.filter((r) => r.correct && !r.timeout));

  const averageReactionTime = Math.round(median(correctRTs));
  const fastestReactionTime = correctRTs.length ? Math.round(Math.min(...correctRTs)) : 0;
  const slowestReactionTime = correctRTs.length ? Math.round(Math.max(...correctRTs)) : 0;
  const reactionTimeVariability = Math.round(stddev(correctRTs));
  const congruentReactionTime = Math.round(median(congruentRTs));
  const incongruentReactionTime = Math.round(median(incongruentRTs));
  const stroopInterferenceEffect = Math.round(incongruentReactionTime - congruentReactionTime);

  const rtAfterError = [];
  const rtAfterCorrect = [];
  for (let i = 1; i < responses.length; i++) {
    const prev = responses[i - 1];
    const cur = responses[i];
    if (cur.correct && !cur.timeout && cur.reactionTime >= MIN_VALID_RT) {
      if (!prev.correct) rtAfterError.push(cur.reactionTime);
      else rtAfterCorrect.push(cur.reactionTime);
    }
  }
  const hasErrorData = rtAfterError.length > 0 && rtAfterCorrect.length > 0;
  const postErrorSlowing = hasErrorData ? Math.round(mean(rtAfterError) - mean(rtAfterCorrect)) : 0;

  const interferenceComponent = clamp(100 - (stroopInterferenceEffect - 100) / 5, 0, 100);
  const responseInhibitionScore = Math.round(0.35 * incongruentAccuracy + 0.65 * interferenceComponent);

  const consistencyComponent = clamp(100 - (reactionTimeVariability - 100) / 5, 0, 100);
  const selectiveAttentionScore = Math.round(0.6 * overallAccuracy + 0.4 * consistencyComponent);

  const processingSpeedScore = Math.round(clamp(100 - (averageReactionTime - 650) / 15, 0, 100));

  /* A participant who makes zero errors cannot be penalized for lacking a
     post-error recovery response — absence of errors defaults to full marks
     rather than an undefined/negative artifact. */
  const flexComponent = hasErrorData ? clamp(100 - Math.abs(postErrorSlowing - 50) / 5, 0, 100) : 100;
  const mentalFlexibilityScore = Math.round(0.6 * flexComponent + 0.4 * consistencyComponent);

  const executiveFunctionScore = Math.round(
    0.3 * responseInhibitionScore +
      0.25 * selectiveAttentionScore +
      0.2 * mentalFlexibilityScore +
      0.15 * processingSpeedScore +
      0.1 * overallAccuracy
  );

  const rawScore = correctResponses;
  const normalizedScore = Math.round(0.7 * overallAccuracy + 0.3 * processingSpeedScore);
  const cognitiveScore = Math.round(
    0.45 * executiveFunctionScore + 0.25 * normalizedScore + 0.15 * selectiveAttentionScore + 0.15 * mentalFlexibilityScore
  );

  let interpretation;
  let severity;
  if (cognitiveScore >= 85) {
    interpretation = "Within normal limits";
    severity = "Normal";
  } else if (cognitiveScore >= 70) {
    interpretation = "Mild cognitive concern — monitor";
    severity = "Mild";
  } else if (cognitiveScore >= 50) {
    interpretation = "Moderate cognitive concern — clinical follow-up recommended";
    severity = "Moderate";
  } else {
    interpretation = "Significant cognitive concern — comprehensive evaluation recommended";
    severity = "Severe";
  }

  const completionTime = responses.reduce((s, r) => s + r.reactionTime, 0);

  return {
    testName: "Stroop Color-Word Test",
    sessionId: `stroop-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    testVersion: "1.0.0",
    domains: [
      "Response Inhibition",
      "Selective Attention",
      "Executive Function",
      "Processing Speed",
      "Cognitive Control",
      "Mental Flexibility",
      "Sustained Attention",
      "Frontal Lobe Function",
    ],
    completionTime,
    accuracy: overallAccuracy,
    errors: incorrectResponses,
    completed: true,
    averageReactionTime,
    fastestReactionTime,
    slowestReactionTime,
    rawScore,
    normalizedScore,
    cognitiveScore,
    interpretation,
    severity,
    clickHistory: responses,
    metrics: {
      correctResponses,
      incorrectResponses,
      congruentAccuracy,
      incongruentAccuracy,
      congruentReactionTime,
      incongruentReactionTime,
      stroopInterferenceEffect,
      responseInhibitionScore,
      selectiveAttentionScore,
      executiveFunctionScore,
      mentalFlexibilityScore,
      processingSpeedScore,
      reactionTimeVariability,
      timeouts,
      postErrorSlowing,
    },
  };
}

/* ------------------------------- Icons ----------------------------------- */
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
    <path d="M4 13l5 5L20 6" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const XIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
    <path d="M5 5l14 14M19 5L5 19" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
  </svg>
);
const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
    <path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const ClockIcon = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
    <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.8" />
    <path d="M12 7v5l3.5 2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);
const TargetIcon = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
    <circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="12" cy="12" r="3" fill="currentColor" />
  </svg>
);
const AlertIcon = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
    <path d="M12 4l9 16H3z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M12 10v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="12" cy="16.6" r="0.9" fill="currentColor" />
  </svg>
);
const ProgressIcon = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
    <path d="M4 19V9M12 19V5M20 19v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

/* ============================ Instructions ================================ */
function InstructionsScreen({ onBegin }) {
  return (
    <div className="screen center-screen">
      <div className="card welcome-card">
        <div className="eyebrow">Cognitive Assessment Suite</div>
        <h1 className="display-xl">Stroop Color-Word Test</h1>
        <p className="lead">
          This assessment measures response inhibition, selective attention, and executive
          function. A color word will appear on screen — your task is not to read the word.
          Respond with the color of the ink it is printed in, as quickly and accurately as
          you can.
        </p>

        <div className="instruction-block">
          <div className="instruction-label">Example</div>
          <div className="example-row">
            <div className="example-tile">
              <span className="example-caption">Word shown</span>
              <span className="example-word" style={{ color: "var(--ink-red)" }}>BLUE</span>
            </div>
            <span className="example-arrow" aria-hidden="true"><ArrowIcon /></span>
            <div className="example-tile">
              <span className="example-caption">Correct answer</span>
              <span className="example-word" style={{ color: "var(--ink-red)" }}>RED</span>
            </div>
          </div>
        </div>

        <ul className="instruction-notes">
          <li><TargetIcon /> <span>Select the ink color, never the written word.</span></li>
          <li><ClockIcon /> <span>Each trial times out after 7 seconds — respond as quickly and accurately as you can.</span></li>
          <li><CheckIcon /> <span>{PRACTICE_COUNT} practice trials come first with feedback, then {SCORED_TRIAL_COUNT} scored trials without feedback.</span></li>
        </ul>

        <button type="button" className="btn btn--primary btn--large" onClick={onBegin}>
          Start Assessment
        </button>
      </div>
    </div>
  );
}

/* ============================== Countdown ================================= */
function Countdown({ onDone }) {
  const steps = ["3", "2", "1", "GO"];
  const [i, setI] = useState(0);

  useEffect(() => {
    if (i >= steps.length) {
      const t = setTimeout(onDone, 380);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setI((v) => v + 1), 650);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);

  return (
    <div className="screen center-screen countdown-screen">
      <div className="countdown-ring">
        <span key={i} className={`countdown-num ${steps[i] === "GO" ? "countdown-go" : ""}`}>
          {steps[i] ?? ""}
        </span>
      </div>
      <p className="countdown-caption">Prepare to begin</p>
    </div>
  );
}

/* ========================== Trial screen (shared) ==========================
   Handles both the practice phase (feedback shown, unscored) and the scored
   assessment phase (no feedback) — same trial engine, per the NeuroTrack
   convention of reusing one orchestration path for both. */
function TrialScreen({ phase, trialCount, onComplete }) {
  const trials = useMemo(() => buildTrialSet(phase, trialCount), [phase, trialCount]);
  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [locked, setLocked] = useState(false);
  const [barKey, setBarKey] = useState(0);
  const responsesRef = useRef([]);
  const startRef = useRef(performance.now());
  const timerRef = useRef(null);
  const finishedRef = useRef(false);

  const trial = trials[index];

  useEffect(() => {
    if (!trial || finishedRef.current) return;
    setLocked(false);
    setFeedback(null);
    setBarKey((k) => k + 1);
    startRef.current = performance.now();
    timerRef.current = setTimeout(() => {
      handleAnswer(null, true);
    }, TRIAL_TIMEOUT_MS);
    return () => clearTimeout(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const handleAnswer = useCallback(
    (colorName, isTimeout) => {
      if (finishedRef.current || locked || !trial) return;
      setLocked(true);
      clearTimeout(timerRef.current);

      const rt = isTimeout ? TRIAL_TIMEOUT_MS : Math.round(performance.now() - startRef.current);
      const correct = !isTimeout && colorName === trial.inkName;
      const record = {
        trialNumber: index + 1,
        word: trial.word,
        inkColor: trial.inkName,
        trialType: trial.trialType,
        selectedAnswer: isTimeout ? null : colorName,
        correctAnswer: trial.inkName,
        reactionTime: rt,
        correct,
        timeout: isTimeout,
      };
      responsesRef.current = [...responsesRef.current, record];

      if (phase === "practice") {
        setFeedback({ ok: correct, inkName: trial.inkName, isTimeout });
      }

      const delay = phase === "practice" ? 750 : 150;
      setTimeout(() => {
        const nextIndex = index + 1;
        if (nextIndex >= trials.length) {
          finishedRef.current = true;
          onComplete(responsesRef.current);
        } else {
          setIndex(nextIndex);
        }
      }, delay);
    },
    [locked, trial, index, phase, trials.length, onComplete]
  );

  if (!trial) return null;

  return (
    <div className="screen assessment-screen">
      <div className="hud" role="status" aria-live="polite">
        <div className="hud-item">
          <span className="hud-label">Phase</span>
          <span className="hud-value">{phase === "practice" ? "Practice" : "Scored assessment"}</span>
        </div>
        <div className="hud-item">
          <span className="hud-label"><ProgressIcon /> Trial</span>
          <span className="hud-value hud-mono">{index + 1} / {trials.length}</span>
        </div>
      </div>

      <div className="board-frame">
        <div className="stroop-stage">
          <p className="stroop-word" style={{ color: `var(${trial.inkVar})` }}>{trial.word}</p>

          <div key={barKey} className="timer-bar-track" aria-hidden="true">
            <div className="timer-bar-fill" />
          </div>

          {feedback && (
            <div className={`feedback-banner ${feedback.ok ? "feedback-banner--ok" : "feedback-banner--bad"}`}>
              {feedback.ok ? <CheckIcon /> : <XIcon />}
              <span>
                {feedback.isTimeout
                  ? `Time is up — ink color was ${feedback.inkName}`
                  : feedback.ok
                  ? "Correct"
                  : `Incorrect — ink color was ${feedback.inkName}`}
              </span>
            </div>
          )}

          <div className="response-grid">
            {trial.buttonOrder.map((name) => {
              const c = COLORS.find((x) => x.name === name);
              return (
                <button
                  key={name}
                  type="button"
                  className="response-btn"
                  disabled={locked}
                  onClick={() => handleAnswer(name, false)}
                >
                  <span className="response-swatch" style={{ background: `var(${c.cssVar})` }} />
                  {name}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================== Completion ================================= */
function CompletionScreen({ results, onRestart, onHome }) {
  const m = results.metrics;
  const [showTrials, setShowTrials] = useState(false);

  return (
    <div className="screen center-screen">
      <div className="card completion-card completion-card--wide">
        <div className="completion-badge"><CheckIcon /></div>
        <div className="eyebrow">Assessment complete</div>
        <h2 className="display-lg">Stroop Color-Word Test — Report</h2>
        <p className="lead lead--tight">{results.interpretation} · Severity: {results.severity}</p>

        <div className="metrics-grid">
          <div className="metric-tile metric-tile--primary">
            <span className="metric-label">Overall Cognitive Score</span>
            <span className="metric-value hud-mono">{results.cognitiveScore} / 100</span>
          </div>

          <div className="metric-tile"><span className="metric-label">Overall Accuracy</span><span className="metric-value hud-mono">{results.accuracy}%</span></div>
          <div className="metric-tile"><span className="metric-label">Completion Time</span><span className="metric-value hud-mono">{formatTime(results.completionTime)}</span></div>
          <div className="metric-tile"><span className="metric-label">Correct Responses</span><span className="metric-value hud-mono">{m.correctResponses}</span></div>
          <div className="metric-tile"><span className="metric-label">Incorrect Responses</span><span className="metric-value hud-mono">{m.incorrectResponses}</span></div>
          <div className="metric-tile"><span className="metric-label">Congruent Accuracy</span><span className="metric-value hud-mono">{m.congruentAccuracy}%</span></div>
          <div className="metric-tile"><span className="metric-label">Incongruent Accuracy</span><span className="metric-value hud-mono">{m.incongruentAccuracy}%</span></div>
          <div className="metric-tile"><span className="metric-label"><AlertIcon /> Response Inhibition</span><span className="metric-value hud-mono">{m.responseInhibitionScore}</span></div>
          <div className="metric-tile"><span className="metric-label"><TargetIcon /> Selective Attention</span><span className="metric-value hud-mono">{m.selectiveAttentionScore}</span></div>
          <div className="metric-tile"><span className="metric-label">Executive Function</span><span className="metric-value hud-mono">{m.executiveFunctionScore}</span></div>
          <div className="metric-tile"><span className="metric-label">Mental Flexibility</span><span className="metric-value hud-mono">{m.mentalFlexibilityScore}</span></div>
          <div className="metric-tile"><span className="metric-label">Processing Speed</span><span className="metric-value hud-mono">{m.processingSpeedScore}</span></div>
          <div className="metric-tile"><span className="metric-label">Stroop Interference</span><span className="metric-value hud-mono">{formatMs(m.stroopInterferenceEffect)}</span></div>
          <div className="metric-tile"><span className="metric-label"><ClockIcon /> Avg. Reaction Time</span><span className="metric-value hud-mono">{formatMs(results.averageReactionTime)}</span></div>
          <div className="metric-tile"><span className="metric-label">Fastest Reaction</span><span className="metric-value hud-mono">{formatMs(results.fastestReactionTime)}</span></div>
          <div className="metric-tile"><span className="metric-label">Slowest Reaction</span><span className="metric-value hud-mono">{formatMs(results.slowestReactionTime)}</span></div>
          <div className="metric-tile"><span className="metric-label">RT Variability</span><span className="metric-value hud-mono">{formatMs(m.reactionTimeVariability)}</span></div>
          <div className="metric-tile"><span className="metric-label">Timeouts</span><span className="metric-value hud-mono">{m.timeouts}</span></div>
          <div className="metric-tile"><span className="metric-label">Post-Error Slowing</span><span className="metric-value hud-mono">{formatMs(m.postErrorSlowing)}</span></div>
        </div>

        <button type="button" className="btn btn--ghost trial-toggle" onClick={() => setShowTrials((v) => !v)}>
          {showTrials ? "Hide" : "Show"} trial review ({results.clickHistory.length} trials)
        </button>

        {showTrials && (
          <div className="trial-table-wrap">
            <table className="trial-table">
              <thead>
                <tr>
                  <th>#</th><th>Word</th><th>Ink</th><th>Selected</th><th>Correct</th><th>RT</th><th>Result</th>
                </tr>
              </thead>
              <tbody>
                {results.clickHistory.map((t) => (
                  <tr key={t.trialNumber}>
                    <td>{t.trialNumber}</td>
                    <td>{t.word}</td>
                    <td>{t.inkColor}</td>
                    <td>{t.selectedAnswer || "—"}</td>
                    <td>{t.correctAnswer}</td>
                    <td>{formatMs(t.reactionTime)}</td>
                    <td>{t.timeout ? "Timeout" : t.correct ? "Correct" : "Incorrect"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="row-actions">
          <button type="button" className="btn btn--ghost" onClick={onHome}>Return Home</button>
          <button type="button" className="btn btn--primary btn--large" onClick={onRestart}>Restart Test</button>
        </div>
      </div>
    </div>
  );
}

/* ============================ Contract adapter ==============================
   Maps this game's own response records onto the GameModule contract
   (features/04-Cognitive-Assist.md §A.1) without touching any of the trial/
   scoring logic above. See src/features/games/weekly/stroop-task/adapter.js
   for the mount/unmount wrapper this component gets rendered through. */
function toContractTrials(responses) {
  return responses.map((r) => ({
    responseTimeMs: r.reactionTime,
    correct: r.correct,
    errorType: r.timeout ? "timeout" : r.correct ? undefined : "wrong_color",
  }));
}

/* ================================== App ==================================== */
export default function StroopGame({ config, onComplete, onPracticeComplete }) {
  const [screen, setScreen] = useState("instructions");
  const [results, setResults] = useState(null);

  const goPractice = () => setScreen("practice");
  const goCountdown = () => setScreen("countdown");
  const goAssessment = () => setScreen("assessment");
  const goHome = () => setScreen("instructions");

  // The practice round is baked into this game's own flow (it always runs
  // practice -> countdown -> scored in one mount) — practice trials get
  // reported separately via onPracticeComplete so the session player can
  // still log them as is_practice rows, without this game needing an
  // external controller deciding when practice starts/stops.
  const handlePracticeFinish = (responses) => {
    onPracticeComplete?.({ score: null, trials: toContractTrials(responses) });
    goCountdown();
  };

  const handleFinish = (responses) => {
    const model = buildResultModel(responses);
    setResults(model);
    setScreen("completion");
    onComplete?.({ score: model.cognitiveScore, trials: toContractTrials(responses), rawLog: model });
  };

  const handleRestart = () => setScreen("countdown");
  void config; // reserved: difficultyLevel/theme/locale — see docs/phase-3/README.md on per-game difficulty wiring

  return (
    <div className="ntx-root">
      <style>{CSS}</style>

      <header className="app-topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="18" height="18">
              <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.6" />
              <path d="M8 13l2.2 2.4L16 9" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="brand-module">Stroop Color-Word Test</span>
        </div>
      </header>

      <main className="app-main">
        {screen === "instructions" && <InstructionsScreen onBegin={goPractice} />}
        {screen === "practice" && (
          <TrialScreen phase="practice" trialCount={PRACTICE_COUNT} onComplete={handlePracticeFinish} />
        )}
        {screen === "countdown" && <Countdown onDone={goAssessment} />}
        {screen === "assessment" && (
          <TrialScreen phase="scored" trialCount={SCORED_TRIAL_COUNT} onComplete={handleFinish} />
        )}
        {screen === "completion" && results && (
          <CompletionScreen results={results} onRestart={handleRestart} onHome={goHome} />
        )}
      </main>
    </div>
  );
}

/* ================================== CSS ==================================== */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500;600;700&display=swap');

:root{
  --paper:#F5F8FC;
  --panel:#FFFFFF;
  --ink:#0F2540;
  --ink-soft:#54647C;
  --line:#DDE5F0;
  --line-soft:#EAF0F8;
  --primary:#2E5FDC;
  --primary-dark:#1B3F9E;
  --primary-tint:#E9EFFC;
  --success:#12805A;
  --success-tint:#E1F5EC;
  --error:#C7433F;
  --error-tint:#FBEAE9;
  --radius-lg:20px;
  --radius-md:14px;
  --radius-sm:10px;
  --shadow-card:0 1px 2px rgba(15,37,64,0.04),0 12px 32px -16px rgba(15,37,64,0.16);
  --font-display:'Sora',sans-serif;
  --font-body:'Inter',sans-serif;
  --font-mono:'JetBrains Mono',monospace;
  --ink-red:#C7433F;
  --ink-blue:#2E5FDC;
  --ink-green:#12805A;
  --ink-yellow:#B8860B;
}

.ntx-root{
  min-height:100vh;
  width:100%;
  background:
    radial-gradient(1100px 480px at 85% -10%, rgba(46,95,220,0.06), transparent 60%),
    var(--paper);
  color:var(--ink);
  font-family:var(--font-body);
  display:flex;
  flex-direction:column;
  box-sizing:border-box;
}
.ntx-root *{ box-sizing:border-box; }
.ntx-root button{ font-family:inherit; }
.ntx-root button:focus-visible{
  outline:3px solid var(--primary);
  outline-offset:2px;
}

@media (prefers-reduced-motion: reduce){
  .ntx-root *{ animation-duration:0.001ms !important; transition-duration:0.001ms !important; }
}

/* ---------------- Topbar ---------------- */
.app-topbar{
  display:flex; align-items:center;
  padding:18px 28px;
  border-bottom:1px solid var(--line);
  background:rgba(255,255,255,0.7);
  backdrop-filter:blur(6px);
}
.brand{ display:flex; align-items:center; gap:10px; color:var(--ink); }
.brand-mark{ color:var(--primary); display:flex; }
.brand-module{ color:var(--ink-soft); font-size:14px; font-weight:500; }

.app-main{ flex:1; display:flex; }

/* ---------------- Generic screen shells ---------------- */
.screen{ flex:1; width:100%; display:flex; }
.center-screen{ align-items:center; justify-content:center; padding:32px 20px; }

.card{
  width:100%;
  background:var(--panel);
  border:1px solid var(--line);
  border-radius:var(--radius-lg);
  box-shadow:var(--shadow-card);
  padding:44px 44px 38px;
}
.welcome-card{ max-width:640px; }
.completion-card{ max-width:640px; text-align:center; }
.completion-card--wide{ max-width:780px; }

.eyebrow{
  font-family:var(--font-mono);
  font-size:11.5px;
  letter-spacing:0.10em;
  text-transform:uppercase;
  color:var(--primary);
  font-weight:600;
  margin-bottom:14px;
}
.display-xl{ font-family:var(--font-display); font-size:36px; line-height:1.15; margin:0 0 14px; letter-spacing:-0.01em; }
.display-lg{ font-family:var(--font-display); font-size:26px; line-height:1.2; margin:0 0 14px; letter-spacing:-0.01em; }
.lead{ font-size:16px; line-height:1.6; color:var(--ink-soft); margin:0 0 28px; max-width:56ch; }
.lead--tight{ margin:0 auto 26px; }

/* ---------------- Instructions / example ---------------- */
.instruction-block{
  border:1px solid var(--line-soft);
  background:var(--paper);
  border-radius:var(--radius-md);
  padding:18px 20px;
  margin-bottom:22px;
}
.instruction-label{ font-family:var(--font-display); font-weight:600; font-size:14.5px; margin-bottom:12px; color:var(--ink); }

.example-row{ display:flex; align-items:center; gap:18px; }
.example-tile{ flex:1; text-align:center; display:flex; flex-direction:column; gap:6px; }
.example-caption{ font-size:11.5px; color:var(--ink-soft); text-transform:uppercase; letter-spacing:0.05em; font-weight:600; }
.example-word{ font-family:var(--font-display); font-weight:700; font-size:28px; }
.example-arrow{ color:var(--line); display:flex; }

.instruction-notes{ list-style:none; padding:0; margin:0 0 26px; display:flex; flex-direction:column; gap:10px; }
.instruction-notes li{ display:flex; align-items:flex-start; gap:10px; font-size:13.5px; color:var(--ink-soft); }
.instruction-notes li svg{ flex:0 0 auto; margin-top:2px; color:var(--primary); }

/* ---------------- Buttons ---------------- */
.btn{
  font-weight:600;
  border-radius:12px;
  border:1.5px solid transparent;
  cursor:pointer;
  transition:transform .12s ease, box-shadow .15s ease, background .15s ease, border-color .15s ease;
  font-size:14.5px;
  padding:12px 20px;
}
.btn--primary{
  background:var(--primary);
  color:#fff;
  box-shadow:0 10px 24px -10px rgba(46,95,220,0.55);
}
.btn--primary:hover{ background:var(--primary-dark); transform:translateY(-1px); }
.btn--primary:active{ transform:translateY(0); }
.btn--large{ padding:16px 28px; font-size:16px; width:100%; }
.btn--ghost{
  background:transparent;
  color:var(--ink-soft);
  border-color:var(--line);
}
.btn--ghost:hover{ border-color:#B7C6EA; color:var(--ink); }

.row-actions{ display:flex; gap:12px; margin-top:8px; }
.row-actions .btn--ghost{ flex:0 0 auto; }
.row-actions .btn--primary{ flex:1; }

/* ---------------- Countdown ---------------- */
.countdown-screen{ flex-direction:column; gap:22px; }
.countdown-ring{
  width:180px; height:180px; border-radius:50%;
  border:2px solid var(--line);
  display:flex; align-items:center; justify-content:center;
  background:var(--panel);
  box-shadow:var(--shadow-card);
}
.countdown-num{
  font-family:var(--font-display);
  font-size:64px; font-weight:700;
  color:var(--primary);
  animation:ntxFade .38s ease;
}
.countdown-go{ color:var(--success); font-size:44px; letter-spacing:0.04em; }
.countdown-caption{ color:var(--ink-soft); font-size:14px; }
@keyframes ntxFade{ from{ opacity:0; transform:scale(0.85);} to{ opacity:1; transform:scale(1);} }

/* ---------------- Trial screen (practice + assessment) ---------------- */
.assessment-screen{ flex-direction:column; padding:20px 22px 26px; gap:16px; align-items:center; }

.hud{
  display:flex;
  gap:1px;
  background:var(--line);
  border:1px solid var(--line);
  border-radius:var(--radius-md);
  overflow:hidden;
  width:100%;
  max-width:520px;
}
.hud-item{
  flex:1;
  background:var(--panel);
  padding:12px 16px;
  display:flex; flex-direction:column; gap:6px;
}
.hud-label{
  font-size:11px; text-transform:uppercase; letter-spacing:0.06em;
  color:var(--ink-soft); font-weight:600;
  display:flex; align-items:center; gap:5px;
}
.hud-label svg{ color:var(--primary); }
.hud-value{ font-family:var(--font-display); font-size:15px; font-weight:600; color:var(--ink); }
.hud-mono{ font-family:var(--font-mono); font-size:18px; }

.board-frame{
  width:100%;
  max-width:520px;
  border:1px solid var(--line);
  border-radius:var(--radius-lg);
  background:var(--panel);
  box-shadow:var(--shadow-card);
  padding:32px 24px;
  display:flex;
}
.stroop-stage{
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  width:100%;
}
.stroop-word{
  font-family:var(--font-display); font-weight:700; font-size:56px;
  letter-spacing:0.02em; margin:0 0 20px;
}
.timer-bar-track{
  width:100%; max-width:280px; height:4px; background:var(--line-soft);
  border-radius:2px; overflow:hidden; margin-bottom:20px;
}
.timer-bar-fill{
  width:100%; height:100%; background:var(--primary);
  transform-origin:left;
  /* Must match TRIAL_TIMEOUT_MS in the JS above exactly. */
  animation:ntxDeplete 7s linear forwards;
}
@keyframes ntxDeplete{ from{ transform:scaleX(1);} to{ transform:scaleX(0);} }

.feedback-banner{
  display:flex; align-items:center; gap:8px;
  padding:10px 16px; border-radius:var(--radius-sm);
  font-size:14px; font-weight:600; margin:0 0 18px;
}
.feedback-banner--ok{ background:var(--success-tint); color:var(--success); }
.feedback-banner--bad{ background:var(--error-tint); color:var(--error); }

.response-grid{
  display:grid; grid-template-columns:1fr 1fr; gap:14px;
  width:100%; max-width:360px;
}
.response-btn{
  display:flex; flex-direction:column; align-items:center; gap:10px;
  padding:20px 16px; border-radius:var(--radius-md);
  border:1.5px solid var(--line); background:#fff; cursor:pointer;
  font-family:var(--font-display); font-weight:600; font-size:15px; color:var(--ink);
  transition:border-color .15s ease, background .15s ease, transform .12s ease;
}
.response-btn:hover:not(:disabled){ border-color:var(--primary); background:var(--primary-tint); transform:translateY(-1px); }
.response-btn:disabled{ cursor:default; opacity:0.7; }
.response-swatch{ width:34px; height:34px; border-radius:50%; }

/* ---------------- Completion ---------------- */
.completion-badge{
  width:52px; height:52px; border-radius:50%;
  background:var(--success-tint); color:var(--success);
  display:flex; align-items:center; justify-content:center;
  margin:0 auto 18px;
}
.metrics-grid{
  display:grid; grid-template-columns:repeat(3, 1fr); gap:12px;
  margin:8px 0 20px;
}
.metric-tile{
  border:1px solid var(--line);
  border-radius:var(--radius-sm);
  padding:16px 14px;
  display:flex; flex-direction:column; gap:6px;
  background:var(--paper);
  text-align:left;
}
.metric-tile--primary{
  grid-column:span 3;
  background:var(--primary-tint);
  border-color:#C8D7F7;
}
.metric-label{ font-size:11.5px; color:var(--ink-soft); text-transform:uppercase; letter-spacing:0.05em; font-weight:600; display:flex; align-items:center; gap:5px; }
.metric-label svg{ color:var(--primary); }
.metric-value{ font-size:20px; font-weight:700; color:var(--ink); }
.metric-tile--primary .metric-value{ font-size:30px; color:var(--primary-dark); }

.trial-toggle{ margin:4px 0 18px; width:100%; }
.trial-table-wrap{
  max-height:320px; overflow:auto;
  border:1px solid var(--line); border-radius:var(--radius-sm);
  margin-bottom:22px;
}
.trial-table{ width:100%; border-collapse:collapse; font-size:12.5px; }
.trial-table th, .trial-table td{ padding:8px 10px; border-bottom:1px solid var(--line-soft); text-align:left; }
.trial-table th{ font-family:var(--font-mono); text-transform:uppercase; font-size:10.5px; letter-spacing:0.04em; color:var(--ink-soft); }

/* ---------------- Responsive ---------------- */
@media (max-width: 720px){
  .card{ padding:30px 22px 26px; }
  .display-xl{ font-size:28px; }
  .stroop-word{ font-size:40px; }
  .metrics-grid{ grid-template-columns:1fr 1fr; }
  .metric-tile--primary{ grid-column:span 2; }
  .app-topbar{ padding:14px 18px; }
  .board-frame{ padding:22px 16px; }
  .hud{ flex-direction:column; }
}
@media (max-width: 420px){
  .metrics-grid{ grid-template-columns:1fr; }
  .metric-tile--primary{ grid-column:span 1; }
  .response-grid{ grid-template-columns:1fr; }
  .row-actions{ flex-direction:column-reverse; }
}
`;
