/**
 * Matrix Reasoning is vanilla JS/HTML/CSS, not a React component — it
 * manipulates its own `document` directly (public/games/matrix-reasoning/).
 * Mounting it in-process the way the other 7 games are mounted would mean
 * rewriting it as a component; instead it's served as static files in an
 * <iframe>, and its GameResult crosses the frame boundary via postMessage
 * (see public/games/matrix-reasoning/script.js — the one addition that
 * file needed, right where it already calls window.onAssessmentComplete).
 * This is the one adapter in the suite that doesn't use mountReactGame.jsx.
 */
function toContractTrials(responseTimes, errorTypes) {
  return responseTimes.map((responseTimeMs, i) => ({
    responseTimeMs,
    correct: errorTypes[i] == null,
    errorType: errorTypes[i] ?? undefined,
  }));
}

export default {
  id: 'matrix-reasoning',
  mode: 'weekly',
  lobe: 'parietal',

  mount(container, config, callbacks) {
    const iframe = document.createElement('iframe');
    iframe.title = 'Matrix Reasoning';
    iframe.style.width = '100%';
    // Not '100%' — the host container SessionPlayer/DailyGameRunner/etc.
    // mount into only sets min-height (deliberately, to let taller React
    // games grow past one viewport), never a definite height. A percentage
    // height on this iframe has no definite ancestor height to resolve
    // against, so it collapsed to the browser's ~150px default iframe
    // height — the tiny sliver at the top of the page, with everything
    // below it just empty container background. calc(100vh - 40px) matches
    // the same value those hosts already use for their own min-height, so
    // this fills the same space without depending on percentage resolution.
    iframe.style.display = 'block';
    iframe.style.height = 'calc(100vh - 40px)';
    iframe.style.border = 'none';
    iframe.src = `/games/matrix-reasoning/index.html?theme=${config?.theme === 'dark' ? 'dark' : 'light'}`;

    const onMessage = (event) => {
      if (event.source !== iframe.contentWindow) return;
      const data = event.data;
      if (!data || data.source !== 'neuromorph-game' || data.gameId !== 'matrix-reasoning') return;

      if (data.type === 'practiceComplete') {
        const r = data.result;
        callbacks.onPracticeComplete?.({
          score: null,
          trials: [{ responseTimeMs: r.responseTimeMs, correct: r.correct, errorType: r.errorType ?? undefined }],
        });
      } else if (data.type === 'complete') {
        const r = data.result;
        callbacks.onComplete?.({
          score: r.raw_score,
          trials: toContractTrials(r.response_times, r.error_types),
          rawLog: r,
        });
      }
    };
    window.addEventListener('message', onMessage);
    iframe._neuromorphCleanup = () => window.removeEventListener('message', onMessage);

    container.appendChild(iframe);
    this._iframe = iframe;
  },

  unmount() {
    this._iframe?._neuromorphCleanup?.();
    this._iframe?.remove();
    this._iframe = null;
  },
};
