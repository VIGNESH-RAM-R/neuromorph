import { useState, useRef, useCallback, useEffect } from 'react';
import { FaceTrackingService } from '../../services/FaceTrackingService.js';
import { PROMPT_SEQUENCE, CALIBRATION_DURATION_MS, FRAME_INTERVAL_MS } from '../../config/facialExpressivityConfig.js';
import { FacialExpressivityEngine } from '../../engines/FacialExpressivityEngine.js';
import { t, format } from '../../i18n/strings/games.js';
import { t as tCommon } from '../../i18n/strings/common.js';
import { DEFAULT_LANGUAGE } from '../../config/i18nConfig.js';

// Facial Expressivity Test -- teammate's real project (face_module, already
// connected), one of the Daily Set's 2 mandatory items. Restyled to this
// app's nmpa- theme; the original's own consent/calibration/prompt/
// completion screens are rebuilt here as one component (this app's
// convention -- state lives in the task component, not a separate hook
// file). Flow: consent -> initializing (camera + on-device ML model
// startup) -> calibration (brief neutral-face capture) -> prompt (loops
// through PROMPT_SEQUENCE) -> onSubmit. A camera/model failure moves to an
// explicit error phase with a retry button, never a silent failure.
//
// PRIVACY: the camera feed is never recorded, stored, or transmitted --
// FaceTrackingService reads it live, on-device, and only ever emits small
// numeric blendshape coefficients per frame. No raw video/image data is
// captured anywhere in this component or its engine.
export default function FacialExpressivityTask({ onSubmit, language = DEFAULT_LANGUAGE }) {
  const [phase, setPhase] = useState('consent'); // 'consent' | 'initializing' | 'calibration' | 'prompt' | 'error'
  const [errorMessage, setErrorMessage] = useState(null);
  const [promptIndex, setPromptIndex] = useState(0);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const framesByPromptIdRef = useRef({});
  const sessionIdRef = useRef('facial-expr-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8));
  const startedAtRef = useRef(null);
  const consentGivenAtRef = useRef(null);
  const captureTimerRef = useRef(null);
  const phaseStartRef = useRef(null);
  const advanceTimerRef = useRef(null);

  const clearTimers = useCallback(() => {
    if (captureTimerRef.current) clearInterval(captureTimerRef.current);
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    captureTimerRef.current = null;
    advanceTimerRef.current = null;
  }, []);

  useEffect(() => () => {
    clearTimers();
    FaceTrackingService.stopCamera(streamRef.current);
    FaceTrackingService.dispose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startCapture = useCallback((promptId, durationMs, onDone) => {
    framesByPromptIdRef.current[promptId] = framesByPromptIdRef.current[promptId] || [];
    phaseStartRef.current = Date.now();
    clearTimers();
    captureTimerRef.current = setInterval(() => {
      if (!videoRef.current) return;
      const relativeTimestampMs = Date.now() - phaseStartRef.current;
      try {
        const frame = FaceTrackingService.detectFrame(videoRef.current, Date.now());
        if (frame) framesByPromptIdRef.current[promptId].push({ timestampMs: relativeTimestampMs, blendshapes: frame.blendshapes });
      } catch (e) { /* one missed detection is not fatal -- keep sampling */ }
    }, FRAME_INTERVAL_MS);
    advanceTimerRef.current = setTimeout(() => {
      if (captureTimerRef.current) clearInterval(captureTimerRef.current);
      captureTimerRef.current = null;
      onDone();
    }, durationMs);
  }, [clearTimers]);

  const finishSession = useCallback(() => {
    clearTimers();
    FaceTrackingService.stopCamera(streamRef.current);
    const completedAt = Date.now();
    const raw = FacialExpressivityEngine.score({
      sessionId: sessionIdRef.current,
      framesByPromptId: framesByPromptIdRef.current,
      promptSequence: PROMPT_SEQUENCE,
      startedAt: startedAtRef.current,
      completedAt,
      completed: true,
      calibrationFrames: framesByPromptIdRef.current['__calibration__'] || [],
      calibrationDurationMs: CALIBRATION_DURATION_MS,
      cameraConsentGivenAt: consentGivenAtRef.current,
    });
    onSubmit({ score: raw.score, raw });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearTimers]);

  const startPromptPhase = useCallback((index) => {
    const p = PROMPT_SEQUENCE[index];
    if (!p) { finishSession(); return; }
    setPhase('prompt');
    setPromptIndex(index);
    startCapture(p.id, p.durationMs, () => {
      const next = index + 1;
      if (next >= PROMPT_SEQUENCE.length) finishSession();
      else startPromptPhase(next);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startCapture, finishSession]);

  const beginSetup = useCallback(async () => {
    try {
      setPhase('initializing');
      await FaceTrackingService.initialize();
      const stream = await FaceTrackingService.requestCamera(videoRef.current);
      streamRef.current = stream;
      startedAtRef.current = Date.now();
      setPhase('calibration');
      startCapture('__calibration__', CALIBRATION_DURATION_MS, () => startPromptPhase(0));
    } catch (err) {
      setErrorMessage(err?.message || t(language, 'facialDefaultError'));
      setPhase('error');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startCapture, startPromptPhase]);

  const giveConsent = useCallback(() => {
    consentGivenAtRef.current = new Date().toISOString();
    setPhase('permission');
    beginSetup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [beginSetup]);

  const retry = useCallback(() => {
    framesByPromptIdRef.current = {};
    setErrorMessage(null);
    setPhase('consent');
  }, []);

  const currentPrompt = PROMPT_SEQUENCE[promptIndex];
  const showVideo = phase === 'calibration' || phase === 'prompt' || phase === 'initializing';

  return (
    <div className="nmpa-task">
      {/* Persistent video element -- mounted for this component's whole
          lifetime (visibility toggled with CSS only) so FaceTrackingService
          never sees a null videoRef, same fix the original module made. */}
      <video
        ref={videoRef}
        className="nmpa-task__video-preview"
        style={{ display: showVideo ? 'block' : 'none' }}
        muted
        playsInline
        aria-hidden={!showVideo}
      />

      {phase === 'consent' && (
        <>
          <p className="nmpa-task__instruction">{t(language, 'facialTitle')}</p>
          <p className="nmpa-muted" style={{ maxWidth: '48ch' }}>
            {t(language, 'facialConsentBlurb')}
          </p>
          <button type="button" className="nmpa-button nmpa-button--primary" onClick={giveConsent}>
            {t(language, 'facialAllowBegin')}
          </button>
        </>
      )}

      {phase === 'initializing' && (
        <p className="nmpa-task__instruction">{t(language, 'facialStarting')}</p>
      )}

      {phase === 'calibration' && (
        <>
          <p className="nmpa-task__instruction">{t(language, 'facialRelax')}</p>
          <p className="nmpa-task__progress">{t(language, 'facialBaseline')}</p>
        </>
      )}

      {phase === 'prompt' && currentPrompt && (
        <>
          <p className="nmpa-task__progress">{format(t(language, 'facialPromptProgress'), { n: promptIndex + 1, total: PROMPT_SEQUENCE.length })}</p>
          {/* currentPrompt.prompt itself is config-driven data (facialExpressivityConfig.js's
              PROMPT_SEQUENCE), not component copy -- left English-only for now, same
              treatment as the rest of this pass's config-data exclusions (see games.js
              header comment and OVERNIGHT_PLAN.md's config-driven-data checklist section). */}
          <p className="nmpa-task__instruction">{currentPrompt.prompt}</p>
        </>
      )}

      {phase === 'error' && (
        <>
          <p className="nmpa-task__feedback is-bad">{errorMessage}</p>
          <button type="button" className="nmpa-button nmpa-button--secondary" onClick={retry}>{tCommon(language, 'retry')}</button>
        </>
      )}
    </div>
  );
}
