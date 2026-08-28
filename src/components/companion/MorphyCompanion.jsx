import { useCallback, useEffect, useRef, useState } from 'react';
import MorphyAvatar from '../chat/MorphyAvatar.jsx';
import { MorphyCompanionEngine } from '../../engines/MorphyCompanionEngine.js';
import { MORPHY_COMPANION_TIMING } from '../../config/morphyCompanionConfig.js';
import { t, format } from '../../i18n/strings/morphyCompanion.js';

// Same tiny local pattern useCountUp.js already uses -- not promoted to a
// shared hook/util on purpose, this codebase duplicates small one-line
// browser-API guards like this per-file rather than over-abstracting them.
function prefersReducedMotion() {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

// 2026-08-28 NEW (VR, this session: "isn't this just a chatbot with a
// mascot skin" is exactly the thing this answers). MorphyCompanion is the
// patient shell's persistent, living presence -- mounted exactly ONCE in
// App.jsx's patient-only render branch (see that file's comment right
// above where this is used), outside/above the routed section content, so
// it survives every `activeSection` change without unmounting. It reuses
// ChatPanel.jsx as-is for the actual conversation (tapping this just calls
// `onOpenChat`, the same `chat.open`/`chat.toggle` App.jsx already wires
// to ChatBubbleButton) -- this component's whole job is presence and
// reaction, not messaging.
//
// PHYSICAL SEPARATION, not a role-check: this file is imported ONLY from
// App.jsx's patient branch. It is never imported by DashboardShell.jsx (a
// shared layout component) or by anything under components/caregiver/ or
// components/doctor/ -- so there is no shared code path a future edit
// could accidentally make it leak through. Verify with
// `grep -rn "MorphyCompanion" src` any time this needs re-checking.
//
// Three independent animation states layer on top of each other via CSS
// classes (see theme.css's "MorphyCompanion" block): --idle (continuous
// bob loop) or --shrunk (during an active Detection Assessment, per
// AssessmentModeGuard's existing philosophy -- small and present, never
// fully hidden), plus a transient --transition (route change),
// --tap (touched), or one of --celebrate/--wellDone/--pulse/--nudge (a
// real app event just happened -- see MorphyCompanionEngine.decideEvent
// and morphyCompanionConfig.js's event list, which is the actual
// differentiator: this reacts to what the patient DID, not just what they
// typed).
export default function MorphyCompanion({ self, assessmentPhase, activeSection, onOpenChat, language }) {
  const isAssessmentActive = assessmentPhase === 'running';

  const prevSnapshotRef = useRef(null);
  const prevSectionRef = useRef(activeSection);
  const reducedMotionRef = useRef(prefersReducedMotion());

  const [reactionAnimation, setReactionAnimation] = useState(null);
  const [routeTransitioning, setRouteTransitioning] = useState(false);
  const [tapping, setTapping] = useState(false);
  const [speechText, setSpeechText] = useState(null);

  const reactionTimerRef = useRef(null);
  const speechTimerRef = useRef(null);
  const routeTimerRef = useRef(null);
  const tapTimerRef = useRef(null);

  const showSpeech = useCallback((text) => {
    clearTimeout(speechTimerRef.current);
    setSpeechText(text);
    const life = reducedMotionRef.current ? Math.min(1200, MORPHY_COMPANION_TIMING.speechBubbleMs) : MORPHY_COMPANION_TIMING.speechBubbleMs;
    speechTimerRef.current = setTimeout(() => setSpeechText(null), life);
  }, []);

  // ---- the actual differentiator: react to real app events, not just taps ----
  // Diffs a small snapshot of self (streak milestone, Daily Set
  // completion, momentum-vs-yesterday, weekly-assessment-due) render to
  // render via MorphyCompanionEngine -- the same "hook/component is the
  // seam, engine decides" split every other module in this app follows.
  // Suppressed entirely while an assessment is running: consistent with
  // AssessmentModeGuard's existing rule that nothing should distract from
  // an active test, even a celebration.
  useEffect(() => {
    if (!self) return;
    const todayDate = self.today?.date;
    const priorScores = (self.momentumHistory || [])
      .filter((day) => day.date !== todayDate)
      .map((day) => day.score);
    const todayScore = self.today?.momentum?.revealed ? self.today.momentum.score : null;
    const momentumImprovedToday = MorphyCompanionEngine.isMomentumImprovement(todayScore, priorScores);
    const snapshot = MorphyCompanionEngine.buildSnapshot(self, momentumImprovedToday);

    if (prevSnapshotRef.current) {
      const event = MorphyCompanionEngine.decideEvent(prevSnapshotRef.current, snapshot);
      if (event && !isAssessmentActive) {
        clearTimeout(reactionTimerRef.current);
        setReactionAnimation(event.animation);
        const phrase = event.id === 'milestone'
          ? format(t(language, event.phraseKey), { label: event.milestoneLabel || '' })
          : t(language, event.phraseKey);
        showSpeech(phrase);
        const life = reducedMotionRef.current ? 1 : (event.durationMs || 2000);
        reactionTimerRef.current = setTimeout(() => setReactionAnimation(null), life);
      }
    }
    prevSnapshotRef.current = snapshot;
  }, [self, isAssessmentActive, language, showSpeech]);

  // ---- "travels with them": a brief transition every time the patient
  // switches dashboard sections (this app has no URL router -- `activeSection`
  // IS the route, see App.jsx/DashboardShell.jsx), so the presence reads as
  // moving WITH the patient rather than silently already being there. ----
  useEffect(() => {
    if (prevSectionRef.current === activeSection) return;
    prevSectionRef.current = activeSection;
    if (isAssessmentActive) return; // stays in its shrunk corner, no swim
    clearTimeout(routeTimerRef.current);
    setRouteTransitioning(true);
    const life = reducedMotionRef.current ? 1 : MORPHY_COMPANION_TIMING.routeTransitionMs;
    routeTimerRef.current = setTimeout(() => setRouteTransitioning(false), life);
  }, [activeSection, isAssessmentActive]);

  useEffect(
    () => () => {
      clearTimeout(reactionTimerRef.current);
      clearTimeout(speechTimerRef.current);
      clearTimeout(routeTimerRef.current);
      clearTimeout(tapTimerRef.current);
    },
    []
  );

  const handleTap = useCallback(() => {
    clearTimeout(tapTimerRef.current);
    setTapping(true);
    const life = reducedMotionRef.current ? 1 : MORPHY_COMPANION_TIMING.tapReactionMs;
    tapTimerRef.current = setTimeout(() => setTapping(false), life);
    if (!isAssessmentActive) showSpeech(t(language, 'idleGreeting'));
    onOpenChat?.();
  }, [isAssessmentActive, onOpenChat, language, showSpeech]);

  // No self yet (e.g. still mid-onboarding, before SelfModel has anything
  // real to build from) -- nothing to be present for or react to yet.
  if (!self) return null;

  const wrapperClass = [
    'nmpa-morphy-companion',
    isAssessmentActive ? 'nmpa-morphy-companion--shrunk' : 'nmpa-morphy-companion--idle',
    !isAssessmentActive && routeTransitioning ? 'nmpa-morphy-companion--transition' : '',
    !isAssessmentActive && tapping ? 'nmpa-morphy-companion--tap' : '',
    !isAssessmentActive && reactionAnimation ? `nmpa-morphy-companion--${reactionAnimation}` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={wrapperClass}>
      {speechText && !isAssessmentActive && (
        <div className="nmpa-morphy-companion__bubble" role="status">
          {speechText}
        </div>
      )}
      <button
        type="button"
        className="nmpa-morphy-companion__hit"
        onClick={handleTap}
        aria-label={isAssessmentActive ? t(language, 'ariaLabelAssessmentActive') : t(language, 'ariaLabelClosed')}
      >
        <MorphyAvatar pose="idle" size={64} />
      </button>
    </div>
  );
}
