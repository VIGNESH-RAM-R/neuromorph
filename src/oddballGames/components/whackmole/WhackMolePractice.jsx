import { useEffect, useMemo, useRef, useState } from 'react';
import WhackMoleBoard from './WhackMoleBoard';
import { useWhackMoleEngine } from '../../hooks/useWhackMoleEngine';
import { getWhackMolePracticeConfig, WHACK_MOLE_DEFAULT_DIFFICULTY } from '../../config/whackMoleConfig';

/**
 * Short practice round (spec section 9) — 5 fixed trials (count mode, no
 * time limit), on its own engine instance so practice data is structurally
 * separate from, and never mixed into, real assessment metrics. Gentle
 * "Good!" feedback on hits; misses simply continue with no negative
 * feedback (spec section 69). Uses the same constant, difficulty-matched
 * pacing as the real assessment so practice feels identical to what follows.
 */
export default function WhackMolePractice({ onPracticeComplete, difficulty = WHACK_MOLE_DEFAULT_DIFFICULTY }) {
  const [feedback, setFeedback] = useState(null);
  const [message, setMessage] = useState('');
  const feedbackTimeoutRef = useRef(null);
  const practiceConfig = useMemo(() => getWhackMolePracticeConfig(difficulty), [difficulty]);

  const engine = useWhackMoleEngine({
    onTrialRecorded: (record) => {
      if (record.result === 'correct') {
        setMessage('Good!');
        setFeedback({ position: record.position, type: 'hit' });
      } else if (record.result === 'miss') {
        setMessage('');
        setFeedback({ position: record.position, type: 'miss' });
      }
      clearTimeout(feedbackTimeoutRef.current);
      feedbackTimeoutRef.current = setTimeout(() => {
        setFeedback(null);
        setMessage('');
      }, 500);
    },
    onComplete: () => onPracticeComplete(),
  });

  useEffect(() => {
    engine.start(practiceConfig, 'count');
    return () => {
      clearTimeout(feedbackTimeoutRef.current);
      engine.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTap = (position, inputMethod) => engine.respond(position, inputMethod || 'mouse');

  return (
    <div className="oddball-screen wm-screen wm-screen--game">
      <span className="oddball-eyebrow">PRACTICE</span>
      <p className="wm-status-text" aria-live="polite">
        {message || 'Let’s try a few practice rounds.'}
      </p>
      <WhackMoleBoard
        totalHoles={practiceConfig.totalHoles}
        activePosition={engine.activeTarget?.position ?? null}
        feedback={feedback}
        onTap={handleTap}
        disabled={engine.phase === 'done'}
      />
      <p className="oddball-progress-label">Trial {Math.min(engine.trialNumber, practiceConfig.trialCount)} of {practiceConfig.trialCount}</p>
    </div>
  );
}
