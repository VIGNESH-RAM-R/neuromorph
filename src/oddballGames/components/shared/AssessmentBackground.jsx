import { useEffect, useRef } from 'react';
import oddballBgVideo from '../../assets/oddball-bg-video-v3.mp4';

/**
 * Shared dark NEUROMORPH background for every assessment module (Oddball,
 * Sequence Memory, Point & Click, Image Pairs, Whack the Mole, and any
 * future module). By default reuses the exact same PCB/circuit-board image
 * as the Cognitive Dashboard (see .assessment-bg in index.css) so moving
 * from the dashboard into an assessment feels like the same product.
 *
 * `variant` is an optional opt-in escape hatch for a single module to use a
 * different background without touching the shared PCB background every
 * other module still relies on: when set, an extra
 * `assessment-bg--{variant}` class is added. Every other module keeps
 * calling this with no `variant` and is unaffected.
 *
 * `oddball` is a special case: instead of a static image it renders the
 * user-provided background video, played "ping-pong" style — forward
 * 0->10s, then backward 10->0s, then forward again, forever, with no pause
 * or restart hitch at either end — driven by usePingPongVideo below
 * (rather than the native `loop` attribute, which only restarts from 0 and
 * can't play in reverse). Audio is stripped from the encoded file and the
 * element is muted anyway, so there is no sound. Every other module is
 * untouched and still gets the static PCB image via the plain div branch
 * below.
 *
 * Rendered once as the first child of a module's root `.oddball-module`
 * div. It's fixed to the viewport with a negative z-index, so it paints
 * behind the existing white `.oddball-screen` card and every internal
 * screen (Welcome/Instructions/Practice/Countdown/Game/Results/History)
 * without requiring any change to those components — the background simply
 * persists for as long as the module stays mounted. No dark tint/overlay is
 * layered on top — the opaque white card already gives the actual task
 * content all the contrast it needs.
 */

/**
 * Drives forward/reverse "ping-pong" playback on a <video> ref, forever,
 * with zero pause or hitch at either turnaround point.
 *
 * Earlier revision: played forward via native `video.play()` and only
 * switched to manual `currentTime` scrubbing for the reverse pass, resuming
 * native `play()` again at the start of every forward pass. That native
 * `play()` call has real, user-visible startup latency (the browser has to
 * re-buffer/re-start decoding after a manual seek to currentTime 0) —
 * exactly the "time delay" / non-smooth loop this was reported to have.
 *
 * Fixed by driving the ENTIRE loop — both directions — from one continuous
 * requestAnimationFrame chain that only ever manually sets `currentTime`,
 * never calling `play()`/`pause()` again after the initial setup. Direction
 * flips the sign of the per-frame delta; a boundary is handled by
 * reflecting ("bouncing") any overshoot back into the new direction instead
 * of clamping to 0/duration, so no elapsed time is ever lost or paused at
 * the turnaround — the very next frame already moves in the new direction.
 * The result is a single unbroken 0->duration->0->duration->... loop.
 */
function usePingPongVideo(videoRef, enabled) {
  useEffect(() => {
    if (!enabled) return undefined;
    const video = videoRef.current;
    if (!video) return undefined;

    let rafId = null;
    let lastTimestamp = null;
    let direction = 'forward';

    const step = (timestamp) => {
      const duration = video.duration;
      if (!Number.isFinite(duration) || duration <= 0) {
        // Metadata not loaded yet — keep waiting, don't advance time.
        lastTimestamp = null;
        rafId = requestAnimationFrame(step);
        return;
      }

      if (lastTimestamp == null) lastTimestamp = timestamp;
      const deltaSeconds = Math.min((timestamp - lastTimestamp) / 1000, 0.25);
      lastTimestamp = timestamp;

      let next =
        direction === 'forward' ? video.currentTime + deltaSeconds : video.currentTime - deltaSeconds;

      // Reflect any overshoot past a boundary back into the new direction
      // instead of clamping — preserves every millisecond of motion across
      // the turnaround instead of losing/pausing on it.
      if (direction === 'forward' && next >= duration) {
        next = duration - (next - duration);
        direction = 'reverse';
      } else if (direction === 'reverse' && next <= 0) {
        next = -next;
        direction = 'forward';
      }

      try {
        video.currentTime = Math.min(Math.max(next, 0), duration);
      } catch {
        // A transient seek error should never stall the loop — just retry
        // next frame with the same currentTime.
      }

      rafId = requestAnimationFrame(step);
    };

    const begin = () => {
      video.pause(); // ensure native playback never fights the manual scrub below
      lastTimestamp = null;
      rafId = requestAnimationFrame(step);
    };

    if (video.readyState >= 1 /* HAVE_METADATA: duration is known */) {
      begin();
    } else {
      video.addEventListener('loadedmetadata', begin, { once: true });
    }

    return () => {
      video.removeEventListener('loadedmetadata', begin);
      if (rafId != null) cancelAnimationFrame(rafId);
    };
  }, [videoRef, enabled]);
}

export default function AssessmentBackground({ variant } = {}) {
  const className = variant ? `assessment-bg assessment-bg--${variant}` : 'assessment-bg';
  const videoRef = useRef(null);
  const isOddball = variant === 'oddball';
  usePingPongVideo(videoRef, isOddball);

  if (isOddball) {
    return (
      <video
        ref={videoRef}
        className={`${className} assessment-bg--video`}
        aria-hidden="true"
        src={oddballBgVideo}
        autoPlay
        muted
        playsInline
        disablePictureInPicture
      />
    );
  }

  return <div className={className} aria-hidden="true" />;
}
